/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
var xf=0,bc=1,_f=2;var ju=1,Bl=2,Yn=3,pi=0,Lt=1,pn=2;var hi=0,mr=1,Oi=2,Mc=3,Sc=4,yf=5,Pi=100,vf=101,bf=102,wc=103,Ec=104,Mf=200,Sf=201,wf=202,Ef=203,Ja=204,$a=205,Tf=206,Af=207,Rf=208,Cf=209,Pf=210,If=211,Lf=212,Df=213,Uf=214,Nf=0,Of=1,Ff=2,eo=3,zf=4,kf=5,Gl=6,Bf=7,Hl=0,Gf=1,Hf=2,Rn=0,Vf=1,Wf=2,Xf=3,Do=4,qf=5,Yf=6;var Qu=300,_r=301,yr=302,ja=303,Qa=304,Uo=306,vr=1e3,Gt=1001,el=1002,Jt=1003,Tc=1004;var fa=1005;var fn=1006,Kf=1007;var $r=1008;var di=1009,Zf=1010,Jf=1011,Vl=1012,eh=1013,ci=1014,ui=1015,Fi=1016,th=1017,nh=1018,Di=1020,$f=1021,An=1023,jf=1024,Qf=1025,Ui=1026,br=1027,ep=1028,ih=1029,tp=1030,rh=1031,sh=1033,pa=33776,ma=33777,ga=33778,xa=33779,Ac=35840,Rc=35841,Cc=35842,Pc=35843,oh=36196,Ic=37492,Lc=37496,Dc=37808,Uc=37809,Nc=37810,Oc=37811,Fc=37812,zc=37813,kc=37814,Bc=37815,Gc=37816,Hc=37817,Vc=37818,Wc=37819,Xc=37820,qc=37821,_a=36492,Yc=36494,Kc=36495,np=36283,Zc=36284,Jc=36285,$c=36286;var to=2300,no=2301,ya=2302,jc=2400,Qc=2401,eu=2402;var ah=3e3,Ni=3001,ip=3200,rp=3201,Wl=0,sp=1,mn="",yt="srgb",jn="srgb-linear",Xl="display-p3",No="display-p3-linear",io="linear",gt="srgb",ro="rec709",so="p3";var Xi=7680,lh=7681;var ch=517;var tu=519,op=512,ap=513,lp=514,uh=515,cp=516,up=517,hp=518,dp=519,tl=35044;var nu="300 es",nl=1035,Jn=2e3,oo=2001,mi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let i=this._listeners[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},Vt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var va=Math.PI/180,il=180/Math.PI;function $n(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Vt[n&255]+Vt[n>>8&255]+Vt[n>>16&255]+Vt[n>>24&255]+"-"+Vt[e&255]+Vt[e>>8&255]+"-"+Vt[e>>16&15|64]+Vt[e>>24&255]+"-"+Vt[t&63|128]+Vt[t>>8&255]+"-"+Vt[t>>16&255]+Vt[t>>24&255]+Vt[i&255]+Vt[i>>8&255]+Vt[i>>16&255]+Vt[i>>24&255]).toLowerCase()}function Bt(n,e,t){return Math.max(e,Math.min(t,n))}function fp(n,e){return(n%e+e)%e}function ba(n,e,t){return(1-t)*n+t*e}function iu(n){return(n&n-1)===0&&n!==0}function rl(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Zn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function ft(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var $=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Bt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},nt=class n{constructor(e,t,i,r,s,o,a,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c)}set(e,t,i,r,s,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],h=i[7],f=i[2],d=i[5],g=i[8],x=r[0],p=r[3],m=r[6],v=r[1],_=r[4],b=r[7],E=r[2],S=r[5],A=r[8];return s[0]=o*x+a*v+l*E,s[3]=o*p+a*_+l*S,s[6]=o*m+a*b+l*A,s[1]=c*x+u*v+h*E,s[4]=c*p+u*_+h*S,s[7]=c*m+u*b+h*A,s[2]=f*x+d*v+g*E,s[5]=f*p+d*_+g*S,s[8]=f*m+d*b+g*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*s*u+i*a*l+r*s*c-r*o*l}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,f=a*l-u*s,d=c*s-o*l,g=t*h+i*f+r*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=h*x,e[1]=(r*c-u*i)*x,e[2]=(a*i-r*o)*x,e[3]=f*x,e[4]=(u*t-r*l)*x,e[5]=(r*s-a*t)*x,e[6]=d*x,e[7]=(i*l-c*t)*x,e[8]=(o*t-i*s)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Ma.makeScale(e,t)),this}rotate(e){return this.premultiply(Ma.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ma.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ma=new nt;function hh(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function ao(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function pp(){let n=ao("canvas");return n.style.display="block",n}var ru={};function Yr(n){n in ru||(ru[n]=!0,console.warn(n))}var su=new nt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),ou=new nt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),ws={[jn]:{transfer:io,primaries:ro,toReference:n=>n,fromReference:n=>n},[yt]:{transfer:gt,primaries:ro,toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[No]:{transfer:io,primaries:so,toReference:n=>n.applyMatrix3(ou),fromReference:n=>n.applyMatrix3(su)},[Xl]:{transfer:gt,primaries:so,toReference:n=>n.convertSRGBToLinear().applyMatrix3(ou),fromReference:n=>n.applyMatrix3(su).convertLinearToSRGB()}},mp=new Set([jn,No]),dt={enabled:!0,_workingColorSpace:jn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!mp.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,e,t){if(this.enabled===!1||e===t||!e||!t)return n;let i=ws[e].toReference,r=ws[t].fromReference;return r(i(n))},fromWorkingColorSpace:function(n,e){return this.convert(n,this._workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this._workingColorSpace)},getPrimaries:function(n){return ws[n].primaries},getTransfer:function(n){return n===mn?io:ws[n].transfer}};function gr(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Sa(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var qi,lo=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{qi===void 0&&(qi=ao("canvas")),qi.width=e.width,qi.height=e.height;let i=qi.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=qi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ao("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=gr(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(gr(t[i]/255)*255):t[i]=gr(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},gp=0,co=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:gp++}),this.uuid=$n(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(wa(r[o].image)):s.push(wa(r[o]))}else s=wa(r);i.url=s}return t||(e.images[this.uuid]=i),i}};function wa(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?lo.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var xp=0,gn=class n extends mi{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Gt,r=Gt,s=fn,o=$r,a=An,l=di,c=n.DEFAULT_ANISOTROPY,u=mn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:xp++}),this.uuid=$n(),this.name="",this.source=new co(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new $(0,0),this.repeat=new $(1,1),this.center=new $(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new nt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof u=="string"?this.colorSpace=u:(Yr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=u===Ni?yt:mn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Qu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case vr:e.x=e.x-Math.floor(e.x);break;case Gt:e.x=e.x<0?0:1;break;case el:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case vr:e.y=e.y-Math.floor(e.y);break;case Gt:e.y=e.y<0?0:1;break;case el:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Yr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===yt?Ni:ah}set encoding(e){Yr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===Ni?yt:mn}};gn.DEFAULT_IMAGE=null;gn.DEFAULT_MAPPING=Qu;gn.DEFAULT_ANISOTROPY=1;var vt=class n{constructor(e=0,t=0,i=0,r=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s,l=e.elements,c=l[0],u=l[4],h=l[8],f=l[1],d=l[5],g=l[9],x=l[2],p=l[6],m=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-x)<.01&&Math.abs(g-p)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+x)<.1&&Math.abs(g+p)<.1&&Math.abs(c+d+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let _=(c+1)/2,b=(d+1)/2,E=(m+1)/2,S=(u+f)/4,A=(h+x)/4,C=(g+p)/4;return _>b&&_>E?_<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(_),r=S/i,s=A/i):b>E?b<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(b),i=S/r,s=C/r):E<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(E),i=A/s,r=C/s),this.set(i,r,s,t),this}let v=Math.sqrt((p-g)*(p-g)+(h-x)*(h-x)+(f-u)*(f-u));return Math.abs(v)<.001&&(v=1),this.x=(p-g)/v,this.y=(h-x)/v,this.z=(f-u)/v,this.w=Math.acos((c+d+m-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},sl=class extends mi{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new vt(0,0,e,t),this.scissorTest=!1,this.viewport=new vt(0,0,e,t);let r={width:e,height:t,depth:1};i.encoding!==void 0&&(Yr("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),i.colorSpace=i.encoding===Ni?yt:mn),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:fn,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},i),this.texture=new gn(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=i.generateMipmaps,this.texture.internalFormat=i.internalFormat,this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}setSize(e,t,i=1){(this.width!==e||this.height!==t||this.depth!==i)&&(this.width=e,this.height=t,this.depth=i,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=i,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new co(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},$t=class extends sl{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},uo=class extends gn{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=Gt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ol=class extends gn{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=Gt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var gi=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let l=i[r+0],c=i[r+1],u=i[r+2],h=i[r+3],f=s[o+0],d=s[o+1],g=s[o+2],x=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=f,e[t+1]=d,e[t+2]=g,e[t+3]=x;return}if(h!==x||l!==f||c!==d||u!==g){let p=1-a,m=l*f+c*d+u*g+h*x,v=m>=0?1:-1,_=1-m*m;if(_>Number.EPSILON){let E=Math.sqrt(_),S=Math.atan2(E,m*v);p=Math.sin(p*S)/E,a=Math.sin(a*S)/E}let b=a*v;if(l=l*p+f*b,c=c*p+d*b,u=u*p+g*b,h=h*p+x*b,p===1-a){let E=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=E,c*=E,u*=E,h*=E}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,r,s,o){let a=i[r],l=i[r+1],c=i[r+2],u=i[r+3],h=s[o],f=s[o+1],d=s[o+2],g=s[o+3];return e[t]=a*g+u*h+l*d-c*f,e[t+1]=l*g+u*f+c*h-a*d,e[t+2]=c*g+u*d+a*f-l*h,e[t+3]=u*g-a*h-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(r/2),h=a(s/2),f=l(i/2),d=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"YXZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"ZXY":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"ZYX":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"YZX":this._x=f*u*h+c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h-f*d*g;break;case"XZY":this._x=f*u*h-c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],f=i+a+h;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(u-l)*d,this._y=(s-c)*d,this._z=(o-r)*d}else if(i>a&&i>h){let d=2*Math.sqrt(1+i-a-h);this._w=(u-l)/d,this._x=.25*d,this._y=(r+o)/d,this._z=(s+c)/d}else if(a>h){let d=2*Math.sqrt(1+a-i-h);this._w=(s-c)/d,this._x=(r+o)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+h-i-a);this._w=(o-r)/d,this._x=(s+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Bt(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-i*c,this._z=s*u+o*c+i*l-r*a,this._w=o*u-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let d=1-t;return this._w=d*o+t*this._w,this._x=d*i+t*this._x,this._y=d*r+t*this._y,this._z=d*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,f=Math.sin(t*u)/c;return this._w=o*h+this._w*f,this._x=i*h+this._x*f,this._y=r*h+this._y*f,this._z=s*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=Math.random(),t=Math.sqrt(1-e),i=Math.sqrt(e),r=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(r),i*Math.sin(s),i*Math.cos(s),t*Math.sin(r))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},I=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(au.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(au.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),u=2*(a*t-s*r),h=2*(s*i-o*t);return this.x=t+l*c+o*h-a*u,this.y=i+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Ea.copy(this).projectOnVector(e),this.sub(Ea)}reflect(e){return this.sub(Ea.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Bt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,i=Math.sqrt(1-e**2);return this.x=i*Math.cos(t),this.y=i*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ea=new I,au=new gi,Cn=class{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(wn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(wn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=wn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,wn):wn.fromBufferAttribute(s,o),wn.applyMatrix4(e.matrixWorld),this.expandByPoint(wn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Es.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Es.copy(i.boundingBox)),Es.applyMatrix4(e.matrixWorld),this.union(Es)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,wn),wn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Fr),Ts.subVectors(this.max,Fr),Yi.subVectors(e.a,Fr),Ki.subVectors(e.b,Fr),Zi.subVectors(e.c,Fr),ri.subVectors(Ki,Yi),si.subVectors(Zi,Ki),Ei.subVectors(Yi,Zi);let t=[0,-ri.z,ri.y,0,-si.z,si.y,0,-Ei.z,Ei.y,ri.z,0,-ri.x,si.z,0,-si.x,Ei.z,0,-Ei.x,-ri.y,ri.x,0,-si.y,si.x,0,-Ei.y,Ei.x,0];return!Ta(t,Yi,Ki,Zi,Ts)||(t=[1,0,0,0,1,0,0,0,1],!Ta(t,Yi,Ki,Zi,Ts))?!1:(As.crossVectors(ri,si),t=[As.x,As.y,As.z],Ta(t,Yi,Ki,Zi,Ts))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,wn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(wn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Hn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Hn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Hn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Hn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Hn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Hn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Hn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Hn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Hn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Hn=[new I,new I,new I,new I,new I,new I,new I,new I],wn=new I,Es=new Cn,Yi=new I,Ki=new I,Zi=new I,ri=new I,si=new I,Ei=new I,Fr=new I,Ts=new I,As=new I,Ti=new I;function Ta(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){Ti.fromArray(n,s);let a=r.x*Math.abs(Ti.x)+r.y*Math.abs(Ti.y)+r.z*Math.abs(Ti.z),l=e.dot(Ti),c=t.dot(Ti),u=i.dot(Ti);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var _p=new Cn,zr=new I,Aa=new I,zi=class{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):_p.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;zr.subVectors(e,this.center);let t=zr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(zr,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Aa.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(zr.copy(e.center).add(Aa)),this.expandByPoint(zr.copy(e.center).sub(Aa))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},Vn=new I,Ra=new I,Rs=new I,oi=new I,Ca=new I,Cs=new I,Pa=new I,al=class{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Vn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Vn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Vn.copy(this.origin).addScaledVector(this.direction,t),Vn.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){Ra.copy(e).add(t).multiplyScalar(.5),Rs.copy(t).sub(e).normalize(),oi.copy(this.origin).sub(Ra);let s=e.distanceTo(t)*.5,o=-this.direction.dot(Rs),a=oi.dot(this.direction),l=-oi.dot(Rs),c=oi.lengthSq(),u=Math.abs(1-o*o),h,f,d,g;if(u>0)if(h=o*l-a,f=o*a-l,g=s*u,h>=0)if(f>=-g)if(f<=g){let x=1/u;h*=x,f*=x,d=h*(h+o*f+2*a)+f*(o*h+f+2*l)+c}else f=s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f=-s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f<=-g?(h=Math.max(0,-(-o*s+a)),f=h>0?-s:Math.min(Math.max(-s,-l),s),d=-h*h+f*(f+2*l)+c):f<=g?(h=0,f=Math.min(Math.max(-s,-l),s),d=f*(f+2*l)+c):(h=Math.max(0,-(o*s+a)),f=h>0?s:Math.min(Math.max(-s,-l),s),d=-h*h+f*(f+2*l)+c);else f=o>0?-s:s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Ra).addScaledVector(Rs,f),d}intersectSphere(e,t){Vn.subVectors(e.center,this.origin);let i=Vn.dot(this.direction),r=Vn.dot(Vn)-i*i,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(i=(e.min.x-f.x)*c,r=(e.max.x-f.x)*c):(i=(e.max.x-f.x)*c,r=(e.min.x-f.x)*c),u>=0?(s=(e.min.y-f.y)*u,o=(e.max.y-f.y)*u):(s=(e.max.y-f.y)*u,o=(e.min.y-f.y)*u),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(a=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,Vn)!==null}intersectTriangle(e,t,i,r,s){Ca.subVectors(t,e),Cs.subVectors(i,e),Pa.crossVectors(Ca,Cs);let o=this.direction.dot(Pa),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;oi.subVectors(this.origin,e);let l=a*this.direction.dot(Cs.crossVectors(oi,Cs));if(l<0)return null;let c=a*this.direction.dot(Ca.cross(oi));if(c<0||l+c>o)return null;let u=-a*oi.dot(Pa);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},pt=class n{constructor(e,t,i,r,s,o,a,l,c,u,h,f,d,g,x,p){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c,u,h,f,d,g,x,p)}set(e,t,i,r,s,o,a,l,c,u,h,f,d,g,x,p){let m=this.elements;return m[0]=e,m[4]=t,m[8]=i,m[12]=r,m[1]=s,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=u,m[10]=h,m[14]=f,m[3]=d,m[7]=g,m[11]=x,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,r=1/Ji.setFromMatrixColumn(e,0).length(),s=1/Ji.setFromMatrixColumn(e,1).length(),o=1/Ji.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let f=o*u,d=o*h,g=a*u,x=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=d+g*c,t[5]=f-x*c,t[9]=-a*l,t[2]=x-f*c,t[6]=g+d*c,t[10]=o*l}else if(e.order==="YXZ"){let f=l*u,d=l*h,g=c*u,x=c*h;t[0]=f+x*a,t[4]=g*a-d,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=d*a-g,t[6]=x+f*a,t[10]=o*l}else if(e.order==="ZXY"){let f=l*u,d=l*h,g=c*u,x=c*h;t[0]=f-x*a,t[4]=-o*h,t[8]=g+d*a,t[1]=d+g*a,t[5]=o*u,t[9]=x-f*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let f=o*u,d=o*h,g=a*u,x=a*h;t[0]=l*u,t[4]=g*c-d,t[8]=f*c+x,t[1]=l*h,t[5]=x*c+f,t[9]=d*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let f=o*l,d=o*c,g=a*l,x=a*c;t[0]=l*u,t[4]=x-f*h,t[8]=g*h+d,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=d*h+g,t[10]=f-x*h}else if(e.order==="XZY"){let f=o*l,d=o*c,g=a*l,x=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=f*h+x,t[5]=o*u,t[9]=d*h-g,t[2]=g*h-d,t[6]=a*u,t[10]=x*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(yp,e,vp)}lookAt(e,t,i){let r=this.elements;return rn.subVectors(e,t),rn.lengthSq()===0&&(rn.z=1),rn.normalize(),ai.crossVectors(i,rn),ai.lengthSq()===0&&(Math.abs(i.z)===1?rn.x+=1e-4:rn.z+=1e-4,rn.normalize(),ai.crossVectors(i,rn)),ai.normalize(),Ps.crossVectors(rn,ai),r[0]=ai.x,r[4]=Ps.x,r[8]=rn.x,r[1]=ai.y,r[5]=Ps.y,r[9]=rn.y,r[2]=ai.z,r[6]=Ps.z,r[10]=rn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],h=i[5],f=i[9],d=i[13],g=i[2],x=i[6],p=i[10],m=i[14],v=i[3],_=i[7],b=i[11],E=i[15],S=r[0],A=r[4],C=r[8],y=r[12],M=r[1],D=r[5],F=r[9],K=r[13],P=r[2],O=r[6],H=r[10],Z=r[14],J=r[3],X=r[7],ie=r[11],j=r[15];return s[0]=o*S+a*M+l*P+c*J,s[4]=o*A+a*D+l*O+c*X,s[8]=o*C+a*F+l*H+c*ie,s[12]=o*y+a*K+l*Z+c*j,s[1]=u*S+h*M+f*P+d*J,s[5]=u*A+h*D+f*O+d*X,s[9]=u*C+h*F+f*H+d*ie,s[13]=u*y+h*K+f*Z+d*j,s[2]=g*S+x*M+p*P+m*J,s[6]=g*A+x*D+p*O+m*X,s[10]=g*C+x*F+p*H+m*ie,s[14]=g*y+x*K+p*Z+m*j,s[3]=v*S+_*M+b*P+E*J,s[7]=v*A+_*D+b*O+E*X,s[11]=v*C+_*F+b*H+E*ie,s[15]=v*y+_*K+b*Z+E*j,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],f=e[10],d=e[14],g=e[3],x=e[7],p=e[11],m=e[15];return g*(+s*l*h-r*c*h-s*a*f+i*c*f+r*a*d-i*l*d)+x*(+t*l*d-t*c*f+s*o*f-r*o*d+r*c*u-s*l*u)+p*(+t*c*h-t*a*d-s*o*h+i*o*d+s*a*u-i*c*u)+m*(-r*a*u-t*l*h+t*a*f+r*o*h-i*o*f+i*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],f=e[10],d=e[11],g=e[12],x=e[13],p=e[14],m=e[15],v=h*p*c-x*f*c+x*l*d-a*p*d-h*l*m+a*f*m,_=g*f*c-u*p*c-g*l*d+o*p*d+u*l*m-o*f*m,b=u*x*c-g*h*c+g*a*d-o*x*d-u*a*m+o*h*m,E=g*h*l-u*x*l-g*a*f+o*x*f+u*a*p-o*h*p,S=t*v+i*_+r*b+s*E;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/S;return e[0]=v*A,e[1]=(x*f*s-h*p*s-x*r*d+i*p*d+h*r*m-i*f*m)*A,e[2]=(a*p*s-x*l*s+x*r*c-i*p*c-a*r*m+i*l*m)*A,e[3]=(h*l*s-a*f*s-h*r*c+i*f*c+a*r*d-i*l*d)*A,e[4]=_*A,e[5]=(u*p*s-g*f*s+g*r*d-t*p*d-u*r*m+t*f*m)*A,e[6]=(g*l*s-o*p*s-g*r*c+t*p*c+o*r*m-t*l*m)*A,e[7]=(o*f*s-u*l*s+u*r*c-t*f*c-o*r*d+t*l*d)*A,e[8]=b*A,e[9]=(g*h*s-u*x*s-g*i*d+t*x*d+u*i*m-t*h*m)*A,e[10]=(o*x*s-g*a*s+g*i*c-t*x*c-o*i*m+t*a*m)*A,e[11]=(u*a*s-o*h*s-u*i*c+t*h*c+o*i*d-t*a*d)*A,e[12]=E*A,e[13]=(u*x*r-g*h*r+g*i*f-t*x*f-u*i*p+t*h*p)*A,e[14]=(g*a*r-o*x*r-g*i*l+t*x*l+o*i*p-t*a*p)*A,e[15]=(o*h*r-u*a*r+u*i*l-t*h*l-o*i*f+t*a*f)*A,this}scale(e){let t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+i,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,h=a+a,f=s*c,d=s*u,g=s*h,x=o*u,p=o*h,m=a*h,v=l*c,_=l*u,b=l*h,E=i.x,S=i.y,A=i.z;return r[0]=(1-(x+m))*E,r[1]=(d+b)*E,r[2]=(g-_)*E,r[3]=0,r[4]=(d-b)*S,r[5]=(1-(f+m))*S,r[6]=(p+v)*S,r[7]=0,r[8]=(g+_)*A,r[9]=(p-v)*A,r[10]=(1-(f+x))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){let r=this.elements,s=Ji.set(r[0],r[1],r[2]).length(),o=Ji.set(r[4],r[5],r[6]).length(),a=Ji.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],En.copy(this);let c=1/s,u=1/o,h=1/a;return En.elements[0]*=c,En.elements[1]*=c,En.elements[2]*=c,En.elements[4]*=u,En.elements[5]*=u,En.elements[6]*=u,En.elements[8]*=h,En.elements[9]*=h,En.elements[10]*=h,t.setFromRotationMatrix(En),i.x=s,i.y=o,i.z=a,this}makePerspective(e,t,i,r,s,o,a=Jn){let l=this.elements,c=2*s/(t-e),u=2*s/(i-r),h=(t+e)/(t-e),f=(i+r)/(i-r),d,g;if(a===Jn)d=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===oo)d=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=Jn){let l=this.elements,c=1/(t-e),u=1/(i-r),h=1/(o-s),f=(t+e)*c,d=(i+r)*u,g,x;if(a===Jn)g=(o+s)*h,x=-2*h;else if(a===oo)g=s*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=x,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Ji=new I,En=new pt,yp=new I(0,0,0),vp=new I(1,1,1),ai=new I,Ps=new I,rn=new I,lu=new pt,cu=new gi,ho=class n{constructor(e=0,t=0,i=0,r=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],f=r[6],d=r[10];switch(t){case"XYZ":this._y=Math.asin(Bt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Bt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(Bt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Bt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Bt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-Bt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return lu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(lu,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return cu.setFromEuler(this),this.setFromQuaternion(cu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ho.DEFAULT_ORDER="XYZ";var fo=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},bp=0,uu=new I,$i=new gi,Wn=new pt,Is=new I,kr=new I,Mp=new I,Sp=new gi,hu=new I(1,0,0),du=new I(0,1,0),fu=new I(0,0,1),wp={type:"added"},Ep={type:"removed"},qt=class n extends mi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:bp++}),this.uuid=$n(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new I,t=new ho,i=new gi,r=new I(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new pt},normalMatrix:{value:new nt}}),this.matrix=new pt,this.matrixWorld=new pt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new fo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return $i.setFromAxisAngle(e,t),this.quaternion.multiply($i),this}rotateOnWorldAxis(e,t){return $i.setFromAxisAngle(e,t),this.quaternion.premultiply($i),this}rotateX(e){return this.rotateOnAxis(hu,e)}rotateY(e){return this.rotateOnAxis(du,e)}rotateZ(e){return this.rotateOnAxis(fu,e)}translateOnAxis(e,t){return uu.copy(e).applyQuaternion(this.quaternion),this.position.add(uu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(hu,e)}translateY(e){return this.translateOnAxis(du,e)}translateZ(e){return this.translateOnAxis(fu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Wn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Is.copy(e):Is.set(e,t,i);let r=this.parent;this.updateWorldMatrix(!0,!1),kr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Wn.lookAt(kr,Is,this.up):Wn.lookAt(Is,kr,this.up),this.quaternion.setFromRotationMatrix(Wn),r&&(Wn.extractRotation(r.matrixWorld),$i.setFromRotationMatrix(Wn),this.quaternion.premultiply($i.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(wp)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Ep)),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Wn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Wn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Wn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(kr,e,Mp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(kr,Sp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,r=t.length;i<r;i++){let s=t[i];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.matrixWorldAutoUpdate===!0&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++){let a=r[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),f=o(e.skeletons),d=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),d.length>0&&(i.animations=d),g.length>0&&(i.nodes=g)}return i.object=r,i;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}};qt.DEFAULT_UP=new I(0,1,0);qt.DEFAULT_MATRIX_AUTO_UPDATE=!0;qt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Tn=new I,Xn=new I,Ia=new I,qn=new I,ji=new I,Qi=new I,pu=new I,La=new I,Da=new I,Ua=new I,Ls=!1,Li=class n{constructor(e=new I,t=new I,i=new I){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Tn.subVectors(e,t),r.cross(Tn);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){Tn.subVectors(r,t),Xn.subVectors(i,t),Ia.subVectors(e,t);let o=Tn.dot(Tn),a=Tn.dot(Xn),l=Tn.dot(Ia),c=Xn.dot(Xn),u=Xn.dot(Ia),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;let f=1/h,d=(c*l-a*u)*f,g=(o*u-a*l)*f;return s.set(1-d-g,g,d)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,qn)===null?!1:qn.x>=0&&qn.y>=0&&qn.x+qn.y<=1}static getUV(e,t,i,r,s,o,a,l){return Ls===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Ls=!0),this.getInterpolation(e,t,i,r,s,o,a,l)}static getInterpolation(e,t,i,r,s,o,a,l){return this.getBarycoord(e,t,i,r,qn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,qn.x),l.addScaledVector(o,qn.y),l.addScaledVector(a,qn.z),l)}static isFrontFacing(e,t,i,r){return Tn.subVectors(i,t),Xn.subVectors(e,t),Tn.cross(Xn).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Tn.subVectors(this.c,this.b),Xn.subVectors(this.a,this.b),Tn.cross(Xn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,i,r,s){return Ls===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Ls=!0),n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}getInterpolation(e,t,i,r,s){return n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,r=this.b,s=this.c,o,a;ji.subVectors(r,i),Qi.subVectors(s,i),La.subVectors(e,i);let l=ji.dot(La),c=Qi.dot(La);if(l<=0&&c<=0)return t.copy(i);Da.subVectors(e,r);let u=ji.dot(Da),h=Qi.dot(Da);if(u>=0&&h<=u)return t.copy(r);let f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector(ji,o);Ua.subVectors(e,s);let d=ji.dot(Ua),g=Qi.dot(Ua);if(g>=0&&d<=g)return t.copy(s);let x=d*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(Qi,a);let p=u*g-d*h;if(p<=0&&h-u>=0&&d-g>=0)return pu.subVectors(s,r),a=(h-u)/(h-u+(d-g)),t.copy(r).addScaledVector(pu,a);let m=1/(p+x+f);return o=x*m,a=f*m,t.copy(i).addScaledVector(ji,o).addScaledVector(Qi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},dh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},li={h:0,s:0,l:0},Ds={h:0,s:0,l:0};function Na(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ze=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,dt.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=dt.workingColorSpace){return this.r=e,this.g=t,this.b=i,dt.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=dt.workingColorSpace){if(e=fp(e,1),t=Bt(t,0,1),i=Bt(i,0,1),t===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=Na(o,s,e+1/3),this.g=Na(o,s,e),this.b=Na(o,s,e-1/3)}return dt.toWorkingColorSpace(this,r),this}setStyle(e,t=yt){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=yt){let i=dh[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=gr(e.r),this.g=gr(e.g),this.b=gr(e.b),this}copyLinearToSRGB(e){return this.r=Sa(e.r),this.g=Sa(e.g),this.b=Sa(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yt){return dt.fromWorkingColorSpace(Wt.copy(this),e),Math.round(Bt(Wt.r*255,0,255))*65536+Math.round(Bt(Wt.g*255,0,255))*256+Math.round(Bt(Wt.b*255,0,255))}getHexString(e=yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=dt.workingColorSpace){dt.fromWorkingColorSpace(Wt.copy(this),t);let i=Wt.r,r=Wt.g,s=Wt.b,o=Math.max(i,r,s),a=Math.min(i,r,s),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=dt.workingColorSpace){return dt.fromWorkingColorSpace(Wt.copy(this),t),e.r=Wt.r,e.g=Wt.g,e.b=Wt.b,e}getStyle(e=yt){dt.fromWorkingColorSpace(Wt.copy(this),e);let t=Wt.r,i=Wt.g,r=Wt.b;return e!==yt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(li),this.setHSL(li.h+e,li.s+t,li.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(li),e.getHSL(Ds);let i=ba(li.h,Ds.h,t),r=ba(li.s,Ds.s,t),s=ba(li.l,Ds.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Wt=new Ze;Ze.NAMES=dh;var Tp=0,Qn=class extends mi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Tp++}),this.uuid=$n(),this.name="",this.type="Material",this.blending=mr,this.side=pi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ja,this.blendDst=$a,this.blendEquation=Pi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ze(0,0,0),this.blendAlpha=0,this.depthFunc=eo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=tu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Xi,this.stencilZFail=Xi,this.stencilZPass=Xi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==mr&&(i.blending=this.blending),this.side!==pi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Ja&&(i.blendSrc=this.blendSrc),this.blendDst!==$a&&(i.blendDst=this.blendDst),this.blendEquation!==Pi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==eo&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==tu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Xi&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Xi&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Xi&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},lt=class extends Qn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ze(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Hl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var It=new I,Us=new $,Xt=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=tl,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=ui,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Us.fromBufferAttribute(this,t),Us.applyMatrix3(e),this.setXY(t,Us.x,Us.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyMatrix3(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyMatrix4(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyNormalMatrix(e),this.setXYZ(t,It.x,It.y,It.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.transformDirection(e),this.setXYZ(t,It.x,It.y,It.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Zn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=ft(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Zn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Zn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Zn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Zn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array),r=ft(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array),r=ft(r,this.array),s=ft(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==tl&&(e.usage=this.usage),e}};var po=class extends Xt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var mo=class extends Xt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var $e=class extends Xt{constructor(e,t,i){super(new Float32Array(e),t,i)}};var Ap=0,dn=new pt,Oa=new qt,er=new I,sn=new Cn,Br=new Cn,zt=new I,Rt=class n extends mi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ap++}),this.uuid=$n(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(hh(e)?mo:po)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new nt().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return dn.makeRotationFromQuaternion(e),this.applyMatrix4(dn),this}rotateX(e){return dn.makeRotationX(e),this.applyMatrix4(dn),this}rotateY(e){return dn.makeRotationY(e),this.applyMatrix4(dn),this}rotateZ(e){return dn.makeRotationZ(e),this.applyMatrix4(dn),this}translate(e,t,i){return dn.makeTranslation(e,t,i),this.applyMatrix4(dn),this}scale(e,t,i){return dn.makeScale(e,t,i),this.applyMatrix4(dn),this}lookAt(e){return Oa.lookAt(e),Oa.updateMatrix(),this.applyMatrix4(Oa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(er).negate(),this.translate(er.x,er.y,er.z),this}setFromPoints(e){let t=[];for(let i=0,r=e.length;i<r;i++){let s=e[i];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new $e(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Cn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){let s=t[i];sn.setFromBufferAttribute(s),this.morphTargetsRelative?(zt.addVectors(this.boundingBox.min,sn.min),this.boundingBox.expandByPoint(zt),zt.addVectors(this.boundingBox.max,sn.max),this.boundingBox.expandByPoint(zt)):(this.boundingBox.expandByPoint(sn.min),this.boundingBox.expandByPoint(sn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new zi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new I,1/0);return}if(e){let i=this.boundingSphere.center;if(sn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];Br.setFromBufferAttribute(a),this.morphTargetsRelative?(zt.addVectors(sn.min,Br.min),sn.expandByPoint(zt),zt.addVectors(sn.max,Br.max),sn.expandByPoint(zt)):(sn.expandByPoint(Br.min),sn.expandByPoint(Br.max))}sn.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)zt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(zt));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)zt.fromBufferAttribute(a,c),l&&(er.fromBufferAttribute(e,c),zt.add(er)),r=Math.max(r,i.distanceToSquared(zt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.array,r=t.position.array,s=t.normal.array,o=t.uv.array,a=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Xt(new Float32Array(4*a),4));let l=this.getAttribute("tangent").array,c=[],u=[];for(let M=0;M<a;M++)c[M]=new I,u[M]=new I;let h=new I,f=new I,d=new I,g=new $,x=new $,p=new $,m=new I,v=new I;function _(M,D,F){h.fromArray(r,M*3),f.fromArray(r,D*3),d.fromArray(r,F*3),g.fromArray(o,M*2),x.fromArray(o,D*2),p.fromArray(o,F*2),f.sub(h),d.sub(h),x.sub(g),p.sub(g);let K=1/(x.x*p.y-p.x*x.y);isFinite(K)&&(m.copy(f).multiplyScalar(p.y).addScaledVector(d,-x.y).multiplyScalar(K),v.copy(d).multiplyScalar(x.x).addScaledVector(f,-p.x).multiplyScalar(K),c[M].add(m),c[D].add(m),c[F].add(m),u[M].add(v),u[D].add(v),u[F].add(v))}let b=this.groups;b.length===0&&(b=[{start:0,count:i.length}]);for(let M=0,D=b.length;M<D;++M){let F=b[M],K=F.start,P=F.count;for(let O=K,H=K+P;O<H;O+=3)_(i[O+0],i[O+1],i[O+2])}let E=new I,S=new I,A=new I,C=new I;function y(M){A.fromArray(s,M*3),C.copy(A);let D=c[M];E.copy(D),E.sub(A.multiplyScalar(A.dot(D))).normalize(),S.crossVectors(C,D);let K=S.dot(u[M])<0?-1:1;l[M*4]=E.x,l[M*4+1]=E.y,l[M*4+2]=E.z,l[M*4+3]=K}for(let M=0,D=b.length;M<D;++M){let F=b[M],K=F.start,P=F.count;for(let O=K,H=K+P;O<H;O+=3)y(i[O+0]),y(i[O+1]),y(i[O+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Xt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,d=i.count;f<d;f++)i.setXYZ(f,0,0,0);let r=new I,s=new I,o=new I,a=new I,l=new I,c=new I,u=new I,h=new I;if(e)for(let f=0,d=e.count;f<d;f+=3){let g=e.getX(f+0),x=e.getX(f+1),p=e.getX(f+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,x),o.fromBufferAttribute(t,p),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,x),c.fromBufferAttribute(i,p),a.add(u),l.add(u),c.add(u),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(p,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)r.fromBufferAttribute(t,f+0),s.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)zt.fromBufferAttribute(e,t),zt.normalize(),e.setXYZ(t,zt.x,zt.y,zt.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,f=new c.constructor(l.length*u),d=0,g=0;for(let x=0,p=l.length;x<p;x++){a.isInterleavedBufferAttribute?d=l[x]*a.data.stride+a.offset:d=l[x]*u;for(let m=0;m<u;m++)f[g++]=c[d++]}return new Xt(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,i);t.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){let f=c[u],d=e(f,i);l.push(d)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){let d=c[h];u.push(d.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone(t));let r=e.attributes;for(let c in r){let u=r[c];this.setAttribute(c,u.clone(t))}let s=e.morphAttributes;for(let c in s){let u=[],h=s[c];for(let f=0,d=h.length;f<d;f++)u.push(h[f].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},mu=new pt,Ai=new al,Ns=new zi,gu=new I,tr=new I,nr=new I,ir=new I,Fa=new I,Os=new I,Fs=new $,zs=new $,ks=new $,xu=new I,_u=new I,yu=new I,Bs=new I,Gs=new I,se=class extends qt{constructor(e=new Rt,t=new lt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){Os.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let u=a[l],h=s[l];u!==0&&(Fa.fromBufferAttribute(h,e),o?Os.addScaledVector(Fa,u):Os.addScaledVector(Fa.sub(t),u))}t.add(Os)}return t}raycast(e,t){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ns.copy(i.boundingSphere),Ns.applyMatrix4(s),Ai.copy(e.ray).recast(e.near),!(Ns.containsPoint(Ai.origin)===!1&&(Ai.intersectSphere(Ns,gu)===null||Ai.origin.distanceToSquared(gu)>(e.far-e.near)**2))&&(mu.copy(s).invert(),Ai.copy(e.ray).applyMatrix4(mu),!(i.boundingBox!==null&&Ai.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Ai)))}_computeIntersections(e,t,i){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,f=s.groups,d=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let p=f[g],m=o[p.materialIndex],v=Math.max(p.start,d.start),_=Math.min(a.count,Math.min(p.start+p.count,d.start+d.count));for(let b=v,E=_;b<E;b+=3){let S=a.getX(b),A=a.getX(b+1),C=a.getX(b+2);r=Hs(this,m,e,i,c,u,h,S,A,C),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let g=Math.max(0,d.start),x=Math.min(a.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){let v=a.getX(p),_=a.getX(p+1),b=a.getX(p+2);r=Hs(this,o,e,i,c,u,h,v,_,b),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let p=f[g],m=o[p.materialIndex],v=Math.max(p.start,d.start),_=Math.min(l.count,Math.min(p.start+p.count,d.start+d.count));for(let b=v,E=_;b<E;b+=3){let S=b,A=b+1,C=b+2;r=Hs(this,m,e,i,c,u,h,S,A,C),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let g=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){let v=p,_=p+1,b=p+2;r=Hs(this,o,e,i,c,u,h,v,_,b),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}}};function Rp(n,e,t,i,r,s,o,a){let l;if(e.side===Lt?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===pi,a),l===null)return null;Gs.copy(a),Gs.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(Gs);return c<t.near||c>t.far?null:{distance:c,point:Gs.clone(),object:n}}function Hs(n,e,t,i,r,s,o,a,l,c){n.getVertexPosition(a,tr),n.getVertexPosition(l,nr),n.getVertexPosition(c,ir);let u=Rp(n,e,t,i,tr,nr,ir,Bs);if(u){r&&(Fs.fromBufferAttribute(r,a),zs.fromBufferAttribute(r,l),ks.fromBufferAttribute(r,c),u.uv=Li.getInterpolation(Bs,tr,nr,ir,Fs,zs,ks,new $)),s&&(Fs.fromBufferAttribute(s,a),zs.fromBufferAttribute(s,l),ks.fromBufferAttribute(s,c),u.uv1=Li.getInterpolation(Bs,tr,nr,ir,Fs,zs,ks,new $),u.uv2=u.uv1),o&&(xu.fromBufferAttribute(o,a),_u.fromBufferAttribute(o,l),yu.fromBufferAttribute(o,c),u.normal=Li.getInterpolation(Bs,tr,nr,ir,xu,_u,yu,new I),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new I,materialIndex:0};Li.getNormal(tr,nr,ir,h.normal),u.face=h}return u}var on=class n extends Rt{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],u=[],h=[],f=0,d=0;g("z","y","x",-1,-1,i,t,e,o,s,0),g("z","y","x",1,-1,i,t,-e,o,s,1),g("x","z","y",1,1,e,i,t,r,o,2),g("x","z","y",1,-1,e,i,-t,r,o,3),g("x","y","z",1,-1,e,t,i,r,s,4),g("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new $e(c,3)),this.setAttribute("normal",new $e(u,3)),this.setAttribute("uv",new $e(h,2));function g(x,p,m,v,_,b,E,S,A,C,y){let M=b/A,D=E/C,F=b/2,K=E/2,P=S/2,O=A+1,H=C+1,Z=0,J=0,X=new I;for(let ie=0;ie<H;ie++){let j=ie*D-K;for(let he=0;he<O;he++){let W=he*M-F;X[x]=W*v,X[p]=j*_,X[m]=P,c.push(X.x,X.y,X.z),X[x]=0,X[p]=0,X[m]=S>0?1:-1,u.push(X.x,X.y,X.z),h.push(he/A),h.push(1-ie/C),Z+=1}}for(let ie=0;ie<C;ie++)for(let j=0;j<A;j++){let he=f+j+O*ie,W=f+j+O*(ie+1),te=f+(j+1)+O*(ie+1),Se=f+(j+1)+O*ie;l.push(he,W,Se),l.push(W,te,Se),J+=6}a.addGroup(d,J,y),d+=J,f+=Z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Mr(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function Zt(n){let e={};for(let t=0;t<n.length;t++){let i=Mr(n[t]);for(let r in i)e[r]=i[r]}return e}function Cp(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function fh(n){return n.getRenderTarget()===null?n.outputColorSpace:dt.workingColorSpace}var Pp={clone:Mr,merge:Zt},Ip=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Lp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,xn=class extends Qn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ip,this.fragmentShader=Lp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Mr(e.uniforms),this.uniformsGroups=Cp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},go=class extends qt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new pt,this.projectionMatrix=new pt,this.projectionMatrixInverse=new pt,this.coordinateSystem=Jn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},tn=class extends go{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=il*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(va*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return il*2*Math.atan(Math.tan(va*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(va*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},rr=-90,sr=1,ll=class extends qt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new tn(rr,sr,e,t);r.layers=this.layers,this.add(r);let s=new tn(rr,sr,e,t);s.layers=this.layers,this.add(s);let o=new tn(rr,sr,e,t);o.layers=this.layers,this.add(o);let a=new tn(rr,sr,e,t);a.layers=this.layers,this.add(a);let l=new tn(rr,sr,e,t);l.layers=this.layers,this.add(l);let c=new tn(rr,sr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,l]=t;for(let c of t)this.remove(c);if(e===Jn)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===oo)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,l),e.setRenderTarget(i,4,r),e.render(t,c),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,r),e.render(t,u),e.setRenderTarget(h,f,d),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},xo=class extends gn{constructor(e,t,i,r,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:_r,super(e,t,i,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},cl=class extends $t{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];t.encoding!==void 0&&(Yr("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===Ni?yt:mn),this.texture=new xo(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:fn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new on(5,5,5),s=new xn({name:"CubemapFromEquirect",uniforms:Mr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Lt,blending:hi});s.uniforms.tEquirect.value=t;let o=new se(r,s),a=t.minFilter;return t.minFilter===$r&&(t.minFilter=fn),new ll(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,r){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}},za=new I,Dp=new I,Up=new nt,Kn=class{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=za.subVectors(i,t).cross(Dp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(za),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||Up.getNormalMatrix(e),r=this.coplanarPoint(za).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ri=new zi,Vs=new I,jr=class{constructor(e=new Kn,t=new Kn,i=new Kn,r=new Kn,s=new Kn,o=new Kn){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Jn){let i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],h=r[6],f=r[7],d=r[8],g=r[9],x=r[10],p=r[11],m=r[12],v=r[13],_=r[14],b=r[15];if(i[0].setComponents(l-s,f-c,p-d,b-m).normalize(),i[1].setComponents(l+s,f+c,p+d,b+m).normalize(),i[2].setComponents(l+o,f+u,p+g,b+v).normalize(),i[3].setComponents(l-o,f-u,p-g,b-v).normalize(),i[4].setComponents(l-a,f-h,p-x,b-_).normalize(),t===Jn)i[5].setComponents(l+a,f+h,p+x,b+_).normalize();else if(t===oo)i[5].setComponents(a,h,x,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ri.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ri.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ri)}intersectsSprite(e){return Ri.center.set(0,0,0),Ri.radius=.7071067811865476,Ri.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ri)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(Vs.x=r.normal.x>0?e.max.x:e.min.x,Vs.y=r.normal.y>0?e.max.y:e.min.y,Vs.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Vs)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function ph(){let n=null,e=!1,t=null,i=null;function r(s,o){t(s,o),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function Np(n,e){let t=e.isWebGL2,i=new WeakMap;function r(c,u){let h=c.array,f=c.usage,d=h.byteLength,g=n.createBuffer();n.bindBuffer(u,g),n.bufferData(u,h,f),c.onUploadCallback();let x;if(h instanceof Float32Array)x=n.FLOAT;else if(h instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)x=n.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else x=n.UNSIGNED_SHORT;else if(h instanceof Int16Array)x=n.SHORT;else if(h instanceof Uint32Array)x=n.UNSIGNED_INT;else if(h instanceof Int32Array)x=n.INT;else if(h instanceof Int8Array)x=n.BYTE;else if(h instanceof Uint8Array)x=n.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)x=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:g,type:x,bytesPerElement:h.BYTES_PER_ELEMENT,version:c.version,size:d}}function s(c,u,h){let f=u.array,d=u._updateRange,g=u.updateRanges;if(n.bindBuffer(h,c),d.count===-1&&g.length===0&&n.bufferSubData(h,0,f),g.length!==0){for(let x=0,p=g.length;x<p;x++){let m=g[x];t?n.bufferSubData(h,m.start*f.BYTES_PER_ELEMENT,f,m.start,m.count):n.bufferSubData(h,m.start*f.BYTES_PER_ELEMENT,f.subarray(m.start,m.start+m.count))}u.clearUpdateRanges()}d.count!==-1&&(t?n.bufferSubData(h,d.offset*f.BYTES_PER_ELEMENT,f,d.offset,d.count):n.bufferSubData(h,d.offset*f.BYTES_PER_ELEMENT,f.subarray(d.offset,d.offset+d.count)),d.count=-1),u.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),i.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);let u=i.get(c);u&&(n.deleteBuffer(u.buffer),i.delete(c))}function l(c,u){if(c.isGLBufferAttribute){let f=i.get(c);(!f||f.version<c.version)&&i.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);let h=i.get(c);if(h===void 0)i.set(c,r(c,u));else if(h.version<c.version){if(h.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(h.buffer,c,u),h.version=c.version}}return{get:o,remove:a,update:l}}var jt=class n extends Rt{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(i),l=Math.floor(r),c=a+1,u=l+1,h=e/a,f=t/l,d=[],g=[],x=[],p=[];for(let m=0;m<u;m++){let v=m*f-o;for(let _=0;_<c;_++){let b=_*h-s;g.push(b,-v,0),x.push(0,0,1),p.push(_/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let v=0;v<a;v++){let _=v+c*m,b=v+c*(m+1),E=v+1+c*(m+1),S=v+1+c*m;d.push(_,b,S),d.push(b,E,S)}this.setIndex(d),this.setAttribute("position",new $e(g,3)),this.setAttribute("normal",new $e(x,3)),this.setAttribute("uv",new $e(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},Op=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Fp=`#ifdef USE_ALPHAHASH
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
#endif`,zp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,kp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Bp=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Gp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Hp=`#ifdef USE_AOMAP
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
#endif`,Vp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Wp=`#ifdef USE_BATCHING
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
#endif`,Xp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,qp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Yp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Kp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Zp=`#ifdef USE_IRIDESCENCE
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
#endif`,Jp=`#ifdef USE_BUMPMAP
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
#endif`,$p=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,jp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Qp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,em=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,tm=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,nm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,im=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,rm=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,sm=`#define PI 3.141592653589793
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
} // validated`,om=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,am=`vec3 transformedNormal = objectNormal;
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
#endif`,lm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,cm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,um=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,hm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,dm="gl_FragColor = linearToOutputTexel( gl_FragColor );",fm=`
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
}`,pm=`#ifdef USE_ENVMAP
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
#endif`,mm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,gm=`#ifdef USE_ENVMAP
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
#endif`,xm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,_m=`#ifdef USE_ENVMAP
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
#endif`,ym=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,vm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,bm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Mm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Sm=`#ifdef USE_GRADIENTMAP
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
}`,wm=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Em=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Tm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Am=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Rm=`uniform bool receiveShadow;
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
#endif`,Cm=`#ifdef USE_ENVMAP
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
#endif`,Pm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Im=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Lm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Dm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Um=`PhysicalMaterial material;
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
#endif`,Nm=`struct PhysicalMaterial {
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
}`,Om=`
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
#endif`,Fm=`#if defined( RE_IndirectDiffuse )
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
#endif`,zm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,km=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Bm=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Gm=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Hm=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Vm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Wm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Xm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,qm=`#if defined( USE_POINTS_UV )
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
#endif`,Ym=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Km=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Zm=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Jm=`#ifdef USE_MORPHNORMALS
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
#endif`,$m=`#ifdef USE_MORPHTARGETS
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
#endif`,jm=`#ifdef USE_MORPHTARGETS
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
#endif`,Qm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,e0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,t0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,n0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,i0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,r0=`#ifdef USE_NORMALMAP
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
#endif`,s0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,o0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,a0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,l0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,c0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,u0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,h0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,d0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,f0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,p0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,m0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,g0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,x0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,_0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,y0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,v0=`float getShadowMask() {
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
}`,b0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,M0=`#ifdef USE_SKINNING
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
#endif`,S0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,w0=`#ifdef USE_SKINNING
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
#endif`,E0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,T0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,A0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,R0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,C0=`#ifdef USE_TRANSMISSION
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
#endif`,P0=`#ifdef USE_TRANSMISSION
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
#endif`,I0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,L0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,D0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,U0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,N0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,O0=`uniform sampler2D t2D;
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
}`,F0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,z0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,k0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,B0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,G0=`#include <common>
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
}`,H0=`#if DEPTH_PACKING == 3200
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
}`,V0=`#define DISTANCE
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
}`,W0=`#define DISTANCE
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
}`,X0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,q0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Y0=`uniform float scale;
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
}`,K0=`uniform vec3 diffuse;
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
}`,Z0=`#include <common>
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
}`,J0=`uniform vec3 diffuse;
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
}`,$0=`#define LAMBERT
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
}`,j0=`#define LAMBERT
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
}`,Q0=`#define MATCAP
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
}`,eg=`#define MATCAP
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
}`,tg=`#define NORMAL
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
}`,ng=`#define NORMAL
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
}`,ig=`#define PHONG
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
}`,rg=`#define PHONG
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
}`,sg=`#define STANDARD
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
}`,og=`#define STANDARD
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
}`,ag=`#define TOON
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
}`,lg=`#define TOON
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
}`,cg=`uniform float size;
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
}`,ug=`uniform vec3 diffuse;
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
}`,hg=`#include <common>
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
}`,dg=`uniform vec3 color;
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
}`,fg=`uniform float rotation;
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
}`,pg=`uniform vec3 diffuse;
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
}`,Qe={alphahash_fragment:Op,alphahash_pars_fragment:Fp,alphamap_fragment:zp,alphamap_pars_fragment:kp,alphatest_fragment:Bp,alphatest_pars_fragment:Gp,aomap_fragment:Hp,aomap_pars_fragment:Vp,batching_pars_vertex:Wp,batching_vertex:Xp,begin_vertex:qp,beginnormal_vertex:Yp,bsdfs:Kp,iridescence_fragment:Zp,bumpmap_pars_fragment:Jp,clipping_planes_fragment:$p,clipping_planes_pars_fragment:jp,clipping_planes_pars_vertex:Qp,clipping_planes_vertex:em,color_fragment:tm,color_pars_fragment:nm,color_pars_vertex:im,color_vertex:rm,common:sm,cube_uv_reflection_fragment:om,defaultnormal_vertex:am,displacementmap_pars_vertex:lm,displacementmap_vertex:cm,emissivemap_fragment:um,emissivemap_pars_fragment:hm,colorspace_fragment:dm,colorspace_pars_fragment:fm,envmap_fragment:pm,envmap_common_pars_fragment:mm,envmap_pars_fragment:gm,envmap_pars_vertex:xm,envmap_physical_pars_fragment:Cm,envmap_vertex:_m,fog_vertex:ym,fog_pars_vertex:vm,fog_fragment:bm,fog_pars_fragment:Mm,gradientmap_pars_fragment:Sm,lightmap_fragment:wm,lightmap_pars_fragment:Em,lights_lambert_fragment:Tm,lights_lambert_pars_fragment:Am,lights_pars_begin:Rm,lights_toon_fragment:Pm,lights_toon_pars_fragment:Im,lights_phong_fragment:Lm,lights_phong_pars_fragment:Dm,lights_physical_fragment:Um,lights_physical_pars_fragment:Nm,lights_fragment_begin:Om,lights_fragment_maps:Fm,lights_fragment_end:zm,logdepthbuf_fragment:km,logdepthbuf_pars_fragment:Bm,logdepthbuf_pars_vertex:Gm,logdepthbuf_vertex:Hm,map_fragment:Vm,map_pars_fragment:Wm,map_particle_fragment:Xm,map_particle_pars_fragment:qm,metalnessmap_fragment:Ym,metalnessmap_pars_fragment:Km,morphcolor_vertex:Zm,morphnormal_vertex:Jm,morphtarget_pars_vertex:$m,morphtarget_vertex:jm,normal_fragment_begin:Qm,normal_fragment_maps:e0,normal_pars_fragment:t0,normal_pars_vertex:n0,normal_vertex:i0,normalmap_pars_fragment:r0,clearcoat_normal_fragment_begin:s0,clearcoat_normal_fragment_maps:o0,clearcoat_pars_fragment:a0,iridescence_pars_fragment:l0,opaque_fragment:c0,packing:u0,premultiplied_alpha_fragment:h0,project_vertex:d0,dithering_fragment:f0,dithering_pars_fragment:p0,roughnessmap_fragment:m0,roughnessmap_pars_fragment:g0,shadowmap_pars_fragment:x0,shadowmap_pars_vertex:_0,shadowmap_vertex:y0,shadowmask_pars_fragment:v0,skinbase_vertex:b0,skinning_pars_vertex:M0,skinning_vertex:S0,skinnormal_vertex:w0,specularmap_fragment:E0,specularmap_pars_fragment:T0,tonemapping_fragment:A0,tonemapping_pars_fragment:R0,transmission_fragment:C0,transmission_pars_fragment:P0,uv_pars_fragment:I0,uv_pars_vertex:L0,uv_vertex:D0,worldpos_vertex:U0,background_vert:N0,background_frag:O0,backgroundCube_vert:F0,backgroundCube_frag:z0,cube_vert:k0,cube_frag:B0,depth_vert:G0,depth_frag:H0,distanceRGBA_vert:V0,distanceRGBA_frag:W0,equirect_vert:X0,equirect_frag:q0,linedashed_vert:Y0,linedashed_frag:K0,meshbasic_vert:Z0,meshbasic_frag:J0,meshlambert_vert:$0,meshlambert_frag:j0,meshmatcap_vert:Q0,meshmatcap_frag:eg,meshnormal_vert:tg,meshnormal_frag:ng,meshphong_vert:ig,meshphong_frag:rg,meshphysical_vert:sg,meshphysical_frag:og,meshtoon_vert:ag,meshtoon_frag:lg,points_vert:cg,points_frag:ug,shadow_vert:hg,shadow_frag:dg,sprite_vert:fg,sprite_frag:pg},me={common:{diffuse:{value:new Ze(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new nt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new nt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new nt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new nt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new nt},normalScale:{value:new $(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new nt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new nt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new nt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new nt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ze(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ze(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0},uvTransform:{value:new nt}},sprite:{diffuse:{value:new Ze(16777215)},opacity:{value:1},center:{value:new $(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}}},On={basic:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Qe.meshbasic_vert,fragmentShader:Qe.meshbasic_frag},lambert:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ze(0)}}]),vertexShader:Qe.meshlambert_vert,fragmentShader:Qe.meshlambert_frag},phong:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ze(0)},specular:{value:new Ze(1118481)},shininess:{value:30}}]),vertexShader:Qe.meshphong_vert,fragmentShader:Qe.meshphong_frag},standard:{uniforms:Zt([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new Ze(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag},toon:{uniforms:Zt([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new Ze(0)}}]),vertexShader:Qe.meshtoon_vert,fragmentShader:Qe.meshtoon_frag},matcap:{uniforms:Zt([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Qe.meshmatcap_vert,fragmentShader:Qe.meshmatcap_frag},points:{uniforms:Zt([me.points,me.fog]),vertexShader:Qe.points_vert,fragmentShader:Qe.points_frag},dashed:{uniforms:Zt([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qe.linedashed_vert,fragmentShader:Qe.linedashed_frag},depth:{uniforms:Zt([me.common,me.displacementmap]),vertexShader:Qe.depth_vert,fragmentShader:Qe.depth_frag},normal:{uniforms:Zt([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Qe.meshnormal_vert,fragmentShader:Qe.meshnormal_frag},sprite:{uniforms:Zt([me.sprite,me.fog]),vertexShader:Qe.sprite_vert,fragmentShader:Qe.sprite_frag},background:{uniforms:{uvTransform:{value:new nt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qe.background_vert,fragmentShader:Qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Qe.backgroundCube_vert,fragmentShader:Qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qe.cube_vert,fragmentShader:Qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qe.equirect_vert,fragmentShader:Qe.equirect_frag},distanceRGBA:{uniforms:Zt([me.common,me.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qe.distanceRGBA_vert,fragmentShader:Qe.distanceRGBA_frag},shadow:{uniforms:Zt([me.lights,me.fog,{color:{value:new Ze(0)},opacity:{value:1}}]),vertexShader:Qe.shadow_vert,fragmentShader:Qe.shadow_frag}};On.physical={uniforms:Zt([On.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new nt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new nt},clearcoatNormalScale:{value:new $(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new nt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new nt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new nt},sheen:{value:0},sheenColor:{value:new Ze(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new nt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new nt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new nt},transmissionSamplerSize:{value:new $},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new nt},attenuationDistance:{value:0},attenuationColor:{value:new Ze(0)},specularColor:{value:new Ze(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new nt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new nt},anisotropyVector:{value:new $},anisotropyMap:{value:null},anisotropyMapTransform:{value:new nt}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag};var Ws={r:0,b:0,g:0};function mg(n,e,t,i,r,s,o){let a=new Ze(0),l=s===!0?0:1,c,u,h=null,f=0,d=null;function g(p,m){let v=!1,_=m.isScene===!0?m.background:null;_&&_.isTexture&&(_=(m.backgroundBlurriness>0?t:e).get(_)),_===null?x(a,l):_&&_.isColor&&(x(_,1),v=!0);let b=n.xr.getEnvironmentBlendMode();b==="additive"?i.buffers.color.setClear(0,0,0,1,o):b==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||v)&&n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil),_&&(_.isCubeTexture||_.mapping===Uo)?(u===void 0&&(u=new se(new on(1,1,1),new xn({name:"BackgroundCubeMaterial",uniforms:Mr(On.backgroundCube.uniforms),vertexShader:On.backgroundCube.vertexShader,fragmentShader:On.backgroundCube.fragmentShader,side:Lt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(E,S,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),u.material.uniforms.envMap.value=_,u.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=m.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,u.material.toneMapped=dt.getTransfer(_.colorSpace)!==gt,(h!==_||f!==_.version||d!==n.toneMapping)&&(u.material.needsUpdate=!0,h=_,f=_.version,d=n.toneMapping),u.layers.enableAll(),p.unshift(u,u.geometry,u.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new se(new jt(2,2),new xn({name:"BackgroundMaterial",uniforms:Mr(On.background.uniforms),vertexShader:On.background.vertexShader,fragmentShader:On.background.fragmentShader,side:pi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,c.material.toneMapped=dt.getTransfer(_.colorSpace)!==gt,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(h!==_||f!==_.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,h=_,f=_.version,d=n.toneMapping),c.layers.enableAll(),p.unshift(c,c.geometry,c.material,0,0,null))}function x(p,m){p.getRGB(Ws,fh(n)),i.buffers.color.setClear(Ws.r,Ws.g,Ws.b,m,o)}return{getClearColor:function(){return a},setClearColor:function(p,m=1){a.set(p),l=m,x(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(p){l=p,x(a,l)},render:g}}function gg(n,e,t,i){let r=n.getParameter(n.MAX_VERTEX_ATTRIBS),s=i.isWebGL2?null:e.get("OES_vertex_array_object"),o=i.isWebGL2||s!==null,a={},l=p(null),c=l,u=!1;function h(P,O,H,Z,J){let X=!1;if(o){let ie=x(Z,H,O);c!==ie&&(c=ie,d(c.object)),X=m(P,Z,H,J),X&&v(P,Z,H,J)}else{let ie=O.wireframe===!0;(c.geometry!==Z.id||c.program!==H.id||c.wireframe!==ie)&&(c.geometry=Z.id,c.program=H.id,c.wireframe=ie,X=!0)}J!==null&&t.update(J,n.ELEMENT_ARRAY_BUFFER),(X||u)&&(u=!1,C(P,O,H,Z),J!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(J).buffer))}function f(){return i.isWebGL2?n.createVertexArray():s.createVertexArrayOES()}function d(P){return i.isWebGL2?n.bindVertexArray(P):s.bindVertexArrayOES(P)}function g(P){return i.isWebGL2?n.deleteVertexArray(P):s.deleteVertexArrayOES(P)}function x(P,O,H){let Z=H.wireframe===!0,J=a[P.id];J===void 0&&(J={},a[P.id]=J);let X=J[O.id];X===void 0&&(X={},J[O.id]=X);let ie=X[Z];return ie===void 0&&(ie=p(f()),X[Z]=ie),ie}function p(P){let O=[],H=[],Z=[];for(let J=0;J<r;J++)O[J]=0,H[J]=0,Z[J]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:H,attributeDivisors:Z,object:P,attributes:{},index:null}}function m(P,O,H,Z){let J=c.attributes,X=O.attributes,ie=0,j=H.getAttributes();for(let he in j)if(j[he].location>=0){let te=J[he],Se=X[he];if(Se===void 0&&(he==="instanceMatrix"&&P.instanceMatrix&&(Se=P.instanceMatrix),he==="instanceColor"&&P.instanceColor&&(Se=P.instanceColor)),te===void 0||te.attribute!==Se||Se&&te.data!==Se.data)return!0;ie++}return c.attributesNum!==ie||c.index!==Z}function v(P,O,H,Z){let J={},X=O.attributes,ie=0,j=H.getAttributes();for(let he in j)if(j[he].location>=0){let te=X[he];te===void 0&&(he==="instanceMatrix"&&P.instanceMatrix&&(te=P.instanceMatrix),he==="instanceColor"&&P.instanceColor&&(te=P.instanceColor));let Se={};Se.attribute=te,te&&te.data&&(Se.data=te.data),J[he]=Se,ie++}c.attributes=J,c.attributesNum=ie,c.index=Z}function _(){let P=c.newAttributes;for(let O=0,H=P.length;O<H;O++)P[O]=0}function b(P){E(P,0)}function E(P,O){let H=c.newAttributes,Z=c.enabledAttributes,J=c.attributeDivisors;H[P]=1,Z[P]===0&&(n.enableVertexAttribArray(P),Z[P]=1),J[P]!==O&&((i.isWebGL2?n:e.get("ANGLE_instanced_arrays"))[i.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](P,O),J[P]=O)}function S(){let P=c.newAttributes,O=c.enabledAttributes;for(let H=0,Z=O.length;H<Z;H++)O[H]!==P[H]&&(n.disableVertexAttribArray(H),O[H]=0)}function A(P,O,H,Z,J,X,ie){ie===!0?n.vertexAttribIPointer(P,O,H,J,X):n.vertexAttribPointer(P,O,H,Z,J,X)}function C(P,O,H,Z){if(i.isWebGL2===!1&&(P.isInstancedMesh||Z.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;_();let J=Z.attributes,X=H.getAttributes(),ie=O.defaultAttributeValues;for(let j in X){let he=X[j];if(he.location>=0){let W=J[j];if(W===void 0&&(j==="instanceMatrix"&&P.instanceMatrix&&(W=P.instanceMatrix),j==="instanceColor"&&P.instanceColor&&(W=P.instanceColor)),W!==void 0){let te=W.normalized,Se=W.itemSize,Le=t.get(W);if(Le===void 0)continue;let _e=Le.buffer,Fe=Le.type,ze=Le.bytesPerElement,le=i.isWebGL2===!0&&(Fe===n.INT||Fe===n.UNSIGNED_INT||W.gpuType===eh);if(W.isInterleavedBufferAttribute){let ge=W.data,L=ge.stride,de=W.offset;if(ge.isInstancedInterleavedBuffer){for(let Y=0;Y<he.locationSize;Y++)E(he.location+Y,ge.meshPerAttribute);P.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let Y=0;Y<he.locationSize;Y++)b(he.location+Y);n.bindBuffer(n.ARRAY_BUFFER,_e);for(let Y=0;Y<he.locationSize;Y++)A(he.location+Y,Se/he.locationSize,Fe,te,L*ze,(de+Se/he.locationSize*Y)*ze,le)}else{if(W.isInstancedBufferAttribute){for(let ge=0;ge<he.locationSize;ge++)E(he.location+ge,W.meshPerAttribute);P.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let ge=0;ge<he.locationSize;ge++)b(he.location+ge);n.bindBuffer(n.ARRAY_BUFFER,_e);for(let ge=0;ge<he.locationSize;ge++)A(he.location+ge,Se/he.locationSize,Fe,te,Se*ze,Se/he.locationSize*ge*ze,le)}}else if(ie!==void 0){let te=ie[j];if(te!==void 0)switch(te.length){case 2:n.vertexAttrib2fv(he.location,te);break;case 3:n.vertexAttrib3fv(he.location,te);break;case 4:n.vertexAttrib4fv(he.location,te);break;default:n.vertexAttrib1fv(he.location,te)}}}}S()}function y(){F();for(let P in a){let O=a[P];for(let H in O){let Z=O[H];for(let J in Z)g(Z[J].object),delete Z[J];delete O[H]}delete a[P]}}function M(P){if(a[P.id]===void 0)return;let O=a[P.id];for(let H in O){let Z=O[H];for(let J in Z)g(Z[J].object),delete Z[J];delete O[H]}delete a[P.id]}function D(P){for(let O in a){let H=a[O];if(H[P.id]===void 0)continue;let Z=H[P.id];for(let J in Z)g(Z[J].object),delete Z[J];delete H[P.id]}}function F(){K(),u=!0,c!==l&&(c=l,d(c.object))}function K(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:F,resetDefaultState:K,dispose:y,releaseStatesOfGeometry:M,releaseStatesOfProgram:D,initAttributes:_,enableAttribute:b,disableUnusedAttributes:S}}function xg(n,e,t,i){let r=i.isWebGL2,s;function o(u){s=u}function a(u,h){n.drawArrays(s,u,h),t.update(h,s,1)}function l(u,h,f){if(f===0)return;let d,g;if(r)d=n,g="drawArraysInstanced";else if(d=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",d===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[g](s,u,h,f),t.update(h,s,f)}function c(u,h,f){if(f===0)return;let d=e.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<f;g++)this.render(u[g],h[g]);else{d.multiDrawArraysWEBGL(s,u,0,h,0,f);let g=0;for(let x=0;x<f;x++)g+=h[x];t.update(g,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function _g(n,e,t){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");i=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function s(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let o=typeof WebGL2RenderingContext<"u"&&n.constructor.name==="WebGL2RenderingContext",a=t.precision!==void 0?t.precision:"highp",l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);let c=o||e.has("WEBGL_draw_buffers"),u=t.logarithmicDepthBuffer===!0,h=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),f=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),d=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),x=n.getParameter(n.MAX_VERTEX_ATTRIBS),p=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),m=n.getParameter(n.MAX_VARYING_VECTORS),v=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),_=f>0,b=o||e.has("OES_texture_float"),E=_&&b,S=o?n.getParameter(n.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:r,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:u,maxTextures:h,maxVertexTextures:f,maxTextureSize:d,maxCubemapSize:g,maxAttributes:x,maxVertexUniforms:p,maxVaryings:m,maxFragmentUniforms:v,vertexTextures:_,floatFragmentTextures:b,floatVertexTextures:E,maxSamples:S}}function yg(n){let e=this,t=null,i=0,r=!1,s=!1,o=new Kn,a=new nt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let d=h.length!==0||f||i!==0||r;return r=f,i=h.length,d},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,d){let g=h.clippingPlanes,x=h.clipIntersection,p=h.clipShadows,m=n.get(h);if(!r||g===null||g.length===0||s&&!p)s?u(null):c();else{let v=s?0:i,_=v*4,b=m.clippingState||null;l.value=b,b=u(g,f,_,d);for(let E=0;E!==_;++E)b[E]=t[E];m.clippingState=b,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,f,d,g){let x=h!==null?h.length:0,p=null;if(x!==0){if(p=l.value,g!==!0||p===null){let m=d+x*4,v=f.matrixWorldInverse;a.getNormalMatrix(v),(p===null||p.length<m)&&(p=new Float32Array(m));for(let _=0,b=d;_!==x;++_,b+=4)o.copy(h[_]).applyMatrix4(v,a),o.normal.toArray(p,b),p[b+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,p}}function vg(n){let e=new WeakMap;function t(o,a){return a===ja?o.mapping=_r:a===Qa&&(o.mapping=yr),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===ja||a===Qa)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new cl(l.height/2);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}var Fn=class extends go{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-e,o=i+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},dr=4,vu=[.125,.215,.35,.446,.526,.582],Ii=20,ka=new Fn,bu=new Ze,Ba=null,Ga=0,Ha=0,Ci=(1+Math.sqrt(5))/2,or=1/Ci,Mu=[new I(1,1,1),new I(-1,1,1),new I(1,1,-1),new I(-1,1,-1),new I(0,Ci,or),new I(0,Ci,-or),new I(or,0,Ci),new I(-or,0,Ci),new I(Ci,or,0),new I(-Ci,or,0)],Sr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100){Ba=this._renderer.getRenderTarget(),Ga=this._renderer.getActiveCubeFace(),Ha=this._renderer.getActiveMipmapLevel(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Eu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=wu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ba,Ga,Ha),e.scissorTest=!1,Xs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===_r||e.mapping===yr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ba=this._renderer.getRenderTarget(),Ga=this._renderer.getActiveCubeFace(),Ha=this._renderer.getActiveMipmapLevel();let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:fn,minFilter:fn,generateMipmaps:!1,type:Fi,format:An,colorSpace:jn,depthBuffer:!1},r=Su(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Su(e,t,i);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=bg(s)),this._blurMaterial=Mg(s,e,t)}return r}_compileMaterial(e){let t=new se(this._lodPlanes[0],e);this._renderer.compile(t,ka)}_sceneToCubeUV(e,t,i,r){let a=new tn(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,f=u.toneMapping;u.getClearColor(bu),u.toneMapping=Rn,u.autoClear=!1;let d=new lt({name:"PMREM.Background",side:Lt,depthWrite:!1,depthTest:!1}),g=new se(new on,d),x=!1,p=e.background;p?p.isColor&&(d.color.copy(p),e.background=null,x=!0):(d.color.copy(bu),x=!0);for(let m=0;m<6;m++){let v=m%3;v===0?(a.up.set(0,l[m],0),a.lookAt(c[m],0,0)):v===1?(a.up.set(0,0,l[m]),a.lookAt(0,c[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,c[m]));let _=this._cubeSize;Xs(r,v*_,m>2?_:0,_,_),u.setRenderTarget(r),x&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=f,u.autoClear=h,e.background=p}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===_r||e.mapping===yr;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Eu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=wu());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new se(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;Xs(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,ka)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){let s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Mu[(r-1)%Mu.length];this._blur(e,r-1,r,s,o)}t.autoClear=i}_blur(e,t,i,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new se(this._lodPlanes[r],c),f=c.uniforms,d=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*Ii-1),x=s/g,p=isFinite(s)?1+Math.floor(u*x):Ii;p>Ii&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Ii}`);let m=[],v=0;for(let A=0;A<Ii;++A){let C=A/x,y=Math.exp(-C*C/2);m.push(y),A===0?v+=y:A<p&&(v+=2*y)}for(let A=0;A<m.length;A++)m[A]=m[A]/v;f.envMap.value=e.texture,f.samples.value=p,f.weights.value=m,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:_}=this;f.dTheta.value=g,f.mipInt.value=_-i;let b=this._sizeLods[r],E=3*b*(r>_-dr?r-_+dr:0),S=4*(this._cubeSize-b);Xs(t,E,S,3*b,2*b),l.setRenderTarget(t),l.render(h,ka)}};function bg(n){let e=[],t=[],i=[],r=n,s=n-dr+1+vu.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);t.push(a);let l=1/a;o>n-dr?l=vu[o-n+dr-1]:o===0&&(l=0),i.push(l);let c=1/(a-2),u=-c,h=1+c,f=[u,u,h,u,h,h,u,u,h,h,u,h],d=6,g=6,x=3,p=2,m=1,v=new Float32Array(x*g*d),_=new Float32Array(p*g*d),b=new Float32Array(m*g*d);for(let S=0;S<d;S++){let A=S%3*2/3-1,C=S>2?0:-1,y=[A,C,0,A+2/3,C,0,A+2/3,C+1,0,A,C,0,A+2/3,C+1,0,A,C+1,0];v.set(y,x*g*S),_.set(f,p*g*S);let M=[S,S,S,S,S,S];b.set(M,m*g*S)}let E=new Rt;E.setAttribute("position",new Xt(v,x)),E.setAttribute("uv",new Xt(_,p)),E.setAttribute("faceIndex",new Xt(b,m)),e.push(E),r>dr&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Su(n,e,t){let i=new $t(n,e,t);return i.texture.mapping=Uo,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Xs(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function Mg(n,e,t){let i=new Float32Array(Ii),r=new I(0,1,0);return new xn({name:"SphericalGaussianBlur",defines:{n:Ii,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:ql(),fragmentShader:`

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
		`,blending:hi,depthTest:!1,depthWrite:!1})}function wu(){return new xn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ql(),fragmentShader:`

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
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Eu(){return new xn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ql(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function ql(){return`

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
	`}function Sg(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===ja||l===Qa,u=l===_r||l===yr;if(c||u)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return t===null&&(t=new Sr(n)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{let h=a.image;if(c&&h&&h.height>0||u&&h&&r(h)){t===null&&(t=new Sr(n));let f=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,f),a.addEventListener("dispose",s),f.texture}else return null}}}return a}function r(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function wg(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(i){i.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(i){let r=t(i);return r===null&&console.warn("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function Eg(n,e,t,i){let r={},s=new WeakMap;function o(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);for(let g in f.morphAttributes){let x=f.morphAttributes[g];for(let p=0,m=x.length;p<m;p++)e.remove(x[p])}f.removeEventListener("dispose",o),delete r[f.id];let d=s.get(f);d&&(e.remove(d),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(h,f){return r[f.id]===!0||(f.addEventListener("dispose",o),r[f.id]=!0,t.memory.geometries++),f}function l(h){let f=h.attributes;for(let g in f)e.update(f[g],n.ARRAY_BUFFER);let d=h.morphAttributes;for(let g in d){let x=d[g];for(let p=0,m=x.length;p<m;p++)e.update(x[p],n.ARRAY_BUFFER)}}function c(h){let f=[],d=h.index,g=h.attributes.position,x=0;if(d!==null){let v=d.array;x=d.version;for(let _=0,b=v.length;_<b;_+=3){let E=v[_+0],S=v[_+1],A=v[_+2];f.push(E,S,S,A,A,E)}}else if(g!==void 0){let v=g.array;x=g.version;for(let _=0,b=v.length/3-1;_<b;_+=3){let E=_+0,S=_+1,A=_+2;f.push(E,S,S,A,A,E)}}else return;let p=new(hh(f)?mo:po)(f,1);p.version=x;let m=s.get(h);m&&e.remove(m),s.set(h,p)}function u(h){let f=s.get(h);if(f){let d=h.index;d!==null&&f.version<d.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function Tg(n,e,t,i){let r=i.isWebGL2,s;function o(d){s=d}let a,l;function c(d){a=d.type,l=d.bytesPerElement}function u(d,g){n.drawElements(s,g,a,d*l),t.update(g,s,1)}function h(d,g,x){if(x===0)return;let p,m;if(r)p=n,m="drawElementsInstanced";else if(p=e.get("ANGLE_instanced_arrays"),m="drawElementsInstancedANGLE",p===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[m](s,g,a,d*l,x),t.update(g,s,x)}function f(d,g,x){if(x===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<x;m++)this.render(d[m]/l,g[m]);else{p.multiDrawElementsWEBGL(s,g,0,a,d,0,x);let m=0;for(let v=0;v<x;v++)m+=g[v];t.update(m,s,1)}}this.setMode=o,this.setIndex=c,this.render=u,this.renderInstances=h,this.renderMultiDraw=f}function Ag(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function Rg(n,e){return n[0]-e[0]}function Cg(n,e){return Math.abs(e[1])-Math.abs(n[1])}function Pg(n,e,t){let i={},r=new Float32Array(8),s=new WeakMap,o=new vt,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,u,h){let f=c.morphTargetInfluences;if(e.isWebGL2===!0){let d=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,g=d!==void 0?d.length:0,x=s.get(u);if(x===void 0||x.count!==g){let P=function(){F.dispose(),s.delete(u),u.removeEventListener("dispose",P)};x!==void 0&&x.texture.dispose();let v=u.morphAttributes.position!==void 0,_=u.morphAttributes.normal!==void 0,b=u.morphAttributes.color!==void 0,E=u.morphAttributes.position||[],S=u.morphAttributes.normal||[],A=u.morphAttributes.color||[],C=0;v===!0&&(C=1),_===!0&&(C=2),b===!0&&(C=3);let y=u.attributes.position.count*C,M=1;y>e.maxTextureSize&&(M=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let D=new Float32Array(y*M*4*g),F=new uo(D,y,M,g);F.type=ui,F.needsUpdate=!0;let K=C*4;for(let O=0;O<g;O++){let H=E[O],Z=S[O],J=A[O],X=y*M*4*O;for(let ie=0;ie<H.count;ie++){let j=ie*K;v===!0&&(o.fromBufferAttribute(H,ie),D[X+j+0]=o.x,D[X+j+1]=o.y,D[X+j+2]=o.z,D[X+j+3]=0),_===!0&&(o.fromBufferAttribute(Z,ie),D[X+j+4]=o.x,D[X+j+5]=o.y,D[X+j+6]=o.z,D[X+j+7]=0),b===!0&&(o.fromBufferAttribute(J,ie),D[X+j+8]=o.x,D[X+j+9]=o.y,D[X+j+10]=o.z,D[X+j+11]=J.itemSize===4?o.w:1)}}x={count:g,texture:F,size:new $(y,M)},s.set(u,x),u.addEventListener("dispose",P)}let p=0;for(let v=0;v<f.length;v++)p+=f[v];let m=u.morphTargetsRelative?1:1-p;h.getUniforms().setValue(n,"morphTargetBaseInfluence",m),h.getUniforms().setValue(n,"morphTargetInfluences",f),h.getUniforms().setValue(n,"morphTargetsTexture",x.texture,t),h.getUniforms().setValue(n,"morphTargetsTextureSize",x.size)}else{let d=f===void 0?0:f.length,g=i[u.id];if(g===void 0||g.length!==d){g=[];for(let _=0;_<d;_++)g[_]=[_,0];i[u.id]=g}for(let _=0;_<d;_++){let b=g[_];b[0]=_,b[1]=f[_]}g.sort(Cg);for(let _=0;_<8;_++)_<d&&g[_][1]?(a[_][0]=g[_][0],a[_][1]=g[_][1]):(a[_][0]=Number.MAX_SAFE_INTEGER,a[_][1]=0);a.sort(Rg);let x=u.morphAttributes.position,p=u.morphAttributes.normal,m=0;for(let _=0;_<8;_++){let b=a[_],E=b[0],S=b[1];E!==Number.MAX_SAFE_INTEGER&&S?(x&&u.getAttribute("morphTarget"+_)!==x[E]&&u.setAttribute("morphTarget"+_,x[E]),p&&u.getAttribute("morphNormal"+_)!==p[E]&&u.setAttribute("morphNormal"+_,p[E]),r[_]=S,m+=S):(x&&u.hasAttribute("morphTarget"+_)===!0&&u.deleteAttribute("morphTarget"+_),p&&u.hasAttribute("morphNormal"+_)===!0&&u.deleteAttribute("morphNormal"+_),r[_]=0)}let v=u.morphTargetsRelative?1:1-m;h.getUniforms().setValue(n,"morphTargetBaseInfluence",v),h.getUniforms().setValue(n,"morphTargetInfluences",r)}}return{update:l}}function Ig(n,e,t,i){let r=new WeakMap;function s(l){let c=i.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==c&&(f.update(),r.set(f,c))}return h}function o(){r=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}var _o=class extends gn{constructor(e,t,i,r,s,o,a,l,c,u){if(u=u!==void 0?u:Ui,u!==Ui&&u!==br)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===Ui&&(i=ci),i===void 0&&u===br&&(i=Di),super(null,r,s,o,a,l,u,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Jt,this.minFilter=l!==void 0?l:Jt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},mh=new gn,gh=new _o(1,1);gh.compareFunction=uh;var xh=new uo,_h=new ol,yh=new xo,Tu=[],Au=[],Ru=new Float32Array(16),Cu=new Float32Array(9),Pu=new Float32Array(4);function Ir(n,e,t){let i=n[0];if(i<=0||i>0)return n;let r=e*t,s=Tu[r];if(s===void 0&&(s=new Float32Array(r),Tu[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function Ut(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Nt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Oo(n,e){let t=Au[e];t===void 0&&(t=new Int32Array(e),Au[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Lg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Dg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;n.uniform2fv(this.addr,e),Nt(t,e)}}function Ug(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ut(t,e))return;n.uniform3fv(this.addr,e),Nt(t,e)}}function Ng(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;n.uniform4fv(this.addr,e),Nt(t,e)}}function Og(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,i))return;Pu.set(i),n.uniformMatrix2fv(this.addr,!1,Pu),Nt(t,i)}}function Fg(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,i))return;Cu.set(i),n.uniformMatrix3fv(this.addr,!1,Cu),Nt(t,i)}}function zg(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,i))return;Ru.set(i),n.uniformMatrix4fv(this.addr,!1,Ru),Nt(t,i)}}function kg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Bg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;n.uniform2iv(this.addr,e),Nt(t,e)}}function Gg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;n.uniform3iv(this.addr,e),Nt(t,e)}}function Hg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;n.uniform4iv(this.addr,e),Nt(t,e)}}function Vg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Wg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;n.uniform2uiv(this.addr,e),Nt(t,e)}}function Xg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;n.uniform3uiv(this.addr,e),Nt(t,e)}}function qg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;n.uniform4uiv(this.addr,e),Nt(t,e)}}function Yg(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s=this.type===n.SAMPLER_2D_SHADOW?gh:mh;t.setTexture2D(e||s,r)}function Kg(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||_h,r)}function Zg(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||yh,r)}function Jg(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||xh,r)}function $g(n){switch(n){case 5126:return Lg;case 35664:return Dg;case 35665:return Ug;case 35666:return Ng;case 35674:return Og;case 35675:return Fg;case 35676:return zg;case 5124:case 35670:return kg;case 35667:case 35671:return Bg;case 35668:case 35672:return Gg;case 35669:case 35673:return Hg;case 5125:return Vg;case 36294:return Wg;case 36295:return Xg;case 36296:return qg;case 35678:case 36198:case 36298:case 36306:case 35682:return Yg;case 35679:case 36299:case 36307:return Kg;case 35680:case 36300:case 36308:case 36293:return Zg;case 36289:case 36303:case 36311:case 36292:return Jg}}function jg(n,e){n.uniform1fv(this.addr,e)}function Qg(n,e){let t=Ir(e,this.size,2);n.uniform2fv(this.addr,t)}function ex(n,e){let t=Ir(e,this.size,3);n.uniform3fv(this.addr,t)}function tx(n,e){let t=Ir(e,this.size,4);n.uniform4fv(this.addr,t)}function nx(n,e){let t=Ir(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function ix(n,e){let t=Ir(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function rx(n,e){let t=Ir(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function sx(n,e){n.uniform1iv(this.addr,e)}function ox(n,e){n.uniform2iv(this.addr,e)}function ax(n,e){n.uniform3iv(this.addr,e)}function lx(n,e){n.uniform4iv(this.addr,e)}function cx(n,e){n.uniform1uiv(this.addr,e)}function ux(n,e){n.uniform2uiv(this.addr,e)}function hx(n,e){n.uniform3uiv(this.addr,e)}function dx(n,e){n.uniform4uiv(this.addr,e)}function fx(n,e,t){let i=this.cache,r=e.length,s=Oo(t,r);Ut(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||mh,s[o])}function px(n,e,t){let i=this.cache,r=e.length,s=Oo(t,r);Ut(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||_h,s[o])}function mx(n,e,t){let i=this.cache,r=e.length,s=Oo(t,r);Ut(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||yh,s[o])}function gx(n,e,t){let i=this.cache,r=e.length,s=Oo(t,r);Ut(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||xh,s[o])}function xx(n){switch(n){case 5126:return jg;case 35664:return Qg;case 35665:return ex;case 35666:return tx;case 35674:return nx;case 35675:return ix;case 35676:return rx;case 5124:case 35670:return sx;case 35667:case 35671:return ox;case 35668:case 35672:return ax;case 35669:case 35673:return lx;case 5125:return cx;case 36294:return ux;case 36295:return hx;case 36296:return dx;case 35678:case 36198:case 36298:case 36306:case 35682:return fx;case 35679:case 36299:case 36307:return px;case 35680:case 36300:case 36308:case 36293:return mx;case 36289:case 36303:case 36311:case 36292:return gx}}var ul=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=$g(t.type)}},hl=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=xx(t.type)}},dl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],i)}}},Va=/(\w+)(\])?(\[|\.)?/g;function Iu(n,e){n.seq.push(e),n.map[e.id]=e}function _x(n,e,t){let i=n.name,r=i.length;for(Va.lastIndex=0;;){let s=Va.exec(i),o=Va.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Iu(t,c===void 0?new ul(a,n,e):new hl(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new dl(a),Iu(t,h)),t=h}}}var xr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);_x(s,o,this)}}setValue(e,t,i,r){let s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&i.push(o)}return i}};function Lu(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var yx=37297,vx=0;function bx(n,e){let t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}function Mx(n){let e=dt.getPrimaries(dt.workingColorSpace),t=dt.getPrimaries(n),i;switch(e===t?i="":e===so&&t===ro?i="LinearDisplayP3ToLinearSRGB":e===ro&&t===so&&(i="LinearSRGBToLinearDisplayP3"),n){case jn:case No:return[i,"LinearTransferOETF"];case yt:case Xl:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function Du(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+bx(n.getShaderSource(e),o)}else return r}function Sx(n,e){let t=Mx(e);return`vec4 ${n}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function wx(n,e){let t;switch(e){case Vf:t="Linear";break;case Wf:t="Reinhard";break;case Xf:t="OptimizedCineon";break;case Do:t="ACESFilmic";break;case Yf:t="AgX";break;case qf:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function Ex(n){return[n.extensionDerivatives||n.envMapCubeUVHeight||n.bumpMap||n.normalMapTangentSpace||n.clearcoatNormalMap||n.flatShading||n.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(n.extensionFragDepth||n.logarithmicDepthBuffer)&&n.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",n.extensionDrawBuffers&&n.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(n.extensionShaderTextureLOD||n.envMap||n.transmission)&&n.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(fr).join(`
`)}function Tx(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(fr).join(`
`)}function Ax(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Rx(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=n.getActiveAttrib(e,r),o=s.name,a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function fr(n){return n!==""}function Uu(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Nu(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Cx=/^[ \t]*#include +<([\w\d./]+)>/gm;function fl(n){return n.replace(Cx,Ix)}var Px=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function Ix(n,e){let t=Qe[e];if(t===void 0){let i=Px.get(e);if(i!==void 0)t=Qe[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return fl(t)}var Lx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ou(n){return n.replace(Lx,Dx)}function Dx(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Fu(n){let e="precision "+n.precision+` float;
precision `+n.precision+" int;";return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Ux(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===ju?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Bl?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Yn&&(e="SHADOWMAP_TYPE_VSM"),e}function Nx(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case _r:case yr:e="ENVMAP_TYPE_CUBE";break;case Uo:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Ox(n){let e="ENVMAP_MODE_REFLECTION";return n.envMap&&n.envMapMode===yr&&(e="ENVMAP_MODE_REFRACTION"),e}function Fx(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Hl:e="ENVMAP_BLENDING_MULTIPLY";break;case Gf:e="ENVMAP_BLENDING_MIX";break;case Hf:e="ENVMAP_BLENDING_ADD";break}return e}function zx(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function kx(n,e,t,i){let r=n.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=Ux(t),c=Nx(t),u=Ox(t),h=Fx(t),f=zx(t),d=t.isWebGL2?"":Ex(t),g=Tx(t),x=Ax(s),p=r.createProgram(),m,v,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(fr).join(`
`),m.length>0&&(m+=`
`),v=[d,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(fr).join(`
`),v.length>0&&(v+=`
`)):(m=[Fu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(fr).join(`
`),v=[d,Fu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Rn?"#define TONE_MAPPING":"",t.toneMapping!==Rn?Qe.tonemapping_pars_fragment:"",t.toneMapping!==Rn?wx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Qe.colorspace_pars_fragment,Sx("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(fr).join(`
`)),o=fl(o),o=Uu(o,t),o=Nu(o,t),a=fl(a),a=Uu(a,t),a=Nu(a,t),o=Ou(o),a=Ou(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,v=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===nu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===nu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);let b=_+m+o,E=_+v+a,S=Lu(r,r.VERTEX_SHADER,b),A=Lu(r,r.FRAGMENT_SHADER,E);r.attachShader(p,S),r.attachShader(p,A),t.index0AttributeName!==void 0?r.bindAttribLocation(p,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(p,0,"position"),r.linkProgram(p);function C(F){if(n.debug.checkShaderErrors){let K=r.getProgramInfoLog(p).trim(),P=r.getShaderInfoLog(S).trim(),O=r.getShaderInfoLog(A).trim(),H=!0,Z=!0;if(r.getProgramParameter(p,r.LINK_STATUS)===!1)if(H=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,p,S,A);else{let J=Du(r,S,"vertex"),X=Du(r,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(p,r.VALIDATE_STATUS)+`

Program Info Log: `+K+`
`+J+`
`+X)}else K!==""?console.warn("THREE.WebGLProgram: Program Info Log:",K):(P===""||O==="")&&(Z=!1);Z&&(F.diagnostics={runnable:H,programLog:K,vertexShader:{log:P,prefix:m},fragmentShader:{log:O,prefix:v}})}r.deleteShader(S),r.deleteShader(A),y=new xr(r,p),M=Rx(r,p)}let y;this.getUniforms=function(){return y===void 0&&C(this),y};let M;this.getAttributes=function(){return M===void 0&&C(this),M};let D=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=r.getProgramParameter(p,yx)),D},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(p),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=vx++,this.cacheKey=e,this.usedTimes=1,this.program=p,this.vertexShader=S,this.fragmentShader=A,this}var Bx=0,pl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new ml(e),t.set(e,i)),i}},ml=class{constructor(e){this.id=Bx++,this.code=e,this.usedTimes=0}};function Gx(n,e,t,i,r,s,o){let a=new fo,l=new pl,c=[],u=r.isWebGL2,h=r.logarithmicDepthBuffer,f=r.vertexTextures,d=r.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(y){return y===0?"uv":`uv${y}`}function p(y,M,D,F,K){let P=F.fog,O=K.geometry,H=y.isMeshStandardMaterial?F.environment:null,Z=(y.isMeshStandardMaterial?t:e).get(y.envMap||H),J=Z&&Z.mapping===Uo?Z.image.height:null,X=g[y.type];y.precision!==null&&(d=r.getMaxPrecision(y.precision),d!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",d,"instead."));let ie=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,j=ie!==void 0?ie.length:0,he=0;O.morphAttributes.position!==void 0&&(he=1),O.morphAttributes.normal!==void 0&&(he=2),O.morphAttributes.color!==void 0&&(he=3);let W,te,Se,Le;if(X){let Et=On[X];W=Et.vertexShader,te=Et.fragmentShader}else W=y.vertexShader,te=y.fragmentShader,l.update(y),Se=l.getVertexShaderID(y),Le=l.getFragmentShaderID(y);let _e=n.getRenderTarget(),Fe=K.isInstancedMesh===!0,ze=K.isBatchedMesh===!0,le=!!y.map,ge=!!y.matcap,L=!!Z,de=!!y.aoMap,Y=!!y.lightMap,ue=!!y.bumpMap,q=!!y.normalMap,Re=!!y.displacementMap,pe=!!y.emissiveMap,R=!!y.metalnessMap,w=!!y.roughnessMap,z=y.anisotropy>0,ae=y.clearcoat>0,re=y.iridescence>0,Q=y.sheen>0,Pe=y.transmission>0,ye=z&&!!y.anisotropyMap,we=ae&&!!y.clearcoatMap,ke=ae&&!!y.clearcoatNormalMap,Je=ae&&!!y.clearcoatRoughnessMap,oe=re&&!!y.iridescenceMap,it=re&&!!y.iridescenceThicknessMap,et=Q&&!!y.sheenColorMap,Ye=Q&&!!y.sheenRoughnessMap,Ne=!!y.specularMap,Ee=!!y.specularColorMap,Ge=!!y.specularIntensityMap,rt=Pe&&!!y.transmissionMap,xt=Pe&&!!y.thicknessMap,je=!!y.gradientMap,fe=!!y.alphaMap,U=y.alphaTest>0,ve=!!y.alphaHash,be=!!y.extensions,Ve=!!O.attributes.uv1,Be=!!O.attributes.uv2,ut=!!O.attributes.uv3,ht=Rn;return y.toneMapped&&(_e===null||_e.isXRRenderTarget===!0)&&(ht=n.toneMapping),{isWebGL2:u,shaderID:X,shaderType:y.type,shaderName:y.name,vertexShader:W,fragmentShader:te,defines:y.defines,customVertexShaderID:Se,customFragmentShaderID:Le,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:d,batching:ze,instancing:Fe,instancingColor:Fe&&K.instanceColor!==null,supportsVertexTextures:f,outputColorSpace:_e===null?n.outputColorSpace:_e.isXRRenderTarget===!0?_e.texture.colorSpace:jn,map:le,matcap:ge,envMap:L,envMapMode:L&&Z.mapping,envMapCubeUVHeight:J,aoMap:de,lightMap:Y,bumpMap:ue,normalMap:q,displacementMap:f&&Re,emissiveMap:pe,normalMapObjectSpace:q&&y.normalMapType===sp,normalMapTangentSpace:q&&y.normalMapType===Wl,metalnessMap:R,roughnessMap:w,anisotropy:z,anisotropyMap:ye,clearcoat:ae,clearcoatMap:we,clearcoatNormalMap:ke,clearcoatRoughnessMap:Je,iridescence:re,iridescenceMap:oe,iridescenceThicknessMap:it,sheen:Q,sheenColorMap:et,sheenRoughnessMap:Ye,specularMap:Ne,specularColorMap:Ee,specularIntensityMap:Ge,transmission:Pe,transmissionMap:rt,thicknessMap:xt,gradientMap:je,opaque:y.transparent===!1&&y.blending===mr,alphaMap:fe,alphaTest:U,alphaHash:ve,combine:y.combine,mapUv:le&&x(y.map.channel),aoMapUv:de&&x(y.aoMap.channel),lightMapUv:Y&&x(y.lightMap.channel),bumpMapUv:ue&&x(y.bumpMap.channel),normalMapUv:q&&x(y.normalMap.channel),displacementMapUv:Re&&x(y.displacementMap.channel),emissiveMapUv:pe&&x(y.emissiveMap.channel),metalnessMapUv:R&&x(y.metalnessMap.channel),roughnessMapUv:w&&x(y.roughnessMap.channel),anisotropyMapUv:ye&&x(y.anisotropyMap.channel),clearcoatMapUv:we&&x(y.clearcoatMap.channel),clearcoatNormalMapUv:ke&&x(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Je&&x(y.clearcoatRoughnessMap.channel),iridescenceMapUv:oe&&x(y.iridescenceMap.channel),iridescenceThicknessMapUv:it&&x(y.iridescenceThicknessMap.channel),sheenColorMapUv:et&&x(y.sheenColorMap.channel),sheenRoughnessMapUv:Ye&&x(y.sheenRoughnessMap.channel),specularMapUv:Ne&&x(y.specularMap.channel),specularColorMapUv:Ee&&x(y.specularColorMap.channel),specularIntensityMapUv:Ge&&x(y.specularIntensityMap.channel),transmissionMapUv:rt&&x(y.transmissionMap.channel),thicknessMapUv:xt&&x(y.thicknessMap.channel),alphaMapUv:fe&&x(y.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(q||z),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,vertexUv1s:Ve,vertexUv2s:Be,vertexUv3s:ut,pointsUvs:K.isPoints===!0&&!!O.attributes.uv&&(le||fe),fog:!!P,useFog:y.fog===!0,fogExp2:P&&P.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:K.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:j,morphTextureStride:he,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&D.length>0,shadowMapType:n.shadowMap.type,toneMapping:ht,useLegacyLights:n._useLegacyLights,decodeVideoTexture:le&&y.map.isVideoTexture===!0&&dt.getTransfer(y.map.colorSpace)===gt,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===pn,flipSided:y.side===Lt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionDerivatives:be&&y.extensions.derivatives===!0,extensionFragDepth:be&&y.extensions.fragDepth===!0,extensionDrawBuffers:be&&y.extensions.drawBuffers===!0,extensionShaderTextureLOD:be&&y.extensions.shaderTextureLOD===!0,extensionClipCullDistance:be&&y.extensions.clipCullDistance&&i.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:u||i.has("EXT_frag_depth"),rendererExtensionDrawBuffers:u||i.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:u||i.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()}}function m(y){let M=[];if(y.shaderID?M.push(y.shaderID):(M.push(y.customVertexShaderID),M.push(y.customFragmentShaderID)),y.defines!==void 0)for(let D in y.defines)M.push(D),M.push(y.defines[D]);return y.isRawShaderMaterial===!1&&(v(M,y),_(M,y),M.push(n.outputColorSpace)),M.push(y.customProgramCacheKey),M.join()}function v(y,M){y.push(M.precision),y.push(M.outputColorSpace),y.push(M.envMapMode),y.push(M.envMapCubeUVHeight),y.push(M.mapUv),y.push(M.alphaMapUv),y.push(M.lightMapUv),y.push(M.aoMapUv),y.push(M.bumpMapUv),y.push(M.normalMapUv),y.push(M.displacementMapUv),y.push(M.emissiveMapUv),y.push(M.metalnessMapUv),y.push(M.roughnessMapUv),y.push(M.anisotropyMapUv),y.push(M.clearcoatMapUv),y.push(M.clearcoatNormalMapUv),y.push(M.clearcoatRoughnessMapUv),y.push(M.iridescenceMapUv),y.push(M.iridescenceThicknessMapUv),y.push(M.sheenColorMapUv),y.push(M.sheenRoughnessMapUv),y.push(M.specularMapUv),y.push(M.specularColorMapUv),y.push(M.specularIntensityMapUv),y.push(M.transmissionMapUv),y.push(M.thicknessMapUv),y.push(M.combine),y.push(M.fogExp2),y.push(M.sizeAttenuation),y.push(M.morphTargetsCount),y.push(M.morphAttributeCount),y.push(M.numDirLights),y.push(M.numPointLights),y.push(M.numSpotLights),y.push(M.numSpotLightMaps),y.push(M.numHemiLights),y.push(M.numRectAreaLights),y.push(M.numDirLightShadows),y.push(M.numPointLightShadows),y.push(M.numSpotLightShadows),y.push(M.numSpotLightShadowsWithMaps),y.push(M.numLightProbes),y.push(M.shadowMapType),y.push(M.toneMapping),y.push(M.numClippingPlanes),y.push(M.numClipIntersection),y.push(M.depthPacking)}function _(y,M){a.disableAll(),M.isWebGL2&&a.enable(0),M.supportsVertexTextures&&a.enable(1),M.instancing&&a.enable(2),M.instancingColor&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),y.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.skinning&&a.enable(4),M.morphTargets&&a.enable(5),M.morphNormals&&a.enable(6),M.morphColors&&a.enable(7),M.premultipliedAlpha&&a.enable(8),M.shadowMapEnabled&&a.enable(9),M.useLegacyLights&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),y.push(a.mask)}function b(y){let M=g[y.type],D;if(M){let F=On[M];D=Pp.clone(F.uniforms)}else D=y.uniforms;return D}function E(y,M){let D;for(let F=0,K=c.length;F<K;F++){let P=c[F];if(P.cacheKey===M){D=P,++D.usedTimes;break}}return D===void 0&&(D=new kx(n,M,y,s),c.push(D)),D}function S(y){if(--y.usedTimes===0){let M=c.indexOf(y);c[M]=c[c.length-1],c.pop(),y.destroy()}}function A(y){l.remove(y)}function C(){l.dispose()}return{getParameters:p,getProgramCacheKey:m,getUniforms:b,acquireProgram:E,releaseProgram:S,releaseShaderCache:A,programs:c,dispose:C}}function Hx(){let n=new WeakMap;function e(s){let o=n.get(s);return o===void 0&&(o={},n.set(s,o)),o}function t(s){n.delete(s)}function i(s,o,a){n.get(s)[o]=a}function r(){n=new WeakMap}return{get:e,remove:t,update:i,dispose:r}}function Vx(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function zu(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function ku(){let n=[],e=0,t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(h,f,d,g,x,p){let m=n[e];return m===void 0?(m={id:h.id,object:h,geometry:f,material:d,groupOrder:g,renderOrder:h.renderOrder,z:x,group:p},n[e]=m):(m.id=h.id,m.object=h,m.geometry=f,m.material=d,m.groupOrder=g,m.renderOrder=h.renderOrder,m.z=x,m.group=p),e++,m}function a(h,f,d,g,x,p){let m=o(h,f,d,g,x,p);d.transmission>0?i.push(m):d.transparent===!0?r.push(m):t.push(m)}function l(h,f,d,g,x,p){let m=o(h,f,d,g,x,p);d.transmission>0?i.unshift(m):d.transparent===!0?r.unshift(m):t.unshift(m)}function c(h,f){t.length>1&&t.sort(h||Vx),i.length>1&&i.sort(f||zu),r.length>1&&r.sort(f||zu)}function u(){for(let h=e,f=n.length;h<f;h++){let d=n[h];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function Wx(){let n=new WeakMap;function e(i,r){let s=n.get(i),o;return s===void 0?(o=new ku,n.set(i,[o])):r>=s.length?(o=new ku,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function Xx(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new Ze};break;case"SpotLight":t={position:new I,direction:new I,color:new Ze,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Ze,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Ze,groundColor:new Ze};break;case"RectAreaLight":t={color:new Ze,position:new I,halfWidth:new I,halfHeight:new I};break}return n[e.id]=t,t}}}function qx(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var Yx=0;function Kx(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function Zx(n,e){let t=new Xx,i=qx(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)r.probe.push(new I);let s=new I,o=new pt,a=new pt;function l(u,h){let f=0,d=0,g=0;for(let F=0;F<9;F++)r.probe[F].set(0,0,0);let x=0,p=0,m=0,v=0,_=0,b=0,E=0,S=0,A=0,C=0,y=0;u.sort(Kx);let M=h===!0?Math.PI:1;for(let F=0,K=u.length;F<K;F++){let P=u[F],O=P.color,H=P.intensity,Z=P.distance,J=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)f+=O.r*H*M,d+=O.g*H*M,g+=O.b*H*M;else if(P.isLightProbe){for(let X=0;X<9;X++)r.probe[X].addScaledVector(P.sh.coefficients[X],H);y++}else if(P.isDirectionalLight){let X=t.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity*M),P.castShadow){let ie=P.shadow,j=i.get(P);j.shadowBias=ie.bias,j.shadowNormalBias=ie.normalBias,j.shadowRadius=ie.radius,j.shadowMapSize=ie.mapSize,r.directionalShadow[x]=j,r.directionalShadowMap[x]=J,r.directionalShadowMatrix[x]=P.shadow.matrix,b++}r.directional[x]=X,x++}else if(P.isSpotLight){let X=t.get(P);X.position.setFromMatrixPosition(P.matrixWorld),X.color.copy(O).multiplyScalar(H*M),X.distance=Z,X.coneCos=Math.cos(P.angle),X.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),X.decay=P.decay,r.spot[m]=X;let ie=P.shadow;if(P.map&&(r.spotLightMap[A]=P.map,A++,ie.updateMatrices(P),P.castShadow&&C++),r.spotLightMatrix[m]=ie.matrix,P.castShadow){let j=i.get(P);j.shadowBias=ie.bias,j.shadowNormalBias=ie.normalBias,j.shadowRadius=ie.radius,j.shadowMapSize=ie.mapSize,r.spotShadow[m]=j,r.spotShadowMap[m]=J,S++}m++}else if(P.isRectAreaLight){let X=t.get(P);X.color.copy(O).multiplyScalar(H),X.halfWidth.set(P.width*.5,0,0),X.halfHeight.set(0,P.height*.5,0),r.rectArea[v]=X,v++}else if(P.isPointLight){let X=t.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity*M),X.distance=P.distance,X.decay=P.decay,P.castShadow){let ie=P.shadow,j=i.get(P);j.shadowBias=ie.bias,j.shadowNormalBias=ie.normalBias,j.shadowRadius=ie.radius,j.shadowMapSize=ie.mapSize,j.shadowCameraNear=ie.camera.near,j.shadowCameraFar=ie.camera.far,r.pointShadow[p]=j,r.pointShadowMap[p]=J,r.pointShadowMatrix[p]=P.shadow.matrix,E++}r.point[p]=X,p++}else if(P.isHemisphereLight){let X=t.get(P);X.skyColor.copy(P.color).multiplyScalar(H*M),X.groundColor.copy(P.groundColor).multiplyScalar(H*M),r.hemi[_]=X,_++}}v>0&&(e.isWebGL2?n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=me.LTC_FLOAT_1,r.rectAreaLTC2=me.LTC_FLOAT_2):(r.rectAreaLTC1=me.LTC_HALF_1,r.rectAreaLTC2=me.LTC_HALF_2):n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=me.LTC_FLOAT_1,r.rectAreaLTC2=me.LTC_FLOAT_2):n.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=me.LTC_HALF_1,r.rectAreaLTC2=me.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=f,r.ambient[1]=d,r.ambient[2]=g;let D=r.hash;(D.directionalLength!==x||D.pointLength!==p||D.spotLength!==m||D.rectAreaLength!==v||D.hemiLength!==_||D.numDirectionalShadows!==b||D.numPointShadows!==E||D.numSpotShadows!==S||D.numSpotMaps!==A||D.numLightProbes!==y)&&(r.directional.length=x,r.spot.length=m,r.rectArea.length=v,r.point.length=p,r.hemi.length=_,r.directionalShadow.length=b,r.directionalShadowMap.length=b,r.pointShadow.length=E,r.pointShadowMap.length=E,r.spotShadow.length=S,r.spotShadowMap.length=S,r.directionalShadowMatrix.length=b,r.pointShadowMatrix.length=E,r.spotLightMatrix.length=S+A-C,r.spotLightMap.length=A,r.numSpotLightShadowsWithMaps=C,r.numLightProbes=y,D.directionalLength=x,D.pointLength=p,D.spotLength=m,D.rectAreaLength=v,D.hemiLength=_,D.numDirectionalShadows=b,D.numPointShadows=E,D.numSpotShadows=S,D.numSpotMaps=A,D.numLightProbes=y,r.version=Yx++)}function c(u,h){let f=0,d=0,g=0,x=0,p=0,m=h.matrixWorldInverse;for(let v=0,_=u.length;v<_;v++){let b=u[v];if(b.isDirectionalLight){let E=r.directional[f];E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(m),f++}else if(b.isSpotLight){let E=r.spot[g];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(m),E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(m),g++}else if(b.isRectAreaLight){let E=r.rectArea[x];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(m),a.identity(),o.copy(b.matrixWorld),o.premultiply(m),a.extractRotation(o),E.halfWidth.set(b.width*.5,0,0),E.halfHeight.set(0,b.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),x++}else if(b.isPointLight){let E=r.point[d];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(m),d++}else if(b.isHemisphereLight){let E=r.hemi[p];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(m),p++}}}return{setup:l,setupView:c,state:r}}function Bu(n,e){let t=new Zx(n,e),i=[],r=[];function s(){i.length=0,r.length=0}function o(h){i.push(h)}function a(h){r.push(h)}function l(h){t.setup(i,h)}function c(h){t.setupView(i,h)}return{init:s,state:{lightsArray:i,shadowsArray:r,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function Jx(n,e){let t=new WeakMap;function i(s,o=0){let a=t.get(s),l;return a===void 0?(l=new Bu(n,e),t.set(s,[l])):o>=a.length?(l=new Bu(n,e),a.push(l)):l=a[o],l}function r(){t=new WeakMap}return{get:i,dispose:r}}var gl=class extends Qn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ip,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},xl=class extends Qn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},$x=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,jx=`uniform sampler2D shadow_pass;
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
}`;function Qx(n,e,t){let i=new jr,r=new $,s=new $,o=new vt,a=new gl({depthPacking:rp}),l=new xl,c={},u=t.maxTextureSize,h={[pi]:Lt,[Lt]:pi,[pn]:pn},f=new xn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new $},radius:{value:4}},vertexShader:$x,fragmentShader:jx}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let g=new Rt;g.setAttribute("position",new Xt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new se(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ju;let m=this.type;this.render=function(S,A,C){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||S.length===0)return;let y=n.getRenderTarget(),M=n.getActiveCubeFace(),D=n.getActiveMipmapLevel(),F=n.state;F.setBlending(hi),F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let K=m!==Yn&&this.type===Yn,P=m===Yn&&this.type!==Yn;for(let O=0,H=S.length;O<H;O++){let Z=S[O],J=Z.shadow;if(J===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if(J.autoUpdate===!1&&J.needsUpdate===!1)continue;r.copy(J.mapSize);let X=J.getFrameExtents();if(r.multiply(X),s.copy(J.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/X.x),r.x=s.x*X.x,J.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/X.y),r.y=s.y*X.y,J.mapSize.y=s.y)),J.map===null||K===!0||P===!0){let j=this.type!==Yn?{minFilter:Jt,magFilter:Jt}:{};J.map!==null&&J.map.dispose(),J.map=new $t(r.x,r.y,j),J.map.texture.name=Z.name+".shadowMap",J.camera.updateProjectionMatrix()}n.setRenderTarget(J.map),n.clear();let ie=J.getViewportCount();for(let j=0;j<ie;j++){let he=J.getViewport(j);o.set(s.x*he.x,s.y*he.y,s.x*he.z,s.y*he.w),F.viewport(o),J.updateMatrices(Z,j),i=J.getFrustum(),b(A,C,J.camera,Z,this.type)}J.isPointLightShadow!==!0&&this.type===Yn&&v(J,C),J.needsUpdate=!1}m=this.type,p.needsUpdate=!1,n.setRenderTarget(y,M,D)};function v(S,A){let C=e.update(x);f.defines.VSM_SAMPLES!==S.blurSamples&&(f.defines.VSM_SAMPLES=S.blurSamples,d.defines.VSM_SAMPLES=S.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new $t(r.x,r.y)),f.uniforms.shadow_pass.value=S.map.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,n.setRenderTarget(S.mapPass),n.clear(),n.renderBufferDirect(A,null,C,f,x,null),d.uniforms.shadow_pass.value=S.mapPass.texture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,n.setRenderTarget(S.map),n.clear(),n.renderBufferDirect(A,null,C,d,x,null)}function _(S,A,C,y){let M=null,D=C.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(D!==void 0)M=D;else if(M=C.isPointLight===!0?l:a,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){let F=M.uuid,K=A.uuid,P=c[F];P===void 0&&(P={},c[F]=P);let O=P[K];O===void 0&&(O=M.clone(),P[K]=O,A.addEventListener("dispose",E)),M=O}if(M.visible=A.visible,M.wireframe=A.wireframe,y===Yn?M.side=A.shadowSide!==null?A.shadowSide:A.side:M.side=A.shadowSide!==null?A.shadowSide:h[A.side],M.alphaMap=A.alphaMap,M.alphaTest=A.alphaTest,M.map=A.map,M.clipShadows=A.clipShadows,M.clippingPlanes=A.clippingPlanes,M.clipIntersection=A.clipIntersection,M.displacementMap=A.displacementMap,M.displacementScale=A.displacementScale,M.displacementBias=A.displacementBias,M.wireframeLinewidth=A.wireframeLinewidth,M.linewidth=A.linewidth,C.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let F=n.properties.get(M);F.light=C}return M}function b(S,A,C,y,M){if(S.visible===!1)return;if(S.layers.test(A.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&M===Yn)&&(!S.frustumCulled||i.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,S.matrixWorld);let K=e.update(S),P=S.material;if(Array.isArray(P)){let O=K.groups;for(let H=0,Z=O.length;H<Z;H++){let J=O[H],X=P[J.materialIndex];if(X&&X.visible){let ie=_(S,X,y,M);S.onBeforeShadow(n,S,A,C,K,ie,J),n.renderBufferDirect(C,null,K,ie,S,J),S.onAfterShadow(n,S,A,C,K,ie,J)}}}else if(P.visible){let O=_(S,P,y,M);S.onBeforeShadow(n,S,A,C,K,O,null),n.renderBufferDirect(C,null,K,O,S,null),S.onAfterShadow(n,S,A,C,K,O,null)}}let F=S.children;for(let K=0,P=F.length;K<P;K++)b(F[K],A,C,y,M)}function E(S){S.target.removeEventListener("dispose",E);for(let C in c){let y=c[C],M=S.target.uuid;M in y&&(y[M].dispose(),delete y[M])}}}function e_(n,e,t){let i=t.isWebGL2;function r(){let U=!1,ve=new vt,be=null,Ve=new vt(0,0,0,0);return{setMask:function(Be){be!==Be&&!U&&(n.colorMask(Be,Be,Be,Be),be=Be)},setLocked:function(Be){U=Be},setClear:function(Be,ut,ht,Mt,Et){Et===!0&&(Be*=Mt,ut*=Mt,ht*=Mt),ve.set(Be,ut,ht,Mt),Ve.equals(ve)===!1&&(n.clearColor(Be,ut,ht,Mt),Ve.copy(ve))},reset:function(){U=!1,be=null,Ve.set(-1,0,0,0)}}}function s(){let U=!1,ve=null,be=null,Ve=null;return{setTest:function(Be){Be?ze(n.DEPTH_TEST):le(n.DEPTH_TEST)},setMask:function(Be){ve!==Be&&!U&&(n.depthMask(Be),ve=Be)},setFunc:function(Be){if(be!==Be){switch(Be){case Nf:n.depthFunc(n.NEVER);break;case Of:n.depthFunc(n.ALWAYS);break;case Ff:n.depthFunc(n.LESS);break;case eo:n.depthFunc(n.LEQUAL);break;case zf:n.depthFunc(n.EQUAL);break;case kf:n.depthFunc(n.GEQUAL);break;case Gl:n.depthFunc(n.GREATER);break;case Bf:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}be=Be}},setLocked:function(Be){U=Be},setClear:function(Be){Ve!==Be&&(n.clearDepth(Be),Ve=Be)},reset:function(){U=!1,ve=null,be=null,Ve=null}}}function o(){let U=!1,ve=null,be=null,Ve=null,Be=null,ut=null,ht=null,Mt=null,Et=null;return{setTest:function(at){U||(at?ze(n.STENCIL_TEST):le(n.STENCIL_TEST))},setMask:function(at){ve!==at&&!U&&(n.stencilMask(at),ve=at)},setFunc:function(at,Tt,nn){(be!==at||Ve!==Tt||Be!==nn)&&(n.stencilFunc(at,Tt,nn),be=at,Ve=Tt,Be=nn)},setOp:function(at,Tt,nn){(ut!==at||ht!==Tt||Mt!==nn)&&(n.stencilOp(at,Tt,nn),ut=at,ht=Tt,Mt=nn)},setLocked:function(at){U=at},setClear:function(at){Et!==at&&(n.clearStencil(at),Et=at)},reset:function(){U=!1,ve=null,be=null,Ve=null,Be=null,ut=null,ht=null,Mt=null,Et=null}}}let a=new r,l=new s,c=new o,u=new WeakMap,h=new WeakMap,f={},d={},g=new WeakMap,x=[],p=null,m=!1,v=null,_=null,b=null,E=null,S=null,A=null,C=null,y=new Ze(0,0,0),M=0,D=!1,F=null,K=null,P=null,O=null,H=null,Z=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),J=!1,X=0,ie=n.getParameter(n.VERSION);ie.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(ie)[1]),J=X>=1):ie.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(ie)[1]),J=X>=2);let j=null,he={},W=n.getParameter(n.SCISSOR_BOX),te=n.getParameter(n.VIEWPORT),Se=new vt().fromArray(W),Le=new vt().fromArray(te);function _e(U,ve,be,Ve){let Be=new Uint8Array(4),ut=n.createTexture();n.bindTexture(U,ut),n.texParameteri(U,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(U,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let ht=0;ht<be;ht++)i&&(U===n.TEXTURE_3D||U===n.TEXTURE_2D_ARRAY)?n.texImage3D(ve,0,n.RGBA,1,1,Ve,0,n.RGBA,n.UNSIGNED_BYTE,Be):n.texImage2D(ve+ht,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Be);return ut}let Fe={};Fe[n.TEXTURE_2D]=_e(n.TEXTURE_2D,n.TEXTURE_2D,1),Fe[n.TEXTURE_CUBE_MAP]=_e(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),i&&(Fe[n.TEXTURE_2D_ARRAY]=_e(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Fe[n.TEXTURE_3D]=_e(n.TEXTURE_3D,n.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),ze(n.DEPTH_TEST),l.setFunc(eo),pe(!1),R(bc),ze(n.CULL_FACE),q(hi);function ze(U){f[U]!==!0&&(n.enable(U),f[U]=!0)}function le(U){f[U]!==!1&&(n.disable(U),f[U]=!1)}function ge(U,ve){return d[U]!==ve?(n.bindFramebuffer(U,ve),d[U]=ve,i&&(U===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=ve),U===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=ve)),!0):!1}function L(U,ve){let be=x,Ve=!1;if(U)if(be=g.get(ve),be===void 0&&(be=[],g.set(ve,be)),U.isWebGLMultipleRenderTargets){let Be=U.texture;if(be.length!==Be.length||be[0]!==n.COLOR_ATTACHMENT0){for(let ut=0,ht=Be.length;ut<ht;ut++)be[ut]=n.COLOR_ATTACHMENT0+ut;be.length=Be.length,Ve=!0}}else be[0]!==n.COLOR_ATTACHMENT0&&(be[0]=n.COLOR_ATTACHMENT0,Ve=!0);else be[0]!==n.BACK&&(be[0]=n.BACK,Ve=!0);Ve&&(t.isWebGL2?n.drawBuffers(be):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(be))}function de(U){return p!==U?(n.useProgram(U),p=U,!0):!1}let Y={[Pi]:n.FUNC_ADD,[vf]:n.FUNC_SUBTRACT,[bf]:n.FUNC_REVERSE_SUBTRACT};if(i)Y[wc]=n.MIN,Y[Ec]=n.MAX;else{let U=e.get("EXT_blend_minmax");U!==null&&(Y[wc]=U.MIN_EXT,Y[Ec]=U.MAX_EXT)}let ue={[Mf]:n.ZERO,[Sf]:n.ONE,[wf]:n.SRC_COLOR,[Ja]:n.SRC_ALPHA,[Pf]:n.SRC_ALPHA_SATURATE,[Rf]:n.DST_COLOR,[Tf]:n.DST_ALPHA,[Ef]:n.ONE_MINUS_SRC_COLOR,[$a]:n.ONE_MINUS_SRC_ALPHA,[Cf]:n.ONE_MINUS_DST_COLOR,[Af]:n.ONE_MINUS_DST_ALPHA,[If]:n.CONSTANT_COLOR,[Lf]:n.ONE_MINUS_CONSTANT_COLOR,[Df]:n.CONSTANT_ALPHA,[Uf]:n.ONE_MINUS_CONSTANT_ALPHA};function q(U,ve,be,Ve,Be,ut,ht,Mt,Et,at){if(U===hi){m===!0&&(le(n.BLEND),m=!1);return}if(m===!1&&(ze(n.BLEND),m=!0),U!==yf){if(U!==v||at!==D){if((_!==Pi||S!==Pi)&&(n.blendEquation(n.FUNC_ADD),_=Pi,S=Pi),at)switch(U){case mr:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Oi:n.blendFunc(n.ONE,n.ONE);break;case Mc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Sc:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case mr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Oi:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Mc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Sc:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}b=null,E=null,A=null,C=null,y.set(0,0,0),M=0,v=U,D=at}return}Be=Be||ve,ut=ut||be,ht=ht||Ve,(ve!==_||Be!==S)&&(n.blendEquationSeparate(Y[ve],Y[Be]),_=ve,S=Be),(be!==b||Ve!==E||ut!==A||ht!==C)&&(n.blendFuncSeparate(ue[be],ue[Ve],ue[ut],ue[ht]),b=be,E=Ve,A=ut,C=ht),(Mt.equals(y)===!1||Et!==M)&&(n.blendColor(Mt.r,Mt.g,Mt.b,Et),y.copy(Mt),M=Et),v=U,D=!1}function Re(U,ve){U.side===pn?le(n.CULL_FACE):ze(n.CULL_FACE);let be=U.side===Lt;ve&&(be=!be),pe(be),U.blending===mr&&U.transparent===!1?q(hi):q(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),l.setFunc(U.depthFunc),l.setTest(U.depthTest),l.setMask(U.depthWrite),a.setMask(U.colorWrite);let Ve=U.stencilWrite;c.setTest(Ve),Ve&&(c.setMask(U.stencilWriteMask),c.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),c.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),z(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?ze(n.SAMPLE_ALPHA_TO_COVERAGE):le(n.SAMPLE_ALPHA_TO_COVERAGE)}function pe(U){F!==U&&(U?n.frontFace(n.CW):n.frontFace(n.CCW),F=U)}function R(U){U!==xf?(ze(n.CULL_FACE),U!==K&&(U===bc?n.cullFace(n.BACK):U===_f?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):le(n.CULL_FACE),K=U}function w(U){U!==P&&(J&&n.lineWidth(U),P=U)}function z(U,ve,be){U?(ze(n.POLYGON_OFFSET_FILL),(O!==ve||H!==be)&&(n.polygonOffset(ve,be),O=ve,H=be)):le(n.POLYGON_OFFSET_FILL)}function ae(U){U?ze(n.SCISSOR_TEST):le(n.SCISSOR_TEST)}function re(U){U===void 0&&(U=n.TEXTURE0+Z-1),j!==U&&(n.activeTexture(U),j=U)}function Q(U,ve,be){be===void 0&&(j===null?be=n.TEXTURE0+Z-1:be=j);let Ve=he[be];Ve===void 0&&(Ve={type:void 0,texture:void 0},he[be]=Ve),(Ve.type!==U||Ve.texture!==ve)&&(j!==be&&(n.activeTexture(be),j=be),n.bindTexture(U,ve||Fe[U]),Ve.type=U,Ve.texture=ve)}function Pe(){let U=he[j];U!==void 0&&U.type!==void 0&&(n.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function ye(){try{n.compressedTexImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function we(){try{n.compressedTexImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ke(){try{n.texSubImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Je(){try{n.texSubImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function oe(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function it(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function et(){try{n.texStorage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ye(){try{n.texStorage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ne(){try{n.texImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ee(){try{n.texImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ge(U){Se.equals(U)===!1&&(n.scissor(U.x,U.y,U.z,U.w),Se.copy(U))}function rt(U){Le.equals(U)===!1&&(n.viewport(U.x,U.y,U.z,U.w),Le.copy(U))}function xt(U,ve){let be=h.get(ve);be===void 0&&(be=new WeakMap,h.set(ve,be));let Ve=be.get(U);Ve===void 0&&(Ve=n.getUniformBlockIndex(ve,U.name),be.set(U,Ve))}function je(U,ve){let Ve=h.get(ve).get(U);u.get(ve)!==Ve&&(n.uniformBlockBinding(ve,Ve,U.__bindingPointIndex),u.set(ve,Ve))}function fe(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),i===!0&&(n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null)),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),f={},j=null,he={},d={},g=new WeakMap,x=[],p=null,m=!1,v=null,_=null,b=null,E=null,S=null,A=null,C=null,y=new Ze(0,0,0),M=0,D=!1,F=null,K=null,P=null,O=null,H=null,Se.set(0,0,n.canvas.width,n.canvas.height),Le.set(0,0,n.canvas.width,n.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:ze,disable:le,bindFramebuffer:ge,drawBuffers:L,useProgram:de,setBlending:q,setMaterial:Re,setFlipSided:pe,setCullFace:R,setLineWidth:w,setPolygonOffset:z,setScissorTest:ae,activeTexture:re,bindTexture:Q,unbindTexture:Pe,compressedTexImage2D:ye,compressedTexImage3D:we,texImage2D:Ne,texImage3D:Ee,updateUBOMapping:xt,uniformBlockBinding:je,texStorage2D:et,texStorage3D:Ye,texSubImage2D:ke,texSubImage3D:Je,compressedTexSubImage2D:oe,compressedTexSubImage3D:it,scissor:Ge,viewport:rt,reset:fe}}function t_(n,e,t,i,r,s,o){let a=r.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new WeakMap,h,f=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,w){return d?new OffscreenCanvas(R,w):ao("canvas")}function x(R,w,z,ae){let re=1;if((R.width>ae||R.height>ae)&&(re=ae/Math.max(R.width,R.height)),re<1||w===!0)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap){let Q=w?rl:Math.floor,Pe=Q(re*R.width),ye=Q(re*R.height);h===void 0&&(h=g(Pe,ye));let we=z?g(Pe,ye):h;return we.width=Pe,we.height=ye,we.getContext("2d").drawImage(R,0,0,Pe,ye),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+R.width+"x"+R.height+") to ("+Pe+"x"+ye+")."),we}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+R.width+"x"+R.height+")."),R;return R}function p(R){return iu(R.width)&&iu(R.height)}function m(R){return a?!1:R.wrapS!==Gt||R.wrapT!==Gt||R.minFilter!==Jt&&R.minFilter!==fn}function v(R,w){return R.generateMipmaps&&w&&R.minFilter!==Jt&&R.minFilter!==fn}function _(R){n.generateMipmap(R)}function b(R,w,z,ae,re=!1){if(a===!1)return w;if(R!==null){if(n[R]!==void 0)return n[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let Q=w;if(w===n.RED&&(z===n.FLOAT&&(Q=n.R32F),z===n.HALF_FLOAT&&(Q=n.R16F),z===n.UNSIGNED_BYTE&&(Q=n.R8)),w===n.RED_INTEGER&&(z===n.UNSIGNED_BYTE&&(Q=n.R8UI),z===n.UNSIGNED_SHORT&&(Q=n.R16UI),z===n.UNSIGNED_INT&&(Q=n.R32UI),z===n.BYTE&&(Q=n.R8I),z===n.SHORT&&(Q=n.R16I),z===n.INT&&(Q=n.R32I)),w===n.RG&&(z===n.FLOAT&&(Q=n.RG32F),z===n.HALF_FLOAT&&(Q=n.RG16F),z===n.UNSIGNED_BYTE&&(Q=n.RG8)),w===n.RGBA){let Pe=re?io:dt.getTransfer(ae);z===n.FLOAT&&(Q=n.RGBA32F),z===n.HALF_FLOAT&&(Q=n.RGBA16F),z===n.UNSIGNED_BYTE&&(Q=Pe===gt?n.SRGB8_ALPHA8:n.RGBA8),z===n.UNSIGNED_SHORT_4_4_4_4&&(Q=n.RGBA4),z===n.UNSIGNED_SHORT_5_5_5_1&&(Q=n.RGB5_A1)}return(Q===n.R16F||Q===n.R32F||Q===n.RG16F||Q===n.RG32F||Q===n.RGBA16F||Q===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function E(R,w,z){return v(R,z)===!0||R.isFramebufferTexture&&R.minFilter!==Jt&&R.minFilter!==fn?Math.log2(Math.max(w.width,w.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?w.mipmaps.length:1}function S(R){return R===Jt||R===Tc||R===fa?n.NEAREST:n.LINEAR}function A(R){let w=R.target;w.removeEventListener("dispose",A),y(w),w.isVideoTexture&&u.delete(w)}function C(R){let w=R.target;w.removeEventListener("dispose",C),D(w)}function y(R){let w=i.get(R);if(w.__webglInit===void 0)return;let z=R.source,ae=f.get(z);if(ae){let re=ae[w.__cacheKey];re.usedTimes--,re.usedTimes===0&&M(R),Object.keys(ae).length===0&&f.delete(z)}i.remove(R)}function M(R){let w=i.get(R);n.deleteTexture(w.__webglTexture);let z=R.source,ae=f.get(z);delete ae[w.__cacheKey],o.memory.textures--}function D(R){let w=R.texture,z=i.get(R),ae=i.get(w);if(ae.__webglTexture!==void 0&&(n.deleteTexture(ae.__webglTexture),o.memory.textures--),R.depthTexture&&R.depthTexture.dispose(),R.isWebGLCubeRenderTarget)for(let re=0;re<6;re++){if(Array.isArray(z.__webglFramebuffer[re]))for(let Q=0;Q<z.__webglFramebuffer[re].length;Q++)n.deleteFramebuffer(z.__webglFramebuffer[re][Q]);else n.deleteFramebuffer(z.__webglFramebuffer[re]);z.__webglDepthbuffer&&n.deleteRenderbuffer(z.__webglDepthbuffer[re])}else{if(Array.isArray(z.__webglFramebuffer))for(let re=0;re<z.__webglFramebuffer.length;re++)n.deleteFramebuffer(z.__webglFramebuffer[re]);else n.deleteFramebuffer(z.__webglFramebuffer);if(z.__webglDepthbuffer&&n.deleteRenderbuffer(z.__webglDepthbuffer),z.__webglMultisampledFramebuffer&&n.deleteFramebuffer(z.__webglMultisampledFramebuffer),z.__webglColorRenderbuffer)for(let re=0;re<z.__webglColorRenderbuffer.length;re++)z.__webglColorRenderbuffer[re]&&n.deleteRenderbuffer(z.__webglColorRenderbuffer[re]);z.__webglDepthRenderbuffer&&n.deleteRenderbuffer(z.__webglDepthRenderbuffer)}if(R.isWebGLMultipleRenderTargets)for(let re=0,Q=w.length;re<Q;re++){let Pe=i.get(w[re]);Pe.__webglTexture&&(n.deleteTexture(Pe.__webglTexture),o.memory.textures--),i.remove(w[re])}i.remove(w),i.remove(R)}let F=0;function K(){F=0}function P(){let R=F;return R>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+r.maxTextures),F+=1,R}function O(R){let w=[];return w.push(R.wrapS),w.push(R.wrapT),w.push(R.wrapR||0),w.push(R.magFilter),w.push(R.minFilter),w.push(R.anisotropy),w.push(R.internalFormat),w.push(R.format),w.push(R.type),w.push(R.generateMipmaps),w.push(R.premultiplyAlpha),w.push(R.flipY),w.push(R.unpackAlignment),w.push(R.colorSpace),w.join()}function H(R,w){let z=i.get(R);if(R.isVideoTexture&&Re(R),R.isRenderTargetTexture===!1&&R.version>0&&z.__version!==R.version){let ae=R.image;if(ae===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ae.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Se(z,R,w);return}}t.bindTexture(n.TEXTURE_2D,z.__webglTexture,n.TEXTURE0+w)}function Z(R,w){let z=i.get(R);if(R.version>0&&z.__version!==R.version){Se(z,R,w);return}t.bindTexture(n.TEXTURE_2D_ARRAY,z.__webglTexture,n.TEXTURE0+w)}function J(R,w){let z=i.get(R);if(R.version>0&&z.__version!==R.version){Se(z,R,w);return}t.bindTexture(n.TEXTURE_3D,z.__webglTexture,n.TEXTURE0+w)}function X(R,w){let z=i.get(R);if(R.version>0&&z.__version!==R.version){Le(z,R,w);return}t.bindTexture(n.TEXTURE_CUBE_MAP,z.__webglTexture,n.TEXTURE0+w)}let ie={[vr]:n.REPEAT,[Gt]:n.CLAMP_TO_EDGE,[el]:n.MIRRORED_REPEAT},j={[Jt]:n.NEAREST,[Tc]:n.NEAREST_MIPMAP_NEAREST,[fa]:n.NEAREST_MIPMAP_LINEAR,[fn]:n.LINEAR,[Kf]:n.LINEAR_MIPMAP_NEAREST,[$r]:n.LINEAR_MIPMAP_LINEAR},he={[op]:n.NEVER,[dp]:n.ALWAYS,[ap]:n.LESS,[uh]:n.LEQUAL,[lp]:n.EQUAL,[hp]:n.GEQUAL,[cp]:n.GREATER,[up]:n.NOTEQUAL};function W(R,w,z){if(z?(n.texParameteri(R,n.TEXTURE_WRAP_S,ie[w.wrapS]),n.texParameteri(R,n.TEXTURE_WRAP_T,ie[w.wrapT]),(R===n.TEXTURE_3D||R===n.TEXTURE_2D_ARRAY)&&n.texParameteri(R,n.TEXTURE_WRAP_R,ie[w.wrapR]),n.texParameteri(R,n.TEXTURE_MAG_FILTER,j[w.magFilter]),n.texParameteri(R,n.TEXTURE_MIN_FILTER,j[w.minFilter])):(n.texParameteri(R,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(R,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),(R===n.TEXTURE_3D||R===n.TEXTURE_2D_ARRAY)&&n.texParameteri(R,n.TEXTURE_WRAP_R,n.CLAMP_TO_EDGE),(w.wrapS!==Gt||w.wrapT!==Gt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),n.texParameteri(R,n.TEXTURE_MAG_FILTER,S(w.magFilter)),n.texParameteri(R,n.TEXTURE_MIN_FILTER,S(w.minFilter)),w.minFilter!==Jt&&w.minFilter!==fn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),w.compareFunction&&(n.texParameteri(R,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(R,n.TEXTURE_COMPARE_FUNC,he[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){let ae=e.get("EXT_texture_filter_anisotropic");if(w.magFilter===Jt||w.minFilter!==fa&&w.minFilter!==$r||w.type===ui&&e.has("OES_texture_float_linear")===!1||a===!1&&w.type===Fi&&e.has("OES_texture_half_float_linear")===!1)return;(w.anisotropy>1||i.get(w).__currentAnisotropy)&&(n.texParameterf(R,ae.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),i.get(w).__currentAnisotropy=w.anisotropy)}}function te(R,w){let z=!1;R.__webglInit===void 0&&(R.__webglInit=!0,w.addEventListener("dispose",A));let ae=w.source,re=f.get(ae);re===void 0&&(re={},f.set(ae,re));let Q=O(w);if(Q!==R.__cacheKey){re[Q]===void 0&&(re[Q]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,z=!0),re[Q].usedTimes++;let Pe=re[R.__cacheKey];Pe!==void 0&&(re[R.__cacheKey].usedTimes--,Pe.usedTimes===0&&M(w)),R.__cacheKey=Q,R.__webglTexture=re[Q].texture}return z}function Se(R,w,z){let ae=n.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(ae=n.TEXTURE_2D_ARRAY),w.isData3DTexture&&(ae=n.TEXTURE_3D);let re=te(R,w),Q=w.source;t.bindTexture(ae,R.__webglTexture,n.TEXTURE0+z);let Pe=i.get(Q);if(Q.version!==Pe.__version||re===!0){t.activeTexture(n.TEXTURE0+z);let ye=dt.getPrimaries(dt.workingColorSpace),we=w.colorSpace===mn?null:dt.getPrimaries(w.colorSpace),ke=w.colorSpace===mn||ye===we?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ke);let Je=m(w)&&p(w.image)===!1,oe=x(w.image,Je,!1,r.maxTextureSize);oe=pe(w,oe);let it=p(oe)||a,et=s.convert(w.format,w.colorSpace),Ye=s.convert(w.type),Ne=b(w.internalFormat,et,Ye,w.colorSpace,w.isVideoTexture);W(ae,w,it);let Ee,Ge=w.mipmaps,rt=a&&w.isVideoTexture!==!0&&Ne!==oh,xt=Pe.__version===void 0||re===!0,je=E(w,oe,it);if(w.isDepthTexture)Ne=n.DEPTH_COMPONENT,a?w.type===ui?Ne=n.DEPTH_COMPONENT32F:w.type===ci?Ne=n.DEPTH_COMPONENT24:w.type===Di?Ne=n.DEPTH24_STENCIL8:Ne=n.DEPTH_COMPONENT16:w.type===ui&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),w.format===Ui&&Ne===n.DEPTH_COMPONENT&&w.type!==Vl&&w.type!==ci&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),w.type=ci,Ye=s.convert(w.type)),w.format===br&&Ne===n.DEPTH_COMPONENT&&(Ne=n.DEPTH_STENCIL,w.type!==Di&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),w.type=Di,Ye=s.convert(w.type))),xt&&(rt?t.texStorage2D(n.TEXTURE_2D,1,Ne,oe.width,oe.height):t.texImage2D(n.TEXTURE_2D,0,Ne,oe.width,oe.height,0,et,Ye,null));else if(w.isDataTexture)if(Ge.length>0&&it){rt&&xt&&t.texStorage2D(n.TEXTURE_2D,je,Ne,Ge[0].width,Ge[0].height);for(let fe=0,U=Ge.length;fe<U;fe++)Ee=Ge[fe],rt?t.texSubImage2D(n.TEXTURE_2D,fe,0,0,Ee.width,Ee.height,et,Ye,Ee.data):t.texImage2D(n.TEXTURE_2D,fe,Ne,Ee.width,Ee.height,0,et,Ye,Ee.data);w.generateMipmaps=!1}else rt?(xt&&t.texStorage2D(n.TEXTURE_2D,je,Ne,oe.width,oe.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,oe.width,oe.height,et,Ye,oe.data)):t.texImage2D(n.TEXTURE_2D,0,Ne,oe.width,oe.height,0,et,Ye,oe.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){rt&&xt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,je,Ne,Ge[0].width,Ge[0].height,oe.depth);for(let fe=0,U=Ge.length;fe<U;fe++)Ee=Ge[fe],w.format!==An?et!==null?rt?t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,fe,0,0,0,Ee.width,Ee.height,oe.depth,et,Ee.data,0,0):t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,fe,Ne,Ee.width,Ee.height,oe.depth,0,Ee.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):rt?t.texSubImage3D(n.TEXTURE_2D_ARRAY,fe,0,0,0,Ee.width,Ee.height,oe.depth,et,Ye,Ee.data):t.texImage3D(n.TEXTURE_2D_ARRAY,fe,Ne,Ee.width,Ee.height,oe.depth,0,et,Ye,Ee.data)}else{rt&&xt&&t.texStorage2D(n.TEXTURE_2D,je,Ne,Ge[0].width,Ge[0].height);for(let fe=0,U=Ge.length;fe<U;fe++)Ee=Ge[fe],w.format!==An?et!==null?rt?t.compressedTexSubImage2D(n.TEXTURE_2D,fe,0,0,Ee.width,Ee.height,et,Ee.data):t.compressedTexImage2D(n.TEXTURE_2D,fe,Ne,Ee.width,Ee.height,0,Ee.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):rt?t.texSubImage2D(n.TEXTURE_2D,fe,0,0,Ee.width,Ee.height,et,Ye,Ee.data):t.texImage2D(n.TEXTURE_2D,fe,Ne,Ee.width,Ee.height,0,et,Ye,Ee.data)}else if(w.isDataArrayTexture)rt?(xt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,je,Ne,oe.width,oe.height,oe.depth),t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,oe.width,oe.height,oe.depth,et,Ye,oe.data)):t.texImage3D(n.TEXTURE_2D_ARRAY,0,Ne,oe.width,oe.height,oe.depth,0,et,Ye,oe.data);else if(w.isData3DTexture)rt?(xt&&t.texStorage3D(n.TEXTURE_3D,je,Ne,oe.width,oe.height,oe.depth),t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,oe.width,oe.height,oe.depth,et,Ye,oe.data)):t.texImage3D(n.TEXTURE_3D,0,Ne,oe.width,oe.height,oe.depth,0,et,Ye,oe.data);else if(w.isFramebufferTexture){if(xt)if(rt)t.texStorage2D(n.TEXTURE_2D,je,Ne,oe.width,oe.height);else{let fe=oe.width,U=oe.height;for(let ve=0;ve<je;ve++)t.texImage2D(n.TEXTURE_2D,ve,Ne,fe,U,0,et,Ye,null),fe>>=1,U>>=1}}else if(Ge.length>0&&it){rt&&xt&&t.texStorage2D(n.TEXTURE_2D,je,Ne,Ge[0].width,Ge[0].height);for(let fe=0,U=Ge.length;fe<U;fe++)Ee=Ge[fe],rt?t.texSubImage2D(n.TEXTURE_2D,fe,0,0,et,Ye,Ee):t.texImage2D(n.TEXTURE_2D,fe,Ne,et,Ye,Ee);w.generateMipmaps=!1}else rt?(xt&&t.texStorage2D(n.TEXTURE_2D,je,Ne,oe.width,oe.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,et,Ye,oe)):t.texImage2D(n.TEXTURE_2D,0,Ne,et,Ye,oe);v(w,it)&&_(ae),Pe.__version=Q.version,w.onUpdate&&w.onUpdate(w)}R.__version=w.version}function Le(R,w,z){if(w.image.length!==6)return;let ae=te(R,w),re=w.source;t.bindTexture(n.TEXTURE_CUBE_MAP,R.__webglTexture,n.TEXTURE0+z);let Q=i.get(re);if(re.version!==Q.__version||ae===!0){t.activeTexture(n.TEXTURE0+z);let Pe=dt.getPrimaries(dt.workingColorSpace),ye=w.colorSpace===mn?null:dt.getPrimaries(w.colorSpace),we=w.colorSpace===mn||Pe===ye?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,we);let ke=w.isCompressedTexture||w.image[0].isCompressedTexture,Je=w.image[0]&&w.image[0].isDataTexture,oe=[];for(let fe=0;fe<6;fe++)!ke&&!Je?oe[fe]=x(w.image[fe],!1,!0,r.maxCubemapSize):oe[fe]=Je?w.image[fe].image:w.image[fe],oe[fe]=pe(w,oe[fe]);let it=oe[0],et=p(it)||a,Ye=s.convert(w.format,w.colorSpace),Ne=s.convert(w.type),Ee=b(w.internalFormat,Ye,Ne,w.colorSpace),Ge=a&&w.isVideoTexture!==!0,rt=Q.__version===void 0||ae===!0,xt=E(w,it,et);W(n.TEXTURE_CUBE_MAP,w,et);let je;if(ke){Ge&&rt&&t.texStorage2D(n.TEXTURE_CUBE_MAP,xt,Ee,it.width,it.height);for(let fe=0;fe<6;fe++){je=oe[fe].mipmaps;for(let U=0;U<je.length;U++){let ve=je[U];w.format!==An?Ye!==null?Ge?t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U,0,0,ve.width,ve.height,Ye,ve.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U,Ee,ve.width,ve.height,0,ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ge?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U,0,0,ve.width,ve.height,Ye,Ne,ve.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U,Ee,ve.width,ve.height,0,Ye,Ne,ve.data)}}}else{je=w.mipmaps,Ge&&rt&&(je.length>0&&xt++,t.texStorage2D(n.TEXTURE_CUBE_MAP,xt,Ee,oe[0].width,oe[0].height));for(let fe=0;fe<6;fe++)if(Je){Ge?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,0,0,oe[fe].width,oe[fe].height,Ye,Ne,oe[fe].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,Ee,oe[fe].width,oe[fe].height,0,Ye,Ne,oe[fe].data);for(let U=0;U<je.length;U++){let be=je[U].image[fe].image;Ge?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U+1,0,0,be.width,be.height,Ye,Ne,be.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U+1,Ee,be.width,be.height,0,Ye,Ne,be.data)}}else{Ge?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,0,0,Ye,Ne,oe[fe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,Ee,Ye,Ne,oe[fe]);for(let U=0;U<je.length;U++){let ve=je[U];Ge?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U+1,0,0,Ye,Ne,ve.image[fe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U+1,Ee,Ye,Ne,ve.image[fe])}}}v(w,et)&&_(n.TEXTURE_CUBE_MAP),Q.__version=re.version,w.onUpdate&&w.onUpdate(w)}R.__version=w.version}function _e(R,w,z,ae,re,Q){let Pe=s.convert(z.format,z.colorSpace),ye=s.convert(z.type),we=b(z.internalFormat,Pe,ye,z.colorSpace);if(!i.get(w).__hasExternalTextures){let Je=Math.max(1,w.width>>Q),oe=Math.max(1,w.height>>Q);re===n.TEXTURE_3D||re===n.TEXTURE_2D_ARRAY?t.texImage3D(re,Q,we,Je,oe,w.depth,0,Pe,ye,null):t.texImage2D(re,Q,we,Je,oe,0,Pe,ye,null)}t.bindFramebuffer(n.FRAMEBUFFER,R),q(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ae,re,i.get(z).__webglTexture,0,ue(w)):(re===n.TEXTURE_2D||re>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&re<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,ae,re,i.get(z).__webglTexture,Q),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Fe(R,w,z){if(n.bindRenderbuffer(n.RENDERBUFFER,R),w.depthBuffer&&!w.stencilBuffer){let ae=a===!0?n.DEPTH_COMPONENT24:n.DEPTH_COMPONENT16;if(z||q(w)){let re=w.depthTexture;re&&re.isDepthTexture&&(re.type===ui?ae=n.DEPTH_COMPONENT32F:re.type===ci&&(ae=n.DEPTH_COMPONENT24));let Q=ue(w);q(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Q,ae,w.width,w.height):n.renderbufferStorageMultisample(n.RENDERBUFFER,Q,ae,w.width,w.height)}else n.renderbufferStorage(n.RENDERBUFFER,ae,w.width,w.height);n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.RENDERBUFFER,R)}else if(w.depthBuffer&&w.stencilBuffer){let ae=ue(w);z&&q(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,ae,n.DEPTH24_STENCIL8,w.width,w.height):q(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ae,n.DEPTH24_STENCIL8,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,n.DEPTH_STENCIL,w.width,w.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.RENDERBUFFER,R)}else{let ae=w.isWebGLMultipleRenderTargets===!0?w.texture:[w.texture];for(let re=0;re<ae.length;re++){let Q=ae[re],Pe=s.convert(Q.format,Q.colorSpace),ye=s.convert(Q.type),we=b(Q.internalFormat,Pe,ye,Q.colorSpace),ke=ue(w);z&&q(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,ke,we,w.width,w.height):q(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ke,we,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,we,w.width,w.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function ze(R,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,R),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(w.depthTexture).__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),H(w.depthTexture,0);let ae=i.get(w.depthTexture).__webglTexture,re=ue(w);if(w.depthTexture.format===Ui)q(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ae,0,re):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ae,0);else if(w.depthTexture.format===br)q(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ae,0,re):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ae,0);else throw new Error("Unknown depthTexture format")}function le(R){let w=i.get(R),z=R.isWebGLCubeRenderTarget===!0;if(R.depthTexture&&!w.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");ze(w.__webglFramebuffer,R)}else if(z){w.__webglDepthbuffer=[];for(let ae=0;ae<6;ae++)t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer[ae]),w.__webglDepthbuffer[ae]=n.createRenderbuffer(),Fe(w.__webglDepthbuffer[ae],R,!1)}else t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer=n.createRenderbuffer(),Fe(w.__webglDepthbuffer,R,!1);t.bindFramebuffer(n.FRAMEBUFFER,null)}function ge(R,w,z){let ae=i.get(R);w!==void 0&&_e(ae.__webglFramebuffer,R,R.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),z!==void 0&&le(R)}function L(R){let w=R.texture,z=i.get(R),ae=i.get(w);R.addEventListener("dispose",C),R.isWebGLMultipleRenderTargets!==!0&&(ae.__webglTexture===void 0&&(ae.__webglTexture=n.createTexture()),ae.__version=w.version,o.memory.textures++);let re=R.isWebGLCubeRenderTarget===!0,Q=R.isWebGLMultipleRenderTargets===!0,Pe=p(R)||a;if(re){z.__webglFramebuffer=[];for(let ye=0;ye<6;ye++)if(a&&w.mipmaps&&w.mipmaps.length>0){z.__webglFramebuffer[ye]=[];for(let we=0;we<w.mipmaps.length;we++)z.__webglFramebuffer[ye][we]=n.createFramebuffer()}else z.__webglFramebuffer[ye]=n.createFramebuffer()}else{if(a&&w.mipmaps&&w.mipmaps.length>0){z.__webglFramebuffer=[];for(let ye=0;ye<w.mipmaps.length;ye++)z.__webglFramebuffer[ye]=n.createFramebuffer()}else z.__webglFramebuffer=n.createFramebuffer();if(Q)if(r.drawBuffers){let ye=R.texture;for(let we=0,ke=ye.length;we<ke;we++){let Je=i.get(ye[we]);Je.__webglTexture===void 0&&(Je.__webglTexture=n.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&R.samples>0&&q(R)===!1){let ye=Q?w:[w];z.__webglMultisampledFramebuffer=n.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let we=0;we<ye.length;we++){let ke=ye[we];z.__webglColorRenderbuffer[we]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,z.__webglColorRenderbuffer[we]);let Je=s.convert(ke.format,ke.colorSpace),oe=s.convert(ke.type),it=b(ke.internalFormat,Je,oe,ke.colorSpace,R.isXRRenderTarget===!0),et=ue(R);n.renderbufferStorageMultisample(n.RENDERBUFFER,et,it,R.width,R.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+we,n.RENDERBUFFER,z.__webglColorRenderbuffer[we])}n.bindRenderbuffer(n.RENDERBUFFER,null),R.depthBuffer&&(z.__webglDepthRenderbuffer=n.createRenderbuffer(),Fe(z.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(re){t.bindTexture(n.TEXTURE_CUBE_MAP,ae.__webglTexture),W(n.TEXTURE_CUBE_MAP,w,Pe);for(let ye=0;ye<6;ye++)if(a&&w.mipmaps&&w.mipmaps.length>0)for(let we=0;we<w.mipmaps.length;we++)_e(z.__webglFramebuffer[ye][we],R,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ye,we);else _e(z.__webglFramebuffer[ye],R,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0);v(w,Pe)&&_(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Q){let ye=R.texture;for(let we=0,ke=ye.length;we<ke;we++){let Je=ye[we],oe=i.get(Je);t.bindTexture(n.TEXTURE_2D,oe.__webglTexture),W(n.TEXTURE_2D,Je,Pe),_e(z.__webglFramebuffer,R,Je,n.COLOR_ATTACHMENT0+we,n.TEXTURE_2D,0),v(Je,Pe)&&_(n.TEXTURE_2D)}t.unbindTexture()}else{let ye=n.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(a?ye=R.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(ye,ae.__webglTexture),W(ye,w,Pe),a&&w.mipmaps&&w.mipmaps.length>0)for(let we=0;we<w.mipmaps.length;we++)_e(z.__webglFramebuffer[we],R,w,n.COLOR_ATTACHMENT0,ye,we);else _e(z.__webglFramebuffer,R,w,n.COLOR_ATTACHMENT0,ye,0);v(w,Pe)&&_(ye),t.unbindTexture()}R.depthBuffer&&le(R)}function de(R){let w=p(R)||a,z=R.isWebGLMultipleRenderTargets===!0?R.texture:[R.texture];for(let ae=0,re=z.length;ae<re;ae++){let Q=z[ae];if(v(Q,w)){let Pe=R.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,ye=i.get(Q).__webglTexture;t.bindTexture(Pe,ye),_(Pe),t.unbindTexture()}}}function Y(R){if(a&&R.samples>0&&q(R)===!1){let w=R.isWebGLMultipleRenderTargets?R.texture:[R.texture],z=R.width,ae=R.height,re=n.COLOR_BUFFER_BIT,Q=[],Pe=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ye=i.get(R),we=R.isWebGLMultipleRenderTargets===!0;if(we)for(let ke=0;ke<w.length;ke++)t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ke,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ke,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,ye.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ye.__webglFramebuffer);for(let ke=0;ke<w.length;ke++){Q.push(n.COLOR_ATTACHMENT0+ke),R.depthBuffer&&Q.push(Pe);let Je=ye.__ignoreDepthValues!==void 0?ye.__ignoreDepthValues:!1;if(Je===!1&&(R.depthBuffer&&(re|=n.DEPTH_BUFFER_BIT),R.stencilBuffer&&(re|=n.STENCIL_BUFFER_BIT)),we&&n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ye.__webglColorRenderbuffer[ke]),Je===!0&&(n.invalidateFramebuffer(n.READ_FRAMEBUFFER,[Pe]),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[Pe])),we){let oe=i.get(w[ke]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,oe,0)}n.blitFramebuffer(0,0,z,ae,0,0,z,ae,re,n.NEAREST),c&&n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Q)}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),we)for(let ke=0;ke<w.length;ke++){t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ke,n.RENDERBUFFER,ye.__webglColorRenderbuffer[ke]);let Je=i.get(w[ke]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ke,n.TEXTURE_2D,Je,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ye.__webglMultisampledFramebuffer)}}function ue(R){return Math.min(r.maxSamples,R.samples)}function q(R){let w=i.get(R);return a&&R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Re(R){let w=o.render.frame;u.get(R)!==w&&(u.set(R,w),R.update())}function pe(R,w){let z=R.colorSpace,ae=R.format,re=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||R.format===nl||z!==jn&&z!==mn&&(dt.getTransfer(z)===gt?a===!1?e.has("EXT_sRGB")===!0&&ae===An?(R.format=nl,R.minFilter=fn,R.generateMipmaps=!1):w=lo.sRGBToLinear(w):(ae!==An||re!==di)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),w}this.allocateTextureUnit=P,this.resetTextureUnits=K,this.setTexture2D=H,this.setTexture2DArray=Z,this.setTexture3D=J,this.setTextureCube=X,this.rebindTextures=ge,this.setupRenderTarget=L,this.updateRenderTargetMipmap=de,this.updateMultisampleRenderTarget=Y,this.setupDepthRenderbuffer=le,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=q}function n_(n,e,t){let i=t.isWebGL2;function r(s,o=mn){let a,l=dt.getTransfer(o);if(s===di)return n.UNSIGNED_BYTE;if(s===th)return n.UNSIGNED_SHORT_4_4_4_4;if(s===nh)return n.UNSIGNED_SHORT_5_5_5_1;if(s===Zf)return n.BYTE;if(s===Jf)return n.SHORT;if(s===Vl)return n.UNSIGNED_SHORT;if(s===eh)return n.INT;if(s===ci)return n.UNSIGNED_INT;if(s===ui)return n.FLOAT;if(s===Fi)return i?n.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===$f)return n.ALPHA;if(s===An)return n.RGBA;if(s===jf)return n.LUMINANCE;if(s===Qf)return n.LUMINANCE_ALPHA;if(s===Ui)return n.DEPTH_COMPONENT;if(s===br)return n.DEPTH_STENCIL;if(s===nl)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===ep)return n.RED;if(s===ih)return n.RED_INTEGER;if(s===tp)return n.RG;if(s===rh)return n.RG_INTEGER;if(s===sh)return n.RGBA_INTEGER;if(s===pa||s===ma||s===ga||s===xa)if(l===gt)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===pa)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===ma)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===ga)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===xa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===pa)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===ma)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===ga)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===xa)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===Ac||s===Rc||s===Cc||s===Pc)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===Ac)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===Rc)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Cc)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Pc)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===oh)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===Ic||s===Lc)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===Ic)return l===gt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===Lc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===Dc||s===Uc||s===Nc||s===Oc||s===Fc||s===zc||s===kc||s===Bc||s===Gc||s===Hc||s===Vc||s===Wc||s===Xc||s===qc)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===Dc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Uc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Nc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===Oc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===Fc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===zc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===kc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Bc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===Gc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Hc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Vc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Wc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Xc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===qc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===_a||s===Yc||s===Kc)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===_a)return l===gt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Yc)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Kc)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===np||s===Zc||s===Jc||s===$c)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===_a)return a.COMPRESSED_RED_RGTC1_EXT;if(s===Zc)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Jc)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===$c)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===Di?i?n.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):n[s]!==void 0?n[s]:null}return{convert:r}}var _l=class extends tn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Te=class extends qt{constructor(){super(),this.isGroup=!0,this.type="Group"}},i_={type:"move"},Kr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Te,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Te,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Te,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let x of e.hand.values()){let p=t.getJointPose(x,i),m=this._getHandJoint(c,x);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(i_)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Te;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},yl=class extends mi{constructor(e,t){super();let i=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,f=null,d=null,g=null,x=t.getContextAttributes(),p=null,m=null,v=[],_=[],b=new $,E=null,S=new tn;S.layers.enable(1),S.viewport=new vt;let A=new tn;A.layers.enable(2),A.viewport=new vt;let C=[S,A],y=new _l;y.layers.enable(1),y.layers.enable(2);let M=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let te=v[W];return te===void 0&&(te=new Kr,v[W]=te),te.getTargetRaySpace()},this.getControllerGrip=function(W){let te=v[W];return te===void 0&&(te=new Kr,v[W]=te),te.getGripSpace()},this.getHand=function(W){let te=v[W];return te===void 0&&(te=new Kr,v[W]=te),te.getHandSpace()};function F(W){let te=_.indexOf(W.inputSource);if(te===-1)return;let Se=v[te];Se!==void 0&&(Se.update(W.inputSource,W.frame,c||o),Se.dispatchEvent({type:W.type,data:W.inputSource}))}function K(){r.removeEventListener("select",F),r.removeEventListener("selectstart",F),r.removeEventListener("selectend",F),r.removeEventListener("squeeze",F),r.removeEventListener("squeezestart",F),r.removeEventListener("squeezeend",F),r.removeEventListener("end",K),r.removeEventListener("inputsourceschange",P);for(let W=0;W<v.length;W++){let te=_[W];te!==null&&(_[W]=null,v[W].disconnect(te))}M=null,D=null,e.setRenderTarget(p),d=null,f=null,h=null,r=null,m=null,he.stop(),i.isPresenting=!1,e.setPixelRatio(E),e.setSize(b.width,b.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){s=W,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){a=W,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(W){if(r=W,r!==null){if(p=e.getRenderTarget(),r.addEventListener("select",F),r.addEventListener("selectstart",F),r.addEventListener("selectend",F),r.addEventListener("squeeze",F),r.addEventListener("squeezestart",F),r.addEventListener("squeezeend",F),r.addEventListener("end",K),r.addEventListener("inputsourceschange",P),x.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(b),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){let te={antialias:r.renderState.layers===void 0?x.antialias:!0,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(r,t,te),r.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),m=new $t(d.framebufferWidth,d.framebufferHeight,{format:An,type:di,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let te=null,Se=null,Le=null;x.depth&&(Le=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=x.stencil?br:Ui,Se=x.stencil?Di:ci);let _e={colorFormat:t.RGBA8,depthFormat:Le,scaleFactor:s};h=new XRWebGLBinding(r,t),f=h.createProjectionLayer(_e),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),m=new $t(f.textureWidth,f.textureHeight,{format:An,type:di,depthTexture:new _o(f.textureWidth,f.textureHeight,Se,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0});let Fe=e.properties.get(m);Fe.__ignoreDepthValues=f.ignoreDepthValues}m.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),he.setContext(r),he.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function P(W){for(let te=0;te<W.removed.length;te++){let Se=W.removed[te],Le=_.indexOf(Se);Le>=0&&(_[Le]=null,v[Le].disconnect(Se))}for(let te=0;te<W.added.length;te++){let Se=W.added[te],Le=_.indexOf(Se);if(Le===-1){for(let Fe=0;Fe<v.length;Fe++)if(Fe>=_.length){_.push(Se),Le=Fe;break}else if(_[Fe]===null){_[Fe]=Se,Le=Fe;break}if(Le===-1)break}let _e=v[Le];_e&&_e.connect(Se)}}let O=new I,H=new I;function Z(W,te,Se){O.setFromMatrixPosition(te.matrixWorld),H.setFromMatrixPosition(Se.matrixWorld);let Le=O.distanceTo(H),_e=te.projectionMatrix.elements,Fe=Se.projectionMatrix.elements,ze=_e[14]/(_e[10]-1),le=_e[14]/(_e[10]+1),ge=(_e[9]+1)/_e[5],L=(_e[9]-1)/_e[5],de=(_e[8]-1)/_e[0],Y=(Fe[8]+1)/Fe[0],ue=ze*de,q=ze*Y,Re=Le/(-de+Y),pe=Re*-de;te.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(pe),W.translateZ(Re),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert();let R=ze+Re,w=le+Re,z=ue-pe,ae=q+(Le-pe),re=ge*le/w*R,Q=L*le/w*R;W.projectionMatrix.makePerspective(z,ae,re,Q,R,w),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}function J(W,te){te===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(te.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(r===null)return;y.near=A.near=S.near=W.near,y.far=A.far=S.far=W.far,(M!==y.near||D!==y.far)&&(r.updateRenderState({depthNear:y.near,depthFar:y.far}),M=y.near,D=y.far);let te=W.parent,Se=y.cameras;J(y,te);for(let Le=0;Le<Se.length;Le++)J(Se[Le],te);Se.length===2?Z(y,S,A):y.projectionMatrix.copy(S.projectionMatrix),X(W,y,te)};function X(W,te,Se){Se===null?W.matrix.copy(te.matrixWorld):(W.matrix.copy(Se.matrixWorld),W.matrix.invert(),W.matrix.multiply(te.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(te.projectionMatrix),W.projectionMatrixInverse.copy(te.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=il*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(W){l=W,f!==null&&(f.fixedFoveation=W),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=W)};let ie=null;function j(W,te){if(u=te.getViewerPose(c||o),g=te,u!==null){let Se=u.views;d!==null&&(e.setRenderTargetFramebuffer(m,d.framebuffer),e.setRenderTarget(m));let Le=!1;Se.length!==y.cameras.length&&(y.cameras.length=0,Le=!0);for(let _e=0;_e<Se.length;_e++){let Fe=Se[_e],ze=null;if(d!==null)ze=d.getViewport(Fe);else{let ge=h.getViewSubImage(f,Fe);ze=ge.viewport,_e===0&&(e.setRenderTargetTextures(m,ge.colorTexture,f.ignoreDepthValues?void 0:ge.depthStencilTexture),e.setRenderTarget(m))}let le=C[_e];le===void 0&&(le=new tn,le.layers.enable(_e),le.viewport=new vt,C[_e]=le),le.matrix.fromArray(Fe.transform.matrix),le.matrix.decompose(le.position,le.quaternion,le.scale),le.projectionMatrix.fromArray(Fe.projectionMatrix),le.projectionMatrixInverse.copy(le.projectionMatrix).invert(),le.viewport.set(ze.x,ze.y,ze.width,ze.height),_e===0&&(y.matrix.copy(le.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),Le===!0&&y.cameras.push(le)}}for(let Se=0;Se<v.length;Se++){let Le=_[Se],_e=v[Se];Le!==null&&_e!==void 0&&_e.update(Le,te,c||o)}ie&&ie(W,te),te.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:te}),g=null}let he=new ph;he.setAnimationLoop(j),this.setAnimationLoop=function(W){ie=W},this.dispose=function(){}}};function r_(n,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function i(p,m){m.color.getRGB(p.fogColor.value,fh(n)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function r(p,m,v,_,b){m.isMeshBasicMaterial||m.isMeshLambertMaterial?s(p,m):m.isMeshToonMaterial?(s(p,m),h(p,m)):m.isMeshPhongMaterial?(s(p,m),u(p,m)):m.isMeshStandardMaterial?(s(p,m),f(p,m),m.isMeshPhysicalMaterial&&d(p,m,b)):m.isMeshMatcapMaterial?(s(p,m),g(p,m)):m.isMeshDepthMaterial?s(p,m):m.isMeshDistanceMaterial?(s(p,m),x(p,m)):m.isMeshNormalMaterial?s(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,v,_):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Lt&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Lt&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let v=e.get(m).envMap;if(v&&(p.envMap.value=v,p.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap){p.lightMap.value=m.lightMap;let _=n._useLegacyLights===!0?Math.PI:1;p.lightMapIntensity.value=m.lightMapIntensity*_,t(m.lightMap,p.lightMapTransform)}m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,v,_){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*v,p.scale.value=_*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function h(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function f(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),e.get(m).envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function d(p,m,v){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Lt&&p.clearcoatNormalScale.value.negate())),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=v.texture,p.transmissionSamplerSize.value.set(v.width,v.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function x(p,m){let v=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(v.matrixWorld),p.nearDistance.value=v.shadow.camera.near,p.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function s_(n,e,t,i){let r={},s={},o=[],a=t.isWebGL2?n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(v,_){let b=_.program;i.uniformBlockBinding(v,b)}function c(v,_){let b=r[v.id];b===void 0&&(g(v),b=u(v),r[v.id]=b,v.addEventListener("dispose",p));let E=_.program;i.updateUBOMapping(v,E);let S=e.render.frame;s[v.id]!==S&&(f(v),s[v.id]=S)}function u(v){let _=h();v.__bindingPointIndex=_;let b=n.createBuffer(),E=v.__size,S=v.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,E,S),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,_,b),b}function h(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(v){let _=r[v.id],b=v.uniforms,E=v.__cache;n.bindBuffer(n.UNIFORM_BUFFER,_);for(let S=0,A=b.length;S<A;S++){let C=Array.isArray(b[S])?b[S]:[b[S]];for(let y=0,M=C.length;y<M;y++){let D=C[y];if(d(D,S,y,E)===!0){let F=D.__offset,K=Array.isArray(D.value)?D.value:[D.value],P=0;for(let O=0;O<K.length;O++){let H=K[O],Z=x(H);typeof H=="number"||typeof H=="boolean"?(D.__data[0]=H,n.bufferSubData(n.UNIFORM_BUFFER,F+P,D.__data)):H.isMatrix3?(D.__data[0]=H.elements[0],D.__data[1]=H.elements[1],D.__data[2]=H.elements[2],D.__data[3]=0,D.__data[4]=H.elements[3],D.__data[5]=H.elements[4],D.__data[6]=H.elements[5],D.__data[7]=0,D.__data[8]=H.elements[6],D.__data[9]=H.elements[7],D.__data[10]=H.elements[8],D.__data[11]=0):(H.toArray(D.__data,P),P+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,F,D.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(v,_,b,E){let S=v.value,A=_+"_"+b;if(E[A]===void 0)return typeof S=="number"||typeof S=="boolean"?E[A]=S:E[A]=S.clone(),!0;{let C=E[A];if(typeof S=="number"||typeof S=="boolean"){if(C!==S)return E[A]=S,!0}else if(C.equals(S)===!1)return C.copy(S),!0}return!1}function g(v){let _=v.uniforms,b=0,E=16;for(let A=0,C=_.length;A<C;A++){let y=Array.isArray(_[A])?_[A]:[_[A]];for(let M=0,D=y.length;M<D;M++){let F=y[M],K=Array.isArray(F.value)?F.value:[F.value];for(let P=0,O=K.length;P<O;P++){let H=K[P],Z=x(H),J=b%E;J!==0&&E-J<Z.boundary&&(b+=E-J),F.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=b,b+=Z.storage}}}let S=b%E;return S>0&&(b+=E-S),v.__size=b,v.__cache={},this}function x(v){let _={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(_.boundary=4,_.storage=4):v.isVector2?(_.boundary=8,_.storage=8):v.isVector3||v.isColor?(_.boundary=16,_.storage=12):v.isVector4?(_.boundary=16,_.storage=16):v.isMatrix3?(_.boundary=48,_.storage=48):v.isMatrix4?(_.boundary=64,_.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),_}function p(v){let _=v.target;_.removeEventListener("dispose",p);let b=o.indexOf(_.__bindingPointIndex);o.splice(b,1),n.deleteBuffer(r[_.id]),delete r[_.id],delete s[_.id]}function m(){for(let v in r)n.deleteBuffer(r[v]);o=[],r={},s={}}return{bind:l,update:c,dispose:m}}var Qr=class{constructor(e={}){let{canvas:t=pp(),context:i=null,depth:r=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let f;i!==null?f=i.getContextAttributes().alpha:f=o;let d=new Uint32Array(4),g=new Int32Array(4),x=null,p=null,m=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=yt,this._useLegacyLights=!1,this.toneMapping=Rn,this.toneMappingExposure=1;let _=this,b=!1,E=0,S=0,A=null,C=-1,y=null,M=new vt,D=new vt,F=null,K=new Ze(0),P=0,O=t.width,H=t.height,Z=1,J=null,X=null,ie=new vt(0,0,O,H),j=new vt(0,0,O,H),he=!1,W=new jr,te=!1,Se=!1,Le=null,_e=new pt,Fe=new $,ze=new I,le={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function ge(){return A===null?Z:1}let L=i;function de(T,N){for(let k=0;k<T.length;k++){let G=T[k],B=t.getContext(G,N);if(B!==null)return B}return null}try{let T={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r160"),t.addEventListener("webglcontextlost",fe,!1),t.addEventListener("webglcontextrestored",U,!1),t.addEventListener("webglcontextcreationerror",ve,!1),L===null){let N=["webgl2","webgl","experimental-webgl"];if(_.isWebGL1Renderer===!0&&N.shift(),L=de(N,T),L===null)throw de(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&L instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),L.getShaderPrecisionFormat===void 0&&(L.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let Y,ue,q,Re,pe,R,w,z,ae,re,Q,Pe,ye,we,ke,Je,oe,it,et,Ye,Ne,Ee,Ge,rt;function xt(){Y=new wg(L),ue=new _g(L,Y,e),Y.init(ue),Ee=new n_(L,Y,ue),q=new e_(L,Y,ue),Re=new Ag(L),pe=new Hx,R=new t_(L,Y,q,pe,ue,Ee,Re),w=new vg(_),z=new Sg(_),ae=new Np(L,ue),Ge=new gg(L,Y,ae,ue),re=new Eg(L,ae,Re,Ge),Q=new Ig(L,re,ae,Re),et=new Pg(L,ue,R),Je=new yg(pe),Pe=new Gx(_,w,z,Y,ue,Ge,Je),ye=new r_(_,pe),we=new Wx,ke=new Jx(Y,ue),it=new mg(_,w,z,q,Q,f,l),oe=new Qx(_,Q,ue),rt=new s_(L,Re,ue,q),Ye=new xg(L,Y,Re,ue),Ne=new Tg(L,Y,Re,ue),Re.programs=Pe.programs,_.capabilities=ue,_.extensions=Y,_.properties=pe,_.renderLists=we,_.shadowMap=oe,_.state=q,_.info=Re}xt();let je=new yl(_,L);this.xr=je,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let T=Y.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=Y.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(T){T!==void 0&&(Z=T,this.setSize(O,H,!1))},this.getSize=function(T){return T.set(O,H)},this.setSize=function(T,N,k=!0){if(je.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}O=T,H=N,t.width=Math.floor(T*Z),t.height=Math.floor(N*Z),k===!0&&(t.style.width=T+"px",t.style.height=N+"px"),this.setViewport(0,0,T,N)},this.getDrawingBufferSize=function(T){return T.set(O*Z,H*Z).floor()},this.setDrawingBufferSize=function(T,N,k){O=T,H=N,Z=k,t.width=Math.floor(T*k),t.height=Math.floor(N*k),this.setViewport(0,0,T,N)},this.getCurrentViewport=function(T){return T.copy(M)},this.getViewport=function(T){return T.copy(ie)},this.setViewport=function(T,N,k,G){T.isVector4?ie.set(T.x,T.y,T.z,T.w):ie.set(T,N,k,G),q.viewport(M.copy(ie).multiplyScalar(Z).floor())},this.getScissor=function(T){return T.copy(j)},this.setScissor=function(T,N,k,G){T.isVector4?j.set(T.x,T.y,T.z,T.w):j.set(T,N,k,G),q.scissor(D.copy(j).multiplyScalar(Z).floor())},this.getScissorTest=function(){return he},this.setScissorTest=function(T){q.setScissorTest(he=T)},this.setOpaqueSort=function(T){J=T},this.setTransparentSort=function(T){X=T},this.getClearColor=function(T){return T.copy(it.getClearColor())},this.setClearColor=function(){it.setClearColor.apply(it,arguments)},this.getClearAlpha=function(){return it.getClearAlpha()},this.setClearAlpha=function(){it.setClearAlpha.apply(it,arguments)},this.clear=function(T=!0,N=!0,k=!0){let G=0;if(T){let B=!1;if(A!==null){let xe=A.texture.format;B=xe===sh||xe===rh||xe===ih}if(B){let xe=A.texture.type,Ce=xe===di||xe===ci||xe===Vl||xe===Di||xe===th||xe===nh,Ae=it.getClearColor(),Ue=it.getClearAlpha(),We=Ae.r,Ie=Ae.g,Xe=Ae.b;Ce?(d[0]=We,d[1]=Ie,d[2]=Xe,d[3]=Ue,L.clearBufferuiv(L.COLOR,0,d)):(g[0]=We,g[1]=Ie,g[2]=Xe,g[3]=Ue,L.clearBufferiv(L.COLOR,0,g))}else G|=L.COLOR_BUFFER_BIT}N&&(G|=L.DEPTH_BUFFER_BIT),k&&(G|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",fe,!1),t.removeEventListener("webglcontextrestored",U,!1),t.removeEventListener("webglcontextcreationerror",ve,!1),we.dispose(),ke.dispose(),pe.dispose(),w.dispose(),z.dispose(),Q.dispose(),Ge.dispose(),rt.dispose(),Pe.dispose(),je.dispose(),je.removeEventListener("sessionstart",Et),je.removeEventListener("sessionend",at),Le&&(Le.dispose(),Le=null),Tt.stop()};function fe(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),b=!0}function U(){console.log("THREE.WebGLRenderer: Context Restored."),b=!1;let T=Re.autoReset,N=oe.enabled,k=oe.autoUpdate,G=oe.needsUpdate,B=oe.type;xt(),Re.autoReset=T,oe.enabled=N,oe.autoUpdate=k,oe.needsUpdate=G,oe.type=B}function ve(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function be(T){let N=T.target;N.removeEventListener("dispose",be),Ve(N)}function Ve(T){Be(T),pe.remove(T)}function Be(T){let N=pe.get(T).programs;N!==void 0&&(N.forEach(function(k){Pe.releaseProgram(k)}),T.isShaderMaterial&&Pe.releaseShaderCache(T))}this.renderBufferDirect=function(T,N,k,G,B,xe){N===null&&(N=le);let Ce=B.isMesh&&B.matrixWorld.determinant()<0,Ae=Ke(T,N,k,G,B);q.setMaterial(G,Ce);let Ue=k.index,We=1;if(G.wireframe===!0){if(Ue=re.getWireframeAttribute(k),Ue===void 0)return;We=2}let Ie=k.drawRange,Xe=k.attributes.position,ct=Ie.start*We,kt=(Ie.start+Ie.count)*We;xe!==null&&(ct=Math.max(ct,xe.start*We),kt=Math.min(kt,(xe.start+xe.count)*We)),Ue!==null?(ct=Math.max(ct,0),kt=Math.min(kt,Ue.count)):Xe!=null&&(ct=Math.max(ct,0),kt=Math.min(kt,Xe.count));let Ft=kt-ct;if(Ft<0||Ft===1/0)return;Ge.setup(B,G,Ae,k,Ue);let Gn,St=Ye;if(Ue!==null&&(Gn=ae.get(Ue),St=Ne,St.setIndex(Gn)),B.isMesh)G.wireframe===!0?(q.setLineWidth(G.wireframeLinewidth*ge()),St.setMode(L.LINES)):St.setMode(L.TRIANGLES);else if(B.isLine){let tt=G.linewidth;tt===void 0&&(tt=1),q.setLineWidth(tt*ge()),B.isLineSegments?St.setMode(L.LINES):B.isLineLoop?St.setMode(L.LINE_LOOP):St.setMode(L.LINE_STRIP)}else B.isPoints?St.setMode(L.POINTS):B.isSprite&&St.setMode(L.TRIANGLES);if(B.isBatchedMesh)St.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else if(B.isInstancedMesh)St.renderInstances(ct,Ft,B.count);else if(k.isInstancedBufferGeometry){let tt=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,ca=Math.min(k.instanceCount,tt);St.renderInstances(ct,Ft,ca)}else St.render(ct,Ft)};function ut(T,N,k){T.transparent===!0&&T.side===pn&&T.forceSinglePass===!1?(T.side=Lt,T.needsUpdate=!0,ce(T,N,k),T.side=pi,T.needsUpdate=!0,ce(T,N,k),T.side=pn):ce(T,N,k)}this.compile=function(T,N,k=null){k===null&&(k=T),p=ke.get(k),p.init(),v.push(p),k.traverseVisible(function(B){B.isLight&&B.layers.test(N.layers)&&(p.pushLight(B),B.castShadow&&p.pushShadow(B))}),T!==k&&T.traverseVisible(function(B){B.isLight&&B.layers.test(N.layers)&&(p.pushLight(B),B.castShadow&&p.pushShadow(B))}),p.setupLights(_._useLegacyLights);let G=new Set;return T.traverse(function(B){let xe=B.material;if(xe)if(Array.isArray(xe))for(let Ce=0;Ce<xe.length;Ce++){let Ae=xe[Ce];ut(Ae,k,B),G.add(Ae)}else ut(xe,k,B),G.add(xe)}),v.pop(),p=null,G},this.compileAsync=function(T,N,k=null){let G=this.compile(T,N,k);return new Promise(B=>{function xe(){if(G.forEach(function(Ce){pe.get(Ce).currentProgram.isReady()&&G.delete(Ce)}),G.size===0){B(T);return}setTimeout(xe,10)}Y.get("KHR_parallel_shader_compile")!==null?xe():setTimeout(xe,10)})};let ht=null;function Mt(T){ht&&ht(T)}function Et(){Tt.stop()}function at(){Tt.start()}let Tt=new ph;Tt.setAnimationLoop(Mt),typeof self<"u"&&Tt.setContext(self),this.setAnimationLoop=function(T){ht=T,je.setAnimationLoop(T),T===null?Tt.stop():Tt.start()},je.addEventListener("sessionstart",Et),je.addEventListener("sessionend",at),this.render=function(T,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(b===!0)return;T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),je.enabled===!0&&je.isPresenting===!0&&(je.cameraAutoUpdate===!0&&je.updateCamera(N),N=je.getCamera()),T.isScene===!0&&T.onBeforeRender(_,T,N,A),p=ke.get(T,v.length),p.init(),v.push(p),_e.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),W.setFromProjectionMatrix(_e),Se=this.localClippingEnabled,te=Je.init(this.clippingPlanes,Se),x=we.get(T,m.length),x.init(),m.push(x),nn(T,N,0,_.sortObjects),x.finish(),_.sortObjects===!0&&x.sort(J,X),this.info.render.frame++,te===!0&&Je.beginShadows();let k=p.state.shadowsArray;if(oe.render(k,T,N),te===!0&&Je.endShadows(),this.info.autoReset===!0&&this.info.reset(),it.render(x,T),p.setupLights(_._useLegacyLights),N.isArrayCamera){let G=N.cameras;for(let B=0,xe=G.length;B<xe;B++){let Ce=G[B];Nr(x,T,Ce,Ce.viewport)}}else Nr(x,T,N);A!==null&&(R.updateMultisampleRenderTarget(A),R.updateRenderTargetMipmap(A)),T.isScene===!0&&T.onAfterRender(_,T,N),Ge.resetDefaultState(),C=-1,y=null,v.pop(),v.length>0?p=v[v.length-1]:p=null,m.pop(),m.length>0?x=m[m.length-1]:x=null};function nn(T,N,k,G){if(T.visible===!1)return;if(T.layers.test(N.layers)){if(T.isGroup)k=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(N);else if(T.isLight)p.pushLight(T),T.castShadow&&p.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||W.intersectsSprite(T)){G&&ze.setFromMatrixPosition(T.matrixWorld).applyMatrix4(_e);let Ce=Q.update(T),Ae=T.material;Ae.visible&&x.push(T,Ce,Ae,k,ze.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||W.intersectsObject(T))){let Ce=Q.update(T),Ae=T.material;if(G&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),ze.copy(T.boundingSphere.center)):(Ce.boundingSphere===null&&Ce.computeBoundingSphere(),ze.copy(Ce.boundingSphere.center)),ze.applyMatrix4(T.matrixWorld).applyMatrix4(_e)),Array.isArray(Ae)){let Ue=Ce.groups;for(let We=0,Ie=Ue.length;We<Ie;We++){let Xe=Ue[We],ct=Ae[Xe.materialIndex];ct&&ct.visible&&x.push(T,Ce,ct,k,ze.z,Xe)}}else Ae.visible&&x.push(T,Ce,Ae,k,ze.z,null)}}let xe=T.children;for(let Ce=0,Ae=xe.length;Ce<Ae;Ce++)nn(xe[Ce],N,k,G)}function Nr(T,N,k,G){let B=T.opaque,xe=T.transmissive,Ce=T.transparent;p.setupLightsView(k),te===!0&&Je.setGlobalState(_.clippingPlanes,k),xe.length>0&&Ss(B,xe,N,k),G&&q.viewport(M.copy(G)),B.length>0&&Mi(B,N,k),xe.length>0&&Mi(xe,N,k),Ce.length>0&&Mi(Ce,N,k),q.buffers.depth.setTest(!0),q.buffers.depth.setMask(!0),q.buffers.color.setMask(!0),q.setPolygonOffset(!1)}function Ss(T,N,k,G){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;let xe=ue.isWebGL2;Le===null&&(Le=new $t(1,1,{generateMipmaps:!0,type:Y.has("EXT_color_buffer_half_float")?Fi:di,minFilter:$r,samples:xe?4:0})),_.getDrawingBufferSize(Fe),xe?Le.setSize(Fe.x,Fe.y):Le.setSize(rl(Fe.x),rl(Fe.y));let Ce=_.getRenderTarget();_.setRenderTarget(Le),_.getClearColor(K),P=_.getClearAlpha(),P<1&&_.setClearColor(16777215,.5),_.clear();let Ae=_.toneMapping;_.toneMapping=Rn,Mi(T,k,G),R.updateMultisampleRenderTarget(Le),R.updateRenderTargetMipmap(Le);let Ue=!1;for(let We=0,Ie=N.length;We<Ie;We++){let Xe=N[We],ct=Xe.object,kt=Xe.geometry,Ft=Xe.material,Gn=Xe.group;if(Ft.side===pn&&ct.layers.test(G.layers)){let St=Ft.side;Ft.side=Lt,Ft.needsUpdate=!0,ee(ct,k,G,kt,Ft,Gn),Ft.side=St,Ft.needsUpdate=!0,Ue=!0}}Ue===!0&&(R.updateMultisampleRenderTarget(Le),R.updateRenderTargetMipmap(Le)),_.setRenderTarget(Ce),_.setClearColor(K,P),_.toneMapping=Ae}function Mi(T,N,k){let G=N.isScene===!0?N.overrideMaterial:null;for(let B=0,xe=T.length;B<xe;B++){let Ce=T[B],Ae=Ce.object,Ue=Ce.geometry,We=G===null?Ce.material:G,Ie=Ce.group;Ae.layers.test(k.layers)&&ee(Ae,N,k,Ue,We,Ie)}}function ee(T,N,k,G,B,xe){T.onBeforeRender(_,N,k,G,B,xe),T.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),B.onBeforeRender(_,N,k,G,T,xe),B.transparent===!0&&B.side===pn&&B.forceSinglePass===!1?(B.side=Lt,B.needsUpdate=!0,_.renderBufferDirect(k,N,G,B,T,xe),B.side=pi,B.needsUpdate=!0,_.renderBufferDirect(k,N,G,B,T,xe),B.side=pn):_.renderBufferDirect(k,N,G,B,T,xe),T.onAfterRender(_,N,k,G,B,xe)}function ce(T,N,k){N.isScene!==!0&&(N=le);let G=pe.get(T),B=p.state.lights,xe=p.state.shadowsArray,Ce=B.state.version,Ae=Pe.getParameters(T,B.state,xe,N,k),Ue=Pe.getProgramCacheKey(Ae),We=G.programs;G.environment=T.isMeshStandardMaterial?N.environment:null,G.fog=N.fog,G.envMap=(T.isMeshStandardMaterial?z:w).get(T.envMap||G.environment),We===void 0&&(T.addEventListener("dispose",be),We=new Map,G.programs=We);let Ie=We.get(Ue);if(Ie!==void 0){if(G.currentProgram===Ie&&G.lightsStateVersion===Ce)return Oe(T,Ae),Ie}else Ae.uniforms=Pe.getUniforms(T),T.onBuild(k,Ae,_),T.onBeforeCompile(Ae,_),Ie=Pe.acquireProgram(Ae,Ue),We.set(Ue,Ie),G.uniforms=Ae.uniforms;let Xe=G.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Xe.clippingPlanes=Je.uniform),Oe(T,Ae),G.needsLights=st(T),G.lightsStateVersion=Ce,G.needsLights&&(Xe.ambientLightColor.value=B.state.ambient,Xe.lightProbe.value=B.state.probe,Xe.directionalLights.value=B.state.directional,Xe.directionalLightShadows.value=B.state.directionalShadow,Xe.spotLights.value=B.state.spot,Xe.spotLightShadows.value=B.state.spotShadow,Xe.rectAreaLights.value=B.state.rectArea,Xe.ltc_1.value=B.state.rectAreaLTC1,Xe.ltc_2.value=B.state.rectAreaLTC2,Xe.pointLights.value=B.state.point,Xe.pointLightShadows.value=B.state.pointShadow,Xe.hemisphereLights.value=B.state.hemi,Xe.directionalShadowMap.value=B.state.directionalShadowMap,Xe.directionalShadowMatrix.value=B.state.directionalShadowMatrix,Xe.spotShadowMap.value=B.state.spotShadowMap,Xe.spotLightMatrix.value=B.state.spotLightMatrix,Xe.spotLightMap.value=B.state.spotLightMap,Xe.pointShadowMap.value=B.state.pointShadowMap,Xe.pointShadowMatrix.value=B.state.pointShadowMatrix),G.currentProgram=Ie,G.uniformsList=null,Ie}function Me(T){if(T.uniformsList===null){let N=T.currentProgram.getUniforms();T.uniformsList=xr.seqWithValue(N.seq,T.uniforms)}return T.uniformsList}function Oe(T,N){let k=pe.get(T);k.outputColorSpace=N.outputColorSpace,k.batching=N.batching,k.instancing=N.instancing,k.instancingColor=N.instancingColor,k.skinning=N.skinning,k.morphTargets=N.morphTargets,k.morphNormals=N.morphNormals,k.morphColors=N.morphColors,k.morphTargetsCount=N.morphTargetsCount,k.numClippingPlanes=N.numClippingPlanes,k.numIntersection=N.numClipIntersection,k.vertexAlphas=N.vertexAlphas,k.vertexTangents=N.vertexTangents,k.toneMapping=N.toneMapping}function Ke(T,N,k,G,B){N.isScene!==!0&&(N=le),R.resetTextureUnits();let xe=N.fog,Ce=G.isMeshStandardMaterial?N.environment:null,Ae=A===null?_.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:jn,Ue=(G.isMeshStandardMaterial?z:w).get(G.envMap||Ce),We=G.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Ie=!!k.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Xe=!!k.morphAttributes.position,ct=!!k.morphAttributes.normal,kt=!!k.morphAttributes.color,Ft=Rn;G.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Ft=_.toneMapping);let Gn=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,St=Gn!==void 0?Gn.length:0,tt=pe.get(G),ca=p.state.lights;if(te===!0&&(Se===!0||T!==y)){let hn=T===y&&G.id===C;Je.setState(G,T,hn)}let At=!1;G.version===tt.__version?(tt.needsLights&&tt.lightsStateVersion!==ca.state.version||tt.outputColorSpace!==Ae||B.isBatchedMesh&&tt.batching===!1||!B.isBatchedMesh&&tt.batching===!0||B.isInstancedMesh&&tt.instancing===!1||!B.isInstancedMesh&&tt.instancing===!0||B.isSkinnedMesh&&tt.skinning===!1||!B.isSkinnedMesh&&tt.skinning===!0||B.isInstancedMesh&&tt.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&tt.instancingColor===!1&&B.instanceColor!==null||tt.envMap!==Ue||G.fog===!0&&tt.fog!==xe||tt.numClippingPlanes!==void 0&&(tt.numClippingPlanes!==Je.numPlanes||tt.numIntersection!==Je.numIntersection)||tt.vertexAlphas!==We||tt.vertexTangents!==Ie||tt.morphTargets!==Xe||tt.morphNormals!==ct||tt.morphColors!==kt||tt.toneMapping!==Ft||ue.isWebGL2===!0&&tt.morphTargetsCount!==St)&&(At=!0):(At=!0,tt.__version=G.version);let Si=tt.currentProgram;At===!0&&(Si=ce(G,N,B));let yc=!1,Or=!1,ua=!1,Ht=Si.getUniforms(),wi=tt.uniforms;if(q.useProgram(Si.program)&&(yc=!0,Or=!0,ua=!0),G.id!==C&&(C=G.id,Or=!0),yc||y!==T){Ht.setValue(L,"projectionMatrix",T.projectionMatrix),Ht.setValue(L,"viewMatrix",T.matrixWorldInverse);let hn=Ht.map.cameraPosition;hn!==void 0&&hn.setValue(L,ze.setFromMatrixPosition(T.matrixWorld)),ue.logarithmicDepthBuffer&&Ht.setValue(L,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&Ht.setValue(L,"isOrthographic",T.isOrthographicCamera===!0),y!==T&&(y=T,Or=!0,ua=!0)}if(B.isSkinnedMesh){Ht.setOptional(L,B,"bindMatrix"),Ht.setOptional(L,B,"bindMatrixInverse");let hn=B.skeleton;hn&&(ue.floatVertexTextures?(hn.boneTexture===null&&hn.computeBoneTexture(),Ht.setValue(L,"boneTexture",hn.boneTexture,R)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}B.isBatchedMesh&&(Ht.setOptional(L,B,"batchingTexture"),Ht.setValue(L,"batchingTexture",B._matricesTexture,R));let ha=k.morphAttributes;if((ha.position!==void 0||ha.normal!==void 0||ha.color!==void 0&&ue.isWebGL2===!0)&&et.update(B,k,Si),(Or||tt.receiveShadow!==B.receiveShadow)&&(tt.receiveShadow=B.receiveShadow,Ht.setValue(L,"receiveShadow",B.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(wi.envMap.value=Ue,wi.flipEnvMap.value=Ue.isCubeTexture&&Ue.isRenderTargetTexture===!1?-1:1),Or&&(Ht.setValue(L,"toneMappingExposure",_.toneMappingExposure),tt.needsLights&&mt(wi,ua),xe&&G.fog===!0&&ye.refreshFogUniforms(wi,xe),ye.refreshMaterialUniforms(wi,G,Z,H,Le),xr.upload(L,Me(tt),wi,R)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(xr.upload(L,Me(tt),wi,R),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&Ht.setValue(L,"center",B.center),Ht.setValue(L,"modelViewMatrix",B.modelViewMatrix),Ht.setValue(L,"normalMatrix",B.normalMatrix),Ht.setValue(L,"modelMatrix",B.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){let hn=G.uniformsGroups;for(let da=0,gf=hn.length;da<gf;da++)if(ue.isWebGL2){let vc=hn[da];rt.update(vc,Si),rt.bind(vc,Si)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Si}function mt(T,N){T.ambientLightColor.needsUpdate=N,T.lightProbe.needsUpdate=N,T.directionalLights.needsUpdate=N,T.directionalLightShadows.needsUpdate=N,T.pointLights.needsUpdate=N,T.pointLightShadows.needsUpdate=N,T.spotLights.needsUpdate=N,T.spotLightShadows.needsUpdate=N,T.rectAreaLights.needsUpdate=N,T.hemisphereLights.needsUpdate=N}function st(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(T,N,k){pe.get(T.texture).__webglTexture=N,pe.get(T.depthTexture).__webglTexture=k;let G=pe.get(T);G.__hasExternalTextures=!0,G.__hasExternalTextures&&(G.__autoAllocateDepthBuffer=k===void 0,G.__autoAllocateDepthBuffer||Y.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(T,N){let k=pe.get(T);k.__webglFramebuffer=N,k.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(T,N=0,k=0){A=T,E=N,S=k;let G=!0,B=null,xe=!1,Ce=!1;if(T){let Ue=pe.get(T);Ue.__useDefaultFramebuffer!==void 0?(q.bindFramebuffer(L.FRAMEBUFFER,null),G=!1):Ue.__webglFramebuffer===void 0?R.setupRenderTarget(T):Ue.__hasExternalTextures&&R.rebindTextures(T,pe.get(T.texture).__webglTexture,pe.get(T.depthTexture).__webglTexture);let We=T.texture;(We.isData3DTexture||We.isDataArrayTexture||We.isCompressedArrayTexture)&&(Ce=!0);let Ie=pe.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Ie[N])?B=Ie[N][k]:B=Ie[N],xe=!0):ue.isWebGL2&&T.samples>0&&R.useMultisampledRTT(T)===!1?B=pe.get(T).__webglMultisampledFramebuffer:Array.isArray(Ie)?B=Ie[k]:B=Ie,M.copy(T.viewport),D.copy(T.scissor),F=T.scissorTest}else M.copy(ie).multiplyScalar(Z).floor(),D.copy(j).multiplyScalar(Z).floor(),F=he;if(q.bindFramebuffer(L.FRAMEBUFFER,B)&&ue.drawBuffers&&G&&q.drawBuffers(T,B),q.viewport(M),q.scissor(D),q.setScissorTest(F),xe){let Ue=pe.get(T.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+N,Ue.__webglTexture,k)}else if(Ce){let Ue=pe.get(T.texture),We=N||0;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ue.__webglTexture,k||0,We)}C=-1},this.readRenderTargetPixels=function(T,N,k,G,B,xe,Ce){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ae=pe.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ce!==void 0&&(Ae=Ae[Ce]),Ae){q.bindFramebuffer(L.FRAMEBUFFER,Ae);try{let Ue=T.texture,We=Ue.format,Ie=Ue.type;if(We!==An&&Ee.convert(We)!==L.getParameter(L.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let Xe=Ie===Fi&&(Y.has("EXT_color_buffer_half_float")||ue.isWebGL2&&Y.has("EXT_color_buffer_float"));if(Ie!==di&&Ee.convert(Ie)!==L.getParameter(L.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ie===ui&&(ue.isWebGL2||Y.has("OES_texture_float")||Y.has("WEBGL_color_buffer_float")))&&!Xe){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=T.width-G&&k>=0&&k<=T.height-B&&L.readPixels(N,k,G,B,Ee.convert(We),Ee.convert(Ie),xe)}finally{let Ue=A!==null?pe.get(A).__webglFramebuffer:null;q.bindFramebuffer(L.FRAMEBUFFER,Ue)}}},this.copyFramebufferToTexture=function(T,N,k=0){let G=Math.pow(2,-k),B=Math.floor(N.image.width*G),xe=Math.floor(N.image.height*G);R.setTexture2D(N,0),L.copyTexSubImage2D(L.TEXTURE_2D,k,0,0,T.x,T.y,B,xe),q.unbindTexture()},this.copyTextureToTexture=function(T,N,k,G=0){let B=N.image.width,xe=N.image.height,Ce=Ee.convert(k.format),Ae=Ee.convert(k.type);R.setTexture2D(k,0),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,k.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,k.unpackAlignment),N.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,G,T.x,T.y,B,xe,Ce,Ae,N.image.data):N.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,G,T.x,T.y,N.mipmaps[0].width,N.mipmaps[0].height,Ce,N.mipmaps[0].data):L.texSubImage2D(L.TEXTURE_2D,G,T.x,T.y,Ce,Ae,N.image),G===0&&k.generateMipmaps&&L.generateMipmap(L.TEXTURE_2D),q.unbindTexture()},this.copyTextureToTexture3D=function(T,N,k,G,B=0){if(_.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let xe=T.max.x-T.min.x+1,Ce=T.max.y-T.min.y+1,Ae=T.max.z-T.min.z+1,Ue=Ee.convert(G.format),We=Ee.convert(G.type),Ie;if(G.isData3DTexture)R.setTexture3D(G,0),Ie=L.TEXTURE_3D;else if(G.isDataArrayTexture||G.isCompressedArrayTexture)R.setTexture2DArray(G,0),Ie=L.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,G.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,G.unpackAlignment);let Xe=L.getParameter(L.UNPACK_ROW_LENGTH),ct=L.getParameter(L.UNPACK_IMAGE_HEIGHT),kt=L.getParameter(L.UNPACK_SKIP_PIXELS),Ft=L.getParameter(L.UNPACK_SKIP_ROWS),Gn=L.getParameter(L.UNPACK_SKIP_IMAGES),St=k.isCompressedTexture?k.mipmaps[B]:k.image;L.pixelStorei(L.UNPACK_ROW_LENGTH,St.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,St.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,T.min.x),L.pixelStorei(L.UNPACK_SKIP_ROWS,T.min.y),L.pixelStorei(L.UNPACK_SKIP_IMAGES,T.min.z),k.isDataTexture||k.isData3DTexture?L.texSubImage3D(Ie,B,N.x,N.y,N.z,xe,Ce,Ae,Ue,We,St.data):k.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),L.compressedTexSubImage3D(Ie,B,N.x,N.y,N.z,xe,Ce,Ae,Ue,St.data)):L.texSubImage3D(Ie,B,N.x,N.y,N.z,xe,Ce,Ae,Ue,We,St),L.pixelStorei(L.UNPACK_ROW_LENGTH,Xe),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ct),L.pixelStorei(L.UNPACK_SKIP_PIXELS,kt),L.pixelStorei(L.UNPACK_SKIP_ROWS,Ft),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Gn),B===0&&G.generateMipmaps&&L.generateMipmap(Ie),q.unbindTexture()},this.initTexture=function(T){T.isCubeTexture?R.setTextureCube(T,0):T.isData3DTexture?R.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?R.setTexture2DArray(T,0):R.setTexture2D(T,0),q.unbindTexture()},this.resetState=function(){E=0,S=0,A=null,q.reset(),Ge.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Jn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===Xl?"display-p3":"srgb",t.unpackColorSpace=dt.workingColorSpace===No?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===yt?Ni:ah}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===Ni?yt:jn}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}},vl=class extends Qr{};vl.prototype.isWebGL1Renderer=!0;var Pn=class extends qt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}},yo=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=tl,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=$n()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=$n()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=$n()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Kt=new I,es=class n{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Kt.fromBufferAttribute(this,t),Kt.applyMatrix4(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Kt.fromBufferAttribute(this,t),Kt.applyNormalMatrix(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Kt.fromBufferAttribute(this,t),Kt.transformDirection(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Zn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Zn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Zn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Zn(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array),r=ft(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array),r=ft(r,this.array),s=ft(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Xt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new n(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},ts=class extends Qn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ze(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ar,Gr=new I,lr=new I,cr=new I,ur=new $,Hr=new $,vh=new pt,qs=new I,Vr=new I,Ys=new I,Gu=new $,Wa=new $,Hu=new $,vo=class extends qt{constructor(e=new ts){if(super(),this.isSprite=!0,this.type="Sprite",ar===void 0){ar=new Rt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new yo(t,5);ar.setIndex([0,1,2,0,2,3]),ar.setAttribute("position",new es(i,3,0,!1)),ar.setAttribute("uv",new es(i,2,3,!1))}this.geometry=ar,this.material=e,this.center=new $(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),lr.setFromMatrixScale(this.matrixWorld),vh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),cr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&lr.multiplyScalar(-cr.z);let i=this.material.rotation,r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));let o=this.center;Ks(qs.set(-.5,-.5,0),cr,o,lr,r,s),Ks(Vr.set(.5,-.5,0),cr,o,lr,r,s),Ks(Ys.set(.5,.5,0),cr,o,lr,r,s),Gu.set(0,0),Wa.set(1,0),Hu.set(1,1);let a=e.ray.intersectTriangle(qs,Vr,Ys,!1,Gr);if(a===null&&(Ks(Vr.set(-.5,.5,0),cr,o,lr,r,s),Wa.set(0,1),a=e.ray.intersectTriangle(qs,Ys,Vr,!1,Gr),a===null))return;let l=e.ray.origin.distanceTo(Gr);l<e.near||l>e.far||t.push({distance:l,point:Gr.clone(),uv:Li.getInterpolation(Gr,qs,Vr,Ys,Gu,Wa,Hu,new $),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Ks(n,e,t,i,r,s){ur.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(Hr.x=s*ur.x-r*ur.y,Hr.y=r*ur.x+s*ur.y):Hr.copy(ur),n.copy(e),n.x+=Hr.x,n.y+=Hr.y,n.applyMatrix4(vh)}var ns=class extends Xt{constructor(e,t,i,r=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},hr=new pt,Vu=new pt,Zs=[],Wu=new Cn,o_=new pt,Wr=new se,Xr=new zi,bo=class extends se{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ns(new Float32Array(i*16),16),this.instanceColor=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,o_)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Cn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,hr),Wu.copy(e.boundingBox).applyMatrix4(hr),this.boundingBox.union(Wu)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new zi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,hr),Xr.copy(e.boundingSphere).applyMatrix4(hr),this.boundingSphere.union(Xr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){let i=this.matrixWorld,r=this.count;if(Wr.geometry=this.geometry,Wr.material=this.material,Wr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Xr.copy(this.boundingSphere),Xr.applyMatrix4(i),e.ray.intersectsSphere(Xr)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,hr),Vu.multiplyMatrices(i,hr),Wr.matrixWorld=Vu,Wr.raycast(e,Zs);for(let o=0,a=Zs.length;o<a;o++){let l=Zs[o];l.instanceId=s,l.object=this,t.push(l)}Zs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new ns(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}};var xi=class extends gn{constructor(e,t,i,r,s,o,a,l,c){super(e,t,i,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},_n=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),t.push(s),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let i=this.getLengths(),r=0,s=i.length,o;t?o=t:o=e*i[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=i[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,i[r]===o)return r/(s-1);let u=i[r],f=i[r+1]-u,d=(o-u)/f;return(r+d)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new $:new I);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){let i=new I,r=[],s=[],o=[],a=new I,l=new pt;for(let d=0;d<=e;d++){let g=d/e;r[d]=this.getTangentAt(g,new I)}s[0]=new I,o[0]=new I;let c=Number.MAX_VALUE,u=Math.abs(r[0].x),h=Math.abs(r[0].y),f=Math.abs(r[0].z);u<=c&&(c=u,i.set(1,0,0)),h<=c&&(c=h,i.set(0,1,0)),f<=c&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let d=1;d<=e;d++){if(s[d]=s[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(r[d-1],r[d]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(Bt(r[d-1].dot(r[d]),-1,1));s[d].applyMatrix4(l.makeRotationAxis(a,g))}o[d].crossVectors(r[d],s[d])}if(t===!0){let d=Math.acos(Bt(s[0].dot(s[e]),-1,1));d/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(d=-d);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],d*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},is=class extends _n{constructor(e=0,t=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){let i=t||new $,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*u-d*h+this.aX,c=f*h+d*u+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},bl=class extends is{constructor(e,t,i,r,s,o){super(e,t,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Yl(){let n=0,e=0,t=0,i=0;function r(s,o,a,l){n=s,e=a,t=-3*s+3*o-2*a-l,i=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,h){let f=(o-s)/c-(a-s)/(c+u)+(a-o)/u,d=(a-o)/u-(l-o)/(u+h)+(l-a)/h;f*=u,d*=u,r(o,a,f,d)},calc:function(s){let o=s*s,a=o*s;return n+e*s+t*o+i*a}}}var Js=new I,Xa=new Yl,qa=new Yl,Ya=new Yl,rs=class extends _n{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new I){let i=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(Js.subVectors(r[0],r[1]).add(r[0]),c=Js);let h=r[a%s],f=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(Js.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=Js),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(h),d),x=Math.pow(h.distanceToSquared(f),d),p=Math.pow(f.distanceToSquared(u),d);x<1e-4&&(x=1),g<1e-4&&(g=x),p<1e-4&&(p=x),Xa.initNonuniformCatmullRom(c.x,h.x,f.x,u.x,g,x,p),qa.initNonuniformCatmullRom(c.y,h.y,f.y,u.y,g,x,p),Ya.initNonuniformCatmullRom(c.z,h.z,f.z,u.z,g,x,p)}else this.curveType==="catmullrom"&&(Xa.initCatmullRom(c.x,h.x,f.x,u.x,this.tension),qa.initCatmullRom(c.y,h.y,f.y,u.y,this.tension),Ya.initCatmullRom(c.z,h.z,f.z,u.z,this.tension));return i.set(Xa.calc(l),qa.calc(l),Ya.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new I().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Xu(n,e,t,i,r){let s=(i-e)*.5,o=(r-t)*.5,a=n*n,l=n*a;return(2*t-2*i+s+o)*l+(-3*t+3*i-2*s-o)*a+s*n+t}function a_(n,e){let t=1-n;return t*t*e}function l_(n,e){return 2*(1-n)*n*e}function c_(n,e){return n*n*e}function Zr(n,e,t,i){return a_(n,e)+l_(n,t)+c_(n,i)}function u_(n,e){let t=1-n;return t*t*t*e}function h_(n,e){let t=1-n;return 3*t*t*n*e}function d_(n,e){return 3*(1-n)*n*n*e}function f_(n,e){return n*n*n*e}function Jr(n,e,t,i,r){return u_(n,e)+h_(n,t)+d_(n,i)+f_(n,r)}var Mo=class extends _n{constructor(e=new $,t=new $,i=new $,r=new $){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new $){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(Jr(e,r.x,s.x,o.x,a.x),Jr(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ml=class extends _n{constructor(e=new I,t=new I,i=new I,r=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new I){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(Jr(e,r.x,s.x,o.x,a.x),Jr(e,r.y,s.y,o.y,a.y),Jr(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},So=class extends _n{constructor(e=new $,t=new $){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new $){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new $){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Sl=class extends _n{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},wo=class extends _n{constructor(e=new $,t=new $,i=new $){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new $){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(Zr(e,r.x,s.x,o.x),Zr(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Eo=class extends _n{constructor(e=new I,t=new I,i=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new I){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(Zr(e,r.x,s.x,o.x),Zr(e,r.y,s.y,o.y),Zr(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},To=class extends _n{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new $){let i=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return i.set(Xu(a,l.x,c.x,u.x,h.x),Xu(a,l.y,c.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new $().fromArray(r))}return this}},Ao=Object.freeze({__proto__:null,ArcCurve:bl,CatmullRomCurve3:rs,CubicBezierCurve:Mo,CubicBezierCurve3:Ml,EllipseCurve:is,LineCurve:So,LineCurve3:Sl,QuadraticBezierCurve:wo,QuadraticBezierCurve3:Eo,SplineCurve:To}),wl=class extends _n{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ao[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=i){let o=r[s]-i,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(new Ao[r.type]().fromJSON(r))}return this}},wr=class extends wl{constructor(e){super(),this.type="Path",this.currentPoint=new $,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new So(this.currentPoint.clone(),new $(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){let s=new wo(this.currentPoint.clone(),new $(e,t),new $(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,s,o){let a=new Mo(this.currentPoint.clone(),new $(e,t),new $(i,r),new $(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new To(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,r,s,o),this}absarc(e,t,i,r,s,o){return this.absellipse(e,t,i,i,r,s,o),this}ellipse(e,t,i,r,s,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,i,r,s,o,a,l),this}absellipse(e,t,i,r,s,o,a,l){let c=new is(e,t,i,r,s,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Er=class n extends Rt{constructor(e=[new $(0,-.5),new $(.5,0),new $(0,.5)],t=12,i=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:r},t=Math.floor(t),r=Bt(r,0,Math.PI*2);let s=[],o=[],a=[],l=[],c=[],u=1/t,h=new I,f=new $,d=new I,g=new I,x=new I,p=0,m=0;for(let v=0;v<=e.length-1;v++)switch(v){case 0:p=e[v+1].x-e[v].x,m=e[v+1].y-e[v].y,d.x=m*1,d.y=-p,d.z=m*0,x.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case e.length-1:l.push(x.x,x.y,x.z);break;default:p=e[v+1].x-e[v].x,m=e[v+1].y-e[v].y,d.x=m*1,d.y=-p,d.z=m*0,g.copy(d),d.x+=x.x,d.y+=x.y,d.z+=x.z,d.normalize(),l.push(d.x,d.y,d.z),x.copy(g)}for(let v=0;v<=t;v++){let _=i+v*u*r,b=Math.sin(_),E=Math.cos(_);for(let S=0;S<=e.length-1;S++){h.x=e[S].x*b,h.y=e[S].y,h.z=e[S].x*E,o.push(h.x,h.y,h.z),f.x=v/t,f.y=S/(e.length-1),a.push(f.x,f.y);let A=l[3*S+0]*b,C=l[3*S+1],y=l[3*S+0]*E;c.push(A,C,y)}}for(let v=0;v<t;v++)for(let _=0;_<e.length-1;_++){let b=_+v*e.length,E=b,S=b+e.length,A=b+e.length+1,C=b+1;s.push(E,S,C),s.push(A,C,S)}this.setIndex(s),this.setAttribute("position",new $e(o,3)),this.setAttribute("uv",new $e(a,2)),this.setAttribute("normal",new $e(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.points,e.segments,e.phiStart,e.phiLength)}};var Ro=class n extends Rt{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],c=new I,u=new $;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,f=3;h<=t;h++,f+=3){let d=i+h/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[f]/e+1)/2,u.y=(o[f+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new $e(o,3)),this.setAttribute("normal",new $e(a,3)),this.setAttribute("uv",new $e(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}},yn=class n extends Rt{constructor(e=1,t=1,i=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let u=[],h=[],f=[],d=[],g=0,x=[],p=i/2,m=0;v(),o===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(u),this.setAttribute("position",new $e(h,3)),this.setAttribute("normal",new $e(f,3)),this.setAttribute("uv",new $e(d,2));function v(){let b=new I,E=new I,S=0,A=(t-e)/i;for(let C=0;C<=s;C++){let y=[],M=C/s,D=M*(t-e)+e;for(let F=0;F<=r;F++){let K=F/r,P=K*l+a,O=Math.sin(P),H=Math.cos(P);E.x=D*O,E.y=-M*i+p,E.z=D*H,h.push(E.x,E.y,E.z),b.set(O,A,H).normalize(),f.push(b.x,b.y,b.z),d.push(K,1-M),y.push(g++)}x.push(y)}for(let C=0;C<r;C++)for(let y=0;y<s;y++){let M=x[y][C],D=x[y+1][C],F=x[y+1][C+1],K=x[y][C+1];u.push(M,D,K),u.push(D,F,K),S+=6}c.addGroup(m,S,0),m+=S}function _(b){let E=g,S=new $,A=new I,C=0,y=b===!0?e:t,M=b===!0?1:-1;for(let F=1;F<=r;F++)h.push(0,p*M,0),f.push(0,M,0),d.push(.5,.5),g++;let D=g;for(let F=0;F<=r;F++){let P=F/r*l+a,O=Math.cos(P),H=Math.sin(P);A.x=y*H,A.y=p*M,A.z=y*O,h.push(A.x,A.y,A.z),f.push(0,M,0),S.x=O*.5+.5,S.y=H*.5*M+.5,d.push(S.x,S.y),g++}for(let F=0;F<r;F++){let K=E+F,P=D+F;b===!0?u.push(P,P+1,K):u.push(P+1,P,K),C+=3}c.addGroup(m,C,b===!0?1:2),m+=C}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Yt=class n extends yn{constructor(e=1,t=1,i=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,i,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},El=class n extends Rt{constructor(e=[],t=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:r};let s=[],o=[];a(r),c(i),u(),this.setAttribute("position",new $e(s,3)),this.setAttribute("normal",new $e(s.slice(),3)),this.setAttribute("uv",new $e(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(v){let _=new I,b=new I,E=new I;for(let S=0;S<t.length;S+=3)d(t[S+0],_),d(t[S+1],b),d(t[S+2],E),l(_,b,E,v)}function l(v,_,b,E){let S=E+1,A=[];for(let C=0;C<=S;C++){A[C]=[];let y=v.clone().lerp(b,C/S),M=_.clone().lerp(b,C/S),D=S-C;for(let F=0;F<=D;F++)F===0&&C===S?A[C][F]=y:A[C][F]=y.clone().lerp(M,F/D)}for(let C=0;C<S;C++)for(let y=0;y<2*(S-C)-1;y++){let M=Math.floor(y/2);y%2===0?(f(A[C][M+1]),f(A[C+1][M]),f(A[C][M])):(f(A[C][M+1]),f(A[C+1][M+1]),f(A[C+1][M]))}}function c(v){let _=new I;for(let b=0;b<s.length;b+=3)_.x=s[b+0],_.y=s[b+1],_.z=s[b+2],_.normalize().multiplyScalar(v),s[b+0]=_.x,s[b+1]=_.y,s[b+2]=_.z}function u(){let v=new I;for(let _=0;_<s.length;_+=3){v.x=s[_+0],v.y=s[_+1],v.z=s[_+2];let b=p(v)/2/Math.PI+.5,E=m(v)/Math.PI+.5;o.push(b,1-E)}g(),h()}function h(){for(let v=0;v<o.length;v+=6){let _=o[v+0],b=o[v+2],E=o[v+4],S=Math.max(_,b,E),A=Math.min(_,b,E);S>.9&&A<.1&&(_<.2&&(o[v+0]+=1),b<.2&&(o[v+2]+=1),E<.2&&(o[v+4]+=1))}}function f(v){s.push(v.x,v.y,v.z)}function d(v,_){let b=v*3;_.x=e[b+0],_.y=e[b+1],_.z=e[b+2]}function g(){let v=new I,_=new I,b=new I,E=new I,S=new $,A=new $,C=new $;for(let y=0,M=0;y<s.length;y+=9,M+=6){v.set(s[y+0],s[y+1],s[y+2]),_.set(s[y+3],s[y+4],s[y+5]),b.set(s[y+6],s[y+7],s[y+8]),S.set(o[M+0],o[M+1]),A.set(o[M+2],o[M+3]),C.set(o[M+4],o[M+5]),E.copy(v).add(_).add(b).divideScalar(3);let D=p(E);x(S,M+0,v,D),x(A,M+2,_,D),x(C,M+4,b,D)}}function x(v,_,b,E){E<0&&v.x===1&&(o[_]=v.x-1),b.x===0&&b.z===0&&(o[_]=E/2/Math.PI+.5)}function p(v){return Math.atan2(v.z,-v.x)}function m(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.details)}};var an=class extends wr{constructor(e){super(e),this.uuid=$n(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(new wr().fromJSON(r))}return this}},p_={triangulate:function(n,e,t=2){let i=e&&e.length,r=i?e[0]*t:n.length,s=bh(n,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c,u,h,f,d;if(i&&(s=y_(n,e,s,t)),n.length>80*t){a=c=n[0],l=u=n[1];for(let g=t;g<r;g+=t)h=n[g],f=n[g+1],h<a&&(a=h),f<l&&(l=f),h>c&&(c=h),f>u&&(u=f);d=Math.max(c-a,u-l),d=d!==0?32767/d:0}return ss(s,o,t,a,l,d,0),o}};function bh(n,e,t,i,r){let s,o;if(r===P_(n,e,t,i)>0)for(s=e;s<t;s+=i)o=qu(s,n[s],n[s+1],o);else for(s=t-i;s>=e;s-=i)o=qu(s,n[s],n[s+1],o);return o&&Fo(o,o.next)&&(as(o),o=o.next),o}function ki(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(Fo(t,t.next)||wt(t.prev,t,t.next)===0)){if(as(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function ss(n,e,t,i,r,s,o){if(!n)return;!o&&s&&w_(n,i,r,s);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,s?g_(n,i,r,s):m_(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),as(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=x_(ki(n),e,t),ss(n,e,t,i,r,s,2)):o===2&&__(n,e,t,i,r,s):ss(ki(n),e,t,i,r,s,1);break}}}function m_(n){let e=n.prev,t=n,i=n.next;if(wt(e,t,i)>=0)return!1;let r=e.x,s=t.x,o=i.x,a=e.y,l=t.y,c=i.y,u=r<s?r<o?r:o:s<o?s:o,h=a<l?a<c?a:c:l<c?l:c,f=r>s?r>o?r:o:s>o?s:o,d=a>l?a>c?a:c:l>c?l:c,g=i.next;for(;g!==e;){if(g.x>=u&&g.x<=f&&g.y>=h&&g.y<=d&&pr(r,a,s,l,o,c,g.x,g.y)&&wt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function g_(n,e,t,i){let r=n.prev,s=n,o=n.next;if(wt(r,s,o)>=0)return!1;let a=r.x,l=s.x,c=o.x,u=r.y,h=s.y,f=o.y,d=a<l?a<c?a:c:l<c?l:c,g=u<h?u<f?u:f:h<f?h:f,x=a>l?a>c?a:c:l>c?l:c,p=u>h?u>f?u:f:h>f?h:f,m=Tl(d,g,e,t,i),v=Tl(x,p,e,t,i),_=n.prevZ,b=n.nextZ;for(;_&&_.z>=m&&b&&b.z<=v;){if(_.x>=d&&_.x<=x&&_.y>=g&&_.y<=p&&_!==r&&_!==o&&pr(a,u,l,h,c,f,_.x,_.y)&&wt(_.prev,_,_.next)>=0||(_=_.prevZ,b.x>=d&&b.x<=x&&b.y>=g&&b.y<=p&&b!==r&&b!==o&&pr(a,u,l,h,c,f,b.x,b.y)&&wt(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;_&&_.z>=m;){if(_.x>=d&&_.x<=x&&_.y>=g&&_.y<=p&&_!==r&&_!==o&&pr(a,u,l,h,c,f,_.x,_.y)&&wt(_.prev,_,_.next)>=0)return!1;_=_.prevZ}for(;b&&b.z<=v;){if(b.x>=d&&b.x<=x&&b.y>=g&&b.y<=p&&b!==r&&b!==o&&pr(a,u,l,h,c,f,b.x,b.y)&&wt(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function x_(n,e,t){let i=n;do{let r=i.prev,s=i.next.next;!Fo(r,s)&&Mh(r,i,i.next,s)&&os(r,s)&&os(s,r)&&(e.push(r.i/t|0),e.push(i.i/t|0),e.push(s.i/t|0),as(i),as(i.next),i=n=s),i=i.next}while(i!==n);return ki(i)}function __(n,e,t,i,r,s){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&A_(o,a)){let l=Sh(o,a);o=ki(o,o.next),l=ki(l,l.next),ss(o,e,t,i,r,s,0),ss(l,e,t,i,r,s,0);return}a=a.next}o=o.next}while(o!==n)}function y_(n,e,t,i){let r=[],s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*i,l=s<o-1?e[s+1]*i:n.length,c=bh(n,a,l,i,!1),c===c.next&&(c.steiner=!0),r.push(T_(c));for(r.sort(v_),s=0;s<r.length;s++)t=b_(r[s],t);return t}function v_(n,e){return n.x-e.x}function b_(n,e){let t=M_(n,e);if(!t)return e;let i=Sh(t,n);return ki(i,i.next),ki(t,t.next)}function M_(n,e){let t=e,i=-1/0,r,s=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let f=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=s&&f>i&&(i=f,r=t.x<t.next.x?t:t.next,f===s))return r}t=t.next}while(t!==e);if(!r)return null;let a=r,l=r.x,c=r.y,u=1/0,h;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&pr(o<c?s:i,o,l,c,o<c?i:s,o,t.x,t.y)&&(h=Math.abs(o-t.y)/(s-t.x),os(t,n)&&(h<u||h===u&&(t.x>r.x||t.x===r.x&&S_(r,t)))&&(r=t,u=h)),t=t.next;while(t!==a);return r}function S_(n,e){return wt(n.prev,n,e.prev)<0&&wt(e.next,n,n.next)<0}function w_(n,e,t,i){let r=n;do r.z===0&&(r.z=Tl(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,E_(r)}function E_(n){let e,t,i,r,s,o,a,l,c=1;do{for(t=n,n=null,s=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(r=t,t=t.nextZ,a--):(r=i,i=i.nextZ,l--),s?s.nextZ=r:n=r,r.prevZ=s,s=r;t=i}s.nextZ=null,c*=2}while(o>1);return n}function Tl(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function T_(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function pr(n,e,t,i,r,s,o,a){return(r-o)*(e-a)>=(n-o)*(s-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(i-a)}function A_(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!R_(n,e)&&(os(n,e)&&os(e,n)&&C_(n,e)&&(wt(n.prev,n,e.prev)||wt(n,e.prev,e))||Fo(n,e)&&wt(n.prev,n,n.next)>0&&wt(e.prev,e,e.next)>0)}function wt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function Fo(n,e){return n.x===e.x&&n.y===e.y}function Mh(n,e,t,i){let r=js(wt(n,e,t)),s=js(wt(n,e,i)),o=js(wt(t,i,n)),a=js(wt(t,i,e));return!!(r!==s&&o!==a||r===0&&$s(n,t,e)||s===0&&$s(n,i,e)||o===0&&$s(t,n,i)||a===0&&$s(t,e,i))}function $s(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function js(n){return n>0?1:n<0?-1:0}function R_(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Mh(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function os(n,e){return wt(n.prev,n,n.next)<0?wt(n,e,n.next)>=0&&wt(n,n.prev,e)>=0:wt(n,e,n.prev)<0||wt(n,n.next,e)<0}function C_(n,e){let t=n,i=!1,r=(n.x+e.x)/2,s=(n.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function Sh(n,e){let t=new Al(n.i,n.x,n.y),i=new Al(e.i,e.x,e.y),r=n.next,s=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function qu(n,e,t,i){let r=new Al(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function as(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Al(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function P_(n,e,t,i){let r=0;for(let s=e,o=t-i;s<t;s+=i)r+=(n[o]-n[s])*(n[s+1]+n[o+1]),o=s;return r}var fi=class n{static area(e){let t=e.length,i=0;for(let r=t-1,s=0;s<t;r=s++)i+=e[r].x*e[s].y-e[s].x*e[r].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],r=[],s=[];Yu(e),Ku(i,e);let o=e.length;t.forEach(Yu);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,Ku(i,t[l]);let a=p_.triangulate(i,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function Yu(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function Ku(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var Bi=class n extends Rt{constructor(e=new an([new $(.5,.5),new $(-.5,.5),new $(-.5,-.5),new $(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new $e(r,3)),this.setAttribute("uv",new $e(s,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:d-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,p=t.bevelSegments!==void 0?t.bevelSegments:3,m=t.extrudePath,v=t.UVGenerator!==void 0?t.UVGenerator:I_,_,b=!1,E,S,A,C;m&&(_=m.getSpacedPoints(u),b=!0,f=!1,E=m.computeFrenetFrames(u,!1),S=new I,A=new I,C=new I),f||(p=0,d=0,g=0,x=0);let y=a.extractPoints(c),M=y.shape,D=y.holes;if(!fi.isClockWise(M)){M=M.reverse();for(let L=0,de=D.length;L<de;L++){let Y=D[L];fi.isClockWise(Y)&&(D[L]=Y.reverse())}}let K=fi.triangulateShape(M,D),P=M;for(let L=0,de=D.length;L<de;L++){let Y=D[L];M=M.concat(Y)}function O(L,de,Y){return de||console.error("THREE.ExtrudeGeometry: vec does not exist"),L.clone().addScaledVector(de,Y)}let H=M.length,Z=K.length;function J(L,de,Y){let ue,q,Re,pe=L.x-de.x,R=L.y-de.y,w=Y.x-L.x,z=Y.y-L.y,ae=pe*pe+R*R,re=pe*z-R*w;if(Math.abs(re)>Number.EPSILON){let Q=Math.sqrt(ae),Pe=Math.sqrt(w*w+z*z),ye=de.x-R/Q,we=de.y+pe/Q,ke=Y.x-z/Pe,Je=Y.y+w/Pe,oe=((ke-ye)*z-(Je-we)*w)/(pe*z-R*w);ue=ye+pe*oe-L.x,q=we+R*oe-L.y;let it=ue*ue+q*q;if(it<=2)return new $(ue,q);Re=Math.sqrt(it/2)}else{let Q=!1;pe>Number.EPSILON?w>Number.EPSILON&&(Q=!0):pe<-Number.EPSILON?w<-Number.EPSILON&&(Q=!0):Math.sign(R)===Math.sign(z)&&(Q=!0),Q?(ue=-R,q=pe,Re=Math.sqrt(ae)):(ue=pe,q=R,Re=Math.sqrt(ae/2))}return new $(ue/Re,q/Re)}let X=[];for(let L=0,de=P.length,Y=de-1,ue=L+1;L<de;L++,Y++,ue++)Y===de&&(Y=0),ue===de&&(ue=0),X[L]=J(P[L],P[Y],P[ue]);let ie=[],j,he=X.concat();for(let L=0,de=D.length;L<de;L++){let Y=D[L];j=[];for(let ue=0,q=Y.length,Re=q-1,pe=ue+1;ue<q;ue++,Re++,pe++)Re===q&&(Re=0),pe===q&&(pe=0),j[ue]=J(Y[ue],Y[Re],Y[pe]);ie.push(j),he=he.concat(j)}for(let L=0;L<p;L++){let de=L/p,Y=d*Math.cos(de*Math.PI/2),ue=g*Math.sin(de*Math.PI/2)+x;for(let q=0,Re=P.length;q<Re;q++){let pe=O(P[q],X[q],ue);_e(pe.x,pe.y,-Y)}for(let q=0,Re=D.length;q<Re;q++){let pe=D[q];j=ie[q];for(let R=0,w=pe.length;R<w;R++){let z=O(pe[R],j[R],ue);_e(z.x,z.y,-Y)}}}let W=g+x;for(let L=0;L<H;L++){let de=f?O(M[L],he[L],W):M[L];b?(A.copy(E.normals[0]).multiplyScalar(de.x),S.copy(E.binormals[0]).multiplyScalar(de.y),C.copy(_[0]).add(A).add(S),_e(C.x,C.y,C.z)):_e(de.x,de.y,0)}for(let L=1;L<=u;L++)for(let de=0;de<H;de++){let Y=f?O(M[de],he[de],W):M[de];b?(A.copy(E.normals[L]).multiplyScalar(Y.x),S.copy(E.binormals[L]).multiplyScalar(Y.y),C.copy(_[L]).add(A).add(S),_e(C.x,C.y,C.z)):_e(Y.x,Y.y,h/u*L)}for(let L=p-1;L>=0;L--){let de=L/p,Y=d*Math.cos(de*Math.PI/2),ue=g*Math.sin(de*Math.PI/2)+x;for(let q=0,Re=P.length;q<Re;q++){let pe=O(P[q],X[q],ue);_e(pe.x,pe.y,h+Y)}for(let q=0,Re=D.length;q<Re;q++){let pe=D[q];j=ie[q];for(let R=0,w=pe.length;R<w;R++){let z=O(pe[R],j[R],ue);b?_e(z.x,z.y+_[u-1].y,_[u-1].x+Y):_e(z.x,z.y,h+Y)}}}te(),Se();function te(){let L=r.length/3;if(f){let de=0,Y=H*de;for(let ue=0;ue<Z;ue++){let q=K[ue];Fe(q[2]+Y,q[1]+Y,q[0]+Y)}de=u+p*2,Y=H*de;for(let ue=0;ue<Z;ue++){let q=K[ue];Fe(q[0]+Y,q[1]+Y,q[2]+Y)}}else{for(let de=0;de<Z;de++){let Y=K[de];Fe(Y[2],Y[1],Y[0])}for(let de=0;de<Z;de++){let Y=K[de];Fe(Y[0]+H*u,Y[1]+H*u,Y[2]+H*u)}}i.addGroup(L,r.length/3-L,0)}function Se(){let L=r.length/3,de=0;Le(P,de),de+=P.length;for(let Y=0,ue=D.length;Y<ue;Y++){let q=D[Y];Le(q,de),de+=q.length}i.addGroup(L,r.length/3-L,1)}function Le(L,de){let Y=L.length;for(;--Y>=0;){let ue=Y,q=Y-1;q<0&&(q=L.length-1);for(let Re=0,pe=u+p*2;Re<pe;Re++){let R=H*Re,w=H*(Re+1),z=de+ue+R,ae=de+q+R,re=de+q+w,Q=de+ue+w;ze(z,ae,re,Q)}}}function _e(L,de,Y){l.push(L),l.push(de),l.push(Y)}function Fe(L,de,Y){le(L),le(de),le(Y);let ue=r.length/3,q=v.generateTopUV(i,r,ue-3,ue-2,ue-1);ge(q[0]),ge(q[1]),ge(q[2])}function ze(L,de,Y,ue){le(L),le(de),le(ue),le(de),le(Y),le(ue);let q=r.length/3,Re=v.generateSideWallUV(i,r,q-6,q-3,q-2,q-1);ge(Re[0]),ge(Re[1]),ge(Re[3]),ge(Re[1]),ge(Re[2]),ge(Re[3])}function le(L){r.push(l[L*3+0]),r.push(l[L*3+1]),r.push(l[L*3+2])}function ge(L){s.push(L.x),s.push(L.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return L_(t,i,e)}static fromJSON(e,t){let i=[];for(let s=0,o=e.shapes.length;s<o;s++){let a=t[e.shapes[s]];i.push(a)}let r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new Ao[r.type]().fromJSON(r)),new n(i,e.options)}},I_={generateTopUV:function(n,e,t,i,r){let s=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],c=e[r*3],u=e[r*3+1];return[new $(s,o),new $(a,l),new $(c,u)]},generateSideWallUV:function(n,e,t,i,r,s){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[i*3],u=e[i*3+1],h=e[i*3+2],f=e[r*3],d=e[r*3+1],g=e[r*3+2],x=e[s*3],p=e[s*3+1],m=e[s*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new $(o,1-l),new $(c,1-h),new $(f,1-g),new $(x,1-m)]:[new $(a,1-l),new $(u,1-h),new $(d,1-g),new $(p,1-m)]}};function L_(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,r=n.length;i<r;i++){let s=n[i];t.shapes.push(s.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Tr=class n extends El{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,r=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var _i=class n extends Rt{constructor(e=.5,t=1,i=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:o},i=Math.max(3,i),r=Math.max(1,r);let a=[],l=[],c=[],u=[],h=e,f=(t-e)/r,d=new I,g=new $;for(let x=0;x<=r;x++){for(let p=0;p<=i;p++){let m=s+p/i*o;d.x=h*Math.cos(m),d.y=h*Math.sin(m),l.push(d.x,d.y,d.z),c.push(0,0,1),g.x=(d.x/t+1)/2,g.y=(d.y/t+1)/2,u.push(g.x,g.y)}h+=f}for(let x=0;x<r;x++){let p=x*(i+1);for(let m=0;m<i;m++){let v=m+p,_=v,b=v+i+1,E=v+i+2,S=v+1;a.push(_,b,S),a.push(b,E,S)}}this.setIndex(a),this.setAttribute("position",new $e(l,3)),this.setAttribute("normal",new $e(c,3)),this.setAttribute("uv",new $e(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Ar=class n extends Rt{constructor(e=new an([new $(0,.5),new $(-.5,-.5),new $(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new $e(r,3)),this.setAttribute("normal",new $e(s,3)),this.setAttribute("uv",new $e(o,2));function c(u){let h=r.length/3,f=u.extractPoints(t),d=f.shape,g=f.holes;fi.isClockWise(d)===!1&&(d=d.reverse());for(let p=0,m=g.length;p<m;p++){let v=g[p];fi.isClockWise(v)===!0&&(g[p]=v.reverse())}let x=fi.triangulateShape(d,g);for(let p=0,m=g.length;p<m;p++){let v=g[p];d=d.concat(v)}for(let p=0,m=d.length;p<m;p++){let v=d[p];r.push(v.x,v.y,0),s.push(0,0,1),o.push(v.x,v.y)}for(let p=0,m=x.length;p<m;p++){let v=x[p],_=v[0]+h,b=v[1]+h,E=v[2]+h;i.push(_,b,E),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return D_(t,e)}static fromJSON(e,t){let i=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];i.push(o)}return new n(i,e.curveSegments)}};function D_(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let r=n[t];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e}var In=class n extends Rt{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new I,f=new I,d=[],g=[],x=[],p=[];for(let m=0;m<=i;m++){let v=[],_=m/i,b=0;m===0&&o===0?b=.5/t:m===i&&l===Math.PI&&(b=-.5/t);for(let E=0;E<=t;E++){let S=E/t;h.x=-e*Math.cos(r+S*s)*Math.sin(o+_*a),h.y=e*Math.cos(o+_*a),h.z=e*Math.sin(r+S*s)*Math.sin(o+_*a),g.push(h.x,h.y,h.z),f.copy(h).normalize(),x.push(f.x,f.y,f.z),p.push(S+b,1-_),v.push(c++)}u.push(v)}for(let m=0;m<i;m++)for(let v=0;v<t;v++){let _=u[m][v+1],b=u[m][v],E=u[m+1][v],S=u[m+1][v+1];(m!==0||o>0)&&d.push(_,b,S),(m!==i-1||l<Math.PI)&&d.push(b,E,S)}this.setIndex(d),this.setAttribute("position",new $e(g,3)),this.setAttribute("normal",new $e(x,3)),this.setAttribute("uv",new $e(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var vn=class n extends Rt{constructor(e=1,t=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);let o=[],a=[],l=[],c=[],u=new I,h=new I,f=new I;for(let d=0;d<=i;d++)for(let g=0;g<=r;g++){let x=g/r*s,p=d/i*Math.PI*2;h.x=(e+t*Math.cos(p))*Math.cos(x),h.y=(e+t*Math.cos(p))*Math.sin(x),h.z=t*Math.sin(p),a.push(h.x,h.y,h.z),u.x=e*Math.cos(x),u.y=e*Math.sin(x),f.subVectors(h,u).normalize(),l.push(f.x,f.y,f.z),c.push(g/r),c.push(d/i)}for(let d=1;d<=i;d++)for(let g=1;g<=r;g++){let x=(r+1)*d+g-1,p=(r+1)*(d-1)+g-1,m=(r+1)*(d-1)+g,v=(r+1)*d+g;o.push(x,p,v),o.push(p,m,v)}this.setIndex(o),this.setAttribute("position",new $e(a,3)),this.setAttribute("normal",new $e(l,3)),this.setAttribute("uv",new $e(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var Co=class n extends Rt{constructor(e=new Eo(new I(-1,-1,0),new I(-1,1,0),new I(1,1,0)),t=64,i=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:r,closed:s};let o=e.computeFrenetFrames(t,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new I,l=new I,c=new $,u=new I,h=[],f=[],d=[],g=[];x(),this.setIndex(g),this.setAttribute("position",new $e(h,3)),this.setAttribute("normal",new $e(f,3)),this.setAttribute("uv",new $e(d,2));function x(){for(let _=0;_<t;_++)p(_);p(s===!1?t:0),v(),m()}function p(_){u=e.getPointAt(_/t,u);let b=o.normals[_],E=o.binormals[_];for(let S=0;S<=r;S++){let A=S/r*Math.PI*2,C=Math.sin(A),y=-Math.cos(A);l.x=y*b.x+C*E.x,l.y=y*b.y+C*E.y,l.z=y*b.z+C*E.z,l.normalize(),f.push(l.x,l.y,l.z),a.x=u.x+i*l.x,a.y=u.y+i*l.y,a.z=u.z+i*l.z,h.push(a.x,a.y,a.z)}}function m(){for(let _=1;_<=t;_++)for(let b=1;b<=r;b++){let E=(r+1)*(_-1)+(b-1),S=(r+1)*_+(b-1),A=(r+1)*_+b,C=(r+1)*(_-1)+b;g.push(E,S,C),g.push(S,A,C)}}function v(){for(let _=0;_<=t;_++)for(let b=0;b<=r;b++)c.x=_/t,c.y=b/r,d.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new n(new Ao[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var Ln=class extends Qn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ze(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wl,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Po=class extends Qn{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Ze(16777215),this.specular=new Ze(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wl,this.normalScale=new $(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Hl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function Qs(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function U_(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var Rr=class{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,r=t[i],s=t[i-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=t[--i-1],e>=s)break e}o=i,i=0;break t}break n}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Rl=class extends Rr{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:jc,endingEnd:jc}}intervalChanged_(e,t,i){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case Qc:s=e,a=2*t-i;break;case eu:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Qc:o=e,l=2*i-t;break;case eu:o=1,l=i+r[1]-r[0];break;default:o=e-1,l=t}let c=(i-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,d=this._weightNext,g=(i-t)/(r-t),x=g*g,p=x*g,m=-f*p+2*f*x-f*g,v=(1+f)*p+(-1.5-2*f)*x+(-.5+f)*g+1,_=(-1-d)*p+(1.5+d)*x+.5*g,b=d*p-d*x;for(let E=0;E!==a;++E)s[E]=m*o[u+E]+v*o[c+E]+_*o[l+E]+b*o[h+E];return s}},Cl=class extends Rr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(i-t)/(r-t),h=1-u;for(let f=0;f!==a;++f)s[f]=o[c+f]*h+o[l+f]*u;return s}},Pl=class extends Rr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Dn=class{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Qs(t,this.TimeBufferType),this.values=Qs(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Qs(e.times,Array),values:Qs(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Pl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Cl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Rl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case to:t=this.InterpolantFactoryMethodDiscrete;break;case no:t=this.InterpolantFactoryMethodLinear;break;case ya:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return to;case this.InterpolantFactoryMethodLinear:return no;case this.InterpolantFactoryMethodSmooth:return ya}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e}return this}trim(e,t){let i=this.times,r=i.length,s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&U_(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===ya,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{let h=a*i,f=h-i,d=h+i;for(let g=0;g!==i;++g){let x=t[h+g];if(x!==t[f+g]||x!==t[d+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*i,f=o*i;for(let d=0;d!==i;++d)t[f+d]=t[h+d]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Dn.prototype.TimeBufferType=Float32Array;Dn.prototype.ValueBufferType=Float32Array;Dn.prototype.DefaultInterpolation=no;var Gi=class extends Dn{};Gi.prototype.ValueTypeName="bool";Gi.prototype.ValueBufferType=Array;Gi.prototype.DefaultInterpolation=to;Gi.prototype.InterpolantFactoryMethodLinear=void 0;Gi.prototype.InterpolantFactoryMethodSmooth=void 0;var Il=class extends Dn{};Il.prototype.ValueTypeName="color";var Ll=class extends Dn{};Ll.prototype.ValueTypeName="number";var Dl=class extends Rr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(r-t),c=e*a;for(let u=c+a;c!==u;c+=4)gi.slerpFlat(s,0,o,c-a,o,c,l);return s}},ls=class extends Dn{InterpolantFactoryMethodLinear(e){return new Dl(this.times,this.values,this.getValueSize(),e)}};ls.prototype.ValueTypeName="quaternion";ls.prototype.DefaultInterpolation=no;ls.prototype.InterpolantFactoryMethodSmooth=void 0;var Hi=class extends Dn{};Hi.prototype.ValueTypeName="string";Hi.prototype.ValueBufferType=Array;Hi.prototype.DefaultInterpolation=to;Hi.prototype.InterpolantFactoryMethodLinear=void 0;Hi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ul=class extends Dn{};Ul.prototype.ValueTypeName="vector";var Nl=class{constructor(e,t,i){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=c.length;h<f;h+=2){let d=c[h],g=c[h+1];if(d.global&&(d.lastIndex=0),d.test(u))return g}return null}}},N_=new Nl,Ol=class{constructor(e){this.manager=e!==void 0?e:N_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};Ol.DEFAULT_MATERIAL_NAME="__DEFAULT";var Cr=class extends qt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ze(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}},Pr=class extends Cr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(qt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ze(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Ka=new pt,Zu=new I,Ju=new I,Io=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new $(512,512),this.map=null,this.mapPass=null,this.matrix=new pt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new jr,this._frameExtents=new $(1,1),this._viewportCount=1,this._viewports=[new vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;Zu.setFromMatrixPosition(e.matrixWorld),t.position.copy(Zu),Ju.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ju),t.updateMatrixWorld(),Ka.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ka),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Ka)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var $u=new pt,qr=new I,Za=new I,Fl=class extends Io{constructor(){super(new tn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new $(4,2),this._viewportCount=6,this._viewports=[new vt(2,1,1,1),new vt(0,1,1,1),new vt(3,1,1,1),new vt(1,1,1,1),new vt(3,0,1,1),new vt(1,0,1,1)],this._cubeDirections=[new I(1,0,0),new I(-1,0,0),new I(0,0,1),new I(0,0,-1),new I(0,1,0),new I(0,-1,0)],this._cubeUps=[new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,0,1),new I(0,0,-1)]}updateMatrices(e,t=0){let i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),qr.setFromMatrixPosition(e.matrixWorld),i.position.copy(qr),Za.copy(i.position),Za.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(Za),i.updateMatrixWorld(),r.makeTranslation(-qr.x,-qr.y,-qr.z),$u.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix($u)}},bn=class extends Cr{constructor(e,t,i=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new Fl}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},zl=class extends Io{constructor(){super(new Fn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ei=class extends Cr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(qt.DEFAULT_UP),this.updateMatrix(),this.target=new qt,this.shadow=new zl}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Lo=class extends Cr{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var Kl="\\[\\]\\.:\\/",O_=new RegExp("["+Kl+"]","g"),Zl="[^"+Kl+"]",F_="[^"+Kl.replace("\\.","")+"]",z_=/((?:WC+[\/:])*)/.source.replace("WC",Zl),k_=/(WCOD+)?/.source.replace("WCOD",F_),B_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Zl),G_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Zl),H_=new RegExp("^"+z_+k_+B_+G_+"$"),V_=["material","materials","bones","map"],kl=class{constructor(e,t,i){let r=i||_t.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},_t=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(O_,"")}static parseTrackName(e){let t=H_.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);V_.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};_t.Composite=kl;_t.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};_t.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};_t.prototype.GetterByBindingType=[_t.prototype._getValue_direct,_t.prototype._getValue_array,_t.prototype._getValue_arrayElement,_t.prototype._getValue_toArray];_t.prototype.SetterByBindingTypeAndVersioning=[[_t.prototype._setValue_direct,_t.prototype._setValue_direct_setNeedsUpdate,_t.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_array,_t.prototype._setValue_array_setNeedsUpdate,_t.prototype._setValue_array_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_arrayElement,_t.prototype._setValue_arrayElement_setNeedsUpdate,_t.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_fromArray,_t.prototype._setValue_fromArray_setNeedsUpdate,_t.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Zv=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");var Lr=["up","down","left","right"];var Jl={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},ot=(n,e,t,i={},r,s=e)=>({char:n,minotaur:e,block:t,hazard:s,...i,sprites:r??[]}),ln={floor:ot(".",!0,!0,{},["floor"]),wall:ot("#",!1,!1,{},["wall"]),exit:ot("E",!1,!1,{},["exit"]),gate:ot("|",!1,!1,{},["gate-closed","gate-open"]),water:ot("~",!1,!0,{needs:"flippers"},["water"]),fire:ot("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:ot("=",!0,!0,{slides:"skates"},["ice"]),"force-up":ot("^",!0,!0,{carries:"up"},["force-up"]),"force-down":ot("v",!0,!0,{carries:"down"},["force-down"]),"force-left":ot("<",!0,!0,{carries:"left"},["force-left"]),"force-right":ot(">",!0,!0,{carries:"right"},["force-right"]),dirt:ot("%",!0,!0,{},["dirt"]),safe:ot("S",!1,!1,{},["safe"]),button:ot("_",!0,!0,{},["button"]),"toggle-open":ot("t",!0,!1,{},["toggle-open"]),"toggle-closed":ot("T",!1,!1,{},["toggle-closed"]),"door-red":ot("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":ot("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":ot("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":ot("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:ot("&",!0,!0,{},["trap"]),"button-brown":ot("-",!0,!0,{},["button-brown"]),"button-red":ot("+",!0,!0,{},["button-red"]),popup:ot(";",!1,!1,{},["popup"]),gravel:ot(":",!1,!1,{},["gravel"]),"fake-wall":ot("W",!1,!1,{},["wall"]),"invisible-wall":ot("I",!1,!1,{},["floor"]),teleport:ot("@",!1,!1,{},["teleport"]),thief:ot("$",!0,!0,{},["thief"]),bomb:ot("!",!1,!0,{},["bomb"],!0),clone:ot("C",!1,!1,{},Lr.map(n=>`clone-${n}`))},Un={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var Nn={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:Jl.mirror.name},cake:{char:"x",sprite:"cake",name:Jl.cake.name},cow:{char:"c",sprite:"cow",name:Jl.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},W_=["theseus","minotaur","minotaur-stone","cow-standing"],X_=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],$v=[...new Set([...Object.values(ln).flatMap(n=>n.sprites),...X_,...Object.values(Nn).map(n=>n.sprite),...W_,...Object.values(Un).map(n=>n.sprite)])];var $l=4,q_=900,Y_=500,K_=.22,wh=[[.3,420],[.36,160],[.3,200],[.36,160],[.3,380],[-.12,520],[0,400]],Z_=wh.reduce((n,[,e])=>n+e,0),J_=[[-1,0],[1,0],[0,-1],[0,1]],cs=(n,e,t)=>e<0||t<0||e>=n.level.rows||t>=n.level.cols||n.terrain[e*n.level.cols+t]==="wall";function jl(n,e,t){return(cs(n,e-1,t)||cs(n,e+1,t))&&!(cs(n,e,t-1)&&cs(n,e,t+1))?"h":"v"}function zo(n,e){return n.terrain[e]!=="floor"?null:ln[n.level.terrain[e]].door??null}function Eh(n,e,t){for(let i of J_){let r=e+i[0],s=t+i[1];if(!cs(n,r,s)&&n.terrain[r*n.level.cols+s]==="gate")return i}return null}function ko(n,e,t=0){let i=Math.round(e.r),r=Math.round(e.c),s=Eh(n,i,r);if(!s)return e;let o=Math.max(0,1-2*Math.max(Math.abs(e.r-i),Math.abs(e.c-r))),a=-K_*o+t;return{r:e.r+s[0]*a,c:e.c+s[1]*a}}var us={bars:new Map,doors:new Map,hoof:0,busy:!1},Th=n=>n*n*(3-2*n);function $_(n){let e=0,t=0;for(let[i,r]of wh){if(n<e+r)return t+(i-t)*Th((n-e)/r);e+=r,t=i}return 0}function Ah(){let n=null,e=!1,t=new Map,i={move:null},r=new Map,s=!1,o=null,a=(c,u)=>{let h=Math.min(1,Math.max(0,(u-c.t0)/c.ms));return c.from+(c.to-c.from)*Th(h)},l=(c,u,h,f)=>{let d=c?a(c,h):1-u;return{from:d,to:u,t0:h,ms:f*Math.abs(u-d)}};return{at(c,u,h,f,d){let{cols:g}=c.level,x=[];c.level.terrain.forEach((C,y)=>{ln[C].door&&x.push(y)});let p=C=>{let y=Math.floor(C/g),M=C%g;return Math.abs(u.player.r-y)+Math.abs(u.player.c-M)<.999},m=new Map(x.map(C=>[C,c.terrain[C]==="floor"||p(C)])),v=c.relicsLeft===0;if(c.level!==n)n=c.level,i.move=null,r.clear(),s=!1,o=null;else if(!f){v!==e&&(i.move=l(i.move,v?1:0,h,q_));for(let[C,y]of m)t.get(C)!==y&&r.set(C,l(r.get(C),y?1:0,h,Y_))}e=v,t=m,f&&(i.move=null,r.clear());let _=!1,b=new Map;if(i.move)if(h-i.move.t0>=i.move.ms)i.move=null;else{let C=a(i.move,h);c.terrain.forEach((y,M)=>{y==="gate"&&b.set(M,C)}),_=!0}let E=new Map;for(let[C,y]of r)h-y.t0>=y.ms?r.delete(C):(E.set(C,a(y,h)),_=!0);c.moves===0&&(s=!1),o&&o.s!==c&&(o=null);let S=c.minotaur;!s&&!f&&d&&v&&c.outcome==="playing"&&S&&c.stone===0&&Eh(c,S.r,S.c)&&(s=!0,o={s:c,t0:h});let A=0;return o&&(h-o.t0>=Z_?o=null:(A=$_(h-o.t0),_=!0)),_?{bars:b,doors:E,hoof:A,busy:_}:us}}}function Bo(n){return Math.max(10,Math.min(90,n))}function Ch(n,e){let t=n*Math.PI/180;return Math.max(40,e/2*Math.cos(t)/Math.max(.05,Math.sin(t))+4)}var hs=n=>Math.sin(n*Math.PI/180);function Ph(n,e,t,i){let r=i?1:1-Math.exp(-t*11),s=!1;for(let o of["yaw","pitch","tx","tz","zoom"]){let a=e[o]-n[o];a!==0&&(n[o]=Math.abs(a)>(o==="yaw"||o==="pitch"?.02:.002)&&!i?n[o]+a*r:e[o],n[o]!==e[o]&&(s=!0))}return s}var Rh=(n,e)=>Math.max(-Math.max(0,e),Math.min(Math.max(0,e),n));function Go(n,e,t,i){let r=n.yaw*Math.PI/180,s=Math.cos(r),o=Math.sin(r),a=n.tx*s-n.tz*o,l=-n.tx*o-n.tz*s,c=(e*Math.abs(s)+t*Math.abs(o))/2,u=(e*Math.abs(o)+t*Math.abs(s))/2,h=Rh(a,c+1-n.zoom*i/2),f=Rh(l,u+1-n.zoom/2/hs(n.pitch));return{...n,tx:h*s-f*o,tz:-h*o-f*s}}function Ih(n,e,t,i){let r=n.yaw*Math.PI/180,s=Math.cos(r),o=-Math.sin(r),a=-Math.sin(r),l=-Math.cos(r),c=e*i,u=t*i/hs(n.pitch);return{...n,tx:n.tx-s*c+a*u,tz:n.tz-o*c+l*u}}function Lh(n,e){return n+360*Math.round((e-n)/360)}var Ql=5,cn=1.25,Dh=n=>2*cn*Math.cos(n*Math.PI/180);function Uh(n,e,t,i,r){let s=r*Math.PI/180,o=Math.abs(Math.cos(s)),a=Math.abs(Math.sin(s)),l=e,c=t,u=l*o+c*a,h=(l*a+c*o)*hs(i);return Math.max(Ql,h+Dh(i),u/n)}function Nh(n,e,t,i){let r=Math.hypot(e+2,t+2);return{min:Ql,max:Math.max(Ql,r*hs(i)+Dh(i),r/n)}}var Ho=(n,e)=>Math.max(e.min,Math.min(e.max,n));function Vi(n,e,t){let i=n.yaw*Math.PI/180,r=t/hs(n.pitch);return{x:n.tx+Math.cos(i)*e-Math.sin(i)*r,z:n.tz-Math.sin(i)*e-Math.cos(i)*r}}function Oh(n,e,t,i,r){let s=Ho(n.zoom*e,r),o=n.zoom-s,a=Vi(n,t*o,i*o);return{...n,zoom:s,tx:a.x,tz:a.z}}function Fh(n,e){let t=n.zoom/2,i=t*e;return{corners:[Vi(n,-i,t),Vi(n,i,t),Vi(n,i,-t),Vi(n,-i,-t)],tick:[Vi(n,0,0),Vi(n,0,t*.4)]}}function zh(n,e,t,i){let r=n<520?8:11,s=Math.min(Math.floor(n*.5/t),Math.floor(e*.4/i));return Math.max(2,Math.min(r,s))}function kh(n,e,t,i,r){return[(n.x+e/2)*i,r+(n.z+t/2)*i]}function Bh(n,e,t,i,r,s){return{x:n/r-t/2,z:(e-s)/r-i/2}}var Gh={items:"plate",beacon:!1,cutaway:!1,caps:!1},Hh="crete-variant";function j_(n){let e={...Gh};if(!n)return e;let t;try{t=JSON.parse(n)}catch{return e}if(!t||typeof t!="object")return e;let i=t;(i.items==="cyan"||i.items==="white"||i.items==="plate")&&(e.items=i.items);for(let r of["beacon","cutaway","caps"])typeof i[r]=="boolean"&&(e[r]=i[r]);return e}var Vh=Gh;function un(){return Vh}function Wh(n){Vh=j_(n)}var ey=12,ty=.6,ny=.4,iy=.4;function qh(){let n=null,e={down(t,i,r){return n?[]:(n={id:t,x0:i,y0:r,x:i,y:r,dragging:!1},[])},move(t,i,r){if(!n||n.id!==t)return[];if(!n.dragging){if(Math.hypot(i-n.x0,r-n.y0)<ey)return[];n.dragging=!0}let s=i-n.x,o=r-n.y;n.x=i,n.y=r;let a=[];return s!==0&&a.push({kind:"turn",deg:-s*ty}),o!==0&&a.push({kind:"tilt",deg:o*ny}),a},up(t,i,r){if(!n||n.id!==t)return[];let s=e.move(t,i,r),o=n.dragging;return n=null,o?s:[{kind:"reset"}]},cancel(t){return n?.id===t&&(n=null),[]}};return e}function Yh(n){let e=Bo(n.pitch);return{needle:n.yaw,squash:Math.max(iy,Math.sin(e*Math.PI/180)),tilt:(90-e)/80}}var ec=n=>Math.max(-30,Math.min(30,n));function Kh(n){let e=new Map,t=null,i=null,r=!1,s=()=>{let[o,a]=[...e.values()];return!o||!a?{ang:0,d:0,mx:0,my:0}:{ang:Math.atan2(a.y-o.y,a.x-o.x),d:Math.hypot(a.x-o.x,a.y-o.y),mx:(o.x+a.x)/2,my:(o.y+a.y)/2}};return{down(o){let a=n();for(let[l,c]of e)(l===o.id||a-c.seen>1e3)&&e.delete(l);return e.size===0&&(r=!1),e.set(o.id,{x:o.x,y:o.y,x0:o.x,y0:o.y,t0:a,seen:a,button:o.type==="mouse"?o.button:0}),t=e.size===2?s():null,e.size>1&&(r=!0),[]},move(o){let a=e.get(o.id);if(!a)return[];let l=o.x-a.x,c=o.y-a.y;a.x=o.x,a.y=o.y,a.seen=n();let u=[];if(e.size===1){if(r)return u;a.button===1||a.button===2?(l!==0||c!==0)&&u.push({kind:"pan",dx:l,dy:c}):(l!==0&&u.push({kind:"turn",deg:ec(-l*.35)}),c!==0&&u.push({kind:"tilt",deg:ec(c*.3)}))}else if(e.size===2&&t){let h=s(),f=h.ang-t.ang;f>Math.PI&&(f-=2*Math.PI),f<-Math.PI&&(f+=2*Math.PI),f!==0&&u.push({kind:"turn",deg:ec(f*180/Math.PI)});let d=h.mx-t.mx,g=h.my-t.my;(d!==0||g!==0)&&u.push({kind:"pan",dx:d,dy:g});let x=Math.max(10,t.d)/Math.max(10,h.d);x!==1&&u.push({kind:"zoom",factor:x,x:h.mx,y:h.my}),t=h}return u},up(o){let a=e.get(o.id);if(!a)return[];e.delete(o.id),t=e.size===2?s():null;let l=r;if(e.size===0&&(r=!1),o.type==="mouse"||e.size!==0||l)return[];let c=n();return c-a.t0>=280||Math.hypot(o.x-a.x0,o.y-a.y0)>=12?[]:i&&c-i.t<320&&Math.hypot(o.x-i.x,o.y-i.y)<40?(i=null,[{kind:"reset"}]):(i={t:c,x:o.x,y:o.y},[])},cancel(o){return e.delete(o),t=e.size===2?s():null,e.size===0&&(r=!1),[]},wheel(o,a,l){return o===0?[]:[{kind:"zoom",factor:Math.exp(o*.0015),x:a,y:l}]}}}var tc="crete-view-hint";function nc(n){try{let e=n?JSON.parse(n):{};return{shows:Number.isInteger(e.shows)&&e.shows>0?e.shows:0,moved:e.moved===!0}}catch{return{shows:0,moved:!1}}}function Zh(n){return n?"Drag to turn and tilt · Two fingers pan, twist and pinch · Tap the compass to reset":"Drag to turn and tilt · Right-drag to pan · Tap the compass to reset"}function Jh(n,e){let t={...n},i=t.moved||t.shows>=2?"done":"waiting",r=e,s=0,o=()=>{let a=i;return i="done",a==="shown"?"hide":null};return{record:()=>({...t}),tick(a,l){return i==="waiting"?l?(r=a,null):a-r<1500?null:(i="shown",s=a,t.shows++,"show"):i==="shown"&&(l||a-s>=8e3)?o():null},moved(){return t.moved=!0,o()},dismiss(){return i==="shown"?o():null},show(a){return s=a,i==="shown"?null:(i="shown","show")},over:()=>i==="done"}}var $h=15,jh=10,Qh=1.2,ry=16,sy='<span class="tilt-ring" aria-hidden="true"></span><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dial" cx="12" cy="12" r="11"/><path class="n" d="M12 3l3.5 9h-7z"/><path class="s" d="M12 21l-3.5-9h7z"/></svg>',oy=600,ed=250;function ay(n,e,t,i){let r=document.createElement("button");return r.type="button",r.id=n,r.className=i,r.setAttribute("aria-label",e),r.title=e,r.innerHTML=t,r}function td(n,e,t,i){let r=!1,s=()=>{let P=S.moved();r||(r=!0,D()),F(P)},o={turn:(P,O)=>{s(),i.turn(P,O)},pan:(P,O)=>{s(),i.pan(P,O)},zoom:(P,O,H,Z)=>{s(),i.zoom(P,O,H,Z)},tilt:(P,O)=>{s(),i.tilt(P,O)},reset:()=>{s(),i.reset()}},a="",l=Kh(()=>performance.now()),c=P=>({id:P.pointerId,x:P.clientX,y:P.clientY,type:P.pointerType==="touch"||P.pointerType==="pen"?P.pointerType:"mouse",button:P.button}),u=P=>{if(!(!P.length||t.blocked())){t.gesture();for(let O of P)if(O.kind==="turn")o.turn(O.deg,!1);else if(O.kind==="tilt")o.tilt(O.deg,!1);else if(O.kind==="pan")o.pan(O.dx,O.dy);else if(O.kind==="zoom"){let H=n.getBoundingClientRect();o.zoom(O.factor,(O.x-H.left)/(H.width||1)-.5,.5-(O.y-H.top)/(H.height||1),!1)}else o.reset()}},h=P=>{if(a=P.pointerType,!t.blocked()){try{n.setPointerCapture(P.pointerId)}catch{}u(l.down(c(P)))}},f=P=>u(l.move(c(P))),d=P=>u(l.up(c(P))),g=P=>u(l.cancel(P.pointerId)),x=P=>{P.pointerType!=="mouse"&&!n.hasPointerCapture?.(P.pointerId)&&g(P)},p=()=>{t.blocked()||(t.gesture(),o.reset())},m=P=>P.preventDefault(),v=P=>{if(t.blocked())return;P.preventDefault();let O=P.deltaMode===1?ry:P.deltaMode===2?n.clientHeight:1;u(l.wheel(P.deltaY*O,P.clientX,P.clientY))};n.style.touchAction="none",n.addEventListener("pointerdown",h),n.addEventListener("pointermove",f),n.addEventListener("pointerup",d),n.addEventListener("pointercancel",g),n.addEventListener("lostpointercapture",g),n.addEventListener("pointerleave",x),n.addEventListener("dblclick",p),n.addEventListener("contextmenu",m),n.addEventListener("wheel",v,{passive:!1});let _=ly("cam-compass",t,{...o,zoomStep:P=>o.zoom(P>0?1/Qh:Qh,0,0,!0)},P=>{a=P}),b=_.button;e.append(b);let E=nc(null);try{E=nc(localStorage.getItem(tc))}catch{}let S=Jh(E,performance.now()),A=document.createElement("p");A.className="view-hint",A.id="view-hint",A.hidden=!0,A.setAttribute("role","status"),e.append(A);let C=0,y=0,M=()=>F(S.tick(performance.now(),K()));function D(){try{localStorage.setItem(tc,JSON.stringify(S.record()))}catch{}}function F(P){if(P){if(D(),P==="show"){let O=a?a!=="mouse":matchMedia("(pointer: coarse)").matches;A.textContent=Zh(O),clearTimeout(y),A.hidden=!1,requestAnimationFrame(()=>A.classList.add("on")),b.classList.remove("wiggle"),b.offsetWidth,b.classList.add("wiggle");return}clearInterval(C),A.classList.remove("on"),b.classList.remove("wiggle"),y=window.setTimeout(()=>{A.hidden=!0},300)}}let K=()=>t.covered()||document.hidden||e.closest("[hidden]")!==null;return!S.over()&&!matchMedia("(pointer: coarse)").matches&&(C=window.setInterval(M,ed)),A.addEventListener("click",()=>F(S.dismiss())),{setView:_.setView,showTips(){let P=S.show(performance.now());P&&(clearInterval(C),C=window.setInterval(M,ed)),F(P)},dispose(){clearInterval(C),clearTimeout(y),A.remove(),n.removeEventListener("pointerdown",h),n.removeEventListener("pointermove",f),n.removeEventListener("pointerup",d),n.removeEventListener("pointercancel",g),n.removeEventListener("lostpointercapture",g),n.removeEventListener("pointerleave",x),n.removeEventListener("dblclick",p),n.removeEventListener("contextmenu",m),n.removeEventListener("wheel",v),b.remove()}}}function ly(n,e,t,i=()=>{}){let r=ay(n,"Compass: drag or use the arrow keys to turn and tilt the view, plus and minus to zoom, tap to reset it",sy,"compass");r.title="Compass";let s=r.querySelector("svg"),o=qh(),a=-1e9,l=u=>{if(u.length){e.gesture();for(let h of u)h.kind==="turn"?t.turn(h.deg,!0):h.kind==="tilt"?t.tilt(h.deg,!0):h.kind==="reset"&&t.reset()}};r.style.touchAction="none";for(let u of["pointerdown","pointermove","pointerup","pointercancel"])r.addEventListener(u,h=>h.stopPropagation());r.addEventListener("pointerdown",u=>{if(i(u.pointerType),!(e.blocked()||u.pointerType==="mouse"&&u.button!==0)){u.preventDefault();try{r.setPointerCapture(u.pointerId)}catch{}l(o.down(u.pointerId,u.clientX,u.clientY))}}),r.addEventListener("pointermove",u=>{e.blocked()||l(o.move(u.pointerId,u.clientX,u.clientY))}),r.addEventListener("pointerup",u=>{let h=o.up(u.pointerId,u.clientX,u.clientY);h.length&&(a=performance.now()),e.blocked()||l(h)}),r.addEventListener("pointercancel",u=>l(o.cancel(u.pointerId)));let c={ArrowLeft:()=>t.turn(-$h,!0),ArrowRight:()=>t.turn($h,!0),ArrowUp:()=>t.tilt(-jh,!0),ArrowDown:()=>t.tilt(jh,!0),"+":()=>t.zoomStep(1),"=":()=>t.zoomStep(1),"-":()=>t.zoomStep(-1),_:()=>t.zoomStep(-1)};return r.addEventListener("keydown",u=>{let h=c[u.key];h&&(u.preventDefault(),u.stopPropagation(),!e.blocked()&&(e.gesture(),h()))}),r.addEventListener("click",()=>{performance.now()-a<oy||e.blocked()||(e.gesture(),t.reset())}),{button:r,setView(u,h){let f=Yh({yaw:u,pitch:h});s&&(s.style.transform=`scale(1, ${f.squash.toFixed(3)}) rotate(${f.needle.toFixed(1)}deg)`),r.style.setProperty("--tilt",f.tilt.toFixed(3)),r.dataset.heading=String(Math.round(u)),r.dataset.pitch=String(Math.round(h))}}}function nd(n,e){let t=[];for(let i=0;i<n.terrain.length;i++)(n.terrain[i]!==e.terrain[i]||n.objects[i]!==e.objects[i])&&t.push(i);return t}function ic(n,e){let t=[];return n.forEach((i,r)=>{i==="water"&&e[r]==="dirt"&&t.push(r)}),t}function id(n,e){if(n<=0)return e;if(n<.25){let t=n/.25;return e+(-.2-e)*t*t}if(n<.25+.35){let t=(n-.25)/.35;return-.2+(.065- -.2)*(1-(1-t)**3)}return .065}function rd(n,e){return e?0:.012*Math.sin(2*Math.PI*n/3)}var cy=n=>Math.max(0,Math.min(1,n)),uy=.06666666666666667;function sd(n){return 1-.67*cy(n)}function od(n,e,t){let i=e-n;return Math.abs(i)<.005?e:n+i*(1-Math.exp(-t/uy))}function ad(n,e,t){let i=e?[e]:[];return n==="ghosted"?[...i,...t]:i}var ld={minotaur:16730682,theseus:3593324,hazard:12614911,item:3859711},cd=657414,hy=10;function ud(n){return Math.max(1,hy/(ds*Math.max(n,1e-6)))}var ds=.18,Vo=.3,dy=.06,fy=.02,py=2.4,my=new Set(Object.values(Un).map(n=>n.sprite)),gy=new Set(Object.values(Nn).map(n=>n.sprite).filter(n=>n!==Nn.block.sprite));function hd(n,e=un().items){return n.id?.startsWith("machine")?null:n.model==="theseus"?"theseus":n.model==="minotaur"||n.model==="minotaur-stone"?"minotaur":e==="plate"?null:my.has(n.model)?"hazard":gy.has(n.model)?"item":null}function dd(n,e,t=0){let i=e*Math.PI/180;return n*Math.cos(i)+t*Math.sin(i)+dy}function fd(n,e){return e?0:-fy*(1-Math.cos(2*Math.PI*n/py))}var pd=.08;function md(n,e,t,i,r,s,o){let a=(l,c,u)=>c>u?0:Math.max(c,Math.min(u,l))-l;return[a(n,-r+o+t/2,r-o-t/2),a(e,-s+o,s-o-i)]}function ms(n,e){let t=n[e],i=n[e+1];return!t||!i||i.jump?null:i.r<t.r?"up":i.r>t.r?"down":i.c<t.c?"left":"right"}function Yo(n){return n.length<2?null:ms(n,0)??n[0].way??null}var gs=1.4,_y=1.2;function Ko(n){return 1+.05*(1-Math.cos(2*Math.PI*n/_y))}function vd(n,e,t){let i=n.getContext("2d"),r=e.rise/e.cell,s=16,o=0;return{size(a,l,c){let u=window.devicePixelRatio||1;s=Math.max(1,Math.round(c*u)),o=Math.round(r*s),n.width=a*s,n.height=l*s+o,n.style.width=`${n.width/u}px`,n.style.height=`${n.height/u}px`,n.dataset.cell=String(c),i.setTransform(1,0,0,1,0,0),i.imageSmoothingEnabled=!0,i.imageSmoothingQuality="high"},paint(a,l,c){i.clearRect(0,0,n.width,n.height);let u=e.cell,h=e.cell+e.rise;for(let f of a){let d=e.sprites[f.sprite];if(!d)continue;let g=Math.round(f.x*s),x=Math.round(f.y*s);if(f.sink){i.save(),i.beginPath(),i.rect(g,x,s,s+o),i.clip(),i.drawImage(t,d.x+f.frame*u,d.y,u,h,g,x+Math.round(f.sink*(s+o)),s,s+o),i.restore();continue}i.drawImage(t,d.x+f.frame*u,d.y,u,h,g,x,s,s+o)}l&&l.length>1&&Ay(i,l,s,o,c===void 0?1:Ko(c))}}}var yy="#8f291f",vy="#bb4131",by="#ffd23f",yd="#1c0402",My=12,Sy=.42,wy=.14,Ey=.2,Ty={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function Ay(n,e,t,i,r){let s=u=>[(u.c+.5)*t,(u.r+.5)*t+i],o=Math.max(1.5,t/12),a=Math.max(.75,t/30);if(n.lineJoin="round",n.lineCap="round",n.beginPath(),e.forEach((u,h)=>{let[f,d]=s(u);h===0||u.jump?n.moveTo(f,d):n.lineTo(f,d)}),n.strokeStyle=yd,n.lineWidth=o+2*a,n.stroke(),n.strokeStyle=yy,n.lineWidth=o,n.stroke(),t<My)return;let l=(u,h,f,d)=>{let g=t*Sy*f,x=t*wy*f,[p,m]=s(e[u]);n.save(),n.translate(p,m),n.rotate(Ty[h]),n.translate(t*Ey,0),n.beginPath(),n.moveTo(g/2,0),n.lineTo(-g/2,-x),n.lineTo(-g/4,0),n.lineTo(-g/2,x),n.closePath(),n.lineWidth=Math.max(1,t/21*f),n.strokeStyle=yd,n.stroke(),n.fillStyle=d,n.fill(),n.restore()};n.lineJoin="miter";for(let u=1;u<e.length;u++){let h=ms(e,u);h&&l(u,h,1,vy)}let c=Yo(e);c&&l(0,c,gs*r,by)}function Ry(n,e,t){let i=n.sprites[e];return!i||i.frames<=1||i.fps<=0?0:Math.floor(t*i.fps/1e3)%i.frames}function Cy(n,e){let t=n.sprites["gate-slide"]?.frames??1;return Math.max(-1,Math.min(t,Math.round(e*(t+1))-1))}function bd(n,e,t,i,r=us){let s=[],o=(d,g,x)=>s.push({sprite:d,frame:Ry(t,d,i),x:g,y:x}),a=(d,g,x)=>{let p=jl(n,g,d)==="v"?"-v":"",m=Cy(t,x),v=t.sprites["gate-slide"]?.frames??1;m<0?o("gate-closed"+p,d,g):m>=v?o("gate-open"+p,d,g):s.push({sprite:"gate-slide"+p,frame:m,x:d,y:g})},l=(d,g,x,p)=>{o(`door-${d}-sill${jl(n,x,g)==="v"?"-v":""}`,g,x),p<1&&s.push({sprite:`door-${d}`,frame:0,x:g,y:x,sink:p})},{rows:c,cols:u}=n.level,h=(d,g)=>!!d&&Math.ceil(d.r-1e-9)===g,f=e.minotaur&&ko(n,e.minotaur,r.hoof);for(let d=0;d<c;d++){for(let g=0;g<u;g++){let x=n.terrain[d*u+g],p=ln[x].sprites,m=x==="clone"?n.level.machines.find(b=>b.at.r===d&&b.at.c===g):void 0,v=d*u+g,_=ln[x].door??zo(n,v);m?o(p[Lr.indexOf(m.dir)],g,d):x==="gate"?a(g,d,r.bars.get(v)??(n.relicsLeft===0?1:0)):_&&(x==="floor"||r.doors.has(v))?l(_,g,d,r.doors.get(v)??1):o(p[0],g,d)}for(let g=0;g<u;g++){let x=n.objects[d*u+g];x==="block"&&e.blocks?.some(p=>p.origin.r===d&&p.origin.c===g)||x&&o(Nn[x].sprite,g,d)}for(let g of n.level.machines)g.at.r===d&&o(g.template==="block"?Nn.block.sprite:Un[g.template].sprite,g.at.c,d);for(let g of e.blocks??[])h(g.at,d)&&o(Nn.block.sprite,g.at.c,g.at.r);for(let g of e.hazards)h(g.at,d)&&o(Un[g.kind].sprite,g.at.c,g.at.r);n.cow&&n.cow.r===d&&o("cow-standing",n.cow.c,d),f&&h(f,d)&&o(n.stone>0?"minotaur-stone":"minotaur",f.c,f.r),h(e.player,d)&&o("theseus",e.player.c,e.player.r)}return s}function Md(n){return!(n instanceof HTMLImageElement)||n.complete&&n.naturalWidth>0}function Sd(n,e,t,i){let r=document.createElement("div");r.className="minimap",r.hidden=!0;let s=document.createElement("canvas");s.id="minimap",s.setAttribute("aria-hidden","true");let o=document.createElement("canvas");o.id="minimap-view",o.setAttribute("role","img"),o.setAttribute("aria-label","Mini map: the whole level from above; the outline is what the camera sees. Tap to look there."),r.append(s,o),n.append(r);let a=vd(s,e,t),l=o.getContext("2d"),c=null,u=null,h=0,f=0,d=0,g=0,x=0,p=1,m=0;function v(){if(!c)return;let D=c.s.level.cols,F=c.s.level.rows,K=zh(h||1280,f||800,D,F);if(D===d&&F===g&&K===x)return;d=D,g=F,x=K,a.size(d,g,x);let P=window.devicePixelRatio||1;o.width=s.width,o.height=s.height,o.style.width=s.style.width,o.style.height=s.style.height,p=s.width/P/d,m=s.height/P-g*p}function _(){!c||!Md(t)||a.paint(bd(c.s,c.f,e,0),c.thread??void 0)}function b(){if(!u||!d)return;let D=window.devicePixelRatio||1;l.setTransform(1,0,0,1,0,0),l.clearRect(0,0,o.width,o.height),l.setTransform(D,0,0,D,0,0);let F=Fh(u.c,u.aspect),K=H=>kh(H,d,g,p,m);l.save(),l.beginPath(),l.rect(0,m,d*p,g*p),l.clip(),l.beginPath(),F.corners.map(K).forEach(([H,Z],J)=>J?l.lineTo(H,Z):l.moveTo(H,Z)),l.closePath(),l.fillStyle="rgba(255,230,180,0.10)",l.fill(),l.lineWidth=1.5,l.strokeStyle="#ffd890",l.stroke();let[P,O]=F.tick.map(K);l.beginPath(),l.moveTo(P[0],P[1]),l.lineTo(O[0],O[1]),l.stroke(),l.restore()}let E=()=>_();Md(t)||t.addEventListener("load",E,{once:!0});let S=!1,A=D=>{if(i.blocked()||!d)return;let F=o.getBoundingClientRect();i.look(Bh(D.clientX-F.left,D.clientY-F.top,d,g,p,m))},C=D=>{if(!i.blocked()){S=!0;try{o.setPointerCapture(D.pointerId)}catch{}A(D)}},y=D=>{S&&A(D)},M=()=>{S=!1};return o.addEventListener("pointerdown",C),o.addEventListener("pointermove",y),o.addEventListener("pointerup",M),o.addEventListener("pointercancel",M),{show(D){r.hidden=!D},paint(D,F,K){c={s:D,f:F,thread:K},v(),_(),b()},view(D,F){u={c:{...D},aspect:F},b()},fit(D,F){h=D,f=F;let K=x;v(),x!==K&&(_(),b())},dispose(){t.removeEventListener("load",E),r.remove()}}}var xs={floor:"flag",wall:"none",exit:"none","gate-closed":"flag","gate-open":"flag",water:"water",fire:"ember",ice:"ice","force-up":"force","force-down":"force","force-left":"force","force-right":"force",dirt:"dirt",safe:"flag",button:"flag","toggle-open":"flag","toggle-closed":"flag","door-red":"flag","door-blue":"flag","door-yellow":"flag","door-green":"flag","door-red-sill":"flag","door-blue-sill":"flag","door-yellow-sill":"flag","door-green-sill":"flag",trap:"flag","button-brown":"flag","button-red":"flag",popup:"flag",gravel:"gravel",teleport:"flag",thief:"flag",bomb:"flag","clone-up":"flag","clone-down":"flag","clone-left":"flag","clone-right":"flag"};function wd(n,e){let t=n.terrain[e],i=ln[t].sprites;if(t==="clone"){let s=Math.floor(e/n.level.cols),o=e%n.level.cols,a=n.level.machines.find(l=>l.at.r===s&&l.at.c===o);return i[Lr.indexOf(a?.dir??"up")]}let r=zo(n,e);return r?`door-${r}-sill`:t==="gate"&&n.relicsLeft===0?i[1]:i[0]}var Ed=["theseus","minotaur","minotaur-stone"];function Td(n,e,t=0){let i=[],r=n.level.cols;n.objects.forEach((s,o)=>{if(!s)return;let a=Math.floor(o/r),l=o%r;s==="block"&&e.blocks?.some(c=>c.origin.r===a&&c.origin.c===l)||i.push({model:Nn[s].sprite,r:a,c:l,id:`o${o}`})});for(let s of n.level.machines){let o=s.template==="block"?Nn.block.sprite:Un[s.template].sprite;i.push({model:o,r:s.at.r,c:s.at.c,id:`machine${s.at.r*r+s.at.c}`,dir:s.dir})}for(let s of e.blocks??[])i.push({model:"block",r:s.at.r,c:s.at.c,id:null});for(let s of e.hazards){let o=n.hazards.find(a=>a.kind===s.kind&&a.at.r===s.at.r&&a.at.c===s.at.c);i.push({model:Un[s.kind].sprite,r:s.at.r,c:s.at.c,id:null,dir:o?.dir})}if(n.cow&&i.push({model:"cow-standing",r:n.cow.r,c:n.cow.c,id:"cow"}),e.minotaur){let s=ko(n,e.minotaur,t);i.push({model:n.stone>0?"minotaur-stone":"minotaur",r:s.r,c:s.c,id:"minotaur"})}return i.push({model:"theseus",r:e.player.r,c:e.player.c,id:"theseus"}),i}function Ad(){return{q:3,gaps:[],skip:10,fails:[0,0,0,0]}}function _s(n){n.gaps=[],n.skip=10}function Zo(n,e){let t=0;for(let i=n.length-1;i>=0;i--)if(t+=n[i],t>=e)return(n.length-i)*1e3/t;return null}function Rd(n,e){if(e>250)return n.q;if(n.skip>0)return n.skip--,n.q;n.gaps.push(e);let t=0,i=0;for(let s=n.gaps.length-1;s>=0&&t<3e3;s--,i++)t+=n.gaps[s];i<n.gaps.length&&(n.gaps=n.gaps.slice(-i));let r=Zo(n.gaps,2e3);if(r!==null&&r<40&&n.q>0)n.fails[n.q]++,n.q=n.q-1,_s(n);else if(n.q<3&&(n.fails[n.q+1]??0)<2){let s=Zo(n.gaps,3e3);s!==null&&s>55&&(n.q=n.q+1,_s(n))}return n.q}function Cd(n,e){return n?e:null}var ys=new I;function Mn(n,e,t,i,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;ys.copy(e),ys[i]=0,ys.normalize();let c=.5*o/(o+a),u=1-ys.angleTo(n)/l;return Math.sign(ys[t])===1?u*c:a/(o+a)+c+c*(1-u)}var zn=class extends on{constructor(e=1,t=1,i=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,t/2,i/2,s),super(1,1,1,r,r,r),r===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new I,l=new I,c=new I(e,t,i).divideScalar(2).subScalar(s),u=this.attributes.position.array,h=this.attributes.normal.array,f=this.attributes.uv.array,d=u.length/6,g=new I,x=.5/r;for(let p=0,m=0;p<u.length;p+=3,m+=2)switch(a.fromArray(u,p),l.copy(a),l.x-=Math.sign(l.x)*x,l.y-=Math.sign(l.y)*x,l.z-=Math.sign(l.z)*x,l.normalize(),u[p+0]=c.x*Math.sign(a.x)+l.x*s,u[p+1]=c.y*Math.sign(a.y)+l.y*s,u[p+2]=c.z*Math.sign(a.z)+l.z*s,h[p+0]=l.x,h[p+1]=l.y,h[p+2]=l.z,Math.floor(p/d)){case 0:g.set(1,0,0),f[m+0]=Mn(g,l,"z","y",s,i),f[m+1]=1-Mn(g,l,"y","z",s,t);break;case 1:g.set(-1,0,0),f[m+0]=1-Mn(g,l,"z","y",s,i),f[m+1]=1-Mn(g,l,"y","z",s,t);break;case 2:g.set(0,1,0),f[m+0]=1-Mn(g,l,"x","z",s,e),f[m+1]=Mn(g,l,"z","x",s,i);break;case 3:g.set(0,-1,0),f[m+0]=1-Mn(g,l,"x","z",s,e),f[m+1]=1-Mn(g,l,"z","x",s,i);break;case 4:g.set(0,0,1),f[m+0]=1-Mn(g,l,"x","y",s,e),f[m+1]=1-Mn(g,l,"y","x",s,t);break;case 5:g.set(0,0,-1),f[m+0]=Mn(g,l,"x","y",s,e),f[m+1]=1-Mn(g,l,"y","x",s,t);break}}};var Jo=class extends Pn{constructor(e=null){super();let t=new on;t.deleteAttribute("uv");let i=new Ln({side:Lt}),r=new Ln,s=5;e!==null&&e._useLegacyLights===!1&&(s=900);let o=new bn(16777215,s,28,2);o.position.set(.418,16.199,.3),this.add(o);let a=new se(t,i);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let l=new se(t,r);l.position.set(-10.906,2.009,1.846),l.rotation.set(0,-.195,0),l.scale.set(2.328,7.905,4.651),this.add(l);let c=new se(t,r);c.position.set(-5.607,-.754,-.758),c.rotation.set(0,.994,0),c.scale.set(1.97,1.534,3.955),this.add(c);let u=new se(t,r);u.position.set(6.167,.857,7.803),u.rotation.set(0,.561,0),u.scale.set(3.927,6.285,3.687),this.add(u);let h=new se(t,r);h.position.set(-2.017,.018,6.124),h.rotation.set(0,.333,0),h.scale.set(2.002,4.566,2.064),this.add(h);let f=new se(t,r);f.position.set(2.291,-.756,-2.621),f.rotation.set(0,-.286,0),f.scale.set(1.546,1.552,1.496),this.add(f);let d=new se(t,r);d.position.set(-2.193,-.369,-5.547),d.rotation.set(0,.516,0),d.scale.set(3.875,3.487,2.986),this.add(d);let g=new se(t,Dr(50));g.position.set(-16.116,14.37,8.208),g.scale.set(.1,2.428,2.739),this.add(g);let x=new se(t,Dr(50));x.position.set(-16.109,18.021,-8.207),x.scale.set(.1,2.425,2.751),this.add(x);let p=new se(t,Dr(17));p.position.set(14.904,12.198,-1.832),p.scale.set(.15,4.265,6.331),this.add(p);let m=new se(t,Dr(43));m.position.set(-.462,8.89,14.52),m.scale.set(4.38,5.441,.088),this.add(m);let v=new se(t,Dr(20));v.position.set(3.235,11.486,-12.541),v.scale.set(2.5,2,.1),this.add(v);let _=new se(t,Dr(100));_.position.set(0,20,0),_.scale.set(1,.1,1),this.add(_)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Dr(n){let e=new lt;return e.color.setScalar(n),e}function Dt(n){return()=>(n=n*1664525+1013904223>>>0,n/4294967296)}function Qt(n,e,t=!0){let i=document.createElement("canvas");i.width=i.height=n,e(i.getContext("2d"),n);let r=new xi(i);return t&&(r.colorSpace=yt),r.wrapS=r.wrapT=vr,r.anisotropy=8,r}function bt(n,e,t,i,r,s,o,a,l=!0){for(let c=0;c<i;c++){let u=t()*e,h=t()*e,f=o+t()*(a-o);n.fillStyle=`rgba(${r},${(s*(.3+.7*t())).toFixed(3)})`;let d=l?[-e,0,e]:[0];for(let g of d)for(let x of d)l&&(Math.abs(u+g-e/2)>e/2+f||Math.abs(h+x-e/2)>e/2+f)||(n.beginPath(),n.arc(u+g,h+x,f,0,7),n.fill())}}function vs(n,e,t){let i=n.createRadialGradient(e/2,e/2,e*.3,e/2,e/2,e*.72);i.addColorStop(0,"rgba(0,0,0,0)"),i.addColorStop(1,`rgba(20,14,10,${t})`),n.fillStyle=i,n.fillRect(0,0,e,e)}function rc(n,e,t,i,r,s,o){n.strokeStyle=r,n.lineWidth=s;for(let a=0;a<i;a++){n.beginPath();let l=t()*e,c=t()*e;n.moveTo(l,c);for(let u=0;u<6;u++)l+=(t()-.5)*o,c+=(t()-.5)*o,n.lineTo(l,c);n.stroke()}}var Py=n=>Qt(256,(e,t)=>{let i=Dt(n);e.fillStyle="#dcc699",e.fillRect(0,0,t,t),bt(e,t,i,260,"150,120,80",.06,6,26,!1),bt(e,t,i,220,"242,226,192",.1,5,20,!1),bt(e,t,i,1800,"120,96,66",.1,.6,2,!1),bt(e,t,i,900,"250,238,212",.12,.6,1.6,!1),rc(e,t,i,2,"rgba(120,94,62,.4)",1.3,60),vs(e,t,.12)}),Iy=()=>Qt(256,(n,e)=>{let t=Dt(7);n.fillStyle="#15171a",n.fillRect(0,0,e,e);let i=e/4,r=e/2;for(let s=0;s<4;s++){let o=s%2?r/2:0;for(let a=-1;a<3;a++){let l=a*r+o,c=s*i,u=.75+t()*.35;n.fillStyle=`rgb(${90*u|0},${94*u|0},${100*u|0})`;for(let h of[0,e])n.fillRect(l+3-h,c+3,r-6,i-6)}}bt(n,e,t,1400,"16,18,22",.25,.7,2.2),bt(n,e,t,500,"150,156,166",.14,.7,2),bt(n,e,t,60,"20,22,26",.25,4,12)}),Ly=()=>Qt(256,(n,e)=>{let t=Dt(11);n.fillStyle="#7a7e86",n.fillRect(0,0,e,e),bt(n,e,t,200,"26,28,32",.2,6,24),bt(n,e,t,1500,"16,18,20",.25,.6,2),bt(n,e,t,600,"140,146,156",.12,.6,1.8)});function Dy(){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d"),i=t.createImageData(128,128),r=[[1,2,.3],[3,-1,1.7],[-2,3,4.1],[4,1,2.2],[-3,-4,5.3],[5,-3,.9]],s=(l,c)=>r.reduce((u,[h,f,d],g)=>u+Math.sin(2*Math.PI*(h*l+f*c)/128+d)/(1+g*.6),0),o=new I;for(let l=0;l<128;l++)for(let c=0;c<128;c++){let u=s(c+1,l)-s(c-1,l),h=s(c,l+1)-s(c,l-1);o.set(-u*1.4,-h*1.4,1).normalize();let f=(l*128+c)*4;i.data[f]=(o.x*.5+.5)*255,i.data[f+1]=(o.y*.5+.5)*255,i.data[f+2]=(o.z*.5+.5)*255,i.data[f+3]=255}t.putImageData(i,0,0);let a=new xi(e);return a.wrapS=a.wrapT=vr,a}var Uy=()=>Qt(256,(n,e)=>{let t=Dt(21);n.fillStyle="#1c120d",n.fillRect(0,0,e,e),bt(n,e,t,200,"50,30,20",.3,4,18,!1),n.lineCap="round";for(let i=0;i<14;i++){n.strokeStyle=`rgba(${200+t()*55|0},${70+t()*80|0},20,.9)`,n.lineWidth=1+t()*2.5,n.shadowColor="#ff6a10",n.shadowBlur=8,n.beginPath();let r=t()*e,s=t()*e;n.moveTo(r,s);for(let o=0;o<5;o++)r+=(t()-.5)*70,s+=(t()-.5)*70,n.lineTo(r,s);n.stroke()}n.shadowBlur=0,vs(n,e,.7)}),Ny=()=>Qt(256,(n,e)=>{let t=Dt(31);for(let i=0;i<5;i++){let r=.85+t()*.25;n.fillStyle=`rgb(${196*r|0},${150*r|0},${98*r|0})`,n.fillRect(i*e/5,0,e/5,e),n.fillStyle="rgba(60,36,18,.6)",n.fillRect(i*e/5,0,2,e)}for(let i=0;i<160;i++){n.strokeStyle=`rgba(90,58,30,${.08+t()*.15})`,n.lineWidth=.6+t();let r=t()*e;n.beginPath(),n.moveTo(r,0),n.bezierCurveTo(r+(t()-.5)*8,e*.3,r+(t()-.5)*8,e*.7,r+(t()-.5)*6,e),n.stroke()}}),Oy=()=>Qt(256,(n,e)=>{let t=Dt(51);n.fillStyle="#3a2414",n.fillRect(0,0,e,e),bt(n,e,t,500,"20,12,6",.25,.6,2.4,!1),bt(n,e,t,80,"90,60,34",.15,4,16,!1),n.strokeStyle="#d8a640",n.lineWidth=22,n.lineJoin="miter";for(let i of[78,178])n.beginPath(),n.moveTo(40,i+38),n.lineTo(128,i-34),n.lineTo(216,i+38),n.stroke();n.strokeStyle="rgba(0,0,0,.6)",n.lineWidth=10,n.strokeRect(5,5,e-10,e-10)}),Fy=()=>Qt(256,(n,e)=>{let t=Dt(61);n.fillStyle="#b6dcea",n.fillRect(0,0,e,e),bt(n,e,t,120,"230,246,252",.25,6,30,!1),bt(n,e,t,90,"120,170,196",.15,6,24,!1),rc(n,e,t,6,"rgba(250,254,255,.8)",1.6,90),vs(n,e,.25)}),zy=()=>Qt(256,(n,e)=>{let t=Dt(71);n.fillStyle="#6a4626",n.fillRect(0,0,e,e),bt(n,e,t,260,"40,24,12",.22,4,20,!1),bt(n,e,t,200,"140,98,58",.16,3,14,!1),bt(n,e,t,2200,"30,18,8",.25,.6,2,!1),bt(n,e,t,40,"170,160,150",.7,2,4.5,!1),vs(n,e,.45)}),ky=()=>Qt(256,(n,e)=>{let t=Dt(81);n.fillStyle="#5e5a54",n.fillRect(0,0,e,e),bt(n,e,t,1600,"30,28,26",.3,.8,3,!1),bt(n,e,t,500,"160,154,146",.25,1,4,!1),vs(n,e,.45)}),By=()=>{let n=Qt(256,(e,t)=>{e.translate(t/2,t/2),e.strokeStyle="rgba(214,200,160,.55)",e.lineWidth=3,e.beginPath();for(let i=0;i<6;i++){let r=i/6*Math.PI*2+.3;e.lineTo(Math.cos(r)*112,Math.sin(r)*112)}e.closePath(),e.stroke();for(let i=0;i<28;i++){let r=i/28*Math.PI*2;e.save(),e.rotate(r),e.translate(76,0),e.rotate(i%2?.6:-.6),e.fillStyle=i%2?"#4f7a3a":"#3d6a30",e.beginPath(),e.ellipse(0,0,14,6,0,0,7),e.fill(),e.restore()}});return n.wrapS=n.wrapT=Gt,n},Gy=()=>{let n=Qt(256,(e,t)=>{let i=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);i.addColorStop(0,"#f2fbff"),i.addColorStop(.35,"#6fc0ef"),i.addColorStop(1,"#1a4f9a"),e.fillStyle=i,e.fillRect(0,0,t,t),e.translate(t/2,t/2),e.lineCap="round";for(let r=0;r<3;r++){e.strokeStyle="rgba(255,255,255,.85)",e.lineWidth=9,e.beginPath();for(let s=0;s<=60;s++){let o=s/60,a=r*(Math.PI*2/3)+o*4.2,l=8+o*110;e.lineTo(Math.cos(a)*l,Math.sin(a)*l)}e.stroke()}});return n.wrapS=n.wrapT=Gt,n},Hy=()=>{let n=Qt(256,(e,t)=>{e.fillStyle="#3a1f52",e.fillRect(0,0,t,t),bt(e,t,Dt(91),300,"20,10,30",.3,1,4,!1),e.fillStyle="#e0a838",e.translate(t/2,t/2+18),e.beginPath(),e.roundRect(-46,-30,92,92,30),e.fill();for(let[i,r,s]of[[-34,70,18],[-12,92,19],[12,96,19],[35,78,18]])e.beginPath(),e.roundRect(i-s/2,-30-r,s,r+20,s/2),e.fill();e.save(),e.translate(-50,14),e.rotate(-.8),e.beginPath(),e.roundRect(-11,-58,22,66,11),e.fill(),e.restore()});return n.wrapS=n.wrapT=Gt,n},Vy=()=>Qt(256,(n,e)=>{let t=Dt(41);n.fillStyle="#ad9f86",n.fillRect(0,0,e,e),bt(n,e,t,300,"60,52,44",.15,4,20,!1),bt(n,e,t,1500,"50,44,38",.2,.6,2,!1),rc(n,e,t,4,"rgba(60,50,40,.45)",2,40);let i=(r,s,o)=>{n.save(),n.translate(e/2+r,e/2+s),n.fillStyle=o,n.fillRect(-7,-80,14,160);for(let a of[-1,1])n.beginPath(),n.moveTo(0,-38),n.quadraticCurveTo(a*60,-70,a*78,-50),n.quadraticCurveTo(a*58,0,a*78,50),n.quadraticCurveTo(a*60,70,0,38),n.fill();n.restore()};i(3,3,"rgba(225,210,185,.35)"),i(0,0,"rgba(40,32,26,.4)"),n.strokeStyle="rgba(40,32,26,.6)",n.lineWidth=6,n.strokeRect(10,10,e-20,e-20)}),Wy=()=>{let n=Qt(64,(e,t)=>{let i=e.createLinearGradient(0,0,0,t);i.addColorStop(0,"rgba(0,0,0,0.85)"),i.addColorStop(.18,"rgba(0,0,0,0.6)"),i.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=i,e.fillRect(0,0,t,t)});return n.wrapS=n.wrapT=Gt,n},Xy=()=>{let n=Qt(64,(e,t)=>{let i=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);i.addColorStop(0,"rgba(255,220,160,1)"),i.addColorStop(.35,"rgba(255,150,60,.45)"),i.addColorStop(1,"rgba(255,120,40,0)"),e.fillStyle=i,e.fillRect(0,0,t,t)});return n.wrapS=n.wrapT=Gt,n},De=(n,e={})=>new Ln({color:n,roughness:.8,metalness:0,...e}),ti=(n,e=.9)=>new lt({color:n,transparent:!0,opacity:e,blending:Oi,depthWrite:!1}),qy=.022;function Yy(){let n=new lt({color:656900,side:Lt});return n.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${qy.toFixed(3)};`)},n}function Pd(n){let e=new Sr(n),t=new Jo(n),i=e.fromScene(t,.04).texture;t.dispose(),e.dispose();let r=(c,u=.35,h={})=>De(c,{roughness:u,metalness:.85,envMap:i,envMapIntensity:.55,...h}),s={brick:Iy(),cap:Ly(),water:Dy(),ember:Uy(),wood:Ny(),force:Oy(),ice:Fy(),dirt:zy(),gravel:ky(),wreath:By(),swirl:Gy(),hand:Hy(),halo:Xy(),ao:Wy(),block:Vy(),flags:[101,202,303].map(Py)},o={under:De(789e3,{roughness:1}),mortar:De(un().caps?1972242:7232580,{roughness:1}),ao:new lt({map:s.ao,transparent:!0,depthWrite:!1}),edge:De(789776,{roughness:1,side:pn}),flags:s.flags.map(c=>De(16777215,{map:c,roughness:.88})),ember:De(16777215,{map:s.ember,emissiveMap:s.ember,emissive:16742960,emissiveIntensity:.9,roughness:.9}),ice:De(10274004,{map:s.ice,roughness:.08,metalness:.1,envMap:i,envMapIntensity:.35}),force:De(16777215,{map:s.force,roughness:.7}),dirt:De(16777215,{map:s.dirt,roughness:.97}),gravelBed:De(16777215,{map:s.gravel,roughness:.95}),pebble:De(9076850,{roughness:.9}),water:De(1722962,{roughness:.14,metalness:.1,normalMap:s.water,normalScale:new $(.55,.55),emissive:399388,envMap:i,envMapIntensity:.25}),basin:De(925216,{roughness:.9}),side:De(11843776,{map:s.brick,roughness:.93}),top:De(un().caps?15921128:10791602,{map:s.cap,roughness:.95}),wood:De(16777215,{map:s.wood,roughness:.75}),darkWood:De(9071178,{map:s.wood,roughness:.8}),iron:r(3025446,.6),bronze:r(12618308,.4,{emissive:2758664}),gold:r(15250496,.3,{emissive:5912064}),stone:De(9075818),paleStone:De(13285530,{roughness:.85}),dark:De(657415),glow:new lt({color:16751168}),keyColor:{red:De(14692382,{roughness:.45,emissive:5901316}),blue:De(3108576,{roughness:.45,emissive:794202}),yellow:De(15910968,{roughness:.45,emissive:5915648}),green:De(3127388,{roughness:.45,emissive:805406})},brownButton:De(6962718,{roughness:.55}),redButton:De(11545116,{roughness:.45,emissive:2753538}),cream:De(15260864,{roughness:.6}),wreath:new Ln({map:s.wreath,transparent:!0,roughness:.8,depthWrite:!1}),swirl:new Ln({map:s.swirl,emissiveMap:s.swirl,emissive:new Ze(6994175),emissiveIntensity:.9,roughness:.3}),hand:De(16777215,{map:s.hand,roughness:.6}),clay:De(11564104,{roughness:.75}),block:De(16777215,{map:s.block,roughness:.85}),skin:De(12618338,{roughness:.7}),tunic:De(2383482,{roughness:.8}),cloak:De(9054750),leather:De(5913122,{roughness:.8}),steel:r(13225424,.3),heroSkin:De(15118472,{roughness:.6,emissive:3020298}),heroTunic:De(3117008,{roughness:.55,emissive:666180}),heroCloak:De(14170660,{roughness:.65,emissive:4328452}),heroLeather:De(9067058,{roughness:.7,emissive:1707012}),heroHair:De(5911576,{roughness:.8,emissive:1312770}),heroRing:new lt({color:1284676,depthWrite:!1}),heroRingEdge:new lt({color:398346,transparent:!0,opacity:.8,depthWrite:!1}),itemShade:new lt({color:656900,transparent:!0,opacity:.9,depthWrite:!1}),itemRing:new lt({color:16773304,depthWrite:!1}),heroBeam:new lt({color:3593324,transparent:!0,opacity:.3,blending:Oi,depthTest:!1,depthWrite:!1,side:pn}),heroXray:new lt({color:6090890,transparent:!0,opacity:.6,depthFunc:Gl,depthWrite:!1,stencilWrite:!0,stencilRef:1,stencilFunc:ch}),outline:Yy(),fur:De(5912096,{roughness:.9,emissive:1181700}),furDark:De(3941396,{roughness:.9}),snout:De(6965814),ivory:De(14866106,{roughness:.5}),kilt:De(11545116,{emissive:2754050}),hoof:De(1314832),eye:new lt({color:16730650}),statue:De(9342088,{roughness:.9}),statueDark:De(6973540,{roughness:.92}),parchment:De(15785648,{emissive:3024920}),teal:De(3193004,{roughness:.4,emissive:670262}),boot:De(12596762,{roughness:.55,emissive:3804164}),bootTrim:De(14715424,{emissive:5906944}),skate:De(13162728,{roughness:.45,emissive:2634300}),suction:De(3445854,{roughness:.5,emissive:798234}),mirror:r(15132390,.08,{envMapIntensity:1,emissive:4211784}),gorgon:De(3450970,{roughness:.5,emissive:798744}),cake:De(15773768,{roughness:.55,emissive:4203528}),hide:De(16051938,{roughness:.65,emissive:2894374}),patch:De(5911072,{roughness:.8}),feather:De(9067058,{roughness:.8,emissive:1970184}),halo:s.halo,env:i},a=new Set([i,...s.flags,...Object.values(s).filter(c=>c instanceof xi)]);for(let c of Object.values(o))c&&typeof c=="object"&&"isMaterial"in c?a.add(c):Array.isArray(c)&&c.forEach(u=>a.add(u));for(let c of Object.values(o.keyColor))a.add(c);return{t:s,m:o,metal:r,std:De,keeps:a,dispose:()=>{for(let c of a)c.dispose()}}}var ne=.1,yi=.035,Ct=(n,e)=>n-(e-1)/2,Pt=(n,e)=>n-(e-1)/2,Ky={"force-up":0,"force-left":Math.PI/2,"force-down":Math.PI,"force-right":-Math.PI/2},Id=26;function Ld(n){let{m:e}=n,t=new Te,i=new zn(.97,.12,.97,2,.02);i.translate(0,ne-.06,0);let r=new jt(1,1);r.rotateX(-Math.PI/2),r.translate(0,yi,0);let s=new Tr(.045,0),o=new se(new jt(1,1),e.under);o.rotation.x=-Math.PI/2,o.position.y=-.02,o.receiveShadow=!0,t.add(o);let a=new jt(1,1);a.rotateX(-Math.PI/2);let l=[],c=(h,f,d)=>{let g=new bo(h,f,Math.max(1,d));return g.count=d,g.receiveShadow=!0,l.push(g),t.add(g),g},u=()=>{for(let h of l)t.remove(h),h.dispose();l=[]};return{group:t,set(h,f,d){u();let g=new an([new $(-100,-100),new $(100,-100),new $(100,100),new $(-100,100)]);g.holes.push(new wr([new $(-d/2,-f/2),new $(-d/2,f/2),new $(d/2,f/2),new $(d/2,-f/2)])),o.geometry.dispose(),o.geometry=new Ar(g);let x=[[],[],[]],p={ember:[],ice:[],force:[],dirt:[],gravel:[],water:[],mortar:[]};h.forEach((S,A)=>{let C=xs[S];S!=="exit"&&p.mortar.push(A),C==="flag"?x[Dt(A*2654435761+7)()*3|0].push(A):C!=="none"&&p[C].push(A)});let m=new pt,v=new Ze,_=(S,A,C,y)=>{A.forEach((M,D)=>{let F=Dt(M*40503+11);if(m.makeRotationY(C(M,F)).setPosition(Ct(M%d,d),0,Pt(Math.floor(M/d),f)),S.setMatrixAt(D,m),y){let K=.78+F()*.3;S.setColorAt(D,v.setRGB(K*(1+(F()-.5)*.06),K,K*(1-F()*.06)))}})},b=(S,A)=>(A()*4|0)*(Math.PI/2);_(c(a,e.mortar,p.mortar.length),p.mortar,()=>0,!1),x.forEach((S,A)=>_(c(i,e.flags[A],S.length),S,b,!0)),_(c(i,e.ember,p.ember.length),p.ember,b,!1),_(c(i,e.ice,p.ice.length),p.ice,b,!1),_(c(i,e.dirt,p.dirt.length),p.dirt,b,!0),_(c(i,e.gravelBed,p.gravel.length),p.gravel,b,!0),_(c(i,e.force,p.force.length),p.force,S=>Ky[h[S]]??0,!1),_(c(r,e.water,p.water.length),p.water,()=>0,!1);let E=p.gravel;if(E.length){let S=c(s,e.pebble,E.length*Id);S.castShadow=!0;let A=0;for(let C of E){let y=Dt(C*7919+3);for(let M=0;M<Id;M++){let D=.7+y()*.5;m.makeScale(D,.6*D,D).setPosition(Ct(C%d,d)+(y()-.5)*.8,ne+.015,Pt(Math.floor(C/d),f)+(y()-.5)*.8),S.setMatrixAt(A,m),S.setColorAt(A++,v.setScalar(.75+y()*.5))}}}},loop(h){n.t.water.offset.set(Math.sin(h*.5)*.04,h*.025%1),e.water.emissiveIntensity=1+.15*Math.sin(h*1.3)},dispose(){u(),i.dispose(),r.dispose(),s.dispose(),a.dispose(),o.geometry.dispose()}}}function $o(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),r=new Set(Object.keys(n[0].morphAttributes)),s={},o={},a=n[0].morphTargetsRelative,l=new Rt,c=0;for(let u=0;u<n.length;++u){let h=n[u],f=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let d in h.attributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;s[d]===void 0&&(s[d]=[]),s[d].push(h.attributes[d]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let d in h.morphAttributes){if(!r.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[d]===void 0&&(o[d]=[]),o[d].push(h.morphAttributes[d])}if(e){let d;if(t)d=h.index.count;else if(h.attributes.position!==void 0)d=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,u),c+=d}}if(t){let u=0,h=[];for(let f=0;f<n.length;++f){let d=n[f].index;for(let g=0;g<d.count;++g)h.push(d.getX(g)+u);u+=n[f].attributes.position.count}l.setIndex(h)}for(let u in s){let h=Dd(s[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let f=0;f<h;++f){let d=[];for(let x=0;x<o[u].length;++x)d.push(o[u][x][f]);let g=Dd(d);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(g)}}return l}function Dd(n){let e,t,i,r=-1,s=0;for(let c=0;c<n.length;++c){let u=n[c];if(u.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=u.normalized),i!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=u.gpuType),r!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=u.array.length}let o=new e(s),a=0;for(let c=0;c<n.length;++c)o.set(n[c].array,a),a+=n[c].array.length;let l=new Xt(o,t,i);return r!==void 0&&(l.gpuType=r),l}var Ur=.38,Zy=.16,sc=.26,Jy=.05,$y={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};function jy(n){let[e,,t]=Sn[n].n,i=1.002,r=.5,s=.5-Jy,o=e!==0?[[e*s,i,-.5*e],[e*s,i,.5*e],[e*r,i,.5*e],[e*r,i,-.5*e]]:[[.5*t,i,t*s],[-.5*t,i,t*s],[-.5*t,i,t*r],[.5*t,i,t*r]];return(e<0||t<0)&&o.reverse(),{v:o,n:[0,1,0],uvs:[[0,0],[1,0],[1,1],[0,1]],mat:2}}var Sn={n:{d:[-1,0],v:[[.5,0,-.5],[-.5,0,-.5],[-.5,1,-.5],[.5,1,-.5]],n:[0,0,-1],u:n=>-n[0]},s:{d:[1,0],v:[[-.5,0,.5],[.5,0,.5],[.5,1,.5],[-.5,1,.5]],n:[0,0,1],u:n=>n[0]},w:{d:[0,-1],v:[[-.5,0,-.5],[-.5,0,.5],[-.5,1,.5],[-.5,1,-.5]],n:[-1,0,0],u:n=>n[2]},e:{d:[0,1],v:[[.5,0,.5],[.5,0,-.5],[.5,1,-.5],[.5,1,.5]],n:[1,0,0],u:n=>-n[2]}},Qy=Object.keys(Sn);function Ud(n){let e=[],t=[],i=[],r=[],s=new Rt,o=0;for(let{v:a,n:l,uvs:c,mat:u}of n){let h=e.length/3;a.forEach((f,d)=>{e.push(...f),t.push(...l),i.push(...c[d])}),r.push(h,h+1,h+2,h,h+2,h+3),s.addGroup(o,6,u),o+=6}return s.setAttribute("position",new $e(e,3)),s.setAttribute("normal",new $e(t,3)),s.setAttribute("uv",new $e(i,2)),s.setIndex(r),s}var Nd=(n,e,t)=>({v:Sn[n].v,n:Sn[n].n,mat:0,uvs:Sn[n].v.map(i=>[Sn[n].u([i[0]+e,0,i[2]+t]),i[1]*cn])}),oc=[];for(let n of[.15,.5,.85])for(let e of[.15,.5,.85])for(let t of[.15,.5,.85])oc.push([n,e,t]);function ev(n,e,t,i){let r=-1e9,s=1e9;for(let o=0;o<3;o++){if(Math.abs(e[o])<1e-9){if(n[o]<t[o]||n[o]>i[o])return-1;continue}let a=(t[o]-n[o])/e[o],l=(i[o]-n[o])/e[o];if(a>l&&([a,l]=[l,a]),a>r&&(r=a),l<s&&(s=l),r>s)return-1}return r}function Od(n){let e=new Te,t=[],i=new jt(1,sc);i.rotateX(-Math.PI/2);let r=[],s=new Map,o=0,a="solid",l=new I,c=h=>{let f=h.op<.999;for(let d of h.mats)d.transparent!==f&&(d.transparent=f,d.needsUpdate=!0),d.opacity=h.op},u=()=>{for(let h of t){e.remove(h.mesh),h.mesh.geometry.dispose();for(let f of h.inner)f.mesh.geometry.dispose();for(let f of h.mats)f.dispose()}t=[],s.clear();for(let h of r)e.remove(h);r=[]};return{group:e,list:()=>t,at:(h,f)=>s.get(h*o+f),build(h,f,d){u(),o=d;let g=(p,m)=>p<0||m<0||p>=f||m>=o||h[p*o+m]==="wall",x=a==="low"?Ur:cn;for(let p=0;p<f;p++)for(let m=0;m<o;m++){if(h[p*o+m]!=="wall")continue;let v=Ct(m,o),_=Pt(p,f),b=[{v:[[-.5,1,.5],[.5,1,.5],[.5,1,-.5],[-.5,1,-.5]],n:[0,1,0],mat:1,uvs:[[v-.5,-_-.5],[v+.5,-_-.5],[v+.5,-_+.5],[v-.5,-_+.5]]}],E=[];for(let M of Qy){let[D,F]=Sn[M].d,K=p+D,P=m+F;if(g(K,P)&&K>=0&&P>=0&&K<f&&P<o?E.push(M):b.push(Nd(M,v,_)),g(K,P))continue;b.push(jy(M));let[O,,H]=Sn[M].n,Z=new se(i,n.m.ao);Z.position.set(v+O*(.5+sc/2),ne+.003,_+H*(.5+sc/2)),Z.rotation.y=$y[M],Z.renderOrder=1,e.add(Z),r.push(Z)}let S=[n.m.side.clone(),n.m.top.clone(),n.m.edge.clone()],A=p===0||m===0||p===f-1||m===o-1;if(!A){A=!0;for(let M=-1;M<=1;M++)for(let D=-1;D<=1;D++)g(p+M,m+D)||(A=!1)}A&&S[1].color.multiplyScalar(Zy);let C=new se(Ud(b),S);C.position.set(v,0,_),C.scale.y=x,C.castShadow=C.receiveShadow=!0,e.add(C);let y={r:p,c:m,x:v,z:_,mesh:C,mats:S,op:1,target:1,inner:[]};for(let M of E){let D=new se(Ud([Nd(M,v,_)]),[S[0]]);D.visible=!1,C.add(D),y.inner.push({k:M,mesh:D,nb:null})}t.push(y),s.set(p*o+m,y)}for(let p of t)for(let m of p.inner){let[v,_]=Sn[m.k].d;m.nb=s.get((p.r+v)*o+p.c+_)??null}},setMode(h){a=h;let f=h==="low"?Ur:cn;for(let d of t)d.mesh.scale.y=f},aim(h,f){let d=new Map,g=a==="low"?Ur:cn;h.getWorldDirection(l);let x=[l.x,l.y,l.z],p=30,m=Math.max(3.2,g/Math.max(.05,-x[1]/Math.hypot(x[0],x[2]))+1.2);for(let v of f){let _=t.filter(E=>Math.abs(E.x-v.x)<m&&Math.abs(E.z-v.z)<m);if(_.length===0)continue;let b=new Map;for(let[E,S,A]of oc){let C=[v.x-v.half+2*v.half*E,ne+v.h*S,v.z-v.half+2*v.half*A],y=[C[0]-x[0]*p,C[1]-x[1]*p,C[2]-x[2]*p];for(let M of _){let D=ev(y,x,[M.x-.49,0,M.z-.49],[M.x+.49,g,M.z+.49]);D>=0&&D<p-.01&&b.set(M,(b.get(M)??0)+1)}}for(let[E,S]of b)d.set(E,Math.max(d.get(E)??0,S/oc.length))}for(let v of t){let _=Math.min(1,Math.max(0,((d.get(v)??0)-.03)/.45));v.target=sd(_*_*(3-2*_))}},ease(h,f){let d=!1;for(let g of t)g.op!==g.target&&(g.op=f?g.target:od(g.op,g.target,h),d=!0,c(g));if(d)for(let g of t)for(let x of g.inner)x.mesh.visible=!!x.nb&&x.nb.op<.999&&g.op>x.nb.op+.02;return d},dispose(){u(),i.dispose()}}}var V=(n,e,t,i)=>(n.position.set(e,t,i),n),tv=(n,e,t,i=14)=>new yn(n,e,t,i),He=(n,e,t,i,r=14)=>new se(tv(n,e,t,r),i),qe=(n,e,t,i)=>new se(new on(n,e,t),i),Wi=n=>(n.rotation.x=Math.PI/2,n);function nv(n){n.updateMatrixWorld(!0);let e=new Map;n.traverse(i=>{if(!(i instanceof se))return;let r=i.geometry.clone().applyMatrix4(i.matrixWorld);r.index&&(r=r.toNonIndexed());for(let o of Object.keys(r.attributes))o!=="position"&&o!=="normal"&&o!=="uv"&&r.deleteAttribute(o);let s=i.material;e.set(s,[...e.get(s)??[],r]),i.geometry.dispose()});let t=new Te;for(let[i,r]of e){let s=new se($o(r),i);r.forEach(o=>o.dispose()),s.castShadow=s.receiveShadow=!0,t.add(s)}return t}function Qo(n,e){let t=[];for(let i of e.children)i instanceof se&&!i.userData.live&&t.push(new se(i.geometry,n.m.outline));return e.add(...t),e}function Ot(n,e,t=[]){let i=nv(n);return t.length&&i.add(...t),i.userData=e,i}var kn=()=>Object.assign(new Te,{userData:{half:0,h:0}}),ac=n=>(n.wall(n.r-1,n.c)||n.wall(n.r+1,n.c))&&!(n.wall(n.r,n.c-1)&&n.wall(n.r,n.c+1));function vi(n,e,t){let{m:i}=n.kit,r=i.keyColor[e],s=new Te,o=1.1,a=.26;s.add(V(qe(1,.008,a+.08,i.dark),0,ne+.003,0)),s.add(V(qe(.98,.012,a,r),0,ne+.007,0));let l=new Te;l.add(V(qe(1,o,a,i.wood),0,o/2,0)),l.add(V(qe(1,.06,a+.02,i.iron),0,.34,0)),l.add(V(qe(1,.16,a+.02,r),0,.8,0)),l.add(V(qe(1,.1,a+.02,r),0,.06,0)),l.add(V(qe(1,.04,a+.02,r),0,o+.02,0)),l.add(V(qe(.16,.18,a+.04,i.iron),.24,.55,0)),l.add(Wi(V(He(.05,.05,a+.08,r,12),.24,.55,0))),l.traverse(h=>{h instanceof se&&(h.castShadow=h.receiveShadow=!0)});let c=h=>{l.position.y=-(o+.14)*h,l.visible=h<1};c(t?1:0);let u=Bd(n,[l]);return ac(n)&&(s.rotation.y=Math.PI/2),Ot(s,{half:.4,h:t?.02:o,tall:!t,open:c},u)}var bs=null;function iv(){if(bs)return bs;let n=128,e=document.createElement("canvas");e.width=e.height=n;let t=e.getContext("2d");t.fillStyle="#050302",t.fillRect(0,0,n,n);let i=(o,a,l,c,u,h,f,d,g)=>{let x=t.createLinearGradient(u,h,f,d);x.addColorStop(0,g),x.addColorStop(1,"#0a0604"),t.fillStyle=x,t.fillRect(o,a,l-o,c-a)},r=n*.2;i(0,0,n,r,0,0,0,r,"#6a5236"),i(0,n-r,n,n,0,n,0,n-r,"#2a1e14"),i(0,0,r,n,0,0,r,0,"#4a3826"),i(n-r,0,n,n,n,0,n-r,0,"#4a3826"),t.fillStyle="#1e160f",t.fillRect(r,r,n-2*r,n-2*r);let s=Dt(7);for(let o=0;o<14;o++)t.fillStyle=["#3a2c1e","#2c2116","#4a3a28"][o%3],t.beginPath(),t.ellipse(r+s()*(n-2*r),r+s()*(n-2*r),3+s()*5,2+s()*4,s()*3,0,Math.PI*2),t.fill();return bs=new xi(e),bs.colorSpace=yt,bs}function Fd(n,e){let{m:t}=n.kit,i=new Te,r=.7,s=.06,o=new se(new jt(1,r),new lt({map:iv()}));o.rotation.x=-Math.PI/2,i.add(V(o,0,ne+.004,0));for(let c of[-1,1])i.add(V(qe(1,.07,.15,t.paleStone),0,ne+.035,c*(r/2+.075))),i.add(V(qe(1,.012,.02,t.dark),0,ne+.072,c*(r/2+.005)));let a=[];for(let c=0;c<$l;c++){let u=-r/2+r*(c+.5)/$l;for(let h of[-1,1]){let f=V(He(s,s,.5,t.bronze,12),0,ne+.06,u);f.rotation.z=Math.PI/2,f.castShadow=f.receiveShadow=!0,f.userData.side=h,a.push(f)}}let l=c=>{for(let u of a)u.visible=c>.01,u.scale.y=Math.max(.01,c),u.position.x=u.userData.side*(.5-.25*c)};return l(e?1:0),ac(n)&&(i.rotation.y=Math.PI/2),Ot(i,{half:.5,h:.15,open:l},Bd(n,a))}function Bd(n,e){let t=new Te;return t.add(...e),ac(n)&&(t.rotation.y=Math.PI/2),[t]}function rv(n){let{m:e}=n.kit,t=new Te;for(let a=0;a<3;a++)t.add(V(qe(.25,.08,.9,e.stone),-.375+a*.25,ne-.04-a*.12,0));for(let a of[-1,1])t.add(V(qe(1,.7,.05,e.stone),0,ne-.35,a*.475));t.add(V(qe(.05,.7,.9,e.stone),.475,ne-.35,0));let i=V(new se(new jt(.25,.9),e.glow),.375,-.32,0);i.rotation.x=-Math.PI/2,t.add(i),t.add(V(qe(.3,.16,1.1,e.top),0,cn-.08,0));for(let a of[-1,1])t.add(V(qe(.16,cn-.16,.12,e.darkWood),0,(cn-.16)/2,a*.5));let r=[[0,-1],[-1,0],[1,0],[0,1]].find(([a,l])=>!n.wall(n.r+a,n.c+l)),[s,o]=r??[0,-1];return t.rotation.y=Math.atan2(s,-o),Ot(t,{half:.4,h:.3,tall:!0})}function zd(n,e){let{m:t}=n.kit,i=new Te;if(e){i.add(V(qe(.8,.72-.04,.8,t.dark),0,ne+.72/2,0));for(let s of[ne+.04,ne+.72-.04])i.add(V(qe(.92,.08,.92,t.darkWood),0,s,0));for(let s of[-1,1])for(let o of[-1,1])i.add(V(qe(.1,.72,.1,t.darkWood),s*.41,ne+.72/2,o*.41));for(let s=0;s<4;s++){let o=-.27+s*.18;for(let a of[-1,1])i.add(V(qe(.07,.72-.12,.05,t.wood),o,ne+.72/2,a*.43)),i.add(V(qe(.05,.72-.12,.07,t.wood),a*.43,ne+.72/2,o));i.add(V(qe(.07,.04,.8,t.wood),o,ne+.72-.01,0))}return Ot(i,{half:.46,h:.72+.1})}i.add(V(qe(.84,.02,.84,t.dark),0,ne+.005,0));for(let r of[-1,1])i.add(V(qe(.88,.04,.07,t.darkWood),0,ne+.02,r*.42)),i.add(V(qe(.07,.04,.88,t.darkWood),r*.42,ne+.02,0));for(let r=0;r<4;r++)i.add(V(qe(.08,.035,.8,t.wood),-.27+r*.18,ne+.018,0));return Ot(i,{half:.42,h:.06})}function Gd(n,e,t=.3){let i=new Te;return i.add(V(He(t,t+.03,.05,n,28),0,ne+.025,0)),i.add(V(He(t-.05,t-.04,.03,e,28),0,ne+.06,0)),i}function sv(n){let{m:e}=n.kit,t=new Te;t.add(V(He(.28,.31,.05,e.iron,24),0,ne+.025,0));let i=V(new se(new In(.21,20,10,0,Math.PI*2,0,Math.PI/2),e.brownButton),0,ne+.04,0);return i.scale.y=.55,t.add(i),Ot(t,{half:.3,h:.16})}function kd(n,e){let{m:t}=n.kit,i=Gd(t.bronze,e);return i.add(Wi(V(new se(new vn(.15,.018,8,32),t.cream),0,ne+.077,0))),i.add(V(He(.05,.055,.04,t.bronze,16),0,ne+.08,0)),Ot(i,{half:.3,h:.12})}function ov(n){let{m:e}=n.kit,t=Gd(e.bronze,e.dark,.34);for(let i=0;i<12;i++){let r=i/12*Math.PI*2;t.add(V(new se(new Yt(.028,.12,6),e.iron),Math.cos(r)*.22,ne+.13,Math.sin(r)*.22))}return t.add(V(He(.1,.11,.04,e.bronze,16),0,ne+.09,0)),Ot(t,{half:.34,h:.2})}function av(n){let{m:e}=n.kit,t=new Te;t.add(V(He(.07,.08,.03,e.gold,18),0,ne+.015,0));let i=Ot(t,{half:.4,h:.05}),r=new se(new jt(.9,.9),e.wreath);return r.rotation.x=-Math.PI/2,r.position.y=ne+.003,r.receiveShadow=!0,i.add(r),i}function lv(n){let{m:e}=n.kit,t=new Te;t.add(V(qe(.78,.04,.78,e.paleStone),0,ne+.02,0));for(let i of[-1,1])t.add(V(qe(.9,.09,.07,e.darkWood),0,ne+.045,i*.42)),t.add(V(qe(.07,.09,.9,e.darkWood),i*.42,ne+.045,0));return Ot(t,{half:.45,h:.1})}function cv(n){let{m:e}=n.kit,t=new Te;t.add(V(He(.36,.38,.06,e.bronze,32),0,ne+.03,0));let i=Ot(t,{half:.36,h:.1}),r=V(He(.3,.3,.02,e.swirl,32),0,ne+.065,0);return r.receiveShadow=!0,i.add(r),i.userData.loop=s=>{r.rotation.y=-s*1.6},i}function uv(n){let{m:e}=n.kit,t=new Te;t.add(V(He(.36,.38,.06,e.gold,32),0,ne+.03,0));let i=V(He(.3,.3,.02,e.hand,32),0,ne+.065,0);return i.rotation.y=Math.PI,t.add(i),Ot(t,{half:.36,h:.1})}function hv(n){let{m:e}=n.kit,t=new Te,i=[[0,0],[.12,0],[.2,.08],[.22,.2],[.18,.32],[.08,.4],[.07,.46],[.09,.48],[0,.48]].map(([a,l])=>new $(a,l));t.add(V(new se(new Er(i,24),e.clay),0,ne,0)),t.add(Wi(V(new se(new vn(.205,.012,6,28),e.dark),0,ne+.22,0)));let r=V(He(.012,.012,.12,e.dark,6),.02,ne+.53,0);r.rotation.z=-.3,t.add(r);let s=V(new se(new Yt(.035,.1,8),ti(16760928)),.04,ne+.62,0),o=Ot(t,{half:.22,h:.6},[s]);return o.userData.loop=a=>s.scale.set(1,1+.2*Math.sin(a*9),1),o}function jo(n,e){let{m:t}=n.kit,i=new Te;i.add(V(new se(new zn(.86,.36,.86,2,.03),t.darkWood),0,ne+.18,0)),i.add(V(qe(.64,.02,.64,t.dark),0,ne+.365,0));for(let a of[-1,1])for(let l of[-1,1])i.add(V(He(.03,.03,.02,t.gold,10),a*.37,ne+.365,l*.37));let r=new an;r.moveTo(0,.24),r.lineTo(.17,.04),r.lineTo(.07,.04),r.lineTo(.07,-.22),r.lineTo(-.07,-.22),r.lineTo(-.07,.04),r.lineTo(-.17,.04),r.closePath();let s=new se(new Bi(r,{depth:.025,bevelEnabled:!1}),t.gold);s.rotation.x=-Math.PI/2,s.position.y=ne+.37;let o=new Te;return o.add(s),o.rotation.y=e,i.add(o),Ot(i,{half:.43,h:.4})}function dv(n){let e=new Te,t=Dt(n.r*31+n.c),i=[];for(let s=0;s<5;s++){let o=.3+t()*.28,a=V(new se(new Yt(.08+t()*.05,o,7),ti(s%2?16738848:16756816,.8)),(t()-.5)*.55,ne+o/2,(t()-.5)*.55);i.push(a),e.add(a)}let r=t()*6.28;return e.userData={half:.4,h:.5,loop:s=>i.forEach((o,a)=>o.scale.set(1,1+.12*Math.sin(s*(6+a)+r+a),1))},e}var Hd={floor:kn,wall:kn,water:kn,ice:kn,dirt:kn,gravel:kn,"force-up":kn,"force-down":kn,"force-left":kn,"force-right":kn,exit:rv,fire:dv,"gate-closed":n=>Fd(n,!1),"gate-open":n=>Fd(n,!0),safe:av,button:sv,trap:ov,popup:lv,teleport:cv,thief:uv,bomb:hv,"toggle-open":n=>zd(n,!1),"toggle-closed":n=>zd(n,!0),"door-red":n=>vi(n,"red",!1),"door-blue":n=>vi(n,"blue",!1),"door-yellow":n=>vi(n,"yellow",!1),"door-green":n=>vi(n,"green",!1),"door-red-sill":n=>vi(n,"red",!0),"door-blue-sill":n=>vi(n,"blue",!0),"door-yellow-sill":n=>vi(n,"yellow",!0),"door-green-sill":n=>vi(n,"green",!0),"button-brown":n=>kd(n,n.kit.m.brownButton),"button-red":n=>kd(n,n.kit.m.redButton),"clone-up":n=>jo(n,0),"clone-left":n=>jo(n,Math.PI/2),"clone-down":n=>jo(n,Math.PI),"clone-right":n=>jo(n,-Math.PI/2)};function bi(n,e){n.traverse(t=>{if(!(t instanceof se))return;t.geometry.dispose();let i=Array.isArray(t.material)?t.material:[t.material];for(let r of i)e.keeps.has(r)||r.dispose()})}var en=(n,e,t=16,i=12)=>new se(new In(n,t,i),e);function Xd(n,e,t){let i=new an;i.moveTo(n[0][0],n[0][1]);for(let[s,o]of n.slice(1))i.lineTo(s,o);i.closePath();let r=new Bi(i,{depth:e,bevelEnabled:!1,curveSegments:6});return r.translate(0,0,-e/2),new se(r,t)}function Ms(n,e,t,i,r=0,s=[]){let o=t.h*i;e.position.y-=ne;let a=new Te;a.position.set(0,ne,o/2*Math.sin(r)),a.rotation.x=-r,a.scale.setScalar(i),a.add(e);let l=new Te;return l.add(a),Qo(n,Ot(l,{...t,half:Math.max(t.half*i,o/2*Math.sin(r)),h:o*Math.cos(r),back:o*Math.sin(r)/2},s))}var lc=.45,fv=.035;function qd(n,e){return n.rotation.x=-Math.PI/2,n.position.y=ne+e,n.userData.live=!0,n}var ta=(n,e=.42)=>qd(new se(new Ro(e,32),n.m.itemShade),.006);function Bn(n,e,t,i,r=0){let s=un().items==="plate",o=[ta(n,s?lc:.42)];return s&&o.push(qd(new se(new _i(lc-fv,lc,48),n.m.itemRing),.008)),Ms(n,e,t,s?i*1.12:i,r,o)}function pv(n){let{m:e}=n,t=new Te;t.add(V(He(.11,.13,.04,e.bronze,18),0,ne+.02,0)),t.add(V(He(.02,.022,.66,e.darkWood,8),0,ne+.35,0)),t.add(V(en(.03,e.gold,10,8),0,ne+.7,0));for(let i of[-1,1]){let r=Xd([[.02,.05],[.12,.08],[.21,.17],[.16,0],[.21,-.17],[.12,-.08],[.02,-.05]].map(([s,o])=>[i*s,o]),.03,e.gold);t.add(V(r,0,ne+.5,0))}return t.add(V(He(.035,.035,.12,e.gold,10),0,ne+.5,0)),Bn(n,t,{half:.22,h:.72},1.2,.85)}function ea(n,e){let{m:t}=n,i=new Te;i.add(V(new se(new vn(.075,.03,10,20),t.keyColor[e]),0,.2,0)),i.add(Wi(V(He(.05,.05,.034,t.keyColor[e],16),0,.2,0))),i.add(V(qe(.035,.24,.03,t.bronze),0,0,0)),i.add(V(qe(.07,.03,.03,t.bronze),.035,-.08,0)),i.add(V(qe(.05,.03,.03,t.bronze),.025,-.03,0)),i.position.y=ne+.2,i.rotation.z=.25;let r=new Te;return r.add(i),Bn(n,r,{half:.12,h:.42},2.05,1.1)}function mv(n){let{m:e}=n,t=new Te,i=new an;i.moveTo(0,0),i.bezierCurveTo(.08,.02,.1,.2,.07,.32),i.lineTo(-.07,.32),i.bezierCurveTo(-.1,.2,-.08,.02,0,0);let r=new Bi(i,{depth:.025,bevelEnabled:!1});for(let s of[-1,1]){let o=new se(r,e.teal);o.rotation.x=-Math.PI/2+.35,o.rotation.z=s*.2,o.position.set(s*.1,ne+.03,.14),t.add(o),t.add(V(qe(.1,.07,.1,e.teal),s*.1,ne+.06,.14))}return Bn(n,t,{half:.24,h:.2},1.8)}function cc(n,e,t,i){let r=new Te;for(let s of[-1,1]){let o=new Te,a=i?.(o)??0;o.add(V(qe(.09,.2,.09,e),0,a+.12,0)),o.add(V(qe(.09,.06,.17,e),0,a+.03,.04)),o.add(V(qe(.1,.045,.1,t),0,a+.225,0)),o.position.set(s*.09,ne,0),o.rotation.y=s*.2,r.add(o)}return r}function gv(n){let{m:e}=n,t=cc(n,e.boot,e.bootTrim,i=>(i.add(V(new se(new Yt(.025,.07,6),e.gold),0,.11,.05)),0));return Bn(n,t,{half:.2,h:.28},1.9,.7)}function xv(n){let{m:e}=n,t=cc(n,e.skate,e.cream,i=>{i.add(V(qe(.02,.05,.24,e.steel),0,.025,.04));for(let r of[-.04,.12])i.add(V(qe(.03,.03,.03,e.steel),0,.05,r));return .05});return Bn(n,t,{half:.2,h:.32},1.8,.7)}function _v(n){let{m:e}=n,t=cc(n,e.suction,e.bootTrim,i=>(i.add(V(He(.1,.07,.035,e.bronze,18),0,.018,.03)),.035));return Bn(n,t,{half:.22,h:.3},1.8,.7)}function yv(n){let{m:e}=n,t=new Te,i=new Te;i.position.set(0,ne+.32,0),i.rotation.x=-.25,i.add(Wi(He(.13,.13,.02,e.mirror,28))),i.add(new se(new vn(.13,.02,8,28),e.bronze));let r=V(en(.045,e.gorgon,12,10),0,0,.012);r.scale.z=.5,i.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;i.add(V(en(.014,e.gorgon,6,5),Math.cos(o)*.08,Math.sin(o)*.08,.012))}return t.add(i),t.add(V(He(.018,.025,.2,e.bronze,8),0,ne+.1,0)),t.add(V(He(.08,.09,.025,e.bronze),0,ne+.012,0)),Bn(n,t,{half:.18,h:.48},1.55,.9)}function vv(n){let{m:e}=n,t=new Te;t.add(V(He(.24,.22,.03,e.bronze,24),0,ne+.015,0)),t.add(V(He(.17,.19,.16,e.cake,24),0,ne+.11,0)),t.add(V(He(.165,.17,.02,e.cream,24),0,ne+.2,0));for(let i=0;i<8;i++){let r=i/8*Math.PI*2;t.add(V(en(.022,e.cream,8,6),Math.cos(r)*.12,ne+.215,Math.sin(r)*.12))}return t.add(V(en(.035,e.cake,10,8),0,ne+.22,0)),Bn(n,t,{half:.24,h:.26},1.4,.35)}function Vd(n,e,t=0,i=!1){let{m:r}=n,s=new Te;s.add(V(qe(.56,.05,.3,r.wood),0,.1,0));for(let l of[-1,1])for(let c of[-1,1])s.add(Wi(V(He(.07,.07,.03,r.darkWood,14),l*.2,.07,c*.165))),s.add(V(He(.028,.025,.14,r.hide,8),l*.16,.18,c*.08));s.add(V(new se(new zn(.46,.22,.24,2,.05),r.hide),0,.34,0));for(let[l,c,u,h]of[[-.1,0,.3,1],[.1,.05,.3,1],[-.04,.12,1,.3],[.12,-.12,1,.3],[-.14,-.12,1,.3]]){let f=V(en(.075,r.patch,10,8),l,h===1?.44:.35,c);f.scale.set(1,u,h),s.add(f)}s.add(V(new se(new zn(.14,.15,.15,2,.03),r.hide),.29,.43,0)),s.add(V(qe(.06,.08,.12,r.snout),.37,.4,0));for(let l of[-1,1]){let c=V(new se(new Yt(.02,.08,6),r.ivory),.28,.53,l*.06);c.rotation.x=l*.5,s.add(c)}let o=V(He(.012,.012,.16,r.patch,6),-.25,.36,0);o.rotation.z=-.4,s.add(o),s.position.y=ne,s.rotation.y=.5;let a=new Te;return a.add(s),(i?Bn:Ms)(n,a,{half:.32,h:.56},e,t)}function bv(n){let{m:e}=n,t=new Te;t.add(V(qe(.26,.008,.14,e.parchment),.02,ne+.006,.08));let i=V(He(.06,.06,.34,e.parchment,14),0,ne+.06,-.02);i.rotation.z=Math.PI/2,t.add(i);for(let s of[-1,1]){let o=V(He(.035,.035,.012,e.darkWood,10),s*.172,ne+.06,-.02);o.rotation.z=Math.PI/2,t.add(o)}let r=V(He(.064,.064,.05,e.cloak,14),-.08,ne+.06,-.02);return r.rotation.z=Math.PI/2,t.add(r),t.rotation.y=.3,Bn(n,t,{half:.2,h:.14},1.9,.5)}function Mv(n){let e=new Te;return e.add(V(new se(new zn(.84,.8,.84,3,.05),n.m.block),0,ne+.4,0)),Ot(e,{half:.42,h:.9})}function Sv(n){let{m:e}=n,t=new Te,i=ne+.22;t.add(V(en(.22,e.bronze,24,16),0,i,0));let r=V(new se(new vn(.222,.012,6,32),e.gold),0,i,0);r.rotation.y=Math.PI/2,t.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;t.add(V(en(.022,e.gold,6,5),Math.cos(o)*.222,i,Math.sin(o)*.222)),s%2===0&&t.add(V(en(.02,e.gold,6,5),0,i+Math.cos(o+.3)*.224,Math.sin(o+.3)*.224))}return Ms(n,t,{half:.24,h:.46},1.45,0,[ta(n)])}function wv(n){let{m:e}=n,t=new Te,i=ne+.4,r=V(en(.12,e.feather,16,12),0,i,-.02);r.scale.set(.9,1.15,.85),t.add(r),t.add(V(en(.075,e.skin,14,10),0,i+.17,.03));let s=V(en(.082,e.furDark,14,8),0,i+.19,.01);s.scale.set(1,.8,1),t.add(s);for(let a of[-1,1]){t.add(V(en(.012,e.dark,6,5),a*.028,i+.18,.1));let l=Xd([[.06,.08],[.24,.16],[.4,.14],[.38,.06],[.33,.08],[.33,-.01],[.26,.02],[.24,-.08],[.17,-.03],[.12,-.1],[.06,-.04]].map(([c,u])=>[a*c,u]),.025,e.feather);l.position.set(0,i+.04,-.04),l.rotation.x=-.9,t.add(l),t.add(V(He(.014,.012,.16,e.bootTrim,6),a*.04,i-.18,.02))}let o=V(new se(new Yt(.06,.16,6),e.feather),0,i-.1,-.12);return o.rotation.x=-2.4,t.add(o),Ms(n,t,{half:.36,h:.66},1.05,0,[ta(n)])}var Wd=1.35;function Ev(n){let e=new Te;e.add(V(en(.13,n.m.bootTrim,12,8),0,ne+.14,0));let t=[],i=V(en(.16,ti(13647888,.5),16,12),0,ne+.17,0);t.push(i);for(let o=0;o<7;o++){let a=o/7*Math.PI*2,l=.24+o%3*.06,c=V(new se(new Yt(.08,l,7),ti(o%2?13122060:14182424,.7)),Math.cos(a)*.12,ne+l/2+.04,Math.sin(a)*.12);c.rotation.z=-Math.cos(a)*.3,c.rotation.x=Math.sin(a)*.3,t.push(c)}let r=new Te;for(let o of t)o.position.y-=ne;r.add(...t),r.position.y=ne,r.scale.setScalar(Wd),r.userData.live=!0;let s=Ms(n,e,{half:.26,h:.5},Wd,0,[r,ta(n)]);return s.userData.loop=o=>t.forEach((a,l)=>a.scale.set(1,1+.15*Math.sin(o*(7+l)+l*1.7),1)),s}var na={relic:pv,"key-red":n=>ea(n,"red"),"key-blue":n=>ea(n,"blue"),"key-yellow":n=>ea(n,"yellow"),"key-green":n=>ea(n,"green"),flippers:mv,"fire-boots":gv,skates:xv,suction:_v,mirror:yv,cake:vv,cow:n=>Vd(n,1.1,.35,!0),"cow-standing":n=>Vd(n,1.1),page:bv,block:Mv,ball:Sv,glider:wv,fireball:Ev};var ni=(n,e,t=16,i=12)=>new se(new In(n,t,i),e);function Zd(n,e,t,i=1.3,r=[]){e.scale.setScalar(i),e.position.y=ne;let s=new Te;return s.add(e),Qo(n,Ot(s,t,r))}function Tv(n,e,t){let i=[];for(let s of e.children){if(!(s instanceof se)||s.userData.live||s.material===n.m.outline)continue;let o=s.material;o.stencilWrite=!0,o.stencilRef=1,o.stencilZPass=lh;let a=new se(s.geometry,n.m.heroXray);a.renderOrder=20,a.userData.live=!0,i.push(a)}let r=new se(new yn(.16,.24,2.2,24,1,!0),n.m.heroBeam);r.position.y=ne+t+.25+1.1,r.renderOrder=21,r.userData.live=!0,e.add(...i,r)}var uc=1.45;function Av(n){let{m:e}=n,t=new Te;for(let u of[-1,1])t.add(V(He(.045,.04,.28,e.heroSkin),u*.065,.14,0)),t.add(V(qe(.07,.05,.12,e.heroLeather),u*.065,.025,.02));t.add(V(He(.13,.2,.22,e.heroTunic),0,.35,0)),t.add(V(He(.155,.13,.22,e.heroTunic),0,.55,0)),t.add(V(He(.16,.16,.035,e.heroLeather),0,.45,0));let i=V(qe(.3,.44,.03,e.heroCloak),0,.44,-.14);i.rotation.x=.12,t.add(i);for(let u of[-1,1]){let h=V(He(.04,.035,.26,e.heroSkin),u*.19,.5,.02);h.rotation.z=u*.18,t.add(h)}t.add(V(ni(.095,e.heroSkin),0,.75,0)),t.add(V(new se(new In(.103,18,10,0,Math.PI*2,0,Math.PI/2),e.heroHair),0,.765,-.012));let r=V(He(.15,.15,.03,e.bronze,24),-.26,.5,.04);r.rotation.z=Math.PI/2,t.add(r);let s=V(He(.06,.06,.035,e.heroCloak,16),-.275,.5,.04);s.rotation.z=Math.PI/2,t.add(s);let o=V(qe(.03,.34,.012,e.steel),.23,.5,.1);o.rotation.x=.5,t.add(o),t.add(V(qe(.09,.02,.03,e.bronze),.23,.37,.03));let a=(u,h,f,d)=>{let g=new se(new _i(u,h,48),f);return g.rotation.x=-Math.PI/2,g.position.y=ne+d,g.userData.live=!0,g},l=[a(.33,.47,e.heroRingEdge,.01),a(.36,.44,e.heroRing,.012)],c=Zd(n,t,{half:.26*uc/1.3,h:1.2*uc/1.3},uc,l);return un().beacon&&Tv(n,c,c.userData.h),c}var hc=1.08,Rv=.24;function Yd(n,e){let{m:t}=n,i=x=>e?t.statue:x,r=i(t.fur),s=e?t.statueDark:t.furDark,o=new Te;for(let x of[-1,1]){let p=x*-.05;o.add(V(He(.06,.068,.05,i(t.hoof)),x*.13,.025,p+.01));let m=V(He(.05,.06,.26,r),x*.125,.18,p);m.rotation.z=x*.04,o.add(m);let v=V(He(.09,.062,.26,r),x*.11,.42,p*.6);v.rotation.z=-x*.1,o.add(v)}o.add(V(He(.15,.2,.14,i(t.kilt)),0,.54,0));let a=V(new se(new vn(.155,.02,8,24),i(t.gold)),0,.605,0);a.rotation.x=Math.PI/2,o.add(a);let l=V(new Te,0,.6,0);l.rotation.x=Rv,o.add(l),l.add(V(He(.21,.15,.2,r),0,.09,0));let c=V(ni(.25,r),0,.29,.01);c.scale.set(1.42,.85,.92),l.add(c);let u=V(ni(.17,s),0,.42,-.06);u.scale.set(1.5,.66,1),l.add(u);for(let x of[-1,1]){l.add(V(ni(.12,r),x*.29,.39,0));let p=V(He(.088,.072,.26,r),x*.325,.24,.01);p.rotation.z=x*.1,l.add(p);let m=V(He(.074,.06,.24,r),x*.335,.04,.07);m.rotation.x=-.45,l.add(m),l.add(V(ni(.072,s),x*.33,-.08,.13)),l.add(V(He(.076,.076,.035,i(t.gold)),x*.33,.14,.03))}let h=V(new Te,0,.45,.13);h.rotation.x=.3,l.add(h);let f=ni(.125,s);f.scale.set(1.05,.95,1.15),h.add(f);let d=V(ni(.085,i(t.snout)),0,-.05,.12);d.scale.set(1.1,.8,.95),h.add(d),h.add(V(new se(new vn(.035,.008,6,16),i(t.gold)),0,-.1,.19));for(let x of[-1,1]){h.add(V(ni(.02,e?t.statueDark:t.eye,8,6),x*.065,.03,.115));let p=V(ni(.04,s),x*.14,.02,-.03);p.scale.set(1.3,.6,.8),h.add(p);let m=new rs([new I(x*.08,.06,0),new I(x*.24,.07,-.03),new I(x*.37,.15,.01),new I(x*.42,.3,.1)]);h.add(new se(new Co(m,20,.036,8),i(t.ivory)));let v=V(new se(new Yt(.036,.11,8),i(t.ivory)),x*.425,.36,.125);v.rotation.x=.35,v.rotation.z=-x*.15,h.add(v)}let g=new Te;g.add(He(.02,.02,1,i(t.iron),8));for(let x of[-1,1]){let p=new se(new yn(.17,.17,.022,24,1,!1,0,Math.PI),i(t.steel));p.rotation.z=Math.PI/2,p.rotation.y=x>0?0:Math.PI,p.position.set(0,.36,0),p.scale.set(1,1,.8),g.add(p)}return g.rotation.set(-.12,Math.PI/2,0),g.position.set(.33,.1,.13),l.add(g),Zd(n,o,{half:.42*hc/1.3,h:1.6*hc/1.3},hc)}var dc={theseus:Av,minotaur:n=>Yd(n,!1),"minotaur-stone":n=>Yd(n,!0)},Cv={...na,...dc},Pv=new Set([...Ed,"ball","glider","fireball"]),Iv={down:0,up:Math.PI,right:Math.PI/2,left:-Math.PI/2},Lv=1.5,Dv=.05,Kd={y:.37,scale:.7},Uv=n=>Math.atan2(Math.sin(n),Math.cos(n));function Jd(n,e){let t=new Te,i=[],r=(d,g,x)=>{let p=hd(d),m=x.userData;return p?e.make(p,g,m.h,m.back??0):null};function s(d){d.foot.set(d.obj.position.x,ne+d.y,d.obj.position.z)}function o(d){let g=Cv[d.model](n);return d.id?.startsWith("machine")&&g.scale.setScalar(Kd.scale),t.add(g),g}function a(d,g){let x=d.id?.startsWith("machine")?Kd.y:0,p=o(d),m=new I;return{model:d.model,id:d.id,obj:p,marker:r(d,m,p),foot:m,r:d.r,c:d.c,yaw:g,goal:g,y:x}}function l(d){t.remove(d.obj),bi(d.obj,n),d.marker&&e.group.remove(d.marker)}function c(d,g){l(d),d.model=g.model,d.obj=o(g),d.marker=r(g,d.foot,d.obj)}function u(d,g,x,p){let m=!1,v=new Set(i),_=new Map,b=new Map(i.filter(C=>C.id).map(C=>[C.id,C]));for(let C of d){let y=C.id?b.get(C.id):void 0;y&&(v.delete(y),_.set(C,y))}let E=[];for(let C of d)if(!_.has(C))for(let y of v){let M=Math.hypot(y.r-C.r,y.c-C.c);y.model===C.model&&M<=Lv&&E.push([M,C,y])}E.sort((C,y)=>C[0]-y[0]);for(let[,C,y]of E)_.has(C)||!v.has(y)||(v.delete(y),y.id=C.id,_.set(C,y));for(let C of v)l(C),m=!0;let S=d.find(C=>C.model==="theseus"),A=[];for(let C of d){let y=_.get(C);if(!y){let F=C.dir?Iv[C.dir]:C.id==="minotaur"&&S?Math.atan2(S.c-C.c,S.r-C.r):0;y=a(C,F),m=!0}y.model!==C.model&&(c(y,C),m=!0);let M=C.r-y.r,D=C.c-y.c;Math.abs(M)+Math.abs(D)>1e-6&&(Pv.has(y.model)&&(y.goal=Math.atan2(D,M)),m=!0),y.r=C.r,y.c=C.c,p&&(y.yaw=y.goal),y.obj.position.set(Ct(y.c,g),y.y,Pt(y.r,x)),y.obj.rotation.y=y.yaw,s(y),A.push(y)}return i=A,m}function h(d,g){let x=!1;for(let p of i){let m=Uv(p.goal-p.yaw);if(Math.abs(m)<.001){p.yaw=p.goal,p.obj.rotation.y=p.yaw;continue}p.yaw=g?p.goal:p.yaw+m*(1-Math.exp(-d/Dv)),p.obj.rotation.y=p.yaw,x=!0}return x}function f(){for(let d of i)l(d);i=[]}return{group:t,set:u,ease:h,seen(){let d=x=>{let p=x.obj.userData;return{x:x.obj.position.x,z:x.obj.position.z,half:p.half,h:p.h}},g=i.find(x=>x.model==="theseus");return{hero:g?d(g):null,rest:i.filter(x=>x!==g).map(d)}},hero:()=>i.find(d=>d.model==="theseus")?.obj??null,loop(d){for(let g of i)g.obj.userData.loop?.(d)},looping:()=>i.flatMap(d=>d.marker||d.obj.userData.loop?[d.obj]:[]),clear:f,dispose:f}}var tf=.8,jd=ne+tf-yi,Qd=9,Fv=9,ef=13823214;function nf(n){let e=new Te,t=new Tr(.05,0),i=new _i(.82,1,40);i.rotateX(-Math.PI/2);let r=new Map,s=0,o=(u,h)=>{u.block.position.y=yi+h-(ne+tf)};function a(u){let h=u.splash;if(h){for(let f of[h.ring,...h.drops])e.remove(f),f.material.dispose();u.splash=null}}function l(u,h,f){let d=Dt(u*2246822519+5),g=new se(i,new lt({color:ef,transparent:!0,depthWrite:!1}));g.position.set(h,yi+.004,f),g.scale.setScalar(.35),e.add(g);let x=[],p=[];for(let m=0;m<Qd;m++){let v=(m+d()*.6)/Qd*Math.PI*2,_=.55+d()*.45;p.push([Math.cos(v)*_,Math.sin(v)*_,1.6+d()*.8]);let b=new se(t,new lt({color:ef,transparent:!0,depthWrite:!1}));b.position.set(h,yi,f),e.add(b),x.push(b)}return{t0:null,ring:g,drops:x,flight:p}}function c(u){let h=r.get(u);h&&(a(h),e.remove(h.block),bi(h.block,n),r.delete(u))}return{group:e,set(u,h,f,d){let g=!1,x=new Set(u);for(let p of[...r.keys()])x.has(p)||(c(p),g=!0);for(let p of u){if(r.has(p))continue;let m=Ct(p%h,h),v=Pt(Math.floor(p/h),f),_=na.block(n);_.position.set(m,0,v),e.add(_);let b={block:_,x:m,z:v,splash:d?l(p,m,v):null};o(b,d?jd:.065+s),r.set(p,b),g=!0}return g},splashing:()=>[...r].filter(([,u])=>u.splash).map(([u])=>u),frame(u){let h=!1;for(let f of r.values()){let d=f.splash;if(!d)continue;d.t0??=u;let g=(u-d.t0)/1e3;if(g>=Math.max(.4,.25+.35)){a(f),o(f,.065+s);continue}h=!0,o(f,id(g,jd));let x=Math.min(1,g/.4);d.ring.scale.setScalar(.35+.35*(1-(1-x)**2)),d.ring.material.opacity=.75*(1-x),d.drops.forEach((p,m)=>{let[v,_,b]=d.flight[m],E=yi+b*g-Fv/2*g*g;p.visible=x<1&&E>=yi,p.position.set(f.x+v*g,E,f.z+_*g),p.material.opacity=.9*(1-x*x)})}return h},loop(u,h){s=rd(u,h);for(let f of r.values())f.splash||o(f,.065+s)},cells:()=>[...r.keys()].sort((u,h)=>u-h),clear(){for(let u of[...r.keys()])c(u)},dispose(){this.clear(),t.dispose(),i.dispose()}}}var zv=Math.PI/6;function rf(){let n=new Pn,e=new Te,t=ds/2,i=Vo,r=new Er([new $(0,0),new $(t,i*.6),new $(0,i)],6),s=new Map,o=un().items==="white";for(let[f,d]of Object.entries(ld)){let g=o&&f==="item"?16777215:d;s.set(f,new Po({color:g,emissive:g,emissiveIntensity:.45,specular:16777215,shininess:80,flatShading:!0,transparent:!0,opacity:.9,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1}))}let a=new lt({color:cd,side:Lt,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1});a.onBeforeCompile=f=>{f.vertexShader=f.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${o?"0.04":"0.022"};`)};let l=new ei(16777215,2.2);n.add(new Lo(16777215,.7),l,e);let c=new I,u=new I,h=new I;return{scene:n,group:e,make(f,d,g,x=0){let p=new se(r,s.get(f));p.userData={kind:f,foot:d,h:g,back:x},p.renderOrder=10;let m=new se(r,a);return m.renderOrder=9,p.add(m),e.add(p),p},place(f,d,g,x,p){let m=ud(p);c.setFromMatrixColumn(f.matrixWorld,0),u.setFromMatrixColumn(f.matrixWorld,1),h.setFromMatrixColumn(f.matrixWorld,2),l.position.copy(h).multiplyScalar(3).addScaledVector(u,2).addScaledVector(c,-1.5);let v=fd(g,x);for(let _ of e.children){let b=_.userData;_.position.copy(b.foot).addScaledVector(u,dd(b.h,d,b.back)+v),_.quaternion.copy(f.quaternion),_.rotateY(zv),_.scale.setScalar(m)}return m},dispose(){e.clear(),r.dispose();for(let f of s.values())f.dispose();a.dispose()}}}var kv={"door-red":ia,"door-blue":ia,"door-yellow":ia,"door-green":ia,"gate-closed":sf,"gate-open":sf,exit:(n,e)=>ii(new bn(16751168,4,4,1.6),n,.4,e)};function ia(n,e){return ii(new bn(16756848,1.6,2.6,1.8),n,.9,e+.6)}function sf(n,e){return ii(new bn(16760944,1.2,2.5,1.8),n,1,e)}function ii(n,e,t,i){return n.position.set(e,t,i),n}var of=n=>n.endsWith("-sill")?"sill":n.startsWith("door")?"door":n.startsWith("gate")?"gate":n;function af(n,e,t,i,r){let{m:s}=n,o=new Te,a=[];o.add(new Pr(10131616,2761760,2.4));let l=Math.hypot(i,t)/2+1.5,c=new ei(11581648,1.6);c.position.set(-6,14,8),c.castShadow=!0,c.shadow.mapSize.set(2048,2048),Object.assign(c.shadow.camera,{left:-l,right:l,top:l,bottom:-l,near:1,far:40+l}),c.shadow.camera.updateProjectionMatrix(),c.shadow.bias=-8e-4,o.add(c,c.target);let u=new bn(16758904,5.5,5.5,1.6);u.castShadow=!0,u.shadow.mapSize.set(512,512),u.shadow.bias=-.004,o.add(u);let h=[],f=[],d=Math.min(8,Math.max(3,Math.round(t*i/37))),g=["s","e","w","n"],x=[];for(let E of r)for(let S of g){let[A,C]=Sn[S].d,y=E.r+A,M=E.c+C;y<0||M<0||y>=t||M>=i||e[y*i+M]!=="floor"||x.push({w:E,k:S,r:y,c:M,pri:g.indexOf(S)})}x.sort((E,S)=>E.pri-S.pri||E.r-S.r||E.c-S.c);let p=[];for(let E of x){if(p.length>=d)break;p.some(S=>Math.max(Math.abs(S.r-E.r),Math.abs(S.c-E.c))<4)||p.push(E)}let m=new ts({map:s.halo,blending:Oi,depthWrite:!1,transparent:!0,opacity:.55});a.push(m),p.forEach(({w:E,k:S},A)=>{let[C,,y]=Sn[S].n,M=new Te;M.position.set(E.x+C*.5,0,E.z+y*.5),M.add(ii(new se(new on(.08,.2,.08),s.iron),C*.04,.82,y*.04)),M.add(ii(new se(new yn(.05,.03,.12,8),s.iron),C*.1,.92,y*.1));let D=ii(new se(new Yt(.055,.2,8),ti(16747056)),C*.1,1.07,y*.1),F=ii(new se(new Yt(.03,.12,8),ti(16769184)),C*.1,1.04,y*.1);a.push(D.material,F.material);let K=new vo(m);K.scale.setScalar(.7),K.position.set(C*.12,1.05,y*.12),M.add(D,F,K);for(let O of M.children)O instanceof se&&O.material===s.iron&&(O.castShadow=!0);o.add(M);let P=ii(new bn(16754788,4,6,1.7),M.position.x+C*.45,1.05,M.position.z+y*.45);o.add(P),f.push({g:M,flames:[D,F],halo:K,light:P,base:4,ph:A*2.39}),h.push(new I(M.position.x,1,M.position.z))});let v=[],_=[];e.forEach((E,S)=>{if(E!=="fire")return;let A=Math.floor(S/i),C=S%i,y=_.at(-1);y&&y.r===A&&y.c1===C-1?y.c1=C:_.push({r:A,c0:C,c1:C}),h.push(new I(Ct(C,i),ne+.2,Pt(A,t)))});for(let E of _){let S=E.c1-E.c0+1,A=ii(new bn(16742960,3+S*1.2,3+S*.8,1.6),(Ct(E.c0,i)+Ct(E.c1,i))/2,.8,Pt(E.r,t));o.add(A),v.push({light:A,base:A.intensity,ph:E.r})}e.forEach((E,S)=>{(E==="water"||E==="teleport")&&h.push(new I(Ct(S%i,i),ne,Pt(Math.floor(S/i),t)))});let b=new Map;return e.forEach((E,S)=>{let A=kv[E];if(!A)return;let C=A(Ct(S%i,i),Pt(Math.floor(S/i),t));o.add(C),b.set(S,{light:C,base:C.intensity,kind:of(E)})}),{group:o,anchors:h,hero(E,S){u.position.set(E,1.5,S+.1)},setMode(E){for(let S of f)S.g.visible=E!=="low",S.light.position.y=E==="low"?.7:1.05},piece(E,S){let A=b.get(E);A&&(A.light.intensity=of(S)===A.kind?A.base:0)},shadows(E){c.castShadow=E,u.castShadow=E},loop(E){for(let S of f){let A=1+.07*Math.sin(E*7.1+S.ph)+.04*Math.sin(E*12.7+S.ph*2);S.flames.forEach(C=>C.scale.set(1,A,1)),S.light.intensity=S.base*(1+.1*Math.sin(E*6.3+S.ph)+.05*Math.sin(E*11.1))}m.opacity=.5+.06*Math.sin(E*5);for(let S of v)S.light.intensity=S.base*(1+.1*Math.sin(E*5.7+S.ph))},dispose(){o.traverse(E=>{E instanceof se&&E.geometry.dispose(),(E instanceof ei||E instanceof bn)&&E.shadow.map?.dispose()});for(let E of a)E.dispose()}}}var pc={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new $(1/1024,1/512)}},vertexShader:`

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
	`};var Bv="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",Gv=`
uniform sampler2D tDiffuse; uniform float exposure; uniform vec2 res; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
void main(){
  vec3 col = pow(aces(texture2D(tDiffuse, vUv).rgb * exposure), vec3(1.0/2.2));
  float l = dot(col, vec3(.2126, .7152, .0722));
  col = col * vec3(1.02, 1.0, 0.96) + vec3(0.018, 0.009, 0.0) * (1.0 - l);
  vec2 q = (vUv - 0.5) * vec2(res.x / res.y, 1.0);
  col *= 1.0 - 0.5 * smoothstep(0.35, 0.95, length(q));
  gl_FragColor = vec4(col, 1.0);
}`;function lf(n){let e=new Fn(-1,1,1,-1,0,1),t=new xn({uniforms:{tDiffuse:{value:null},exposure:{value:1.4},res:{value:new $(1,1)}},vertexShader:Bv,fragmentShader:Gv,depthTest:!1,depthWrite:!1}),i=new xn({uniforms:{tDiffuse:{value:null},resolution:{value:new $}},vertexShader:pc.vertexShader,fragmentShader:pc.fragmentShader,depthTest:!1,depthWrite:!1}),r=new se(new jt(2,2),t);r.frustumCulled=!1;let s=new Pn;s.add(r);let o=new $t(1,1,{type:Fi,samples:4,stencilBuffer:!0}),a=new $t(1,1);return{setSize(l,c){o.setSize(l,c),a.setSize(l,c),t.uniforms.res.value.set(l,c),i.uniforms.resolution.value.set(1/l,1/c)},render(l,c,u){n.setRenderTarget(o),n.render(l,c),r.material=t,t.uniforms.tDiffuse.value=o.texture,n.setRenderTarget(u?a:null),n.render(s,e),u&&(r.material=i,i.uniforms.tDiffuse.value=a.texture,n.setRenderTarget(null),n.render(s,e))},dispose(){o.dispose(),a.dispose(),t.dispose(),i.dispose(),r.geometry.dispose()}}}var cf=9382175,Hv=12271921,Vv=16765503,uf=1836034,oa=.03,mc=ne+.035,aa=mc+oa+.01,hf=aa+.006,Wv=.42,Xv=.2,qv=.2,df=1.32,ra={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function sa(n){let e=Wv*n,t=Xv*n,i=new an;return i.moveTo(e/2,0),i.lineTo(-e/2,t),i.lineTo(-e/4,0),i.lineTo(-e/2,-t),i.closePath(),new Ar(i).rotateX(-Math.PI/2).translate(qv,0,0)}function ff(){let n=new Te,e=new Ln({color:cf,roughness:.7,emissive:cf,emissiveIntensity:.35}),t=new lt({color:Hv}),i=new lt({color:uf}),r=new lt({color:Vv,depthTest:!1}),s=new lt({color:uf,depthTest:!1}),o=[],a=null,l="",c=()=>{for(let h of o)h.parent?.remove(h),h.geometry.dispose();o.length=0,a&&n.remove(a.mesh),a=null},u=(h,f)=>{if(h.length===0)return null;let d=h.map(x=>x.index?x.toNonIndexed():x),g=new se($o(d),f);return h.forEach(x=>x.dispose()),d.forEach(x=>x.dispose()),o.push(g),n.add(g),g};return{group:n,set(h,f,d){let g=h&&h.length>1?`${f}x${d}:${h.map(E=>`${E.jump?"^":""}${E.r},${E.c}${E.way??""}`).join(" ")}`:"";if(g===l)return!1;if(l=g,c(),!h||h.length<2)return!0;let x=h.map(E=>[Ct(E.c,f),Pt(E.r,d)]),p=[],m=[],v=[];x.forEach(([E,S],A)=>{p.push(new In(oa,8,6).translate(E,mc,S));let C=ms(h,A);if(!C)return;let[y,M]=x[A+1],D=y-E,F=M-S,K=Math.hypot(D,F),P=new yn(oa,oa,K,8,1,!0);P.rotateZ(Math.PI/2),P.rotateY(-Math.atan2(F,D)),P.translate(E+D/2,mc,S+F/2),p.push(P),A!==0&&(v.push(sa(df).rotateY(-ra[C]).translate(E,aa,S)),m.push(sa(1).rotateY(-ra[C]).translate(E,hf,S)))});let _=u(p,e);_&&(_.receiveShadow=!0),u(v,i),u(m,t);let b=Yo(h);if(b){let E=new Te,S=new se(sa(df).rotateY(-ra[b]),s),A=new se(sa(1).rotateY(-ra[b]).translate(0,hf-aa,0),r);S.renderOrder=10,A.renderOrder=11,o.push(S,A),E.add(S,A),E.position.set(x[0][0],aa,x[0][1]),E.scale.setScalar(gs),n.add(E),a={mesh:E,dir:b}}return!0},pulse(h){return a?(a.mesh.scale.setScalar(gs*Ko(h)),!0):!1},next(){return a?{dir:a.dir,scale:a.mesh.scale.x}:null},dispose(){c(),e.dispose(),t.dispose(),i.dispose(),r.dispose(),s.dispose()}}}var pf=394500,xc=Math.PI/180,_c=12,mf=.12;function Kv(n){let e=null;try{e=localStorage.getItem(Hh)}catch{e=null}Wh(e);let t=new Qr({canvas:n.canvas,antialias:!0,powerPreference:"high-performance"});t.shadowMap.enabled=!0,t.shadowMap.type=Bl,t.shadowMap.autoUpdate=!1;let i=Pd(t),r=new Pn;r.background=new Ze(pf);let s=new Fn(-1,1,1,-1,.1,200),o=new I,a=new I,l=new I,c=lf(t),u=Ld(i),h=Od(i),f=new Te,d=rf(),g=Jd(i,d),x=ff(),p=nf(i);r.add(u.group,h.group,f,g.group,x.group,p.group);let m=!0,v=0,_=0,b=-1e9,E=!1,S=Ad(),A=S.q,C=1,y=1,M="solid",D=un(),F=null,K=null,P=!0,O=Ah(),H=0,Z=us,J=null,X=[],ie=new Set,j=[],he=null,W=0,te=0,Se=!0,Le="",_e=!0,Fe=!0,ze=!0,le={yaw:0,pitch:75,tx:0,tz:0,zoom:10},ge={...le},L=!0,de=!1,Y=()=>n.reducedMotion(),ue=()=>A===0?1:Math.min(globalThis.devicePixelRatio||1,2),q=()=>F?.level.rows??1,Re=()=>F?.level.cols??1,pe=()=>C/y,R=(ee,ce)=>ie.has(ce)?"water":wd(ee,ce),w=()=>Nh(pe(),Re(),q(),ge.pitch);function z(){!_&&m&&(_=requestAnimationFrame(oe))}function ae(ee){W=ee,Fe=!0,z()}let re=()=>m&&Se&&!document.hidden&&!n.reducedMotion();function Q(){te&&clearTimeout(te),te=0,re()&&(te=setTimeout(()=>{te=0,re()&&(F&&(Pe()||x.next())?ae(W+1/_c):W+=1/_c,Q())},1e3/_c))}function Pe(){ye();let ee=ce=>(o.copy(ce).project(s),Math.abs(o.x)<1.05&&Math.abs(o.y)<1.05);return(he?.anchors??[]).some(ee)||g.looping().some(ce=>ee(ce.position))||j.some(ce=>!!ce?.userData?.loop&&ee(ce.position))}function ye(){let ee=le.yaw*xc,ce=le.pitch*xc,Me=le.zoom/2,Oe=pe(),Ke=Ch(le.pitch,le.zoom);s.position.set(le.tx+Math.sin(ee)*Math.cos(ce)*Ke,ne+Math.sin(ce)*Ke,le.tz+Math.cos(ee)*Math.cos(ce)*Ke),s.up.set(-Math.sin(ee),0,-Math.cos(ee)),s.lookAt(le.tx,ne,le.tz),s.far=Ke+160,s.left=-Me*Oe,s.right=Me*Oe,s.top=Me,s.bottom=-Me,s.updateProjectionMatrix(),s.updateMatrixWorld()}function we(){de?(L&&J&&(ge.tx=Ct(J.c,Re()),ge.tz=Pt(J.r,q())),ge.zoom=Ho(ge.zoom,w())):(ge.tx=ge.tz=0,ge.zoom=Uh(pe(),Re(),q(),ge.pitch,ge.yaw)),Object.assign(ge,Go(ge,Re(),q(),pe()))}function ke(){let{hero:ee,rest:ce}=g.seen();if(M==="ghosted"&&F){let Me=Re(),Oe=q();j.forEach((Ke,mt)=>{let st=Ke?.userData;!st||st.h<=0||ce.push({x:Ct(mt%Me,Me),z:Pt(Math.floor(mt/Me),Oe),half:st.half,h:st.h})})}return ad(M,ee,ce)}function Je(){he?.shadows(A>=3),ze=!0,fe()}function oe(ee){if(_=0,!m){E=!1;return}let ce=ee-b;b=ee;let Me=Cd(E,ce);if(Me!==null){let st=Rd(S,Me);st!==A&&(A=st,Je())}let Oe=Me!==null?Math.min(.1,ce/1e3):1/60;we();let Ke=Ph(le,ge,Oe,Y());if(Ke&&(_e=!0),ye(),at.setView(le.yaw,le.pitch),_e&&(h.aim(s,ke()),_e=!1),Ke=h.ease(Oe,Y())||Ke,g.ease(Oe,Y())&&(Ke=!0,ze=!0),p.frame(ee)&&(Ke=!0,ze=!0),it(ee)&&(Ke=!0,ze=!0),Fe){u.loop(W),he?.loop(W),g.loop(W),p.loop(W,Y()),x.pulse(W);for(let st of j)st?.userData?.loop?.(W);Fe=!1}if(ze&&(t.shadowMap.needsUpdate=!0,ze=!1),c.render(r,s,A>=2),d.group.children.length){let st=d.place(s,le.pitch,W,Y(),y/le.zoom);et(st),t.autoClear=!1,t.render(d.scene,s),t.autoClear=!0}let mt=`${le.yaw} ${le.tx} ${le.tz} ${le.zoom} ${C} ${y}`;mt!==Le&&(Le=mt,Tt?.view(le,pe())),v++,E=Ke,Ke&&z()}function it(ee){if(!F||!K)return!1;let ce=Z=O.at(F,K,ee,Y(),P);return F.terrain.forEach((Me,Oe)=>{let Ke=j[Oe]?.userData;Ke?.open&&(Me==="gate"?Ke.open(ce.bars.get(Oe)??(F.relicsLeft===0?1:0)):Ke.open(ce.doors.get(Oe)??(Me==="floor"?1:0)))}),ce.hoof!==H&&(H=ce.hoof,ve(F,K)),ce.busy}function et(ee){let ce=le.zoom/2,Me=ce*pe();a.setFromMatrixColumn(s.matrixWorld,0),l.setFromMatrixColumn(s.matrixWorld,1);for(let Oe of d.group.children){if(o.copy(Oe.userData.foot).project(s),Math.abs(o.x)>1||Math.abs(o.y)>1)continue;o.copy(Oe.position).project(s);let[Ke,mt]=md(o.x*Me,o.y*ce,ds*ee,Vo*ee,Me,ce,pd);Oe.position.addScaledVector(a,Ke).addScaledVector(l,mt)}}function Ye(){let ee=ce=>(o.copy(ce).project(s),[(o.x+1)/2*C,(1-o.y)/2*y]);return d.group.children.map(ce=>{let Me=ce.userData;return{kind:Me.kind,at:ee(ce.position),foot:ee(Me.foot),cell:y/le.zoom}})}function Ne(ee,ce){return o.set(Ct(ee,Re()),ne,Pt(ce,q())).project(s),[(o.x+1)/2*C,(1-o.y)/2*y]}let Ee=new Fn(-1,1,1,-1,.1,200),Ge=null,rt=new Uint8Array(0);function xt(ee,ce,Me,Oe,Ke){if(!F)return!1;let mt=Re(),st=q(),T=ee.width,N=ee.height,k=(Ie,Xe,ct)=>ct<=Xe?(ct-1)/2:Math.max((Xe-1)/2,Math.min(ct-1-(Xe-1)/2,Ie)),G=Ct(k(Me,Oe,mt),mt),B=Pt(k(ce,Ke,st),st),xe=75*xc,Ce=40;Ee.position.set(G,ne+Math.sin(xe)*Ce,B+Math.cos(xe)*Ce),Ee.up.set(0,0,-1),Ee.lookAt(G,ne,B);let Ae=Oe/2,Ue=Ke*Math.sin(xe)/2;Object.assign(Ee,{left:-Ae,right:Ae,top:Ue,bottom:-Ue}),Ee.updateProjectionMatrix(),Ee.updateMatrixWorld(),(!Ge||Ge.width!==T||Ge.height!==N)&&(Ge?.dispose(),Ge=new $t(T,N),Ge.texture.colorSpace=yt,rt=new Uint8Array(T*N*4)),t.toneMapping=Do,t.toneMappingExposure=1.4,t.setRenderTarget(Ge),t.render(r,Ee),t.setRenderTarget(null),t.toneMapping=Rn,t.readRenderTargetPixels(Ge,0,0,T,N,rt);let We=new ImageData(T,N);for(let Ie=0;Ie<N;Ie++)We.data.set(rt.subarray((N-1-Ie)*T*4,(N-Ie)*T*4),Ie*T*4);return ee.getContext("2d").putImageData(We,0,0),!0}function je(ee){let ce=ee.width,Me=ee.height,Oe=new Pn,Ke=dc.theseus(i);Oe.add(Ke,new Pr(16773596,2759954,1.6));let mt=new ei(16769720,2.4);mt.position.set(1.5,3,4),Oe.add(mt);let st=new Cn().setFromObject(Ke),T=st.max.y,N=Math.max(st.max.y-st.min.y,st.max.x-st.min.x)*.8,k=(st.min.x+st.max.x)/2,G=(st.min.z+st.max.z)/2,B=T-N*.46,xe=new Fn(-N/2,N/2,N/2,-N/2,.1,50);xe.position.set(k+3,B+3,G+9),xe.lookAt(k,B,G),xe.updateMatrixWorld();let Ce=new $t(ce,Me);Ce.texture.colorSpace=yt;let Ae=new Uint8Array(ce*Me*4),Ue=t.getClearAlpha();t.setClearColor(0,0),t.toneMapping=Do,t.toneMappingExposure=1.4,t.setRenderTarget(Ce),t.clear(),t.render(Oe,xe),t.setRenderTarget(null),t.toneMapping=Rn,t.setClearColor(pf,Ue),t.readRenderTargetPixels(Ce,0,0,ce,Me,Ae),Ce.dispose(),bi(Ke,i);let We=new ImageData(ce,Me);for(let Ie=0;Ie<Me;Ie++)We.data.set(Ae.subarray((Me-1-Ie)*ce*4,(Me-Ie)*ce*4),Ie*ce*4);ee.getContext("2d").putImageData(We,0,0)}function fe(){let ee=n.canvas.clientWidth,ce=n.canvas.clientHeight;if(ee<=0||ce<=0)return;C=ee,y=ce;let Me=ue();t.setPixelRatio(Me),t.setSize(ee,ce,!1),c.setSize(Math.round(ee*Me),Math.round(ce*Me)),Tt?.fit(n.overlay.clientWidth||ee,n.overlay.clientHeight||ce),de||(we(),le.zoom=ge.zoom),_e=!0}function U(ee){let ce=j[ee];ce&&(f.remove(ce),bi(ce,i));let Me=Re(),Oe=q(),Ke=Math.floor(ee/Me),mt=ee%Me,st=(k,G)=>k<0||G<0||k>=Oe||G>=Me||X[k*Me+G]==="wall",T=Hd[X[ee]]({kit:i,r:Ke,c:mt,wall:st}),N=T.userData;if(!T.children.length){j[ee]=null;return}T.position.set(Ct(mt,Me),0,Pt(Ke,Oe)),N.tall&&M==="low"&&(T.scale.y=Ur/cn),f.add(T),j[ee]=T}function ve(ee,ce){J&&(J.r!==ce.player.r||J.c!==ce.player.c)&&(L=!0),J={r:ce.player.r,c:ce.player.c};let Me=g.set(Td(ee,ce,H),Re(),q(),Y()),Oe=g.hero();return Oe&&he?.hero(Oe.position.x,Oe.position.z),Me}function be(){for(let ee of j)ee&&(f.remove(ee),bi(ee,i));j=[],he&&(r.remove(he.group),he.dispose(),he=null),g.clear(),p.clear(),x.set(null,0,0)}function Ve(ee){be(),F=ee;let{rows:ce,cols:Me}=ee.level;ie=new Set(ic(ee.level.terrain,ee.terrain)),X=ee.terrain.map((Oe,Ke)=>R(ee,Ke)),p.set([...ie],Me,ce,!1),u.set(X,ce,Me),h.build(X,ce,Me),j=X.map(()=>null);for(let Oe=0;Oe<X.length;Oe++)U(Oe);he=af(i,X,ce,Me,h.list()),he.setMode(M),he.shadows(A>=3),r.add(he.group),_s(S),J=null,ve(ee,{player:ee.player,minotaur:ee.minotaur,hazards:ee.hazards.map(Oe=>({kind:Oe.kind,at:Oe.at}))}),L=!0,de=!1,ge.yaw=0,ge.pitch=75,we(),Object.assign(le,ge),_e=Fe=ze=!0,Tt?.paint(ee,{player:ee.player,minotaur:ee.minotaur,hazards:ee.hazards.map(Oe=>({kind:Oe.kind,at:Oe.at}))},null),z(),te||Q()}function Be(ee,ce){let Me=ee.state;K=ee.figures,P=ee.done??!0,(!F||Me.level!==F.level)&&Ve(Me);let Oe=F,Ke=nd(Oe,Me);Oe.relicsLeft!==Me.relicsLeft&&Me.terrain.forEach((Ae,Ue)=>{Ae==="gate"&&Ke.push(Ue)});let mt=!1,st=!1,{rows:T,cols:N}=Me.level,k=new Set,G=ic(Me.level.terrain,Me.terrain);ie=new Set(G);for(let Ae of Ke){let Ue=R(Me,Ae),We=X[Ae];if(Ue!==We){if(xs[Ue]!==xs[We]&&(mt=!0),Ue==="wall"!=(We==="wall")){st=!0;let Ie=Math.floor(Ae/N),Xe=Ae%N;for(let[ct,kt]of[[-1,0],[1,0],[0,-1],[0,1]])Ie+ct>=0&&Ie+ct<T&&Xe+kt>=0&&Xe+kt<N&&k.add((Ie+ct)*N+Xe+kt)}X[Ae]=Ue,U(Ae),he?.piece(Ae,Ue)}}for(let Ae of k)Ke.includes(Ae)||U(Ae);mt&&u.set(X,T,N),st&&(h.build(X,T,N),h.setMode(M)),F=Me;let B=ve(Me,ee.figures),xe=x.set(ce,N,T),Ce=p.set(G,N,T,!Y());Ke.length===0&&!B&&!xe&&!Ce&&Me===Oe||((Ke.length||B||Ce)&&(_e=!0,ze=!0),Tt?.paint(Me,ee.figures,ce),z(),te||Q())}function ut(ee){let ce=D.cutaway&&ee==="solid"?"ghosted":ee;M=ce,h.setMode(ce),he?.setMode(ce);for(let Me of j)Me&&Me.userData.tall&&(Me.scale.y=ce==="low"?Ur/cn:1);_e=ze=!0,z()}function ht(){L=!0,de=!1,ge.yaw=Lh(0,le.yaw),ge.pitch=75,Y()&&(le.yaw=ge.yaw,le.pitch=ge.pitch)}let Mt={turn(ee,ce){ge.yaw+=ee,(!ce||Y())&&(le.yaw+=ee),_e=!0,z()},pan(ee,ce){L=!1;let Me=le.zoom/y;for(let Oe of[le,ge])Object.assign(Oe,Go(Ih(Oe,ee,ce,Me),Re(),q(),pe()));_e=!0,z()},zoom(ee,ce,Me,Oe){de=!0;let Ke=w();if(Oe)ge.zoom=Ho(ge.zoom*ee,Ke);else{let mt=Math.abs(ce)>mf||Math.abs(Me)>mf;mt&&(L=!1);let st=mt?ce*pe():0,T=mt?Me:0;for(let N of[le,ge])Object.assign(N,Go(Oh(N,ee,st,T,Ke),Re(),q(),pe()))}_e=!0,z()},tilt(ee,ce){ge.pitch=Bo(ge.pitch+ee),(!ce||Y())&&(le.pitch=ge.pitch),_e=!0,z()},reset(){ht(),_e=!0,z()}},Et=document.createElement("div");Et.className="modern-ui",n.overlay.append(Et);let at=td(n.canvas,Et,n,Mt),Tt=n.atlas&&n.image?Sd(Et,n.atlas,n.image,{blocked:()=>n.blocked(),look(ee){n.gesture(),L=!1,ge.tx=ee.x,ge.tz=ee.z,z()}}):null,nn=()=>{_s(S),Q()};document.addEventListener("visibilitychange",nn);let Nr=typeof IntersectionObserver=="function"?new IntersectionObserver(ee=>{Se=ee.some(ce=>ce.isIntersecting),Q()}):null;Nr?.observe(n.canvas);let Ss=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,Mi=()=>{Fe=!0,z(),Q()};return Ss?.addEventListener("change",Mi),fe(),{level:Ve,show:Be,walls:ut,yaw:()=>le.yaw,zoom:()=>le.zoom,pitch:()=>le.pitch,setView(ee,ce){Mt.turn(ee-ge.yaw,!1),Mt.tilt(ce-ge.pitch,!1),we(),Object.assign(le,ge)},following:()=>L,reset:Mt.reset,resize(){fe(),z()},setActive(ee){m=ee,Et.hidden=!ee,ee?z():(_&&cancelAnimationFrame(_),_=0,E=!1),Q()},frames:()=>v,opening:()=>({bars:[...Z.bars.values()],doors:[...Z.doors.values()],hoof:Z.hoof}),quality:()=>A,fps:()=>Zo(S.gaps,2e3),floating:()=>p.cells(),routeNext:()=>x.next(),markers:Ye,cellAt:Ne,splashing:()=>p.splashing(),minimap(ee){Tt?.show(ee)},showTips:()=>at.showTips(),snapshot:xt,portrait:je,dispose(){_&&cancelAnimationFrame(_),_=0,m=!1,Q(),document.removeEventListener("visibilitychange",nn),Nr?.disconnect(),Ss?.removeEventListener("change",Mi),at.dispose(),Tt?.dispose(),Et.remove(),be(),u.dispose(),h.dispose(),g.dispose(),p.dispose(),x.dispose(),d.dispose(),Ge?.dispose(),c.dispose(),i.dispose(),t.dispose()}}}export{Kv as createModernBoard};
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=modern.js.map
