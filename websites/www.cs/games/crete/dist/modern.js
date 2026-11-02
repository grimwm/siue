/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
var Mf=0,Mc=1,Sf=2;var Qu=1,Hl=2,Yn=3,pi=0,Lt=1,pn=2;var hi=0,mr=1,Oi=2,Sc=3,wc=4,wf=5,Pi=100,Ef=101,Tf=102,Ec=103,Tc=104,Af=200,Rf=201,Cf=202,Pf=203,ja=204,Qa=205,If=206,Lf=207,Df=208,Uf=209,Nf=210,Of=211,Ff=212,zf=213,kf=214,Bf=0,Gf=1,Hf=2,no=3,Vf=4,Wf=5,Vl=6,Xf=7,Wl=0,qf=1,Yf=2,Rn=0,Kf=1,Zf=2,Jf=3,No=4,$f=5,jf=6;var eh=300,_r=301,yr=302,el=303,tl=304,Oo=306,vr=1e3,Gt=1001,nl=1002,Jt=1003,Ac=1004;var ma=1005;var fn=1006,Qf=1007;var jr=1008;var di=1009,ep=1010,tp=1011,Xl=1012,th=1013,ci=1014,ui=1015,Fi=1016,nh=1017,ih=1018,Di=1020,np=1021,An=1023,ip=1024,rp=1025,Ui=1026,br=1027,sp=1028,rh=1029,op=1030,sh=1031,oh=1033,ga=33776,xa=33777,_a=33778,ya=33779,Rc=35840,Cc=35841,Pc=35842,Ic=35843,ah=36196,Lc=37492,Dc=37496,Uc=37808,Nc=37809,Oc=37810,Fc=37811,zc=37812,kc=37813,Bc=37814,Gc=37815,Hc=37816,Vc=37817,Wc=37818,Xc=37819,qc=37820,Yc=37821,va=36492,Kc=36494,Zc=36495,ap=36283,Jc=36284,$c=36285,jc=36286;var io=2300,ro=2301,ba=2302,Qc=2400,eu=2401,tu=2402;var lh=3e3,Ni=3001,lp=3200,cp=3201,ql=0,up=1,mn="",yt="srgb",jn="srgb-linear",Yl="display-p3",Fo="display-p3-linear",so="linear",gt="srgb",oo="rec709",ao="p3";var Xi=7680,ch=7681;var uh=517;var nu=519,hp=512,dp=513,fp=514,hh=515,pp=516,mp=517,gp=518,xp=519,il=35044;var iu="300 es",rl=1035,Jn=2e3,lo=2001,mi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let i=this._listeners[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},Vt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ma=Math.PI/180,sl=180/Math.PI;function $n(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Vt[n&255]+Vt[n>>8&255]+Vt[n>>16&255]+Vt[n>>24&255]+"-"+Vt[e&255]+Vt[e>>8&255]+"-"+Vt[e>>16&15|64]+Vt[e>>24&255]+"-"+Vt[t&63|128]+Vt[t>>8&255]+"-"+Vt[t>>16&255]+Vt[t>>24&255]+Vt[i&255]+Vt[i>>8&255]+Vt[i>>16&255]+Vt[i>>24&255]).toLowerCase()}function Bt(n,e,t){return Math.max(e,Math.min(t,n))}function _p(n,e){return(n%e+e)%e}function Sa(n,e,t){return(1-t)*n+t*e}function ru(n){return(n&n-1)===0&&n!==0}function ol(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Zn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function ft(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var j=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Bt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},nt=class n{constructor(e,t,i,r,s,o,a,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c)}set(e,t,i,r,s,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],h=i[7],f=i[2],d=i[5],g=i[8],x=r[0],p=r[3],m=r[6],y=r[1],_=r[4],b=r[7],E=r[2],S=r[5],A=r[8];return s[0]=o*x+a*y+l*E,s[3]=o*p+a*_+l*S,s[6]=o*m+a*b+l*A,s[1]=c*x+u*y+h*E,s[4]=c*p+u*_+h*S,s[7]=c*m+u*b+h*A,s[2]=f*x+d*y+g*E,s[5]=f*p+d*_+g*S,s[8]=f*m+d*b+g*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*s*u+i*a*l+r*s*c-r*o*l}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,f=a*l-u*s,d=c*s-o*l,g=t*h+i*f+r*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=h*x,e[1]=(r*c-u*i)*x,e[2]=(a*i-r*o)*x,e[3]=f*x,e[4]=(u*t-r*l)*x,e[5]=(r*s-a*t)*x,e[6]=d*x,e[7]=(i*l-c*t)*x,e[8]=(o*t-i*s)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(wa.makeScale(e,t)),this}rotate(e){return this.premultiply(wa.makeRotation(-e)),this}translate(e,t){return this.premultiply(wa.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},wa=new nt;function dh(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function co(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function yp(){let n=co("canvas");return n.style.display="block",n}var su={};function Kr(n){n in su||(su[n]=!0,console.warn(n))}var ou=new nt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),au=new nt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ts={[jn]:{transfer:so,primaries:oo,toReference:n=>n,fromReference:n=>n},[yt]:{transfer:gt,primaries:oo,toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[Fo]:{transfer:so,primaries:ao,toReference:n=>n.applyMatrix3(au),fromReference:n=>n.applyMatrix3(ou)},[Yl]:{transfer:gt,primaries:ao,toReference:n=>n.convertSRGBToLinear().applyMatrix3(au),fromReference:n=>n.applyMatrix3(ou).convertLinearToSRGB()}},vp=new Set([jn,Fo]),dt={enabled:!0,_workingColorSpace:jn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!vp.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,e,t){if(this.enabled===!1||e===t||!e||!t)return n;let i=Ts[e].toReference,r=Ts[t].fromReference;return r(i(n))},fromWorkingColorSpace:function(n,e){return this.convert(n,this._workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this._workingColorSpace)},getPrimaries:function(n){return Ts[n].primaries},getTransfer:function(n){return n===mn?so:Ts[n].transfer}};function gr(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ea(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var qi,uo=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{qi===void 0&&(qi=co("canvas")),qi.width=e.width,qi.height=e.height;let i=qi.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=qi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=co("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=gr(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(gr(t[i]/255)*255):t[i]=gr(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},bp=0,ho=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:bp++}),this.uuid=$n(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(Ta(r[o].image)):s.push(Ta(r[o]))}else s=Ta(r);i.url=s}return t||(e.images[this.uuid]=i),i}};function Ta(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?uo.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Mp=0,gn=class n extends mi{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Gt,r=Gt,s=fn,o=jr,a=An,l=di,c=n.DEFAULT_ANISOTROPY,u=mn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Mp++}),this.uuid=$n(),this.name="",this.source=new ho(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new j(0,0),this.repeat=new j(1,1),this.center=new j(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new nt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof u=="string"?this.colorSpace=u:(Kr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=u===Ni?yt:mn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==eh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case vr:e.x=e.x-Math.floor(e.x);break;case Gt:e.x=e.x<0?0:1;break;case nl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case vr:e.y=e.y-Math.floor(e.y);break;case Gt:e.y=e.y<0?0:1;break;case nl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Kr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===yt?Ni:lh}set encoding(e){Kr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===Ni?yt:mn}};gn.DEFAULT_IMAGE=null;gn.DEFAULT_MAPPING=eh;gn.DEFAULT_ANISOTROPY=1;var vt=class n{constructor(e=0,t=0,i=0,r=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s,l=e.elements,c=l[0],u=l[4],h=l[8],f=l[1],d=l[5],g=l[9],x=l[2],p=l[6],m=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-x)<.01&&Math.abs(g-p)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+x)<.1&&Math.abs(g+p)<.1&&Math.abs(c+d+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let _=(c+1)/2,b=(d+1)/2,E=(m+1)/2,S=(u+f)/4,A=(h+x)/4,C=(g+p)/4;return _>b&&_>E?_<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(_),r=S/i,s=A/i):b>E?b<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(b),i=S/r,s=C/r):E<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(E),i=A/s,r=C/s),this.set(i,r,s,t),this}let y=Math.sqrt((p-g)*(p-g)+(h-x)*(h-x)+(f-u)*(f-u));return Math.abs(y)<.001&&(y=1),this.x=(p-g)/y,this.y=(h-x)/y,this.z=(f-u)/y,this.w=Math.acos((c+d+m-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},al=class extends mi{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new vt(0,0,e,t),this.scissorTest=!1,this.viewport=new vt(0,0,e,t);let r={width:e,height:t,depth:1};i.encoding!==void 0&&(Kr("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),i.colorSpace=i.encoding===Ni?yt:mn),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:fn,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},i),this.texture=new gn(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=i.generateMipmaps,this.texture.internalFormat=i.internalFormat,this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}setSize(e,t,i=1){(this.width!==e||this.height!==t||this.depth!==i)&&(this.width=e,this.height=t,this.depth=i,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=i,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new ho(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},$t=class extends al{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},fo=class extends gn{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=Gt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ll=class extends gn{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=Gt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var gi=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let l=i[r+0],c=i[r+1],u=i[r+2],h=i[r+3],f=s[o+0],d=s[o+1],g=s[o+2],x=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=f,e[t+1]=d,e[t+2]=g,e[t+3]=x;return}if(h!==x||l!==f||c!==d||u!==g){let p=1-a,m=l*f+c*d+u*g+h*x,y=m>=0?1:-1,_=1-m*m;if(_>Number.EPSILON){let E=Math.sqrt(_),S=Math.atan2(E,m*y);p=Math.sin(p*S)/E,a=Math.sin(a*S)/E}let b=a*y;if(l=l*p+f*b,c=c*p+d*b,u=u*p+g*b,h=h*p+x*b,p===1-a){let E=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=E,c*=E,u*=E,h*=E}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,r,s,o){let a=i[r],l=i[r+1],c=i[r+2],u=i[r+3],h=s[o],f=s[o+1],d=s[o+2],g=s[o+3];return e[t]=a*g+u*h+l*d-c*f,e[t+1]=l*g+u*f+c*h-a*d,e[t+2]=c*g+u*d+a*f-l*h,e[t+3]=u*g-a*h-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(r/2),h=a(s/2),f=l(i/2),d=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"YXZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"ZXY":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"ZYX":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"YZX":this._x=f*u*h+c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h-f*d*g;break;case"XZY":this._x=f*u*h-c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],f=i+a+h;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(u-l)*d,this._y=(s-c)*d,this._z=(o-r)*d}else if(i>a&&i>h){let d=2*Math.sqrt(1+i-a-h);this._w=(u-l)/d,this._x=.25*d,this._y=(r+o)/d,this._z=(s+c)/d}else if(a>h){let d=2*Math.sqrt(1+a-i-h);this._w=(s-c)/d,this._x=(r+o)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+h-i-a);this._w=(o-r)/d,this._x=(s+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Bt(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-i*c,this._z=s*u+o*c+i*l-r*a,this._w=o*u-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let d=1-t;return this._w=d*o+t*this._w,this._x=d*i+t*this._x,this._y=d*r+t*this._y,this._z=d*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,f=Math.sin(t*u)/c;return this._w=o*h+this._w*f,this._x=i*h+this._x*f,this._y=r*h+this._y*f,this._z=s*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=Math.random(),t=Math.sqrt(1-e),i=Math.sqrt(e),r=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(r),i*Math.sin(s),i*Math.cos(s),t*Math.sin(r))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(lu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(lu.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),u=2*(a*t-s*r),h=2*(s*i-o*t);return this.x=t+l*c+o*h-a*u,this.y=i+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Aa.copy(this).projectOnVector(e),this.sub(Aa)}reflect(e){return this.sub(Aa.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Bt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,i=Math.sqrt(1-e**2);return this.x=i*Math.cos(t),this.y=i*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Aa=new P,lu=new gi,Cn=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(wn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(wn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=wn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,wn):wn.fromBufferAttribute(s,o),wn.applyMatrix4(e.matrixWorld),this.expandByPoint(wn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),As.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),As.copy(i.boundingBox)),As.applyMatrix4(e.matrixWorld),this.union(As)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,wn),wn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(zr),Rs.subVectors(this.max,zr),Yi.subVectors(e.a,zr),Ki.subVectors(e.b,zr),Zi.subVectors(e.c,zr),ri.subVectors(Ki,Yi),si.subVectors(Zi,Ki),Ei.subVectors(Yi,Zi);let t=[0,-ri.z,ri.y,0,-si.z,si.y,0,-Ei.z,Ei.y,ri.z,0,-ri.x,si.z,0,-si.x,Ei.z,0,-Ei.x,-ri.y,ri.x,0,-si.y,si.x,0,-Ei.y,Ei.x,0];return!Ra(t,Yi,Ki,Zi,Rs)||(t=[1,0,0,0,1,0,0,0,1],!Ra(t,Yi,Ki,Zi,Rs))?!1:(Cs.crossVectors(ri,si),t=[Cs.x,Cs.y,Cs.z],Ra(t,Yi,Ki,Zi,Rs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,wn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(wn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Hn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Hn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Hn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Hn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Hn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Hn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Hn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Hn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Hn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Hn=[new P,new P,new P,new P,new P,new P,new P,new P],wn=new P,As=new Cn,Yi=new P,Ki=new P,Zi=new P,ri=new P,si=new P,Ei=new P,zr=new P,Rs=new P,Cs=new P,Ti=new P;function Ra(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){Ti.fromArray(n,s);let a=r.x*Math.abs(Ti.x)+r.y*Math.abs(Ti.y)+r.z*Math.abs(Ti.z),l=e.dot(Ti),c=t.dot(Ti),u=i.dot(Ti);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var Sp=new Cn,kr=new P,Ca=new P,zi=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):Sp.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;kr.subVectors(e,this.center);let t=kr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(kr,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ca.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(kr.copy(e.center).add(Ca)),this.expandByPoint(kr.copy(e.center).sub(Ca))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},Vn=new P,Pa=new P,Ps=new P,oi=new P,Ia=new P,Is=new P,La=new P,cl=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Vn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Vn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Vn.copy(this.origin).addScaledVector(this.direction,t),Vn.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){Pa.copy(e).add(t).multiplyScalar(.5),Ps.copy(t).sub(e).normalize(),oi.copy(this.origin).sub(Pa);let s=e.distanceTo(t)*.5,o=-this.direction.dot(Ps),a=oi.dot(this.direction),l=-oi.dot(Ps),c=oi.lengthSq(),u=Math.abs(1-o*o),h,f,d,g;if(u>0)if(h=o*l-a,f=o*a-l,g=s*u,h>=0)if(f>=-g)if(f<=g){let x=1/u;h*=x,f*=x,d=h*(h+o*f+2*a)+f*(o*h+f+2*l)+c}else f=s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f=-s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f<=-g?(h=Math.max(0,-(-o*s+a)),f=h>0?-s:Math.min(Math.max(-s,-l),s),d=-h*h+f*(f+2*l)+c):f<=g?(h=0,f=Math.min(Math.max(-s,-l),s),d=f*(f+2*l)+c):(h=Math.max(0,-(o*s+a)),f=h>0?s:Math.min(Math.max(-s,-l),s),d=-h*h+f*(f+2*l)+c);else f=o>0?-s:s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Pa).addScaledVector(Ps,f),d}intersectSphere(e,t){Vn.subVectors(e.center,this.origin);let i=Vn.dot(this.direction),r=Vn.dot(Vn)-i*i,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(i=(e.min.x-f.x)*c,r=(e.max.x-f.x)*c):(i=(e.max.x-f.x)*c,r=(e.min.x-f.x)*c),u>=0?(s=(e.min.y-f.y)*u,o=(e.max.y-f.y)*u):(s=(e.max.y-f.y)*u,o=(e.min.y-f.y)*u),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(a=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,Vn)!==null}intersectTriangle(e,t,i,r,s){Ia.subVectors(t,e),Is.subVectors(i,e),La.crossVectors(Ia,Is);let o=this.direction.dot(La),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;oi.subVectors(this.origin,e);let l=a*this.direction.dot(Is.crossVectors(oi,Is));if(l<0)return null;let c=a*this.direction.dot(Ia.cross(oi));if(c<0||l+c>o)return null;let u=-a*oi.dot(La);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},pt=class n{constructor(e,t,i,r,s,o,a,l,c,u,h,f,d,g,x,p){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c,u,h,f,d,g,x,p)}set(e,t,i,r,s,o,a,l,c,u,h,f,d,g,x,p){let m=this.elements;return m[0]=e,m[4]=t,m[8]=i,m[12]=r,m[1]=s,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=u,m[10]=h,m[14]=f,m[3]=d,m[7]=g,m[11]=x,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,r=1/Ji.setFromMatrixColumn(e,0).length(),s=1/Ji.setFromMatrixColumn(e,1).length(),o=1/Ji.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let f=o*u,d=o*h,g=a*u,x=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=d+g*c,t[5]=f-x*c,t[9]=-a*l,t[2]=x-f*c,t[6]=g+d*c,t[10]=o*l}else if(e.order==="YXZ"){let f=l*u,d=l*h,g=c*u,x=c*h;t[0]=f+x*a,t[4]=g*a-d,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=d*a-g,t[6]=x+f*a,t[10]=o*l}else if(e.order==="ZXY"){let f=l*u,d=l*h,g=c*u,x=c*h;t[0]=f-x*a,t[4]=-o*h,t[8]=g+d*a,t[1]=d+g*a,t[5]=o*u,t[9]=x-f*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let f=o*u,d=o*h,g=a*u,x=a*h;t[0]=l*u,t[4]=g*c-d,t[8]=f*c+x,t[1]=l*h,t[5]=x*c+f,t[9]=d*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let f=o*l,d=o*c,g=a*l,x=a*c;t[0]=l*u,t[4]=x-f*h,t[8]=g*h+d,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=d*h+g,t[10]=f-x*h}else if(e.order==="XZY"){let f=o*l,d=o*c,g=a*l,x=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=f*h+x,t[5]=o*u,t[9]=d*h-g,t[2]=g*h-d,t[6]=a*u,t[10]=x*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(wp,e,Ep)}lookAt(e,t,i){let r=this.elements;return rn.subVectors(e,t),rn.lengthSq()===0&&(rn.z=1),rn.normalize(),ai.crossVectors(i,rn),ai.lengthSq()===0&&(Math.abs(i.z)===1?rn.x+=1e-4:rn.z+=1e-4,rn.normalize(),ai.crossVectors(i,rn)),ai.normalize(),Ls.crossVectors(rn,ai),r[0]=ai.x,r[4]=Ls.x,r[8]=rn.x,r[1]=ai.y,r[5]=Ls.y,r[9]=rn.y,r[2]=ai.z,r[6]=Ls.z,r[10]=rn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],h=i[5],f=i[9],d=i[13],g=i[2],x=i[6],p=i[10],m=i[14],y=i[3],_=i[7],b=i[11],E=i[15],S=r[0],A=r[4],C=r[8],v=r[12],M=r[1],D=r[5],O=r[9],Y=r[13],I=r[2],z=r[6],W=r[10],$=r[14],J=r[3],q=r[7],re=r[11],k=r[15];return s[0]=o*S+a*M+l*I+c*J,s[4]=o*A+a*D+l*z+c*q,s[8]=o*C+a*O+l*W+c*re,s[12]=o*v+a*Y+l*$+c*k,s[1]=u*S+h*M+f*I+d*J,s[5]=u*A+h*D+f*z+d*q,s[9]=u*C+h*O+f*W+d*re,s[13]=u*v+h*Y+f*$+d*k,s[2]=g*S+x*M+p*I+m*J,s[6]=g*A+x*D+p*z+m*q,s[10]=g*C+x*O+p*W+m*re,s[14]=g*v+x*Y+p*$+m*k,s[3]=y*S+_*M+b*I+E*J,s[7]=y*A+_*D+b*z+E*q,s[11]=y*C+_*O+b*W+E*re,s[15]=y*v+_*Y+b*$+E*k,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],f=e[10],d=e[14],g=e[3],x=e[7],p=e[11],m=e[15];return g*(+s*l*h-r*c*h-s*a*f+i*c*f+r*a*d-i*l*d)+x*(+t*l*d-t*c*f+s*o*f-r*o*d+r*c*u-s*l*u)+p*(+t*c*h-t*a*d-s*o*h+i*o*d+s*a*u-i*c*u)+m*(-r*a*u-t*l*h+t*a*f+r*o*h-i*o*f+i*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],f=e[10],d=e[11],g=e[12],x=e[13],p=e[14],m=e[15],y=h*p*c-x*f*c+x*l*d-a*p*d-h*l*m+a*f*m,_=g*f*c-u*p*c-g*l*d+o*p*d+u*l*m-o*f*m,b=u*x*c-g*h*c+g*a*d-o*x*d-u*a*m+o*h*m,E=g*h*l-u*x*l-g*a*f+o*x*f+u*a*p-o*h*p,S=t*y+i*_+r*b+s*E;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/S;return e[0]=y*A,e[1]=(x*f*s-h*p*s-x*r*d+i*p*d+h*r*m-i*f*m)*A,e[2]=(a*p*s-x*l*s+x*r*c-i*p*c-a*r*m+i*l*m)*A,e[3]=(h*l*s-a*f*s-h*r*c+i*f*c+a*r*d-i*l*d)*A,e[4]=_*A,e[5]=(u*p*s-g*f*s+g*r*d-t*p*d-u*r*m+t*f*m)*A,e[6]=(g*l*s-o*p*s-g*r*c+t*p*c+o*r*m-t*l*m)*A,e[7]=(o*f*s-u*l*s+u*r*c-t*f*c-o*r*d+t*l*d)*A,e[8]=b*A,e[9]=(g*h*s-u*x*s-g*i*d+t*x*d+u*i*m-t*h*m)*A,e[10]=(o*x*s-g*a*s+g*i*c-t*x*c-o*i*m+t*a*m)*A,e[11]=(u*a*s-o*h*s-u*i*c+t*h*c+o*i*d-t*a*d)*A,e[12]=E*A,e[13]=(u*x*r-g*h*r+g*i*f-t*x*f-u*i*p+t*h*p)*A,e[14]=(g*a*r-o*x*r-g*i*l+t*x*l+o*i*p-t*a*p)*A,e[15]=(o*h*r-u*a*r+u*i*l-t*h*l-o*i*f+t*a*f)*A,this}scale(e){let t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+i,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,h=a+a,f=s*c,d=s*u,g=s*h,x=o*u,p=o*h,m=a*h,y=l*c,_=l*u,b=l*h,E=i.x,S=i.y,A=i.z;return r[0]=(1-(x+m))*E,r[1]=(d+b)*E,r[2]=(g-_)*E,r[3]=0,r[4]=(d-b)*S,r[5]=(1-(f+m))*S,r[6]=(p+y)*S,r[7]=0,r[8]=(g+_)*A,r[9]=(p-y)*A,r[10]=(1-(f+x))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){let r=this.elements,s=Ji.set(r[0],r[1],r[2]).length(),o=Ji.set(r[4],r[5],r[6]).length(),a=Ji.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],En.copy(this);let c=1/s,u=1/o,h=1/a;return En.elements[0]*=c,En.elements[1]*=c,En.elements[2]*=c,En.elements[4]*=u,En.elements[5]*=u,En.elements[6]*=u,En.elements[8]*=h,En.elements[9]*=h,En.elements[10]*=h,t.setFromRotationMatrix(En),i.x=s,i.y=o,i.z=a,this}makePerspective(e,t,i,r,s,o,a=Jn){let l=this.elements,c=2*s/(t-e),u=2*s/(i-r),h=(t+e)/(t-e),f=(i+r)/(i-r),d,g;if(a===Jn)d=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===lo)d=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=Jn){let l=this.elements,c=1/(t-e),u=1/(i-r),h=1/(o-s),f=(t+e)*c,d=(i+r)*u,g,x;if(a===Jn)g=(o+s)*h,x=-2*h;else if(a===lo)g=s*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=x,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Ji=new P,En=new pt,wp=new P(0,0,0),Ep=new P(1,1,1),ai=new P,Ls=new P,rn=new P,cu=new pt,uu=new gi,po=class n{constructor(e=0,t=0,i=0,r=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],f=r[6],d=r[10];switch(t){case"XYZ":this._y=Math.asin(Bt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Bt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(Bt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Bt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Bt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-Bt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return cu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(cu,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return uu.setFromEuler(this),this.setFromQuaternion(uu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};po.DEFAULT_ORDER="XYZ";var mo=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Tp=0,hu=new P,$i=new gi,Wn=new pt,Ds=new P,Br=new P,Ap=new P,Rp=new gi,du=new P(1,0,0),fu=new P(0,1,0),pu=new P(0,0,1),Cp={type:"added"},Pp={type:"removed"},qt=class n extends mi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Tp++}),this.uuid=$n(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new P,t=new po,i=new gi,r=new P(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new pt},normalMatrix:{value:new nt}}),this.matrix=new pt,this.matrixWorld=new pt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new mo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return $i.setFromAxisAngle(e,t),this.quaternion.multiply($i),this}rotateOnWorldAxis(e,t){return $i.setFromAxisAngle(e,t),this.quaternion.premultiply($i),this}rotateX(e){return this.rotateOnAxis(du,e)}rotateY(e){return this.rotateOnAxis(fu,e)}rotateZ(e){return this.rotateOnAxis(pu,e)}translateOnAxis(e,t){return hu.copy(e).applyQuaternion(this.quaternion),this.position.add(hu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(du,e)}translateY(e){return this.translateOnAxis(fu,e)}translateZ(e){return this.translateOnAxis(pu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Wn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Ds.copy(e):Ds.set(e,t,i);let r=this.parent;this.updateWorldMatrix(!0,!1),Br.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Wn.lookAt(Br,Ds,this.up):Wn.lookAt(Ds,Br,this.up),this.quaternion.setFromRotationMatrix(Wn),r&&(Wn.extractRotation(r.matrixWorld),$i.setFromRotationMatrix(Wn),this.quaternion.premultiply($i.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(Cp)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Pp)),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Wn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Wn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Wn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Br,e,Ap),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Br,Rp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,r=t.length;i<r;i++){let s=t[i];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.matrixWorldAutoUpdate===!0&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++){let a=r[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),f=o(e.skeletons),d=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),d.length>0&&(i.animations=d),g.length>0&&(i.nodes=g)}return i.object=r,i;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}};qt.DEFAULT_UP=new P(0,1,0);qt.DEFAULT_MATRIX_AUTO_UPDATE=!0;qt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Tn=new P,Xn=new P,Da=new P,qn=new P,ji=new P,Qi=new P,mu=new P,Ua=new P,Na=new P,Oa=new P,Us=!1,Li=class n{constructor(e=new P,t=new P,i=new P){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Tn.subVectors(e,t),r.cross(Tn);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){Tn.subVectors(r,t),Xn.subVectors(i,t),Da.subVectors(e,t);let o=Tn.dot(Tn),a=Tn.dot(Xn),l=Tn.dot(Da),c=Xn.dot(Xn),u=Xn.dot(Da),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;let f=1/h,d=(c*l-a*u)*f,g=(o*u-a*l)*f;return s.set(1-d-g,g,d)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,qn)===null?!1:qn.x>=0&&qn.y>=0&&qn.x+qn.y<=1}static getUV(e,t,i,r,s,o,a,l){return Us===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Us=!0),this.getInterpolation(e,t,i,r,s,o,a,l)}static getInterpolation(e,t,i,r,s,o,a,l){return this.getBarycoord(e,t,i,r,qn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,qn.x),l.addScaledVector(o,qn.y),l.addScaledVector(a,qn.z),l)}static isFrontFacing(e,t,i,r){return Tn.subVectors(i,t),Xn.subVectors(e,t),Tn.cross(Xn).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Tn.subVectors(this.c,this.b),Xn.subVectors(this.a,this.b),Tn.cross(Xn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,i,r,s){return Us===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Us=!0),n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}getInterpolation(e,t,i,r,s){return n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,r=this.b,s=this.c,o,a;ji.subVectors(r,i),Qi.subVectors(s,i),Ua.subVectors(e,i);let l=ji.dot(Ua),c=Qi.dot(Ua);if(l<=0&&c<=0)return t.copy(i);Na.subVectors(e,r);let u=ji.dot(Na),h=Qi.dot(Na);if(u>=0&&h<=u)return t.copy(r);let f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector(ji,o);Oa.subVectors(e,s);let d=ji.dot(Oa),g=Qi.dot(Oa);if(g>=0&&d<=g)return t.copy(s);let x=d*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(Qi,a);let p=u*g-d*h;if(p<=0&&h-u>=0&&d-g>=0)return mu.subVectors(s,r),a=(h-u)/(h-u+(d-g)),t.copy(r).addScaledVector(mu,a);let m=1/(p+x+f);return o=x*m,a=f*m,t.copy(i).addScaledVector(ji,o).addScaledVector(Qi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},fh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},li={h:0,s:0,l:0},Ns={h:0,s:0,l:0};function Fa(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ze=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,dt.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=dt.workingColorSpace){return this.r=e,this.g=t,this.b=i,dt.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=dt.workingColorSpace){if(e=_p(e,1),t=Bt(t,0,1),i=Bt(i,0,1),t===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=Fa(o,s,e+1/3),this.g=Fa(o,s,e),this.b=Fa(o,s,e-1/3)}return dt.toWorkingColorSpace(this,r),this}setStyle(e,t=yt){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=yt){let i=fh[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=gr(e.r),this.g=gr(e.g),this.b=gr(e.b),this}copyLinearToSRGB(e){return this.r=Ea(e.r),this.g=Ea(e.g),this.b=Ea(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yt){return dt.fromWorkingColorSpace(Wt.copy(this),e),Math.round(Bt(Wt.r*255,0,255))*65536+Math.round(Bt(Wt.g*255,0,255))*256+Math.round(Bt(Wt.b*255,0,255))}getHexString(e=yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=dt.workingColorSpace){dt.fromWorkingColorSpace(Wt.copy(this),t);let i=Wt.r,r=Wt.g,s=Wt.b,o=Math.max(i,r,s),a=Math.min(i,r,s),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=dt.workingColorSpace){return dt.fromWorkingColorSpace(Wt.copy(this),t),e.r=Wt.r,e.g=Wt.g,e.b=Wt.b,e}getStyle(e=yt){dt.fromWorkingColorSpace(Wt.copy(this),e);let t=Wt.r,i=Wt.g,r=Wt.b;return e!==yt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(li),this.setHSL(li.h+e,li.s+t,li.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(li),e.getHSL(Ns);let i=Sa(li.h,Ns.h,t),r=Sa(li.s,Ns.s,t),s=Sa(li.l,Ns.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Wt=new Ze;Ze.NAMES=fh;var Ip=0,Qn=class extends mi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ip++}),this.uuid=$n(),this.name="",this.type="Material",this.blending=mr,this.side=pi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ja,this.blendDst=Qa,this.blendEquation=Pi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ze(0,0,0),this.blendAlpha=0,this.depthFunc=no,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=nu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Xi,this.stencilZFail=Xi,this.stencilZPass=Xi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==mr&&(i.blending=this.blending),this.side!==pi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==ja&&(i.blendSrc=this.blendSrc),this.blendDst!==Qa&&(i.blendDst=this.blendDst),this.blendEquation!==Pi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==no&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==nu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Xi&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Xi&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Xi&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},lt=class extends Qn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ze(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Wl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var It=new P,Os=new j,Xt=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=il,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=ui,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Os.fromBufferAttribute(this,t),Os.applyMatrix3(e),this.setXY(t,Os.x,Os.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyMatrix3(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyMatrix4(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyNormalMatrix(e),this.setXYZ(t,It.x,It.y,It.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.transformDirection(e),this.setXYZ(t,It.x,It.y,It.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Zn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=ft(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Zn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Zn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Zn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Zn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array),r=ft(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array),r=ft(r,this.array),s=ft(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==il&&(e.usage=this.usage),e}};var go=class extends Xt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var xo=class extends Xt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var $e=class extends Xt{constructor(e,t,i){super(new Float32Array(e),t,i)}};var Lp=0,dn=new pt,za=new qt,er=new P,sn=new Cn,Gr=new Cn,zt=new P,Rt=class n extends mi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Lp++}),this.uuid=$n(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(dh(e)?xo:go)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new nt().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return dn.makeRotationFromQuaternion(e),this.applyMatrix4(dn),this}rotateX(e){return dn.makeRotationX(e),this.applyMatrix4(dn),this}rotateY(e){return dn.makeRotationY(e),this.applyMatrix4(dn),this}rotateZ(e){return dn.makeRotationZ(e),this.applyMatrix4(dn),this}translate(e,t,i){return dn.makeTranslation(e,t,i),this.applyMatrix4(dn),this}scale(e,t,i){return dn.makeScale(e,t,i),this.applyMatrix4(dn),this}lookAt(e){return za.lookAt(e),za.updateMatrix(),this.applyMatrix4(za.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(er).negate(),this.translate(er.x,er.y,er.z),this}setFromPoints(e){let t=[];for(let i=0,r=e.length;i<r;i++){let s=e[i];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new $e(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Cn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){let s=t[i];sn.setFromBufferAttribute(s),this.morphTargetsRelative?(zt.addVectors(this.boundingBox.min,sn.min),this.boundingBox.expandByPoint(zt),zt.addVectors(this.boundingBox.max,sn.max),this.boundingBox.expandByPoint(zt)):(this.boundingBox.expandByPoint(sn.min),this.boundingBox.expandByPoint(sn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new zi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new P,1/0);return}if(e){let i=this.boundingSphere.center;if(sn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];Gr.setFromBufferAttribute(a),this.morphTargetsRelative?(zt.addVectors(sn.min,Gr.min),sn.expandByPoint(zt),zt.addVectors(sn.max,Gr.max),sn.expandByPoint(zt)):(sn.expandByPoint(Gr.min),sn.expandByPoint(Gr.max))}sn.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)zt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(zt));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)zt.fromBufferAttribute(a,c),l&&(er.fromBufferAttribute(e,c),zt.add(er)),r=Math.max(r,i.distanceToSquared(zt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.array,r=t.position.array,s=t.normal.array,o=t.uv.array,a=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Xt(new Float32Array(4*a),4));let l=this.getAttribute("tangent").array,c=[],u=[];for(let M=0;M<a;M++)c[M]=new P,u[M]=new P;let h=new P,f=new P,d=new P,g=new j,x=new j,p=new j,m=new P,y=new P;function _(M,D,O){h.fromArray(r,M*3),f.fromArray(r,D*3),d.fromArray(r,O*3),g.fromArray(o,M*2),x.fromArray(o,D*2),p.fromArray(o,O*2),f.sub(h),d.sub(h),x.sub(g),p.sub(g);let Y=1/(x.x*p.y-p.x*x.y);isFinite(Y)&&(m.copy(f).multiplyScalar(p.y).addScaledVector(d,-x.y).multiplyScalar(Y),y.copy(d).multiplyScalar(x.x).addScaledVector(f,-p.x).multiplyScalar(Y),c[M].add(m),c[D].add(m),c[O].add(m),u[M].add(y),u[D].add(y),u[O].add(y))}let b=this.groups;b.length===0&&(b=[{start:0,count:i.length}]);for(let M=0,D=b.length;M<D;++M){let O=b[M],Y=O.start,I=O.count;for(let z=Y,W=Y+I;z<W;z+=3)_(i[z+0],i[z+1],i[z+2])}let E=new P,S=new P,A=new P,C=new P;function v(M){A.fromArray(s,M*3),C.copy(A);let D=c[M];E.copy(D),E.sub(A.multiplyScalar(A.dot(D))).normalize(),S.crossVectors(C,D);let Y=S.dot(u[M])<0?-1:1;l[M*4]=E.x,l[M*4+1]=E.y,l[M*4+2]=E.z,l[M*4+3]=Y}for(let M=0,D=b.length;M<D;++M){let O=b[M],Y=O.start,I=O.count;for(let z=Y,W=Y+I;z<W;z+=3)v(i[z+0]),v(i[z+1]),v(i[z+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Xt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,d=i.count;f<d;f++)i.setXYZ(f,0,0,0);let r=new P,s=new P,o=new P,a=new P,l=new P,c=new P,u=new P,h=new P;if(e)for(let f=0,d=e.count;f<d;f+=3){let g=e.getX(f+0),x=e.getX(f+1),p=e.getX(f+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,x),o.fromBufferAttribute(t,p),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,x),c.fromBufferAttribute(i,p),a.add(u),l.add(u),c.add(u),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(p,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)r.fromBufferAttribute(t,f+0),s.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)zt.fromBufferAttribute(e,t),zt.normalize(),e.setXYZ(t,zt.x,zt.y,zt.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,f=new c.constructor(l.length*u),d=0,g=0;for(let x=0,p=l.length;x<p;x++){a.isInterleavedBufferAttribute?d=l[x]*a.data.stride+a.offset:d=l[x]*u;for(let m=0;m<u;m++)f[g++]=c[d++]}return new Xt(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,i);t.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){let f=c[u],d=e(f,i);l.push(d)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){let d=c[h];u.push(d.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone(t));let r=e.attributes;for(let c in r){let u=r[c];this.setAttribute(c,u.clone(t))}let s=e.morphAttributes;for(let c in s){let u=[],h=s[c];for(let f=0,d=h.length;f<d;f++)u.push(h[f].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},gu=new pt,Ai=new cl,Fs=new zi,xu=new P,tr=new P,nr=new P,ir=new P,ka=new P,zs=new P,ks=new j,Bs=new j,Gs=new j,_u=new P,yu=new P,vu=new P,Hs=new P,Vs=new P,oe=class extends qt{constructor(e=new Rt,t=new lt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){zs.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let u=a[l],h=s[l];u!==0&&(ka.fromBufferAttribute(h,e),o?zs.addScaledVector(ka,u):zs.addScaledVector(ka.sub(t),u))}t.add(zs)}return t}raycast(e,t){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Fs.copy(i.boundingSphere),Fs.applyMatrix4(s),Ai.copy(e.ray).recast(e.near),!(Fs.containsPoint(Ai.origin)===!1&&(Ai.intersectSphere(Fs,xu)===null||Ai.origin.distanceToSquared(xu)>(e.far-e.near)**2))&&(gu.copy(s).invert(),Ai.copy(e.ray).applyMatrix4(gu),!(i.boundingBox!==null&&Ai.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Ai)))}_computeIntersections(e,t,i){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,f=s.groups,d=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let p=f[g],m=o[p.materialIndex],y=Math.max(p.start,d.start),_=Math.min(a.count,Math.min(p.start+p.count,d.start+d.count));for(let b=y,E=_;b<E;b+=3){let S=a.getX(b),A=a.getX(b+1),C=a.getX(b+2);r=Ws(this,m,e,i,c,u,h,S,A,C),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let g=Math.max(0,d.start),x=Math.min(a.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){let y=a.getX(p),_=a.getX(p+1),b=a.getX(p+2);r=Ws(this,o,e,i,c,u,h,y,_,b),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let p=f[g],m=o[p.materialIndex],y=Math.max(p.start,d.start),_=Math.min(l.count,Math.min(p.start+p.count,d.start+d.count));for(let b=y,E=_;b<E;b+=3){let S=b,A=b+1,C=b+2;r=Ws(this,m,e,i,c,u,h,S,A,C),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let g=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){let y=p,_=p+1,b=p+2;r=Ws(this,o,e,i,c,u,h,y,_,b),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}}};function Dp(n,e,t,i,r,s,o,a){let l;if(e.side===Lt?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===pi,a),l===null)return null;Vs.copy(a),Vs.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(Vs);return c<t.near||c>t.far?null:{distance:c,point:Vs.clone(),object:n}}function Ws(n,e,t,i,r,s,o,a,l,c){n.getVertexPosition(a,tr),n.getVertexPosition(l,nr),n.getVertexPosition(c,ir);let u=Dp(n,e,t,i,tr,nr,ir,Hs);if(u){r&&(ks.fromBufferAttribute(r,a),Bs.fromBufferAttribute(r,l),Gs.fromBufferAttribute(r,c),u.uv=Li.getInterpolation(Hs,tr,nr,ir,ks,Bs,Gs,new j)),s&&(ks.fromBufferAttribute(s,a),Bs.fromBufferAttribute(s,l),Gs.fromBufferAttribute(s,c),u.uv1=Li.getInterpolation(Hs,tr,nr,ir,ks,Bs,Gs,new j),u.uv2=u.uv1),o&&(_u.fromBufferAttribute(o,a),yu.fromBufferAttribute(o,l),vu.fromBufferAttribute(o,c),u.normal=Li.getInterpolation(Hs,tr,nr,ir,_u,yu,vu,new P),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new P,materialIndex:0};Li.getNormal(tr,nr,ir,h.normal),u.face=h}return u}var on=class n extends Rt{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],u=[],h=[],f=0,d=0;g("z","y","x",-1,-1,i,t,e,o,s,0),g("z","y","x",1,-1,i,t,-e,o,s,1),g("x","z","y",1,1,e,i,t,r,o,2),g("x","z","y",1,-1,e,i,-t,r,o,3),g("x","y","z",1,-1,e,t,i,r,s,4),g("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new $e(c,3)),this.setAttribute("normal",new $e(u,3)),this.setAttribute("uv",new $e(h,2));function g(x,p,m,y,_,b,E,S,A,C,v){let M=b/A,D=E/C,O=b/2,Y=E/2,I=S/2,z=A+1,W=C+1,$=0,J=0,q=new P;for(let re=0;re<W;re++){let k=re*D-Y;for(let Q=0;Q<z;Q++){let V=Q*M-O;q[x]=V*y,q[p]=k*_,q[m]=I,c.push(q.x,q.y,q.z),q[x]=0,q[p]=0,q[m]=S>0?1:-1,u.push(q.x,q.y,q.z),h.push(Q/A),h.push(1-re/C),$+=1}}for(let re=0;re<C;re++)for(let k=0;k<A;k++){let Q=f+k+z*re,V=f+k+z*(re+1),te=f+(k+1)+z*(re+1),Se=f+(k+1)+z*re;l.push(Q,V,Se),l.push(V,te,Se),J+=6}a.addGroup(d,J,v),d+=J,f+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Mr(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function Zt(n){let e={};for(let t=0;t<n.length;t++){let i=Mr(n[t]);for(let r in i)e[r]=i[r]}return e}function Up(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function ph(n){return n.getRenderTarget()===null?n.outputColorSpace:dt.workingColorSpace}var Np={clone:Mr,merge:Zt},Op=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Fp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,xn=class extends Qn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Op,this.fragmentShader=Fp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Mr(e.uniforms),this.uniformsGroups=Up(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},_o=class extends qt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new pt,this.projectionMatrix=new pt,this.projectionMatrixInverse=new pt,this.coordinateSystem=Jn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},tn=class extends _o{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=sl*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ma*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return sl*2*Math.atan(Math.tan(Ma*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ma*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},rr=-90,sr=1,ul=class extends qt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new tn(rr,sr,e,t);r.layers=this.layers,this.add(r);let s=new tn(rr,sr,e,t);s.layers=this.layers,this.add(s);let o=new tn(rr,sr,e,t);o.layers=this.layers,this.add(o);let a=new tn(rr,sr,e,t);a.layers=this.layers,this.add(a);let l=new tn(rr,sr,e,t);l.layers=this.layers,this.add(l);let c=new tn(rr,sr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,l]=t;for(let c of t)this.remove(c);if(e===Jn)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===lo)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,l),e.setRenderTarget(i,4,r),e.render(t,c),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,r),e.render(t,u),e.setRenderTarget(h,f,d),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},yo=class extends gn{constructor(e,t,i,r,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:_r,super(e,t,i,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},hl=class extends $t{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];t.encoding!==void 0&&(Kr("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===Ni?yt:mn),this.texture=new yo(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:fn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new on(5,5,5),s=new xn({name:"CubemapFromEquirect",uniforms:Mr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Lt,blending:hi});s.uniforms.tEquirect.value=t;let o=new oe(r,s),a=t.minFilter;return t.minFilter===jr&&(t.minFilter=fn),new ul(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,r){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}},Ba=new P,zp=new P,kp=new nt,Kn=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=Ba.subVectors(i,t).cross(zp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(Ba),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||kp.getNormalMatrix(e),r=this.coplanarPoint(Ba).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ri=new zi,Xs=new P,Qr=class{constructor(e=new Kn,t=new Kn,i=new Kn,r=new Kn,s=new Kn,o=new Kn){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Jn){let i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],h=r[6],f=r[7],d=r[8],g=r[9],x=r[10],p=r[11],m=r[12],y=r[13],_=r[14],b=r[15];if(i[0].setComponents(l-s,f-c,p-d,b-m).normalize(),i[1].setComponents(l+s,f+c,p+d,b+m).normalize(),i[2].setComponents(l+o,f+u,p+g,b+y).normalize(),i[3].setComponents(l-o,f-u,p-g,b-y).normalize(),i[4].setComponents(l-a,f-h,p-x,b-_).normalize(),t===Jn)i[5].setComponents(l+a,f+h,p+x,b+_).normalize();else if(t===lo)i[5].setComponents(a,h,x,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ri.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ri.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ri)}intersectsSprite(e){return Ri.center.set(0,0,0),Ri.radius=.7071067811865476,Ri.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ri)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(Xs.x=r.normal.x>0?e.max.x:e.min.x,Xs.y=r.normal.y>0?e.max.y:e.min.y,Xs.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Xs)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function mh(){let n=null,e=!1,t=null,i=null;function r(s,o){t(s,o),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function Bp(n,e){let t=e.isWebGL2,i=new WeakMap;function r(c,u){let h=c.array,f=c.usage,d=h.byteLength,g=n.createBuffer();n.bindBuffer(u,g),n.bufferData(u,h,f),c.onUploadCallback();let x;if(h instanceof Float32Array)x=n.FLOAT;else if(h instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)x=n.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else x=n.UNSIGNED_SHORT;else if(h instanceof Int16Array)x=n.SHORT;else if(h instanceof Uint32Array)x=n.UNSIGNED_INT;else if(h instanceof Int32Array)x=n.INT;else if(h instanceof Int8Array)x=n.BYTE;else if(h instanceof Uint8Array)x=n.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)x=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:g,type:x,bytesPerElement:h.BYTES_PER_ELEMENT,version:c.version,size:d}}function s(c,u,h){let f=u.array,d=u._updateRange,g=u.updateRanges;if(n.bindBuffer(h,c),d.count===-1&&g.length===0&&n.bufferSubData(h,0,f),g.length!==0){for(let x=0,p=g.length;x<p;x++){let m=g[x];t?n.bufferSubData(h,m.start*f.BYTES_PER_ELEMENT,f,m.start,m.count):n.bufferSubData(h,m.start*f.BYTES_PER_ELEMENT,f.subarray(m.start,m.start+m.count))}u.clearUpdateRanges()}d.count!==-1&&(t?n.bufferSubData(h,d.offset*f.BYTES_PER_ELEMENT,f,d.offset,d.count):n.bufferSubData(h,d.offset*f.BYTES_PER_ELEMENT,f.subarray(d.offset,d.offset+d.count)),d.count=-1),u.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),i.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);let u=i.get(c);u&&(n.deleteBuffer(u.buffer),i.delete(c))}function l(c,u){if(c.isGLBufferAttribute){let f=i.get(c);(!f||f.version<c.version)&&i.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);let h=i.get(c);if(h===void 0)i.set(c,r(c,u));else if(h.version<c.version){if(h.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(h.buffer,c,u),h.version=c.version}}return{get:o,remove:a,update:l}}var jt=class n extends Rt{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(i),l=Math.floor(r),c=a+1,u=l+1,h=e/a,f=t/l,d=[],g=[],x=[],p=[];for(let m=0;m<u;m++){let y=m*f-o;for(let _=0;_<c;_++){let b=_*h-s;g.push(b,-y,0),x.push(0,0,1),p.push(_/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<a;y++){let _=y+c*m,b=y+c*(m+1),E=y+1+c*(m+1),S=y+1+c*m;d.push(_,b,S),d.push(b,E,S)}this.setIndex(d),this.setAttribute("position",new $e(g,3)),this.setAttribute("normal",new $e(x,3)),this.setAttribute("uv",new $e(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},Gp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Hp=`#ifdef USE_ALPHAHASH
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
#endif`,Vp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Wp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Xp=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,qp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Yp=`#ifdef USE_AOMAP
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
#endif`,Kp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Zp=`#ifdef USE_BATCHING
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
#endif`,Jp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,$p=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,jp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Qp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,em=`#ifdef USE_IRIDESCENCE
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
#endif`,tm=`#ifdef USE_BUMPMAP
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
#endif`,nm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,im=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,rm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,sm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,om=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,am=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,lm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,cm=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,um=`#define PI 3.141592653589793
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
} // validated`,hm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,dm=`vec3 transformedNormal = objectNormal;
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
#endif`,fm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,pm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,mm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,gm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,xm="gl_FragColor = linearToOutputTexel( gl_FragColor );",_m=`
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
}`,ym=`#ifdef USE_ENVMAP
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
#endif`,vm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,bm=`#ifdef USE_ENVMAP
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
#endif`,Mm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Sm=`#ifdef USE_ENVMAP
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
#endif`,wm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Em=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Tm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Am=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Rm=`#ifdef USE_GRADIENTMAP
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
}`,Cm=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Pm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Im=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Lm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Dm=`uniform bool receiveShadow;
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
#endif`,Um=`#ifdef USE_ENVMAP
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
#endif`,Nm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Om=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Fm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,zm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,km=`PhysicalMaterial material;
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
#endif`,Bm=`struct PhysicalMaterial {
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
}`,Gm=`
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
#endif`,Hm=`#if defined( RE_IndirectDiffuse )
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
#endif`,Vm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Wm=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Xm=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qm=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Ym=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Km=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Zm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Jm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,$m=`#if defined( USE_POINTS_UV )
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
#endif`,jm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Qm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,e0=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,t0=`#ifdef USE_MORPHNORMALS
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
#endif`,n0=`#ifdef USE_MORPHTARGETS
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
#endif`,i0=`#ifdef USE_MORPHTARGETS
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
#endif`,r0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,s0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,o0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,a0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,l0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,c0=`#ifdef USE_NORMALMAP
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
#endif`,u0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,h0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,d0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,f0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,p0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,m0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,g0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,x0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,_0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,y0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,v0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,b0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,M0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,S0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,w0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,E0=`float getShadowMask() {
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
}`,T0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,A0=`#ifdef USE_SKINNING
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
#endif`,R0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,C0=`#ifdef USE_SKINNING
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
#endif`,P0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,I0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,L0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,D0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,U0=`#ifdef USE_TRANSMISSION
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
#endif`,N0=`#ifdef USE_TRANSMISSION
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
#endif`,O0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,F0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,z0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,k0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,B0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,G0=`uniform sampler2D t2D;
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
}`,H0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,V0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,W0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,X0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,q0=`#include <common>
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
}`,Y0=`#if DEPTH_PACKING == 3200
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
}`,K0=`#define DISTANCE
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
}`,Z0=`#define DISTANCE
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
}`,J0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,$0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,j0=`uniform float scale;
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
}`,Q0=`uniform vec3 diffuse;
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
}`,eg=`#include <common>
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
}`,tg=`uniform vec3 diffuse;
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
}`,ng=`#define LAMBERT
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
}`,ig=`#define LAMBERT
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
}`,rg=`#define MATCAP
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
}`,sg=`#define MATCAP
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
}`,og=`#define NORMAL
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
}`,ag=`#define NORMAL
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
}`,lg=`#define PHONG
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
}`,cg=`#define PHONG
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
}`,ug=`#define STANDARD
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
}`,hg=`#define STANDARD
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
}`,dg=`#define TOON
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
}`,fg=`#define TOON
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
}`,pg=`uniform float size;
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
}`,mg=`uniform vec3 diffuse;
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
}`,gg=`#include <common>
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
}`,xg=`uniform vec3 color;
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
}`,_g=`uniform float rotation;
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
}`,yg=`uniform vec3 diffuse;
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
}`,Qe={alphahash_fragment:Gp,alphahash_pars_fragment:Hp,alphamap_fragment:Vp,alphamap_pars_fragment:Wp,alphatest_fragment:Xp,alphatest_pars_fragment:qp,aomap_fragment:Yp,aomap_pars_fragment:Kp,batching_pars_vertex:Zp,batching_vertex:Jp,begin_vertex:$p,beginnormal_vertex:jp,bsdfs:Qp,iridescence_fragment:em,bumpmap_pars_fragment:tm,clipping_planes_fragment:nm,clipping_planes_pars_fragment:im,clipping_planes_pars_vertex:rm,clipping_planes_vertex:sm,color_fragment:om,color_pars_fragment:am,color_pars_vertex:lm,color_vertex:cm,common:um,cube_uv_reflection_fragment:hm,defaultnormal_vertex:dm,displacementmap_pars_vertex:fm,displacementmap_vertex:pm,emissivemap_fragment:mm,emissivemap_pars_fragment:gm,colorspace_fragment:xm,colorspace_pars_fragment:_m,envmap_fragment:ym,envmap_common_pars_fragment:vm,envmap_pars_fragment:bm,envmap_pars_vertex:Mm,envmap_physical_pars_fragment:Um,envmap_vertex:Sm,fog_vertex:wm,fog_pars_vertex:Em,fog_fragment:Tm,fog_pars_fragment:Am,gradientmap_pars_fragment:Rm,lightmap_fragment:Cm,lightmap_pars_fragment:Pm,lights_lambert_fragment:Im,lights_lambert_pars_fragment:Lm,lights_pars_begin:Dm,lights_toon_fragment:Nm,lights_toon_pars_fragment:Om,lights_phong_fragment:Fm,lights_phong_pars_fragment:zm,lights_physical_fragment:km,lights_physical_pars_fragment:Bm,lights_fragment_begin:Gm,lights_fragment_maps:Hm,lights_fragment_end:Vm,logdepthbuf_fragment:Wm,logdepthbuf_pars_fragment:Xm,logdepthbuf_pars_vertex:qm,logdepthbuf_vertex:Ym,map_fragment:Km,map_pars_fragment:Zm,map_particle_fragment:Jm,map_particle_pars_fragment:$m,metalnessmap_fragment:jm,metalnessmap_pars_fragment:Qm,morphcolor_vertex:e0,morphnormal_vertex:t0,morphtarget_pars_vertex:n0,morphtarget_vertex:i0,normal_fragment_begin:r0,normal_fragment_maps:s0,normal_pars_fragment:o0,normal_pars_vertex:a0,normal_vertex:l0,normalmap_pars_fragment:c0,clearcoat_normal_fragment_begin:u0,clearcoat_normal_fragment_maps:h0,clearcoat_pars_fragment:d0,iridescence_pars_fragment:f0,opaque_fragment:p0,packing:m0,premultiplied_alpha_fragment:g0,project_vertex:x0,dithering_fragment:_0,dithering_pars_fragment:y0,roughnessmap_fragment:v0,roughnessmap_pars_fragment:b0,shadowmap_pars_fragment:M0,shadowmap_pars_vertex:S0,shadowmap_vertex:w0,shadowmask_pars_fragment:E0,skinbase_vertex:T0,skinning_pars_vertex:A0,skinning_vertex:R0,skinnormal_vertex:C0,specularmap_fragment:P0,specularmap_pars_fragment:I0,tonemapping_fragment:L0,tonemapping_pars_fragment:D0,transmission_fragment:U0,transmission_pars_fragment:N0,uv_pars_fragment:O0,uv_pars_vertex:F0,uv_vertex:z0,worldpos_vertex:k0,background_vert:B0,background_frag:G0,backgroundCube_vert:H0,backgroundCube_frag:V0,cube_vert:W0,cube_frag:X0,depth_vert:q0,depth_frag:Y0,distanceRGBA_vert:K0,distanceRGBA_frag:Z0,equirect_vert:J0,equirect_frag:$0,linedashed_vert:j0,linedashed_frag:Q0,meshbasic_vert:eg,meshbasic_frag:tg,meshlambert_vert:ng,meshlambert_frag:ig,meshmatcap_vert:rg,meshmatcap_frag:sg,meshnormal_vert:og,meshnormal_frag:ag,meshphong_vert:lg,meshphong_frag:cg,meshphysical_vert:ug,meshphysical_frag:hg,meshtoon_vert:dg,meshtoon_frag:fg,points_vert:pg,points_frag:mg,shadow_vert:gg,shadow_frag:xg,sprite_vert:_g,sprite_frag:yg},me={common:{diffuse:{value:new Ze(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new nt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new nt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new nt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new nt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new nt},normalScale:{value:new j(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new nt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new nt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new nt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new nt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ze(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ze(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0},uvTransform:{value:new nt}},sprite:{diffuse:{value:new Ze(16777215)},opacity:{value:1},center:{value:new j(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}}},On={basic:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Qe.meshbasic_vert,fragmentShader:Qe.meshbasic_frag},lambert:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ze(0)}}]),vertexShader:Qe.meshlambert_vert,fragmentShader:Qe.meshlambert_frag},phong:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ze(0)},specular:{value:new Ze(1118481)},shininess:{value:30}}]),vertexShader:Qe.meshphong_vert,fragmentShader:Qe.meshphong_frag},standard:{uniforms:Zt([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new Ze(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag},toon:{uniforms:Zt([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new Ze(0)}}]),vertexShader:Qe.meshtoon_vert,fragmentShader:Qe.meshtoon_frag},matcap:{uniforms:Zt([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Qe.meshmatcap_vert,fragmentShader:Qe.meshmatcap_frag},points:{uniforms:Zt([me.points,me.fog]),vertexShader:Qe.points_vert,fragmentShader:Qe.points_frag},dashed:{uniforms:Zt([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qe.linedashed_vert,fragmentShader:Qe.linedashed_frag},depth:{uniforms:Zt([me.common,me.displacementmap]),vertexShader:Qe.depth_vert,fragmentShader:Qe.depth_frag},normal:{uniforms:Zt([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Qe.meshnormal_vert,fragmentShader:Qe.meshnormal_frag},sprite:{uniforms:Zt([me.sprite,me.fog]),vertexShader:Qe.sprite_vert,fragmentShader:Qe.sprite_frag},background:{uniforms:{uvTransform:{value:new nt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qe.background_vert,fragmentShader:Qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Qe.backgroundCube_vert,fragmentShader:Qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qe.cube_vert,fragmentShader:Qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qe.equirect_vert,fragmentShader:Qe.equirect_frag},distanceRGBA:{uniforms:Zt([me.common,me.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qe.distanceRGBA_vert,fragmentShader:Qe.distanceRGBA_frag},shadow:{uniforms:Zt([me.lights,me.fog,{color:{value:new Ze(0)},opacity:{value:1}}]),vertexShader:Qe.shadow_vert,fragmentShader:Qe.shadow_frag}};On.physical={uniforms:Zt([On.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new nt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new nt},clearcoatNormalScale:{value:new j(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new nt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new nt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new nt},sheen:{value:0},sheenColor:{value:new Ze(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new nt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new nt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new nt},transmissionSamplerSize:{value:new j},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new nt},attenuationDistance:{value:0},attenuationColor:{value:new Ze(0)},specularColor:{value:new Ze(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new nt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new nt},anisotropyVector:{value:new j},anisotropyMap:{value:null},anisotropyMapTransform:{value:new nt}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag};var qs={r:0,b:0,g:0};function vg(n,e,t,i,r,s,o){let a=new Ze(0),l=s===!0?0:1,c,u,h=null,f=0,d=null;function g(p,m){let y=!1,_=m.isScene===!0?m.background:null;_&&_.isTexture&&(_=(m.backgroundBlurriness>0?t:e).get(_)),_===null?x(a,l):_&&_.isColor&&(x(_,1),y=!0);let b=n.xr.getEnvironmentBlendMode();b==="additive"?i.buffers.color.setClear(0,0,0,1,o):b==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||y)&&n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil),_&&(_.isCubeTexture||_.mapping===Oo)?(u===void 0&&(u=new oe(new on(1,1,1),new xn({name:"BackgroundCubeMaterial",uniforms:Mr(On.backgroundCube.uniforms),vertexShader:On.backgroundCube.vertexShader,fragmentShader:On.backgroundCube.fragmentShader,side:Lt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(E,S,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),u.material.uniforms.envMap.value=_,u.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=m.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,u.material.toneMapped=dt.getTransfer(_.colorSpace)!==gt,(h!==_||f!==_.version||d!==n.toneMapping)&&(u.material.needsUpdate=!0,h=_,f=_.version,d=n.toneMapping),u.layers.enableAll(),p.unshift(u,u.geometry,u.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new oe(new jt(2,2),new xn({name:"BackgroundMaterial",uniforms:Mr(On.background.uniforms),vertexShader:On.background.vertexShader,fragmentShader:On.background.fragmentShader,side:pi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,c.material.toneMapped=dt.getTransfer(_.colorSpace)!==gt,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(h!==_||f!==_.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,h=_,f=_.version,d=n.toneMapping),c.layers.enableAll(),p.unshift(c,c.geometry,c.material,0,0,null))}function x(p,m){p.getRGB(qs,ph(n)),i.buffers.color.setClear(qs.r,qs.g,qs.b,m,o)}return{getClearColor:function(){return a},setClearColor:function(p,m=1){a.set(p),l=m,x(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(p){l=p,x(a,l)},render:g}}function bg(n,e,t,i){let r=n.getParameter(n.MAX_VERTEX_ATTRIBS),s=i.isWebGL2?null:e.get("OES_vertex_array_object"),o=i.isWebGL2||s!==null,a={},l=p(null),c=l,u=!1;function h(I,z,W,$,J){let q=!1;if(o){let re=x($,W,z);c!==re&&(c=re,d(c.object)),q=m(I,$,W,J),q&&y(I,$,W,J)}else{let re=z.wireframe===!0;(c.geometry!==$.id||c.program!==W.id||c.wireframe!==re)&&(c.geometry=$.id,c.program=W.id,c.wireframe=re,q=!0)}J!==null&&t.update(J,n.ELEMENT_ARRAY_BUFFER),(q||u)&&(u=!1,C(I,z,W,$),J!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(J).buffer))}function f(){return i.isWebGL2?n.createVertexArray():s.createVertexArrayOES()}function d(I){return i.isWebGL2?n.bindVertexArray(I):s.bindVertexArrayOES(I)}function g(I){return i.isWebGL2?n.deleteVertexArray(I):s.deleteVertexArrayOES(I)}function x(I,z,W){let $=W.wireframe===!0,J=a[I.id];J===void 0&&(J={},a[I.id]=J);let q=J[z.id];q===void 0&&(q={},J[z.id]=q);let re=q[$];return re===void 0&&(re=p(f()),q[$]=re),re}function p(I){let z=[],W=[],$=[];for(let J=0;J<r;J++)z[J]=0,W[J]=0,$[J]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:W,attributeDivisors:$,object:I,attributes:{},index:null}}function m(I,z,W,$){let J=c.attributes,q=z.attributes,re=0,k=W.getAttributes();for(let Q in k)if(k[Q].location>=0){let te=J[Q],Se=q[Q];if(Se===void 0&&(Q==="instanceMatrix"&&I.instanceMatrix&&(Se=I.instanceMatrix),Q==="instanceColor"&&I.instanceColor&&(Se=I.instanceColor)),te===void 0||te.attribute!==Se||Se&&te.data!==Se.data)return!0;re++}return c.attributesNum!==re||c.index!==$}function y(I,z,W,$){let J={},q=z.attributes,re=0,k=W.getAttributes();for(let Q in k)if(k[Q].location>=0){let te=q[Q];te===void 0&&(Q==="instanceMatrix"&&I.instanceMatrix&&(te=I.instanceMatrix),Q==="instanceColor"&&I.instanceColor&&(te=I.instanceColor));let Se={};Se.attribute=te,te&&te.data&&(Se.data=te.data),J[Q]=Se,re++}c.attributes=J,c.attributesNum=re,c.index=$}function _(){let I=c.newAttributes;for(let z=0,W=I.length;z<W;z++)I[z]=0}function b(I){E(I,0)}function E(I,z){let W=c.newAttributes,$=c.enabledAttributes,J=c.attributeDivisors;W[I]=1,$[I]===0&&(n.enableVertexAttribArray(I),$[I]=1),J[I]!==z&&((i.isWebGL2?n:e.get("ANGLE_instanced_arrays"))[i.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](I,z),J[I]=z)}function S(){let I=c.newAttributes,z=c.enabledAttributes;for(let W=0,$=z.length;W<$;W++)z[W]!==I[W]&&(n.disableVertexAttribArray(W),z[W]=0)}function A(I,z,W,$,J,q,re){re===!0?n.vertexAttribIPointer(I,z,W,J,q):n.vertexAttribPointer(I,z,W,$,J,q)}function C(I,z,W,$){if(i.isWebGL2===!1&&(I.isInstancedMesh||$.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;_();let J=$.attributes,q=W.getAttributes(),re=z.defaultAttributeValues;for(let k in q){let Q=q[k];if(Q.location>=0){let V=J[k];if(V===void 0&&(k==="instanceMatrix"&&I.instanceMatrix&&(V=I.instanceMatrix),k==="instanceColor"&&I.instanceColor&&(V=I.instanceColor)),V!==void 0){let te=V.normalized,Se=V.itemSize,Le=t.get(V);if(Le===void 0)continue;let _e=Le.buffer,Fe=Le.type,ze=Le.bytesPerElement,ce=i.isWebGL2===!0&&(Fe===n.INT||Fe===n.UNSIGNED_INT||V.gpuType===th);if(V.isInterleavedBufferAttribute){let ge=V.data,L=ge.stride,de=V.offset;if(ge.isInstancedInterleavedBuffer){for(let Z=0;Z<Q.locationSize;Z++)E(Q.location+Z,ge.meshPerAttribute);I.isInstancedMesh!==!0&&$._maxInstanceCount===void 0&&($._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let Z=0;Z<Q.locationSize;Z++)b(Q.location+Z);n.bindBuffer(n.ARRAY_BUFFER,_e);for(let Z=0;Z<Q.locationSize;Z++)A(Q.location+Z,Se/Q.locationSize,Fe,te,L*ze,(de+Se/Q.locationSize*Z)*ze,ce)}else{if(V.isInstancedBufferAttribute){for(let ge=0;ge<Q.locationSize;ge++)E(Q.location+ge,V.meshPerAttribute);I.isInstancedMesh!==!0&&$._maxInstanceCount===void 0&&($._maxInstanceCount=V.meshPerAttribute*V.count)}else for(let ge=0;ge<Q.locationSize;ge++)b(Q.location+ge);n.bindBuffer(n.ARRAY_BUFFER,_e);for(let ge=0;ge<Q.locationSize;ge++)A(Q.location+ge,Se/Q.locationSize,Fe,te,Se*ze,Se/Q.locationSize*ge*ze,ce)}}else if(re!==void 0){let te=re[k];if(te!==void 0)switch(te.length){case 2:n.vertexAttrib2fv(Q.location,te);break;case 3:n.vertexAttrib3fv(Q.location,te);break;case 4:n.vertexAttrib4fv(Q.location,te);break;default:n.vertexAttrib1fv(Q.location,te)}}}}S()}function v(){O();for(let I in a){let z=a[I];for(let W in z){let $=z[W];for(let J in $)g($[J].object),delete $[J];delete z[W]}delete a[I]}}function M(I){if(a[I.id]===void 0)return;let z=a[I.id];for(let W in z){let $=z[W];for(let J in $)g($[J].object),delete $[J];delete z[W]}delete a[I.id]}function D(I){for(let z in a){let W=a[z];if(W[I.id]===void 0)continue;let $=W[I.id];for(let J in $)g($[J].object),delete $[J];delete W[I.id]}}function O(){Y(),u=!0,c!==l&&(c=l,d(c.object))}function Y(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:O,resetDefaultState:Y,dispose:v,releaseStatesOfGeometry:M,releaseStatesOfProgram:D,initAttributes:_,enableAttribute:b,disableUnusedAttributes:S}}function Mg(n,e,t,i){let r=i.isWebGL2,s;function o(u){s=u}function a(u,h){n.drawArrays(s,u,h),t.update(h,s,1)}function l(u,h,f){if(f===0)return;let d,g;if(r)d=n,g="drawArraysInstanced";else if(d=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",d===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[g](s,u,h,f),t.update(h,s,f)}function c(u,h,f){if(f===0)return;let d=e.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<f;g++)this.render(u[g],h[g]);else{d.multiDrawArraysWEBGL(s,u,0,h,0,f);let g=0;for(let x=0;x<f;x++)g+=h[x];t.update(g,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function Sg(n,e,t){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");i=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function s(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let o=typeof WebGL2RenderingContext<"u"&&n.constructor.name==="WebGL2RenderingContext",a=t.precision!==void 0?t.precision:"highp",l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);let c=o||e.has("WEBGL_draw_buffers"),u=t.logarithmicDepthBuffer===!0,h=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),f=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),d=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),x=n.getParameter(n.MAX_VERTEX_ATTRIBS),p=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),m=n.getParameter(n.MAX_VARYING_VECTORS),y=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),_=f>0,b=o||e.has("OES_texture_float"),E=_&&b,S=o?n.getParameter(n.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:r,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:u,maxTextures:h,maxVertexTextures:f,maxTextureSize:d,maxCubemapSize:g,maxAttributes:x,maxVertexUniforms:p,maxVaryings:m,maxFragmentUniforms:y,vertexTextures:_,floatFragmentTextures:b,floatVertexTextures:E,maxSamples:S}}function wg(n){let e=this,t=null,i=0,r=!1,s=!1,o=new Kn,a=new nt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let d=h.length!==0||f||i!==0||r;return r=f,i=h.length,d},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,d){let g=h.clippingPlanes,x=h.clipIntersection,p=h.clipShadows,m=n.get(h);if(!r||g===null||g.length===0||s&&!p)s?u(null):c();else{let y=s?0:i,_=y*4,b=m.clippingState||null;l.value=b,b=u(g,f,_,d);for(let E=0;E!==_;++E)b[E]=t[E];m.clippingState=b,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,f,d,g){let x=h!==null?h.length:0,p=null;if(x!==0){if(p=l.value,g!==!0||p===null){let m=d+x*4,y=f.matrixWorldInverse;a.getNormalMatrix(y),(p===null||p.length<m)&&(p=new Float32Array(m));for(let _=0,b=d;_!==x;++_,b+=4)o.copy(h[_]).applyMatrix4(y,a),o.normal.toArray(p,b),p[b+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,p}}function Eg(n){let e=new WeakMap;function t(o,a){return a===el?o.mapping=_r:a===tl&&(o.mapping=yr),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===el||a===tl)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new hl(l.height/2);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}var Fn=class extends _o{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-e,o=i+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},dr=4,bu=[.125,.215,.35,.446,.526,.582],Ii=20,Ga=new Fn,Mu=new Ze,Ha=null,Va=0,Wa=0,Ci=(1+Math.sqrt(5))/2,or=1/Ci,Su=[new P(1,1,1),new P(-1,1,1),new P(1,1,-1),new P(-1,1,-1),new P(0,Ci,or),new P(0,Ci,-or),new P(or,0,Ci),new P(-or,0,Ci),new P(Ci,or,0),new P(-Ci,or,0)],Sr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100){Ha=this._renderer.getRenderTarget(),Va=this._renderer.getActiveCubeFace(),Wa=this._renderer.getActiveMipmapLevel(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Tu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Eu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ha,Va,Wa),e.scissorTest=!1,Ys(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===_r||e.mapping===yr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ha=this._renderer.getRenderTarget(),Va=this._renderer.getActiveCubeFace(),Wa=this._renderer.getActiveMipmapLevel();let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:fn,minFilter:fn,generateMipmaps:!1,type:Fi,format:An,colorSpace:jn,depthBuffer:!1},r=wu(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=wu(e,t,i);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Tg(s)),this._blurMaterial=Ag(s,e,t)}return r}_compileMaterial(e){let t=new oe(this._lodPlanes[0],e);this._renderer.compile(t,Ga)}_sceneToCubeUV(e,t,i,r){let a=new tn(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,f=u.toneMapping;u.getClearColor(Mu),u.toneMapping=Rn,u.autoClear=!1;let d=new lt({name:"PMREM.Background",side:Lt,depthWrite:!1,depthTest:!1}),g=new oe(new on,d),x=!1,p=e.background;p?p.isColor&&(d.color.copy(p),e.background=null,x=!0):(d.color.copy(Mu),x=!0);for(let m=0;m<6;m++){let y=m%3;y===0?(a.up.set(0,l[m],0),a.lookAt(c[m],0,0)):y===1?(a.up.set(0,0,l[m]),a.lookAt(0,c[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,c[m]));let _=this._cubeSize;Ys(r,y*_,m>2?_:0,_,_),u.setRenderTarget(r),x&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=f,u.autoClear=h,e.background=p}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===_r||e.mapping===yr;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Tu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Eu());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new oe(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;Ys(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Ga)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){let s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Su[(r-1)%Su.length];this._blur(e,r-1,r,s,o)}t.autoClear=i}_blur(e,t,i,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new oe(this._lodPlanes[r],c),f=c.uniforms,d=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*Ii-1),x=s/g,p=isFinite(s)?1+Math.floor(u*x):Ii;p>Ii&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Ii}`);let m=[],y=0;for(let A=0;A<Ii;++A){let C=A/x,v=Math.exp(-C*C/2);m.push(v),A===0?y+=v:A<p&&(y+=2*v)}for(let A=0;A<m.length;A++)m[A]=m[A]/y;f.envMap.value=e.texture,f.samples.value=p,f.weights.value=m,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:_}=this;f.dTheta.value=g,f.mipInt.value=_-i;let b=this._sizeLods[r],E=3*b*(r>_-dr?r-_+dr:0),S=4*(this._cubeSize-b);Ys(t,E,S,3*b,2*b),l.setRenderTarget(t),l.render(h,Ga)}};function Tg(n){let e=[],t=[],i=[],r=n,s=n-dr+1+bu.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);t.push(a);let l=1/a;o>n-dr?l=bu[o-n+dr-1]:o===0&&(l=0),i.push(l);let c=1/(a-2),u=-c,h=1+c,f=[u,u,h,u,h,h,u,u,h,h,u,h],d=6,g=6,x=3,p=2,m=1,y=new Float32Array(x*g*d),_=new Float32Array(p*g*d),b=new Float32Array(m*g*d);for(let S=0;S<d;S++){let A=S%3*2/3-1,C=S>2?0:-1,v=[A,C,0,A+2/3,C,0,A+2/3,C+1,0,A,C,0,A+2/3,C+1,0,A,C+1,0];y.set(v,x*g*S),_.set(f,p*g*S);let M=[S,S,S,S,S,S];b.set(M,m*g*S)}let E=new Rt;E.setAttribute("position",new Xt(y,x)),E.setAttribute("uv",new Xt(_,p)),E.setAttribute("faceIndex",new Xt(b,m)),e.push(E),r>dr&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function wu(n,e,t){let i=new $t(n,e,t);return i.texture.mapping=Oo,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ys(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function Ag(n,e,t){let i=new Float32Array(Ii),r=new P(0,1,0);return new xn({name:"SphericalGaussianBlur",defines:{n:Ii,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Kl(),fragmentShader:`

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
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Eu(){return new xn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Kl(),fragmentShader:`

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
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Tu(){return new xn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Kl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Kl(){return`

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
	`}function Rg(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===el||l===tl,u=l===_r||l===yr;if(c||u)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return t===null&&(t=new Sr(n)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{let h=a.image;if(c&&h&&h.height>0||u&&h&&r(h)){t===null&&(t=new Sr(n));let f=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,f),a.addEventListener("dispose",s),f.texture}else return null}}}return a}function r(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function Cg(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(i){i.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(i){let r=t(i);return r===null&&console.warn("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function Pg(n,e,t,i){let r={},s=new WeakMap;function o(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);for(let g in f.morphAttributes){let x=f.morphAttributes[g];for(let p=0,m=x.length;p<m;p++)e.remove(x[p])}f.removeEventListener("dispose",o),delete r[f.id];let d=s.get(f);d&&(e.remove(d),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(h,f){return r[f.id]===!0||(f.addEventListener("dispose",o),r[f.id]=!0,t.memory.geometries++),f}function l(h){let f=h.attributes;for(let g in f)e.update(f[g],n.ARRAY_BUFFER);let d=h.morphAttributes;for(let g in d){let x=d[g];for(let p=0,m=x.length;p<m;p++)e.update(x[p],n.ARRAY_BUFFER)}}function c(h){let f=[],d=h.index,g=h.attributes.position,x=0;if(d!==null){let y=d.array;x=d.version;for(let _=0,b=y.length;_<b;_+=3){let E=y[_+0],S=y[_+1],A=y[_+2];f.push(E,S,S,A,A,E)}}else if(g!==void 0){let y=g.array;x=g.version;for(let _=0,b=y.length/3-1;_<b;_+=3){let E=_+0,S=_+1,A=_+2;f.push(E,S,S,A,A,E)}}else return;let p=new(dh(f)?xo:go)(f,1);p.version=x;let m=s.get(h);m&&e.remove(m),s.set(h,p)}function u(h){let f=s.get(h);if(f){let d=h.index;d!==null&&f.version<d.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function Ig(n,e,t,i){let r=i.isWebGL2,s;function o(d){s=d}let a,l;function c(d){a=d.type,l=d.bytesPerElement}function u(d,g){n.drawElements(s,g,a,d*l),t.update(g,s,1)}function h(d,g,x){if(x===0)return;let p,m;if(r)p=n,m="drawElementsInstanced";else if(p=e.get("ANGLE_instanced_arrays"),m="drawElementsInstancedANGLE",p===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[m](s,g,a,d*l,x),t.update(g,s,x)}function f(d,g,x){if(x===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<x;m++)this.render(d[m]/l,g[m]);else{p.multiDrawElementsWEBGL(s,g,0,a,d,0,x);let m=0;for(let y=0;y<x;y++)m+=g[y];t.update(m,s,1)}}this.setMode=o,this.setIndex=c,this.render=u,this.renderInstances=h,this.renderMultiDraw=f}function Lg(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function Dg(n,e){return n[0]-e[0]}function Ug(n,e){return Math.abs(e[1])-Math.abs(n[1])}function Ng(n,e,t){let i={},r=new Float32Array(8),s=new WeakMap,o=new vt,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,u,h){let f=c.morphTargetInfluences;if(e.isWebGL2===!0){let d=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,g=d!==void 0?d.length:0,x=s.get(u);if(x===void 0||x.count!==g){let I=function(){O.dispose(),s.delete(u),u.removeEventListener("dispose",I)};x!==void 0&&x.texture.dispose();let y=u.morphAttributes.position!==void 0,_=u.morphAttributes.normal!==void 0,b=u.morphAttributes.color!==void 0,E=u.morphAttributes.position||[],S=u.morphAttributes.normal||[],A=u.morphAttributes.color||[],C=0;y===!0&&(C=1),_===!0&&(C=2),b===!0&&(C=3);let v=u.attributes.position.count*C,M=1;v>e.maxTextureSize&&(M=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let D=new Float32Array(v*M*4*g),O=new fo(D,v,M,g);O.type=ui,O.needsUpdate=!0;let Y=C*4;for(let z=0;z<g;z++){let W=E[z],$=S[z],J=A[z],q=v*M*4*z;for(let re=0;re<W.count;re++){let k=re*Y;y===!0&&(o.fromBufferAttribute(W,re),D[q+k+0]=o.x,D[q+k+1]=o.y,D[q+k+2]=o.z,D[q+k+3]=0),_===!0&&(o.fromBufferAttribute($,re),D[q+k+4]=o.x,D[q+k+5]=o.y,D[q+k+6]=o.z,D[q+k+7]=0),b===!0&&(o.fromBufferAttribute(J,re),D[q+k+8]=o.x,D[q+k+9]=o.y,D[q+k+10]=o.z,D[q+k+11]=J.itemSize===4?o.w:1)}}x={count:g,texture:O,size:new j(v,M)},s.set(u,x),u.addEventListener("dispose",I)}let p=0;for(let y=0;y<f.length;y++)p+=f[y];let m=u.morphTargetsRelative?1:1-p;h.getUniforms().setValue(n,"morphTargetBaseInfluence",m),h.getUniforms().setValue(n,"morphTargetInfluences",f),h.getUniforms().setValue(n,"morphTargetsTexture",x.texture,t),h.getUniforms().setValue(n,"morphTargetsTextureSize",x.size)}else{let d=f===void 0?0:f.length,g=i[u.id];if(g===void 0||g.length!==d){g=[];for(let _=0;_<d;_++)g[_]=[_,0];i[u.id]=g}for(let _=0;_<d;_++){let b=g[_];b[0]=_,b[1]=f[_]}g.sort(Ug);for(let _=0;_<8;_++)_<d&&g[_][1]?(a[_][0]=g[_][0],a[_][1]=g[_][1]):(a[_][0]=Number.MAX_SAFE_INTEGER,a[_][1]=0);a.sort(Dg);let x=u.morphAttributes.position,p=u.morphAttributes.normal,m=0;for(let _=0;_<8;_++){let b=a[_],E=b[0],S=b[1];E!==Number.MAX_SAFE_INTEGER&&S?(x&&u.getAttribute("morphTarget"+_)!==x[E]&&u.setAttribute("morphTarget"+_,x[E]),p&&u.getAttribute("morphNormal"+_)!==p[E]&&u.setAttribute("morphNormal"+_,p[E]),r[_]=S,m+=S):(x&&u.hasAttribute("morphTarget"+_)===!0&&u.deleteAttribute("morphTarget"+_),p&&u.hasAttribute("morphNormal"+_)===!0&&u.deleteAttribute("morphNormal"+_),r[_]=0)}let y=u.morphTargetsRelative?1:1-m;h.getUniforms().setValue(n,"morphTargetBaseInfluence",y),h.getUniforms().setValue(n,"morphTargetInfluences",r)}}return{update:l}}function Og(n,e,t,i){let r=new WeakMap;function s(l){let c=i.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==c&&(f.update(),r.set(f,c))}return h}function o(){r=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}var vo=class extends gn{constructor(e,t,i,r,s,o,a,l,c,u){if(u=u!==void 0?u:Ui,u!==Ui&&u!==br)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===Ui&&(i=ci),i===void 0&&u===br&&(i=Di),super(null,r,s,o,a,l,u,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Jt,this.minFilter=l!==void 0?l:Jt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},gh=new gn,xh=new vo(1,1);xh.compareFunction=hh;var _h=new fo,yh=new ll,vh=new yo,Au=[],Ru=[],Cu=new Float32Array(16),Pu=new Float32Array(9),Iu=new Float32Array(4);function Ir(n,e,t){let i=n[0];if(i<=0||i>0)return n;let r=e*t,s=Au[r];if(s===void 0&&(s=new Float32Array(r),Au[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function Ut(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Nt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function zo(n,e){let t=Ru[e];t===void 0&&(t=new Int32Array(e),Ru[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Fg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function zg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;n.uniform2fv(this.addr,e),Nt(t,e)}}function kg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ut(t,e))return;n.uniform3fv(this.addr,e),Nt(t,e)}}function Bg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;n.uniform4fv(this.addr,e),Nt(t,e)}}function Gg(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,i))return;Iu.set(i),n.uniformMatrix2fv(this.addr,!1,Iu),Nt(t,i)}}function Hg(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,i))return;Pu.set(i),n.uniformMatrix3fv(this.addr,!1,Pu),Nt(t,i)}}function Vg(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,i))return;Cu.set(i),n.uniformMatrix4fv(this.addr,!1,Cu),Nt(t,i)}}function Wg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Xg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;n.uniform2iv(this.addr,e),Nt(t,e)}}function qg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;n.uniform3iv(this.addr,e),Nt(t,e)}}function Yg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;n.uniform4iv(this.addr,e),Nt(t,e)}}function Kg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Zg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;n.uniform2uiv(this.addr,e),Nt(t,e)}}function Jg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;n.uniform3uiv(this.addr,e),Nt(t,e)}}function $g(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;n.uniform4uiv(this.addr,e),Nt(t,e)}}function jg(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s=this.type===n.SAMPLER_2D_SHADOW?xh:gh;t.setTexture2D(e||s,r)}function Qg(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||yh,r)}function ex(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||vh,r)}function tx(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||_h,r)}function nx(n){switch(n){case 5126:return Fg;case 35664:return zg;case 35665:return kg;case 35666:return Bg;case 35674:return Gg;case 35675:return Hg;case 35676:return Vg;case 5124:case 35670:return Wg;case 35667:case 35671:return Xg;case 35668:case 35672:return qg;case 35669:case 35673:return Yg;case 5125:return Kg;case 36294:return Zg;case 36295:return Jg;case 36296:return $g;case 35678:case 36198:case 36298:case 36306:case 35682:return jg;case 35679:case 36299:case 36307:return Qg;case 35680:case 36300:case 36308:case 36293:return ex;case 36289:case 36303:case 36311:case 36292:return tx}}function ix(n,e){n.uniform1fv(this.addr,e)}function rx(n,e){let t=Ir(e,this.size,2);n.uniform2fv(this.addr,t)}function sx(n,e){let t=Ir(e,this.size,3);n.uniform3fv(this.addr,t)}function ox(n,e){let t=Ir(e,this.size,4);n.uniform4fv(this.addr,t)}function ax(n,e){let t=Ir(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function lx(n,e){let t=Ir(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function cx(n,e){let t=Ir(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function ux(n,e){n.uniform1iv(this.addr,e)}function hx(n,e){n.uniform2iv(this.addr,e)}function dx(n,e){n.uniform3iv(this.addr,e)}function fx(n,e){n.uniform4iv(this.addr,e)}function px(n,e){n.uniform1uiv(this.addr,e)}function mx(n,e){n.uniform2uiv(this.addr,e)}function gx(n,e){n.uniform3uiv(this.addr,e)}function xx(n,e){n.uniform4uiv(this.addr,e)}function _x(n,e,t){let i=this.cache,r=e.length,s=zo(t,r);Ut(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||gh,s[o])}function yx(n,e,t){let i=this.cache,r=e.length,s=zo(t,r);Ut(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||yh,s[o])}function vx(n,e,t){let i=this.cache,r=e.length,s=zo(t,r);Ut(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||vh,s[o])}function bx(n,e,t){let i=this.cache,r=e.length,s=zo(t,r);Ut(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||_h,s[o])}function Mx(n){switch(n){case 5126:return ix;case 35664:return rx;case 35665:return sx;case 35666:return ox;case 35674:return ax;case 35675:return lx;case 35676:return cx;case 5124:case 35670:return ux;case 35667:case 35671:return hx;case 35668:case 35672:return dx;case 35669:case 35673:return fx;case 5125:return px;case 36294:return mx;case 36295:return gx;case 36296:return xx;case 35678:case 36198:case 36298:case 36306:case 35682:return _x;case 35679:case 36299:case 36307:return yx;case 35680:case 36300:case 36308:case 36293:return vx;case 36289:case 36303:case 36311:case 36292:return bx}}var dl=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=nx(t.type)}},fl=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Mx(t.type)}},pl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],i)}}},Xa=/(\w+)(\])?(\[|\.)?/g;function Lu(n,e){n.seq.push(e),n.map[e.id]=e}function Sx(n,e,t){let i=n.name,r=i.length;for(Xa.lastIndex=0;;){let s=Xa.exec(i),o=Xa.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Lu(t,c===void 0?new dl(a,n,e):new fl(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new pl(a),Lu(t,h)),t=h}}}var xr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);Sx(s,o,this)}}setValue(e,t,i,r){let s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&i.push(o)}return i}};function Du(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var wx=37297,Ex=0;function Tx(n,e){let t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}function Ax(n){let e=dt.getPrimaries(dt.workingColorSpace),t=dt.getPrimaries(n),i;switch(e===t?i="":e===ao&&t===oo?i="LinearDisplayP3ToLinearSRGB":e===oo&&t===ao&&(i="LinearSRGBToLinearDisplayP3"),n){case jn:case Fo:return[i,"LinearTransferOETF"];case yt:case Yl:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function Uu(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+Tx(n.getShaderSource(e),o)}else return r}function Rx(n,e){let t=Ax(e);return`vec4 ${n}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function Cx(n,e){let t;switch(e){case Kf:t="Linear";break;case Zf:t="Reinhard";break;case Jf:t="OptimizedCineon";break;case No:t="ACESFilmic";break;case jf:t="AgX";break;case $f:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function Px(n){return[n.extensionDerivatives||n.envMapCubeUVHeight||n.bumpMap||n.normalMapTangentSpace||n.clearcoatNormalMap||n.flatShading||n.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(n.extensionFragDepth||n.logarithmicDepthBuffer)&&n.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",n.extensionDrawBuffers&&n.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(n.extensionShaderTextureLOD||n.envMap||n.transmission)&&n.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(fr).join(`
`)}function Ix(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(fr).join(`
`)}function Lx(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Dx(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=n.getActiveAttrib(e,r),o=s.name,a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function fr(n){return n!==""}function Nu(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ou(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Ux=/^[ \t]*#include +<([\w\d./]+)>/gm;function ml(n){return n.replace(Ux,Ox)}var Nx=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function Ox(n,e){let t=Qe[e];if(t===void 0){let i=Nx.get(e);if(i!==void 0)t=Qe[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return ml(t)}var Fx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Fu(n){return n.replace(Fx,zx)}function zx(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function zu(n){let e="precision "+n.precision+` float;
precision `+n.precision+" int;";return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function kx(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Qu?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Hl?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Yn&&(e="SHADOWMAP_TYPE_VSM"),e}function Bx(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case _r:case yr:e="ENVMAP_TYPE_CUBE";break;case Oo:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Gx(n){let e="ENVMAP_MODE_REFLECTION";return n.envMap&&n.envMapMode===yr&&(e="ENVMAP_MODE_REFRACTION"),e}function Hx(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Wl:e="ENVMAP_BLENDING_MULTIPLY";break;case qf:e="ENVMAP_BLENDING_MIX";break;case Yf:e="ENVMAP_BLENDING_ADD";break}return e}function Vx(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Wx(n,e,t,i){let r=n.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=kx(t),c=Bx(t),u=Gx(t),h=Hx(t),f=Vx(t),d=t.isWebGL2?"":Px(t),g=Ix(t),x=Lx(s),p=r.createProgram(),m,y,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(fr).join(`
`),m.length>0&&(m+=`
`),y=[d,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(fr).join(`
`),y.length>0&&(y+=`
`)):(m=[zu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(fr).join(`
`),y=[d,zu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Rn?"#define TONE_MAPPING":"",t.toneMapping!==Rn?Qe.tonemapping_pars_fragment:"",t.toneMapping!==Rn?Cx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Qe.colorspace_pars_fragment,Rx("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(fr).join(`
`)),o=ml(o),o=Nu(o,t),o=Ou(o,t),a=ml(a),a=Nu(a,t),a=Ou(a,t),o=Fu(o),a=Fu(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,y=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===iu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===iu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);let b=_+m+o,E=_+y+a,S=Du(r,r.VERTEX_SHADER,b),A=Du(r,r.FRAGMENT_SHADER,E);r.attachShader(p,S),r.attachShader(p,A),t.index0AttributeName!==void 0?r.bindAttribLocation(p,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(p,0,"position"),r.linkProgram(p);function C(O){if(n.debug.checkShaderErrors){let Y=r.getProgramInfoLog(p).trim(),I=r.getShaderInfoLog(S).trim(),z=r.getShaderInfoLog(A).trim(),W=!0,$=!0;if(r.getProgramParameter(p,r.LINK_STATUS)===!1)if(W=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,p,S,A);else{let J=Uu(r,S,"vertex"),q=Uu(r,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(p,r.VALIDATE_STATUS)+`

Program Info Log: `+Y+`
`+J+`
`+q)}else Y!==""?console.warn("THREE.WebGLProgram: Program Info Log:",Y):(I===""||z==="")&&($=!1);$&&(O.diagnostics={runnable:W,programLog:Y,vertexShader:{log:I,prefix:m},fragmentShader:{log:z,prefix:y}})}r.deleteShader(S),r.deleteShader(A),v=new xr(r,p),M=Dx(r,p)}let v;this.getUniforms=function(){return v===void 0&&C(this),v};let M;this.getAttributes=function(){return M===void 0&&C(this),M};let D=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=r.getProgramParameter(p,wx)),D},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(p),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Ex++,this.cacheKey=e,this.usedTimes=1,this.program=p,this.vertexShader=S,this.fragmentShader=A,this}var Xx=0,gl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new xl(e),t.set(e,i)),i}},xl=class{constructor(e){this.id=Xx++,this.code=e,this.usedTimes=0}};function qx(n,e,t,i,r,s,o){let a=new mo,l=new gl,c=[],u=r.isWebGL2,h=r.logarithmicDepthBuffer,f=r.vertexTextures,d=r.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(v){return v===0?"uv":`uv${v}`}function p(v,M,D,O,Y){let I=O.fog,z=Y.geometry,W=v.isMeshStandardMaterial?O.environment:null,$=(v.isMeshStandardMaterial?t:e).get(v.envMap||W),J=$&&$.mapping===Oo?$.image.height:null,q=g[v.type];v.precision!==null&&(d=r.getMaxPrecision(v.precision),d!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",d,"instead."));let re=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,k=re!==void 0?re.length:0,Q=0;z.morphAttributes.position!==void 0&&(Q=1),z.morphAttributes.normal!==void 0&&(Q=2),z.morphAttributes.color!==void 0&&(Q=3);let V,te,Se,Le;if(q){let Et=On[q];V=Et.vertexShader,te=Et.fragmentShader}else V=v.vertexShader,te=v.fragmentShader,l.update(v),Se=l.getVertexShaderID(v),Le=l.getFragmentShaderID(v);let _e=n.getRenderTarget(),Fe=Y.isInstancedMesh===!0,ze=Y.isBatchedMesh===!0,ce=!!v.map,ge=!!v.matcap,L=!!$,de=!!v.aoMap,Z=!!v.lightMap,he=!!v.bumpMap,K=!!v.normalMap,Re=!!v.displacementMap,pe=!!v.emissiveMap,R=!!v.metalnessMap,w=!!v.roughnessMap,F=v.anisotropy>0,le=v.clearcoat>0,se=v.iridescence>0,ee=v.sheen>0,Pe=v.transmission>0,ye=F&&!!v.anisotropyMap,we=le&&!!v.clearcoatMap,ke=le&&!!v.clearcoatNormalMap,Je=le&&!!v.clearcoatRoughnessMap,ae=se&&!!v.iridescenceMap,it=se&&!!v.iridescenceThicknessMap,et=ee&&!!v.sheenColorMap,Ye=ee&&!!v.sheenRoughnessMap,Ne=!!v.specularMap,Ee=!!v.specularColorMap,Ge=!!v.specularIntensityMap,rt=Pe&&!!v.transmissionMap,xt=Pe&&!!v.thicknessMap,je=!!v.gradientMap,fe=!!v.alphaMap,U=v.alphaTest>0,ve=!!v.alphaHash,be=!!v.extensions,Ve=!!z.attributes.uv1,Be=!!z.attributes.uv2,ut=!!z.attributes.uv3,ht=Rn;return v.toneMapped&&(_e===null||_e.isXRRenderTarget===!0)&&(ht=n.toneMapping),{isWebGL2:u,shaderID:q,shaderType:v.type,shaderName:v.name,vertexShader:V,fragmentShader:te,defines:v.defines,customVertexShaderID:Se,customFragmentShaderID:Le,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:d,batching:ze,instancing:Fe,instancingColor:Fe&&Y.instanceColor!==null,supportsVertexTextures:f,outputColorSpace:_e===null?n.outputColorSpace:_e.isXRRenderTarget===!0?_e.texture.colorSpace:jn,map:ce,matcap:ge,envMap:L,envMapMode:L&&$.mapping,envMapCubeUVHeight:J,aoMap:de,lightMap:Z,bumpMap:he,normalMap:K,displacementMap:f&&Re,emissiveMap:pe,normalMapObjectSpace:K&&v.normalMapType===up,normalMapTangentSpace:K&&v.normalMapType===ql,metalnessMap:R,roughnessMap:w,anisotropy:F,anisotropyMap:ye,clearcoat:le,clearcoatMap:we,clearcoatNormalMap:ke,clearcoatRoughnessMap:Je,iridescence:se,iridescenceMap:ae,iridescenceThicknessMap:it,sheen:ee,sheenColorMap:et,sheenRoughnessMap:Ye,specularMap:Ne,specularColorMap:Ee,specularIntensityMap:Ge,transmission:Pe,transmissionMap:rt,thicknessMap:xt,gradientMap:je,opaque:v.transparent===!1&&v.blending===mr,alphaMap:fe,alphaTest:U,alphaHash:ve,combine:v.combine,mapUv:ce&&x(v.map.channel),aoMapUv:de&&x(v.aoMap.channel),lightMapUv:Z&&x(v.lightMap.channel),bumpMapUv:he&&x(v.bumpMap.channel),normalMapUv:K&&x(v.normalMap.channel),displacementMapUv:Re&&x(v.displacementMap.channel),emissiveMapUv:pe&&x(v.emissiveMap.channel),metalnessMapUv:R&&x(v.metalnessMap.channel),roughnessMapUv:w&&x(v.roughnessMap.channel),anisotropyMapUv:ye&&x(v.anisotropyMap.channel),clearcoatMapUv:we&&x(v.clearcoatMap.channel),clearcoatNormalMapUv:ke&&x(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Je&&x(v.clearcoatRoughnessMap.channel),iridescenceMapUv:ae&&x(v.iridescenceMap.channel),iridescenceThicknessMapUv:it&&x(v.iridescenceThicknessMap.channel),sheenColorMapUv:et&&x(v.sheenColorMap.channel),sheenRoughnessMapUv:Ye&&x(v.sheenRoughnessMap.channel),specularMapUv:Ne&&x(v.specularMap.channel),specularColorMapUv:Ee&&x(v.specularColorMap.channel),specularIntensityMapUv:Ge&&x(v.specularIntensityMap.channel),transmissionMapUv:rt&&x(v.transmissionMap.channel),thicknessMapUv:xt&&x(v.thicknessMap.channel),alphaMapUv:fe&&x(v.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(K||F),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,vertexUv1s:Ve,vertexUv2s:Be,vertexUv3s:ut,pointsUvs:Y.isPoints===!0&&!!z.attributes.uv&&(ce||fe),fog:!!I,useFog:v.fog===!0,fogExp2:I&&I.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:Y.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:k,morphTextureStride:Q,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&D.length>0,shadowMapType:n.shadowMap.type,toneMapping:ht,useLegacyLights:n._useLegacyLights,decodeVideoTexture:ce&&v.map.isVideoTexture===!0&&dt.getTransfer(v.map.colorSpace)===gt,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===pn,flipSided:v.side===Lt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionDerivatives:be&&v.extensions.derivatives===!0,extensionFragDepth:be&&v.extensions.fragDepth===!0,extensionDrawBuffers:be&&v.extensions.drawBuffers===!0,extensionShaderTextureLOD:be&&v.extensions.shaderTextureLOD===!0,extensionClipCullDistance:be&&v.extensions.clipCullDistance&&i.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:u||i.has("EXT_frag_depth"),rendererExtensionDrawBuffers:u||i.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:u||i.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()}}function m(v){let M=[];if(v.shaderID?M.push(v.shaderID):(M.push(v.customVertexShaderID),M.push(v.customFragmentShaderID)),v.defines!==void 0)for(let D in v.defines)M.push(D),M.push(v.defines[D]);return v.isRawShaderMaterial===!1&&(y(M,v),_(M,v),M.push(n.outputColorSpace)),M.push(v.customProgramCacheKey),M.join()}function y(v,M){v.push(M.precision),v.push(M.outputColorSpace),v.push(M.envMapMode),v.push(M.envMapCubeUVHeight),v.push(M.mapUv),v.push(M.alphaMapUv),v.push(M.lightMapUv),v.push(M.aoMapUv),v.push(M.bumpMapUv),v.push(M.normalMapUv),v.push(M.displacementMapUv),v.push(M.emissiveMapUv),v.push(M.metalnessMapUv),v.push(M.roughnessMapUv),v.push(M.anisotropyMapUv),v.push(M.clearcoatMapUv),v.push(M.clearcoatNormalMapUv),v.push(M.clearcoatRoughnessMapUv),v.push(M.iridescenceMapUv),v.push(M.iridescenceThicknessMapUv),v.push(M.sheenColorMapUv),v.push(M.sheenRoughnessMapUv),v.push(M.specularMapUv),v.push(M.specularColorMapUv),v.push(M.specularIntensityMapUv),v.push(M.transmissionMapUv),v.push(M.thicknessMapUv),v.push(M.combine),v.push(M.fogExp2),v.push(M.sizeAttenuation),v.push(M.morphTargetsCount),v.push(M.morphAttributeCount),v.push(M.numDirLights),v.push(M.numPointLights),v.push(M.numSpotLights),v.push(M.numSpotLightMaps),v.push(M.numHemiLights),v.push(M.numRectAreaLights),v.push(M.numDirLightShadows),v.push(M.numPointLightShadows),v.push(M.numSpotLightShadows),v.push(M.numSpotLightShadowsWithMaps),v.push(M.numLightProbes),v.push(M.shadowMapType),v.push(M.toneMapping),v.push(M.numClippingPlanes),v.push(M.numClipIntersection),v.push(M.depthPacking)}function _(v,M){a.disableAll(),M.isWebGL2&&a.enable(0),M.supportsVertexTextures&&a.enable(1),M.instancing&&a.enable(2),M.instancingColor&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),v.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.skinning&&a.enable(4),M.morphTargets&&a.enable(5),M.morphNormals&&a.enable(6),M.morphColors&&a.enable(7),M.premultipliedAlpha&&a.enable(8),M.shadowMapEnabled&&a.enable(9),M.useLegacyLights&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),v.push(a.mask)}function b(v){let M=g[v.type],D;if(M){let O=On[M];D=Np.clone(O.uniforms)}else D=v.uniforms;return D}function E(v,M){let D;for(let O=0,Y=c.length;O<Y;O++){let I=c[O];if(I.cacheKey===M){D=I,++D.usedTimes;break}}return D===void 0&&(D=new Wx(n,M,v,s),c.push(D)),D}function S(v){if(--v.usedTimes===0){let M=c.indexOf(v);c[M]=c[c.length-1],c.pop(),v.destroy()}}function A(v){l.remove(v)}function C(){l.dispose()}return{getParameters:p,getProgramCacheKey:m,getUniforms:b,acquireProgram:E,releaseProgram:S,releaseShaderCache:A,programs:c,dispose:C}}function Yx(){let n=new WeakMap;function e(s){let o=n.get(s);return o===void 0&&(o={},n.set(s,o)),o}function t(s){n.delete(s)}function i(s,o,a){n.get(s)[o]=a}function r(){n=new WeakMap}return{get:e,remove:t,update:i,dispose:r}}function Kx(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function ku(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Bu(){let n=[],e=0,t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(h,f,d,g,x,p){let m=n[e];return m===void 0?(m={id:h.id,object:h,geometry:f,material:d,groupOrder:g,renderOrder:h.renderOrder,z:x,group:p},n[e]=m):(m.id=h.id,m.object=h,m.geometry=f,m.material=d,m.groupOrder=g,m.renderOrder=h.renderOrder,m.z=x,m.group=p),e++,m}function a(h,f,d,g,x,p){let m=o(h,f,d,g,x,p);d.transmission>0?i.push(m):d.transparent===!0?r.push(m):t.push(m)}function l(h,f,d,g,x,p){let m=o(h,f,d,g,x,p);d.transmission>0?i.unshift(m):d.transparent===!0?r.unshift(m):t.unshift(m)}function c(h,f){t.length>1&&t.sort(h||Kx),i.length>1&&i.sort(f||ku),r.length>1&&r.sort(f||ku)}function u(){for(let h=e,f=n.length;h<f;h++){let d=n[h];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function Zx(){let n=new WeakMap;function e(i,r){let s=n.get(i),o;return s===void 0?(o=new Bu,n.set(i,[o])):r>=s.length?(o=new Bu,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function Jx(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Ze};break;case"SpotLight":t={position:new P,direction:new P,color:new Ze,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ze,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ze,groundColor:new Ze};break;case"RectAreaLight":t={color:new Ze,position:new P,halfWidth:new P,halfHeight:new P};break}return n[e.id]=t,t}}}function $x(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new j};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new j};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new j,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var jx=0;function Qx(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function e_(n,e){let t=new Jx,i=$x(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)r.probe.push(new P);let s=new P,o=new pt,a=new pt;function l(u,h){let f=0,d=0,g=0;for(let O=0;O<9;O++)r.probe[O].set(0,0,0);let x=0,p=0,m=0,y=0,_=0,b=0,E=0,S=0,A=0,C=0,v=0;u.sort(Qx);let M=h===!0?Math.PI:1;for(let O=0,Y=u.length;O<Y;O++){let I=u[O],z=I.color,W=I.intensity,$=I.distance,J=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)f+=z.r*W*M,d+=z.g*W*M,g+=z.b*W*M;else if(I.isLightProbe){for(let q=0;q<9;q++)r.probe[q].addScaledVector(I.sh.coefficients[q],W);v++}else if(I.isDirectionalLight){let q=t.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity*M),I.castShadow){let re=I.shadow,k=i.get(I);k.shadowBias=re.bias,k.shadowNormalBias=re.normalBias,k.shadowRadius=re.radius,k.shadowMapSize=re.mapSize,r.directionalShadow[x]=k,r.directionalShadowMap[x]=J,r.directionalShadowMatrix[x]=I.shadow.matrix,b++}r.directional[x]=q,x++}else if(I.isSpotLight){let q=t.get(I);q.position.setFromMatrixPosition(I.matrixWorld),q.color.copy(z).multiplyScalar(W*M),q.distance=$,q.coneCos=Math.cos(I.angle),q.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),q.decay=I.decay,r.spot[m]=q;let re=I.shadow;if(I.map&&(r.spotLightMap[A]=I.map,A++,re.updateMatrices(I),I.castShadow&&C++),r.spotLightMatrix[m]=re.matrix,I.castShadow){let k=i.get(I);k.shadowBias=re.bias,k.shadowNormalBias=re.normalBias,k.shadowRadius=re.radius,k.shadowMapSize=re.mapSize,r.spotShadow[m]=k,r.spotShadowMap[m]=J,S++}m++}else if(I.isRectAreaLight){let q=t.get(I);q.color.copy(z).multiplyScalar(W),q.halfWidth.set(I.width*.5,0,0),q.halfHeight.set(0,I.height*.5,0),r.rectArea[y]=q,y++}else if(I.isPointLight){let q=t.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity*M),q.distance=I.distance,q.decay=I.decay,I.castShadow){let re=I.shadow,k=i.get(I);k.shadowBias=re.bias,k.shadowNormalBias=re.normalBias,k.shadowRadius=re.radius,k.shadowMapSize=re.mapSize,k.shadowCameraNear=re.camera.near,k.shadowCameraFar=re.camera.far,r.pointShadow[p]=k,r.pointShadowMap[p]=J,r.pointShadowMatrix[p]=I.shadow.matrix,E++}r.point[p]=q,p++}else if(I.isHemisphereLight){let q=t.get(I);q.skyColor.copy(I.color).multiplyScalar(W*M),q.groundColor.copy(I.groundColor).multiplyScalar(W*M),r.hemi[_]=q,_++}}y>0&&(e.isWebGL2?n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=me.LTC_FLOAT_1,r.rectAreaLTC2=me.LTC_FLOAT_2):(r.rectAreaLTC1=me.LTC_HALF_1,r.rectAreaLTC2=me.LTC_HALF_2):n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=me.LTC_FLOAT_1,r.rectAreaLTC2=me.LTC_FLOAT_2):n.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=me.LTC_HALF_1,r.rectAreaLTC2=me.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=f,r.ambient[1]=d,r.ambient[2]=g;let D=r.hash;(D.directionalLength!==x||D.pointLength!==p||D.spotLength!==m||D.rectAreaLength!==y||D.hemiLength!==_||D.numDirectionalShadows!==b||D.numPointShadows!==E||D.numSpotShadows!==S||D.numSpotMaps!==A||D.numLightProbes!==v)&&(r.directional.length=x,r.spot.length=m,r.rectArea.length=y,r.point.length=p,r.hemi.length=_,r.directionalShadow.length=b,r.directionalShadowMap.length=b,r.pointShadow.length=E,r.pointShadowMap.length=E,r.spotShadow.length=S,r.spotShadowMap.length=S,r.directionalShadowMatrix.length=b,r.pointShadowMatrix.length=E,r.spotLightMatrix.length=S+A-C,r.spotLightMap.length=A,r.numSpotLightShadowsWithMaps=C,r.numLightProbes=v,D.directionalLength=x,D.pointLength=p,D.spotLength=m,D.rectAreaLength=y,D.hemiLength=_,D.numDirectionalShadows=b,D.numPointShadows=E,D.numSpotShadows=S,D.numSpotMaps=A,D.numLightProbes=v,r.version=jx++)}function c(u,h){let f=0,d=0,g=0,x=0,p=0,m=h.matrixWorldInverse;for(let y=0,_=u.length;y<_;y++){let b=u[y];if(b.isDirectionalLight){let E=r.directional[f];E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(m),f++}else if(b.isSpotLight){let E=r.spot[g];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(m),E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(m),g++}else if(b.isRectAreaLight){let E=r.rectArea[x];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(m),a.identity(),o.copy(b.matrixWorld),o.premultiply(m),a.extractRotation(o),E.halfWidth.set(b.width*.5,0,0),E.halfHeight.set(0,b.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),x++}else if(b.isPointLight){let E=r.point[d];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(m),d++}else if(b.isHemisphereLight){let E=r.hemi[p];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(m),p++}}}return{setup:l,setupView:c,state:r}}function Gu(n,e){let t=new e_(n,e),i=[],r=[];function s(){i.length=0,r.length=0}function o(h){i.push(h)}function a(h){r.push(h)}function l(h){t.setup(i,h)}function c(h){t.setupView(i,h)}return{init:s,state:{lightsArray:i,shadowsArray:r,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function t_(n,e){let t=new WeakMap;function i(s,o=0){let a=t.get(s),l;return a===void 0?(l=new Gu(n,e),t.set(s,[l])):o>=a.length?(l=new Gu(n,e),a.push(l)):l=a[o],l}function r(){t=new WeakMap}return{get:i,dispose:r}}var _l=class extends Qn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=lp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},yl=class extends Qn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},n_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,i_=`uniform sampler2D shadow_pass;
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
}`;function r_(n,e,t){let i=new Qr,r=new j,s=new j,o=new vt,a=new _l({depthPacking:cp}),l=new yl,c={},u=t.maxTextureSize,h={[pi]:Lt,[Lt]:pi,[pn]:pn},f=new xn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new j},radius:{value:4}},vertexShader:n_,fragmentShader:i_}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let g=new Rt;g.setAttribute("position",new Xt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new oe(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Qu;let m=this.type;this.render=function(S,A,C){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||S.length===0)return;let v=n.getRenderTarget(),M=n.getActiveCubeFace(),D=n.getActiveMipmapLevel(),O=n.state;O.setBlending(hi),O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);let Y=m!==Yn&&this.type===Yn,I=m===Yn&&this.type!==Yn;for(let z=0,W=S.length;z<W;z++){let $=S[z],J=$.shadow;if(J===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(J.autoUpdate===!1&&J.needsUpdate===!1)continue;r.copy(J.mapSize);let q=J.getFrameExtents();if(r.multiply(q),s.copy(J.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/q.x),r.x=s.x*q.x,J.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/q.y),r.y=s.y*q.y,J.mapSize.y=s.y)),J.map===null||Y===!0||I===!0){let k=this.type!==Yn?{minFilter:Jt,magFilter:Jt}:{};J.map!==null&&J.map.dispose(),J.map=new $t(r.x,r.y,k),J.map.texture.name=$.name+".shadowMap",J.camera.updateProjectionMatrix()}n.setRenderTarget(J.map),n.clear();let re=J.getViewportCount();for(let k=0;k<re;k++){let Q=J.getViewport(k);o.set(s.x*Q.x,s.y*Q.y,s.x*Q.z,s.y*Q.w),O.viewport(o),J.updateMatrices($,k),i=J.getFrustum(),b(A,C,J.camera,$,this.type)}J.isPointLightShadow!==!0&&this.type===Yn&&y(J,C),J.needsUpdate=!1}m=this.type,p.needsUpdate=!1,n.setRenderTarget(v,M,D)};function y(S,A){let C=e.update(x);f.defines.VSM_SAMPLES!==S.blurSamples&&(f.defines.VSM_SAMPLES=S.blurSamples,d.defines.VSM_SAMPLES=S.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new $t(r.x,r.y)),f.uniforms.shadow_pass.value=S.map.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,n.setRenderTarget(S.mapPass),n.clear(),n.renderBufferDirect(A,null,C,f,x,null),d.uniforms.shadow_pass.value=S.mapPass.texture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,n.setRenderTarget(S.map),n.clear(),n.renderBufferDirect(A,null,C,d,x,null)}function _(S,A,C,v){let M=null,D=C.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(D!==void 0)M=D;else if(M=C.isPointLight===!0?l:a,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){let O=M.uuid,Y=A.uuid,I=c[O];I===void 0&&(I={},c[O]=I);let z=I[Y];z===void 0&&(z=M.clone(),I[Y]=z,A.addEventListener("dispose",E)),M=z}if(M.visible=A.visible,M.wireframe=A.wireframe,v===Yn?M.side=A.shadowSide!==null?A.shadowSide:A.side:M.side=A.shadowSide!==null?A.shadowSide:h[A.side],M.alphaMap=A.alphaMap,M.alphaTest=A.alphaTest,M.map=A.map,M.clipShadows=A.clipShadows,M.clippingPlanes=A.clippingPlanes,M.clipIntersection=A.clipIntersection,M.displacementMap=A.displacementMap,M.displacementScale=A.displacementScale,M.displacementBias=A.displacementBias,M.wireframeLinewidth=A.wireframeLinewidth,M.linewidth=A.linewidth,C.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let O=n.properties.get(M);O.light=C}return M}function b(S,A,C,v,M){if(S.visible===!1)return;if(S.layers.test(A.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&M===Yn)&&(!S.frustumCulled||i.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,S.matrixWorld);let Y=e.update(S),I=S.material;if(Array.isArray(I)){let z=Y.groups;for(let W=0,$=z.length;W<$;W++){let J=z[W],q=I[J.materialIndex];if(q&&q.visible){let re=_(S,q,v,M);S.onBeforeShadow(n,S,A,C,Y,re,J),n.renderBufferDirect(C,null,Y,re,S,J),S.onAfterShadow(n,S,A,C,Y,re,J)}}}else if(I.visible){let z=_(S,I,v,M);S.onBeforeShadow(n,S,A,C,Y,z,null),n.renderBufferDirect(C,null,Y,z,S,null),S.onAfterShadow(n,S,A,C,Y,z,null)}}let O=S.children;for(let Y=0,I=O.length;Y<I;Y++)b(O[Y],A,C,v,M)}function E(S){S.target.removeEventListener("dispose",E);for(let C in c){let v=c[C],M=S.target.uuid;M in v&&(v[M].dispose(),delete v[M])}}}function s_(n,e,t){let i=t.isWebGL2;function r(){let U=!1,ve=new vt,be=null,Ve=new vt(0,0,0,0);return{setMask:function(Be){be!==Be&&!U&&(n.colorMask(Be,Be,Be,Be),be=Be)},setLocked:function(Be){U=Be},setClear:function(Be,ut,ht,Mt,Et){Et===!0&&(Be*=Mt,ut*=Mt,ht*=Mt),ve.set(Be,ut,ht,Mt),Ve.equals(ve)===!1&&(n.clearColor(Be,ut,ht,Mt),Ve.copy(ve))},reset:function(){U=!1,be=null,Ve.set(-1,0,0,0)}}}function s(){let U=!1,ve=null,be=null,Ve=null;return{setTest:function(Be){Be?ze(n.DEPTH_TEST):ce(n.DEPTH_TEST)},setMask:function(Be){ve!==Be&&!U&&(n.depthMask(Be),ve=Be)},setFunc:function(Be){if(be!==Be){switch(Be){case Bf:n.depthFunc(n.NEVER);break;case Gf:n.depthFunc(n.ALWAYS);break;case Hf:n.depthFunc(n.LESS);break;case no:n.depthFunc(n.LEQUAL);break;case Vf:n.depthFunc(n.EQUAL);break;case Wf:n.depthFunc(n.GEQUAL);break;case Vl:n.depthFunc(n.GREATER);break;case Xf:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}be=Be}},setLocked:function(Be){U=Be},setClear:function(Be){Ve!==Be&&(n.clearDepth(Be),Ve=Be)},reset:function(){U=!1,ve=null,be=null,Ve=null}}}function o(){let U=!1,ve=null,be=null,Ve=null,Be=null,ut=null,ht=null,Mt=null,Et=null;return{setTest:function(at){U||(at?ze(n.STENCIL_TEST):ce(n.STENCIL_TEST))},setMask:function(at){ve!==at&&!U&&(n.stencilMask(at),ve=at)},setFunc:function(at,Tt,nn){(be!==at||Ve!==Tt||Be!==nn)&&(n.stencilFunc(at,Tt,nn),be=at,Ve=Tt,Be=nn)},setOp:function(at,Tt,nn){(ut!==at||ht!==Tt||Mt!==nn)&&(n.stencilOp(at,Tt,nn),ut=at,ht=Tt,Mt=nn)},setLocked:function(at){U=at},setClear:function(at){Et!==at&&(n.clearStencil(at),Et=at)},reset:function(){U=!1,ve=null,be=null,Ve=null,Be=null,ut=null,ht=null,Mt=null,Et=null}}}let a=new r,l=new s,c=new o,u=new WeakMap,h=new WeakMap,f={},d={},g=new WeakMap,x=[],p=null,m=!1,y=null,_=null,b=null,E=null,S=null,A=null,C=null,v=new Ze(0,0,0),M=0,D=!1,O=null,Y=null,I=null,z=null,W=null,$=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),J=!1,q=0,re=n.getParameter(n.VERSION);re.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(re)[1]),J=q>=1):re.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),J=q>=2);let k=null,Q={},V=n.getParameter(n.SCISSOR_BOX),te=n.getParameter(n.VIEWPORT),Se=new vt().fromArray(V),Le=new vt().fromArray(te);function _e(U,ve,be,Ve){let Be=new Uint8Array(4),ut=n.createTexture();n.bindTexture(U,ut),n.texParameteri(U,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(U,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let ht=0;ht<be;ht++)i&&(U===n.TEXTURE_3D||U===n.TEXTURE_2D_ARRAY)?n.texImage3D(ve,0,n.RGBA,1,1,Ve,0,n.RGBA,n.UNSIGNED_BYTE,Be):n.texImage2D(ve+ht,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Be);return ut}let Fe={};Fe[n.TEXTURE_2D]=_e(n.TEXTURE_2D,n.TEXTURE_2D,1),Fe[n.TEXTURE_CUBE_MAP]=_e(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),i&&(Fe[n.TEXTURE_2D_ARRAY]=_e(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Fe[n.TEXTURE_3D]=_e(n.TEXTURE_3D,n.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),ze(n.DEPTH_TEST),l.setFunc(no),pe(!1),R(Mc),ze(n.CULL_FACE),K(hi);function ze(U){f[U]!==!0&&(n.enable(U),f[U]=!0)}function ce(U){f[U]!==!1&&(n.disable(U),f[U]=!1)}function ge(U,ve){return d[U]!==ve?(n.bindFramebuffer(U,ve),d[U]=ve,i&&(U===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=ve),U===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=ve)),!0):!1}function L(U,ve){let be=x,Ve=!1;if(U)if(be=g.get(ve),be===void 0&&(be=[],g.set(ve,be)),U.isWebGLMultipleRenderTargets){let Be=U.texture;if(be.length!==Be.length||be[0]!==n.COLOR_ATTACHMENT0){for(let ut=0,ht=Be.length;ut<ht;ut++)be[ut]=n.COLOR_ATTACHMENT0+ut;be.length=Be.length,Ve=!0}}else be[0]!==n.COLOR_ATTACHMENT0&&(be[0]=n.COLOR_ATTACHMENT0,Ve=!0);else be[0]!==n.BACK&&(be[0]=n.BACK,Ve=!0);Ve&&(t.isWebGL2?n.drawBuffers(be):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(be))}function de(U){return p!==U?(n.useProgram(U),p=U,!0):!1}let Z={[Pi]:n.FUNC_ADD,[Ef]:n.FUNC_SUBTRACT,[Tf]:n.FUNC_REVERSE_SUBTRACT};if(i)Z[Ec]=n.MIN,Z[Tc]=n.MAX;else{let U=e.get("EXT_blend_minmax");U!==null&&(Z[Ec]=U.MIN_EXT,Z[Tc]=U.MAX_EXT)}let he={[Af]:n.ZERO,[Rf]:n.ONE,[Cf]:n.SRC_COLOR,[ja]:n.SRC_ALPHA,[Nf]:n.SRC_ALPHA_SATURATE,[Df]:n.DST_COLOR,[If]:n.DST_ALPHA,[Pf]:n.ONE_MINUS_SRC_COLOR,[Qa]:n.ONE_MINUS_SRC_ALPHA,[Uf]:n.ONE_MINUS_DST_COLOR,[Lf]:n.ONE_MINUS_DST_ALPHA,[Of]:n.CONSTANT_COLOR,[Ff]:n.ONE_MINUS_CONSTANT_COLOR,[zf]:n.CONSTANT_ALPHA,[kf]:n.ONE_MINUS_CONSTANT_ALPHA};function K(U,ve,be,Ve,Be,ut,ht,Mt,Et,at){if(U===hi){m===!0&&(ce(n.BLEND),m=!1);return}if(m===!1&&(ze(n.BLEND),m=!0),U!==wf){if(U!==y||at!==D){if((_!==Pi||S!==Pi)&&(n.blendEquation(n.FUNC_ADD),_=Pi,S=Pi),at)switch(U){case mr:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Oi:n.blendFunc(n.ONE,n.ONE);break;case Sc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case wc:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case mr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Oi:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Sc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case wc:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}b=null,E=null,A=null,C=null,v.set(0,0,0),M=0,y=U,D=at}return}Be=Be||ve,ut=ut||be,ht=ht||Ve,(ve!==_||Be!==S)&&(n.blendEquationSeparate(Z[ve],Z[Be]),_=ve,S=Be),(be!==b||Ve!==E||ut!==A||ht!==C)&&(n.blendFuncSeparate(he[be],he[Ve],he[ut],he[ht]),b=be,E=Ve,A=ut,C=ht),(Mt.equals(v)===!1||Et!==M)&&(n.blendColor(Mt.r,Mt.g,Mt.b,Et),v.copy(Mt),M=Et),y=U,D=!1}function Re(U,ve){U.side===pn?ce(n.CULL_FACE):ze(n.CULL_FACE);let be=U.side===Lt;ve&&(be=!be),pe(be),U.blending===mr&&U.transparent===!1?K(hi):K(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),l.setFunc(U.depthFunc),l.setTest(U.depthTest),l.setMask(U.depthWrite),a.setMask(U.colorWrite);let Ve=U.stencilWrite;c.setTest(Ve),Ve&&(c.setMask(U.stencilWriteMask),c.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),c.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),F(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?ze(n.SAMPLE_ALPHA_TO_COVERAGE):ce(n.SAMPLE_ALPHA_TO_COVERAGE)}function pe(U){O!==U&&(U?n.frontFace(n.CW):n.frontFace(n.CCW),O=U)}function R(U){U!==Mf?(ze(n.CULL_FACE),U!==Y&&(U===Mc?n.cullFace(n.BACK):U===Sf?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ce(n.CULL_FACE),Y=U}function w(U){U!==I&&(J&&n.lineWidth(U),I=U)}function F(U,ve,be){U?(ze(n.POLYGON_OFFSET_FILL),(z!==ve||W!==be)&&(n.polygonOffset(ve,be),z=ve,W=be)):ce(n.POLYGON_OFFSET_FILL)}function le(U){U?ze(n.SCISSOR_TEST):ce(n.SCISSOR_TEST)}function se(U){U===void 0&&(U=n.TEXTURE0+$-1),k!==U&&(n.activeTexture(U),k=U)}function ee(U,ve,be){be===void 0&&(k===null?be=n.TEXTURE0+$-1:be=k);let Ve=Q[be];Ve===void 0&&(Ve={type:void 0,texture:void 0},Q[be]=Ve),(Ve.type!==U||Ve.texture!==ve)&&(k!==be&&(n.activeTexture(be),k=be),n.bindTexture(U,ve||Fe[U]),Ve.type=U,Ve.texture=ve)}function Pe(){let U=Q[k];U!==void 0&&U.type!==void 0&&(n.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function ye(){try{n.compressedTexImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function we(){try{n.compressedTexImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ke(){try{n.texSubImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Je(){try{n.texSubImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ae(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function it(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function et(){try{n.texStorage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ye(){try{n.texStorage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ne(){try{n.texImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ee(){try{n.texImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ge(U){Se.equals(U)===!1&&(n.scissor(U.x,U.y,U.z,U.w),Se.copy(U))}function rt(U){Le.equals(U)===!1&&(n.viewport(U.x,U.y,U.z,U.w),Le.copy(U))}function xt(U,ve){let be=h.get(ve);be===void 0&&(be=new WeakMap,h.set(ve,be));let Ve=be.get(U);Ve===void 0&&(Ve=n.getUniformBlockIndex(ve,U.name),be.set(U,Ve))}function je(U,ve){let Ve=h.get(ve).get(U);u.get(ve)!==Ve&&(n.uniformBlockBinding(ve,Ve,U.__bindingPointIndex),u.set(ve,Ve))}function fe(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),i===!0&&(n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null)),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),f={},k=null,Q={},d={},g=new WeakMap,x=[],p=null,m=!1,y=null,_=null,b=null,E=null,S=null,A=null,C=null,v=new Ze(0,0,0),M=0,D=!1,O=null,Y=null,I=null,z=null,W=null,Se.set(0,0,n.canvas.width,n.canvas.height),Le.set(0,0,n.canvas.width,n.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:ze,disable:ce,bindFramebuffer:ge,drawBuffers:L,useProgram:de,setBlending:K,setMaterial:Re,setFlipSided:pe,setCullFace:R,setLineWidth:w,setPolygonOffset:F,setScissorTest:le,activeTexture:se,bindTexture:ee,unbindTexture:Pe,compressedTexImage2D:ye,compressedTexImage3D:we,texImage2D:Ne,texImage3D:Ee,updateUBOMapping:xt,uniformBlockBinding:je,texStorage2D:et,texStorage3D:Ye,texSubImage2D:ke,texSubImage3D:Je,compressedTexSubImage2D:ae,compressedTexSubImage3D:it,scissor:Ge,viewport:rt,reset:fe}}function o_(n,e,t,i,r,s,o){let a=r.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new WeakMap,h,f=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,w){return d?new OffscreenCanvas(R,w):co("canvas")}function x(R,w,F,le){let se=1;if((R.width>le||R.height>le)&&(se=le/Math.max(R.width,R.height)),se<1||w===!0)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap){let ee=w?ol:Math.floor,Pe=ee(se*R.width),ye=ee(se*R.height);h===void 0&&(h=g(Pe,ye));let we=F?g(Pe,ye):h;return we.width=Pe,we.height=ye,we.getContext("2d").drawImage(R,0,0,Pe,ye),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+R.width+"x"+R.height+") to ("+Pe+"x"+ye+")."),we}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+R.width+"x"+R.height+")."),R;return R}function p(R){return ru(R.width)&&ru(R.height)}function m(R){return a?!1:R.wrapS!==Gt||R.wrapT!==Gt||R.minFilter!==Jt&&R.minFilter!==fn}function y(R,w){return R.generateMipmaps&&w&&R.minFilter!==Jt&&R.minFilter!==fn}function _(R){n.generateMipmap(R)}function b(R,w,F,le,se=!1){if(a===!1)return w;if(R!==null){if(n[R]!==void 0)return n[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let ee=w;if(w===n.RED&&(F===n.FLOAT&&(ee=n.R32F),F===n.HALF_FLOAT&&(ee=n.R16F),F===n.UNSIGNED_BYTE&&(ee=n.R8)),w===n.RED_INTEGER&&(F===n.UNSIGNED_BYTE&&(ee=n.R8UI),F===n.UNSIGNED_SHORT&&(ee=n.R16UI),F===n.UNSIGNED_INT&&(ee=n.R32UI),F===n.BYTE&&(ee=n.R8I),F===n.SHORT&&(ee=n.R16I),F===n.INT&&(ee=n.R32I)),w===n.RG&&(F===n.FLOAT&&(ee=n.RG32F),F===n.HALF_FLOAT&&(ee=n.RG16F),F===n.UNSIGNED_BYTE&&(ee=n.RG8)),w===n.RGBA){let Pe=se?so:dt.getTransfer(le);F===n.FLOAT&&(ee=n.RGBA32F),F===n.HALF_FLOAT&&(ee=n.RGBA16F),F===n.UNSIGNED_BYTE&&(ee=Pe===gt?n.SRGB8_ALPHA8:n.RGBA8),F===n.UNSIGNED_SHORT_4_4_4_4&&(ee=n.RGBA4),F===n.UNSIGNED_SHORT_5_5_5_1&&(ee=n.RGB5_A1)}return(ee===n.R16F||ee===n.R32F||ee===n.RG16F||ee===n.RG32F||ee===n.RGBA16F||ee===n.RGBA32F)&&e.get("EXT_color_buffer_float"),ee}function E(R,w,F){return y(R,F)===!0||R.isFramebufferTexture&&R.minFilter!==Jt&&R.minFilter!==fn?Math.log2(Math.max(w.width,w.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?w.mipmaps.length:1}function S(R){return R===Jt||R===Ac||R===ma?n.NEAREST:n.LINEAR}function A(R){let w=R.target;w.removeEventListener("dispose",A),v(w),w.isVideoTexture&&u.delete(w)}function C(R){let w=R.target;w.removeEventListener("dispose",C),D(w)}function v(R){let w=i.get(R);if(w.__webglInit===void 0)return;let F=R.source,le=f.get(F);if(le){let se=le[w.__cacheKey];se.usedTimes--,se.usedTimes===0&&M(R),Object.keys(le).length===0&&f.delete(F)}i.remove(R)}function M(R){let w=i.get(R);n.deleteTexture(w.__webglTexture);let F=R.source,le=f.get(F);delete le[w.__cacheKey],o.memory.textures--}function D(R){let w=R.texture,F=i.get(R),le=i.get(w);if(le.__webglTexture!==void 0&&(n.deleteTexture(le.__webglTexture),o.memory.textures--),R.depthTexture&&R.depthTexture.dispose(),R.isWebGLCubeRenderTarget)for(let se=0;se<6;se++){if(Array.isArray(F.__webglFramebuffer[se]))for(let ee=0;ee<F.__webglFramebuffer[se].length;ee++)n.deleteFramebuffer(F.__webglFramebuffer[se][ee]);else n.deleteFramebuffer(F.__webglFramebuffer[se]);F.__webglDepthbuffer&&n.deleteRenderbuffer(F.__webglDepthbuffer[se])}else{if(Array.isArray(F.__webglFramebuffer))for(let se=0;se<F.__webglFramebuffer.length;se++)n.deleteFramebuffer(F.__webglFramebuffer[se]);else n.deleteFramebuffer(F.__webglFramebuffer);if(F.__webglDepthbuffer&&n.deleteRenderbuffer(F.__webglDepthbuffer),F.__webglMultisampledFramebuffer&&n.deleteFramebuffer(F.__webglMultisampledFramebuffer),F.__webglColorRenderbuffer)for(let se=0;se<F.__webglColorRenderbuffer.length;se++)F.__webglColorRenderbuffer[se]&&n.deleteRenderbuffer(F.__webglColorRenderbuffer[se]);F.__webglDepthRenderbuffer&&n.deleteRenderbuffer(F.__webglDepthRenderbuffer)}if(R.isWebGLMultipleRenderTargets)for(let se=0,ee=w.length;se<ee;se++){let Pe=i.get(w[se]);Pe.__webglTexture&&(n.deleteTexture(Pe.__webglTexture),o.memory.textures--),i.remove(w[se])}i.remove(w),i.remove(R)}let O=0;function Y(){O=0}function I(){let R=O;return R>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+r.maxTextures),O+=1,R}function z(R){let w=[];return w.push(R.wrapS),w.push(R.wrapT),w.push(R.wrapR||0),w.push(R.magFilter),w.push(R.minFilter),w.push(R.anisotropy),w.push(R.internalFormat),w.push(R.format),w.push(R.type),w.push(R.generateMipmaps),w.push(R.premultiplyAlpha),w.push(R.flipY),w.push(R.unpackAlignment),w.push(R.colorSpace),w.join()}function W(R,w){let F=i.get(R);if(R.isVideoTexture&&Re(R),R.isRenderTargetTexture===!1&&R.version>0&&F.__version!==R.version){let le=R.image;if(le===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(le.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Se(F,R,w);return}}t.bindTexture(n.TEXTURE_2D,F.__webglTexture,n.TEXTURE0+w)}function $(R,w){let F=i.get(R);if(R.version>0&&F.__version!==R.version){Se(F,R,w);return}t.bindTexture(n.TEXTURE_2D_ARRAY,F.__webglTexture,n.TEXTURE0+w)}function J(R,w){let F=i.get(R);if(R.version>0&&F.__version!==R.version){Se(F,R,w);return}t.bindTexture(n.TEXTURE_3D,F.__webglTexture,n.TEXTURE0+w)}function q(R,w){let F=i.get(R);if(R.version>0&&F.__version!==R.version){Le(F,R,w);return}t.bindTexture(n.TEXTURE_CUBE_MAP,F.__webglTexture,n.TEXTURE0+w)}let re={[vr]:n.REPEAT,[Gt]:n.CLAMP_TO_EDGE,[nl]:n.MIRRORED_REPEAT},k={[Jt]:n.NEAREST,[Ac]:n.NEAREST_MIPMAP_NEAREST,[ma]:n.NEAREST_MIPMAP_LINEAR,[fn]:n.LINEAR,[Qf]:n.LINEAR_MIPMAP_NEAREST,[jr]:n.LINEAR_MIPMAP_LINEAR},Q={[hp]:n.NEVER,[xp]:n.ALWAYS,[dp]:n.LESS,[hh]:n.LEQUAL,[fp]:n.EQUAL,[gp]:n.GEQUAL,[pp]:n.GREATER,[mp]:n.NOTEQUAL};function V(R,w,F){if(F?(n.texParameteri(R,n.TEXTURE_WRAP_S,re[w.wrapS]),n.texParameteri(R,n.TEXTURE_WRAP_T,re[w.wrapT]),(R===n.TEXTURE_3D||R===n.TEXTURE_2D_ARRAY)&&n.texParameteri(R,n.TEXTURE_WRAP_R,re[w.wrapR]),n.texParameteri(R,n.TEXTURE_MAG_FILTER,k[w.magFilter]),n.texParameteri(R,n.TEXTURE_MIN_FILTER,k[w.minFilter])):(n.texParameteri(R,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(R,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),(R===n.TEXTURE_3D||R===n.TEXTURE_2D_ARRAY)&&n.texParameteri(R,n.TEXTURE_WRAP_R,n.CLAMP_TO_EDGE),(w.wrapS!==Gt||w.wrapT!==Gt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),n.texParameteri(R,n.TEXTURE_MAG_FILTER,S(w.magFilter)),n.texParameteri(R,n.TEXTURE_MIN_FILTER,S(w.minFilter)),w.minFilter!==Jt&&w.minFilter!==fn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),w.compareFunction&&(n.texParameteri(R,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(R,n.TEXTURE_COMPARE_FUNC,Q[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){let le=e.get("EXT_texture_filter_anisotropic");if(w.magFilter===Jt||w.minFilter!==ma&&w.minFilter!==jr||w.type===ui&&e.has("OES_texture_float_linear")===!1||a===!1&&w.type===Fi&&e.has("OES_texture_half_float_linear")===!1)return;(w.anisotropy>1||i.get(w).__currentAnisotropy)&&(n.texParameterf(R,le.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),i.get(w).__currentAnisotropy=w.anisotropy)}}function te(R,w){let F=!1;R.__webglInit===void 0&&(R.__webglInit=!0,w.addEventListener("dispose",A));let le=w.source,se=f.get(le);se===void 0&&(se={},f.set(le,se));let ee=z(w);if(ee!==R.__cacheKey){se[ee]===void 0&&(se[ee]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,F=!0),se[ee].usedTimes++;let Pe=se[R.__cacheKey];Pe!==void 0&&(se[R.__cacheKey].usedTimes--,Pe.usedTimes===0&&M(w)),R.__cacheKey=ee,R.__webglTexture=se[ee].texture}return F}function Se(R,w,F){let le=n.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(le=n.TEXTURE_2D_ARRAY),w.isData3DTexture&&(le=n.TEXTURE_3D);let se=te(R,w),ee=w.source;t.bindTexture(le,R.__webglTexture,n.TEXTURE0+F);let Pe=i.get(ee);if(ee.version!==Pe.__version||se===!0){t.activeTexture(n.TEXTURE0+F);let ye=dt.getPrimaries(dt.workingColorSpace),we=w.colorSpace===mn?null:dt.getPrimaries(w.colorSpace),ke=w.colorSpace===mn||ye===we?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ke);let Je=m(w)&&p(w.image)===!1,ae=x(w.image,Je,!1,r.maxTextureSize);ae=pe(w,ae);let it=p(ae)||a,et=s.convert(w.format,w.colorSpace),Ye=s.convert(w.type),Ne=b(w.internalFormat,et,Ye,w.colorSpace,w.isVideoTexture);V(le,w,it);let Ee,Ge=w.mipmaps,rt=a&&w.isVideoTexture!==!0&&Ne!==ah,xt=Pe.__version===void 0||se===!0,je=E(w,ae,it);if(w.isDepthTexture)Ne=n.DEPTH_COMPONENT,a?w.type===ui?Ne=n.DEPTH_COMPONENT32F:w.type===ci?Ne=n.DEPTH_COMPONENT24:w.type===Di?Ne=n.DEPTH24_STENCIL8:Ne=n.DEPTH_COMPONENT16:w.type===ui&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),w.format===Ui&&Ne===n.DEPTH_COMPONENT&&w.type!==Xl&&w.type!==ci&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),w.type=ci,Ye=s.convert(w.type)),w.format===br&&Ne===n.DEPTH_COMPONENT&&(Ne=n.DEPTH_STENCIL,w.type!==Di&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),w.type=Di,Ye=s.convert(w.type))),xt&&(rt?t.texStorage2D(n.TEXTURE_2D,1,Ne,ae.width,ae.height):t.texImage2D(n.TEXTURE_2D,0,Ne,ae.width,ae.height,0,et,Ye,null));else if(w.isDataTexture)if(Ge.length>0&&it){rt&&xt&&t.texStorage2D(n.TEXTURE_2D,je,Ne,Ge[0].width,Ge[0].height);for(let fe=0,U=Ge.length;fe<U;fe++)Ee=Ge[fe],rt?t.texSubImage2D(n.TEXTURE_2D,fe,0,0,Ee.width,Ee.height,et,Ye,Ee.data):t.texImage2D(n.TEXTURE_2D,fe,Ne,Ee.width,Ee.height,0,et,Ye,Ee.data);w.generateMipmaps=!1}else rt?(xt&&t.texStorage2D(n.TEXTURE_2D,je,Ne,ae.width,ae.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,ae.width,ae.height,et,Ye,ae.data)):t.texImage2D(n.TEXTURE_2D,0,Ne,ae.width,ae.height,0,et,Ye,ae.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){rt&&xt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,je,Ne,Ge[0].width,Ge[0].height,ae.depth);for(let fe=0,U=Ge.length;fe<U;fe++)Ee=Ge[fe],w.format!==An?et!==null?rt?t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,fe,0,0,0,Ee.width,Ee.height,ae.depth,et,Ee.data,0,0):t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,fe,Ne,Ee.width,Ee.height,ae.depth,0,Ee.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):rt?t.texSubImage3D(n.TEXTURE_2D_ARRAY,fe,0,0,0,Ee.width,Ee.height,ae.depth,et,Ye,Ee.data):t.texImage3D(n.TEXTURE_2D_ARRAY,fe,Ne,Ee.width,Ee.height,ae.depth,0,et,Ye,Ee.data)}else{rt&&xt&&t.texStorage2D(n.TEXTURE_2D,je,Ne,Ge[0].width,Ge[0].height);for(let fe=0,U=Ge.length;fe<U;fe++)Ee=Ge[fe],w.format!==An?et!==null?rt?t.compressedTexSubImage2D(n.TEXTURE_2D,fe,0,0,Ee.width,Ee.height,et,Ee.data):t.compressedTexImage2D(n.TEXTURE_2D,fe,Ne,Ee.width,Ee.height,0,Ee.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):rt?t.texSubImage2D(n.TEXTURE_2D,fe,0,0,Ee.width,Ee.height,et,Ye,Ee.data):t.texImage2D(n.TEXTURE_2D,fe,Ne,Ee.width,Ee.height,0,et,Ye,Ee.data)}else if(w.isDataArrayTexture)rt?(xt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,je,Ne,ae.width,ae.height,ae.depth),t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ae.width,ae.height,ae.depth,et,Ye,ae.data)):t.texImage3D(n.TEXTURE_2D_ARRAY,0,Ne,ae.width,ae.height,ae.depth,0,et,Ye,ae.data);else if(w.isData3DTexture)rt?(xt&&t.texStorage3D(n.TEXTURE_3D,je,Ne,ae.width,ae.height,ae.depth),t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ae.width,ae.height,ae.depth,et,Ye,ae.data)):t.texImage3D(n.TEXTURE_3D,0,Ne,ae.width,ae.height,ae.depth,0,et,Ye,ae.data);else if(w.isFramebufferTexture){if(xt)if(rt)t.texStorage2D(n.TEXTURE_2D,je,Ne,ae.width,ae.height);else{let fe=ae.width,U=ae.height;for(let ve=0;ve<je;ve++)t.texImage2D(n.TEXTURE_2D,ve,Ne,fe,U,0,et,Ye,null),fe>>=1,U>>=1}}else if(Ge.length>0&&it){rt&&xt&&t.texStorage2D(n.TEXTURE_2D,je,Ne,Ge[0].width,Ge[0].height);for(let fe=0,U=Ge.length;fe<U;fe++)Ee=Ge[fe],rt?t.texSubImage2D(n.TEXTURE_2D,fe,0,0,et,Ye,Ee):t.texImage2D(n.TEXTURE_2D,fe,Ne,et,Ye,Ee);w.generateMipmaps=!1}else rt?(xt&&t.texStorage2D(n.TEXTURE_2D,je,Ne,ae.width,ae.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,et,Ye,ae)):t.texImage2D(n.TEXTURE_2D,0,Ne,et,Ye,ae);y(w,it)&&_(le),Pe.__version=ee.version,w.onUpdate&&w.onUpdate(w)}R.__version=w.version}function Le(R,w,F){if(w.image.length!==6)return;let le=te(R,w),se=w.source;t.bindTexture(n.TEXTURE_CUBE_MAP,R.__webglTexture,n.TEXTURE0+F);let ee=i.get(se);if(se.version!==ee.__version||le===!0){t.activeTexture(n.TEXTURE0+F);let Pe=dt.getPrimaries(dt.workingColorSpace),ye=w.colorSpace===mn?null:dt.getPrimaries(w.colorSpace),we=w.colorSpace===mn||Pe===ye?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,we);let ke=w.isCompressedTexture||w.image[0].isCompressedTexture,Je=w.image[0]&&w.image[0].isDataTexture,ae=[];for(let fe=0;fe<6;fe++)!ke&&!Je?ae[fe]=x(w.image[fe],!1,!0,r.maxCubemapSize):ae[fe]=Je?w.image[fe].image:w.image[fe],ae[fe]=pe(w,ae[fe]);let it=ae[0],et=p(it)||a,Ye=s.convert(w.format,w.colorSpace),Ne=s.convert(w.type),Ee=b(w.internalFormat,Ye,Ne,w.colorSpace),Ge=a&&w.isVideoTexture!==!0,rt=ee.__version===void 0||le===!0,xt=E(w,it,et);V(n.TEXTURE_CUBE_MAP,w,et);let je;if(ke){Ge&&rt&&t.texStorage2D(n.TEXTURE_CUBE_MAP,xt,Ee,it.width,it.height);for(let fe=0;fe<6;fe++){je=ae[fe].mipmaps;for(let U=0;U<je.length;U++){let ve=je[U];w.format!==An?Ye!==null?Ge?t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U,0,0,ve.width,ve.height,Ye,ve.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U,Ee,ve.width,ve.height,0,ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ge?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U,0,0,ve.width,ve.height,Ye,Ne,ve.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U,Ee,ve.width,ve.height,0,Ye,Ne,ve.data)}}}else{je=w.mipmaps,Ge&&rt&&(je.length>0&&xt++,t.texStorage2D(n.TEXTURE_CUBE_MAP,xt,Ee,ae[0].width,ae[0].height));for(let fe=0;fe<6;fe++)if(Je){Ge?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,0,0,ae[fe].width,ae[fe].height,Ye,Ne,ae[fe].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,Ee,ae[fe].width,ae[fe].height,0,Ye,Ne,ae[fe].data);for(let U=0;U<je.length;U++){let be=je[U].image[fe].image;Ge?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U+1,0,0,be.width,be.height,Ye,Ne,be.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U+1,Ee,be.width,be.height,0,Ye,Ne,be.data)}}else{Ge?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,0,0,Ye,Ne,ae[fe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,Ee,Ye,Ne,ae[fe]);for(let U=0;U<je.length;U++){let ve=je[U];Ge?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U+1,0,0,Ye,Ne,ve.image[fe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,U+1,Ee,Ye,Ne,ve.image[fe])}}}y(w,et)&&_(n.TEXTURE_CUBE_MAP),ee.__version=se.version,w.onUpdate&&w.onUpdate(w)}R.__version=w.version}function _e(R,w,F,le,se,ee){let Pe=s.convert(F.format,F.colorSpace),ye=s.convert(F.type),we=b(F.internalFormat,Pe,ye,F.colorSpace);if(!i.get(w).__hasExternalTextures){let Je=Math.max(1,w.width>>ee),ae=Math.max(1,w.height>>ee);se===n.TEXTURE_3D||se===n.TEXTURE_2D_ARRAY?t.texImage3D(se,ee,we,Je,ae,w.depth,0,Pe,ye,null):t.texImage2D(se,ee,we,Je,ae,0,Pe,ye,null)}t.bindFramebuffer(n.FRAMEBUFFER,R),K(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,le,se,i.get(F).__webglTexture,0,he(w)):(se===n.TEXTURE_2D||se>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&se<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,le,se,i.get(F).__webglTexture,ee),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Fe(R,w,F){if(n.bindRenderbuffer(n.RENDERBUFFER,R),w.depthBuffer&&!w.stencilBuffer){let le=a===!0?n.DEPTH_COMPONENT24:n.DEPTH_COMPONENT16;if(F||K(w)){let se=w.depthTexture;se&&se.isDepthTexture&&(se.type===ui?le=n.DEPTH_COMPONENT32F:se.type===ci&&(le=n.DEPTH_COMPONENT24));let ee=he(w);K(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ee,le,w.width,w.height):n.renderbufferStorageMultisample(n.RENDERBUFFER,ee,le,w.width,w.height)}else n.renderbufferStorage(n.RENDERBUFFER,le,w.width,w.height);n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.RENDERBUFFER,R)}else if(w.depthBuffer&&w.stencilBuffer){let le=he(w);F&&K(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,le,n.DEPTH24_STENCIL8,w.width,w.height):K(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,le,n.DEPTH24_STENCIL8,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,n.DEPTH_STENCIL,w.width,w.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.RENDERBUFFER,R)}else{let le=w.isWebGLMultipleRenderTargets===!0?w.texture:[w.texture];for(let se=0;se<le.length;se++){let ee=le[se],Pe=s.convert(ee.format,ee.colorSpace),ye=s.convert(ee.type),we=b(ee.internalFormat,Pe,ye,ee.colorSpace),ke=he(w);F&&K(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,ke,we,w.width,w.height):K(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ke,we,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,we,w.width,w.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function ze(R,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,R),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(w.depthTexture).__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),W(w.depthTexture,0);let le=i.get(w.depthTexture).__webglTexture,se=he(w);if(w.depthTexture.format===Ui)K(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,le,0,se):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,le,0);else if(w.depthTexture.format===br)K(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,le,0,se):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,le,0);else throw new Error("Unknown depthTexture format")}function ce(R){let w=i.get(R),F=R.isWebGLCubeRenderTarget===!0;if(R.depthTexture&&!w.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");ze(w.__webglFramebuffer,R)}else if(F){w.__webglDepthbuffer=[];for(let le=0;le<6;le++)t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer[le]),w.__webglDepthbuffer[le]=n.createRenderbuffer(),Fe(w.__webglDepthbuffer[le],R,!1)}else t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer=n.createRenderbuffer(),Fe(w.__webglDepthbuffer,R,!1);t.bindFramebuffer(n.FRAMEBUFFER,null)}function ge(R,w,F){let le=i.get(R);w!==void 0&&_e(le.__webglFramebuffer,R,R.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),F!==void 0&&ce(R)}function L(R){let w=R.texture,F=i.get(R),le=i.get(w);R.addEventListener("dispose",C),R.isWebGLMultipleRenderTargets!==!0&&(le.__webglTexture===void 0&&(le.__webglTexture=n.createTexture()),le.__version=w.version,o.memory.textures++);let se=R.isWebGLCubeRenderTarget===!0,ee=R.isWebGLMultipleRenderTargets===!0,Pe=p(R)||a;if(se){F.__webglFramebuffer=[];for(let ye=0;ye<6;ye++)if(a&&w.mipmaps&&w.mipmaps.length>0){F.__webglFramebuffer[ye]=[];for(let we=0;we<w.mipmaps.length;we++)F.__webglFramebuffer[ye][we]=n.createFramebuffer()}else F.__webglFramebuffer[ye]=n.createFramebuffer()}else{if(a&&w.mipmaps&&w.mipmaps.length>0){F.__webglFramebuffer=[];for(let ye=0;ye<w.mipmaps.length;ye++)F.__webglFramebuffer[ye]=n.createFramebuffer()}else F.__webglFramebuffer=n.createFramebuffer();if(ee)if(r.drawBuffers){let ye=R.texture;for(let we=0,ke=ye.length;we<ke;we++){let Je=i.get(ye[we]);Je.__webglTexture===void 0&&(Je.__webglTexture=n.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&R.samples>0&&K(R)===!1){let ye=ee?w:[w];F.__webglMultisampledFramebuffer=n.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let we=0;we<ye.length;we++){let ke=ye[we];F.__webglColorRenderbuffer[we]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,F.__webglColorRenderbuffer[we]);let Je=s.convert(ke.format,ke.colorSpace),ae=s.convert(ke.type),it=b(ke.internalFormat,Je,ae,ke.colorSpace,R.isXRRenderTarget===!0),et=he(R);n.renderbufferStorageMultisample(n.RENDERBUFFER,et,it,R.width,R.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+we,n.RENDERBUFFER,F.__webglColorRenderbuffer[we])}n.bindRenderbuffer(n.RENDERBUFFER,null),R.depthBuffer&&(F.__webglDepthRenderbuffer=n.createRenderbuffer(),Fe(F.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(se){t.bindTexture(n.TEXTURE_CUBE_MAP,le.__webglTexture),V(n.TEXTURE_CUBE_MAP,w,Pe);for(let ye=0;ye<6;ye++)if(a&&w.mipmaps&&w.mipmaps.length>0)for(let we=0;we<w.mipmaps.length;we++)_e(F.__webglFramebuffer[ye][we],R,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ye,we);else _e(F.__webglFramebuffer[ye],R,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0);y(w,Pe)&&_(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ee){let ye=R.texture;for(let we=0,ke=ye.length;we<ke;we++){let Je=ye[we],ae=i.get(Je);t.bindTexture(n.TEXTURE_2D,ae.__webglTexture),V(n.TEXTURE_2D,Je,Pe),_e(F.__webglFramebuffer,R,Je,n.COLOR_ATTACHMENT0+we,n.TEXTURE_2D,0),y(Je,Pe)&&_(n.TEXTURE_2D)}t.unbindTexture()}else{let ye=n.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(a?ye=R.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(ye,le.__webglTexture),V(ye,w,Pe),a&&w.mipmaps&&w.mipmaps.length>0)for(let we=0;we<w.mipmaps.length;we++)_e(F.__webglFramebuffer[we],R,w,n.COLOR_ATTACHMENT0,ye,we);else _e(F.__webglFramebuffer,R,w,n.COLOR_ATTACHMENT0,ye,0);y(w,Pe)&&_(ye),t.unbindTexture()}R.depthBuffer&&ce(R)}function de(R){let w=p(R)||a,F=R.isWebGLMultipleRenderTargets===!0?R.texture:[R.texture];for(let le=0,se=F.length;le<se;le++){let ee=F[le];if(y(ee,w)){let Pe=R.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,ye=i.get(ee).__webglTexture;t.bindTexture(Pe,ye),_(Pe),t.unbindTexture()}}}function Z(R){if(a&&R.samples>0&&K(R)===!1){let w=R.isWebGLMultipleRenderTargets?R.texture:[R.texture],F=R.width,le=R.height,se=n.COLOR_BUFFER_BIT,ee=[],Pe=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ye=i.get(R),we=R.isWebGLMultipleRenderTargets===!0;if(we)for(let ke=0;ke<w.length;ke++)t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ke,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ke,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,ye.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ye.__webglFramebuffer);for(let ke=0;ke<w.length;ke++){ee.push(n.COLOR_ATTACHMENT0+ke),R.depthBuffer&&ee.push(Pe);let Je=ye.__ignoreDepthValues!==void 0?ye.__ignoreDepthValues:!1;if(Je===!1&&(R.depthBuffer&&(se|=n.DEPTH_BUFFER_BIT),R.stencilBuffer&&(se|=n.STENCIL_BUFFER_BIT)),we&&n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ye.__webglColorRenderbuffer[ke]),Je===!0&&(n.invalidateFramebuffer(n.READ_FRAMEBUFFER,[Pe]),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[Pe])),we){let ae=i.get(w[ke]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,ae,0)}n.blitFramebuffer(0,0,F,le,0,0,F,le,se,n.NEAREST),c&&n.invalidateFramebuffer(n.READ_FRAMEBUFFER,ee)}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),we)for(let ke=0;ke<w.length;ke++){t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ke,n.RENDERBUFFER,ye.__webglColorRenderbuffer[ke]);let Je=i.get(w[ke]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ke,n.TEXTURE_2D,Je,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ye.__webglMultisampledFramebuffer)}}function he(R){return Math.min(r.maxSamples,R.samples)}function K(R){let w=i.get(R);return a&&R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Re(R){let w=o.render.frame;u.get(R)!==w&&(u.set(R,w),R.update())}function pe(R,w){let F=R.colorSpace,le=R.format,se=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||R.format===rl||F!==jn&&F!==mn&&(dt.getTransfer(F)===gt?a===!1?e.has("EXT_sRGB")===!0&&le===An?(R.format=rl,R.minFilter=fn,R.generateMipmaps=!1):w=uo.sRGBToLinear(w):(le!==An||se!==di)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),w}this.allocateTextureUnit=I,this.resetTextureUnits=Y,this.setTexture2D=W,this.setTexture2DArray=$,this.setTexture3D=J,this.setTextureCube=q,this.rebindTextures=ge,this.setupRenderTarget=L,this.updateRenderTargetMipmap=de,this.updateMultisampleRenderTarget=Z,this.setupDepthRenderbuffer=ce,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=K}function a_(n,e,t){let i=t.isWebGL2;function r(s,o=mn){let a,l=dt.getTransfer(o);if(s===di)return n.UNSIGNED_BYTE;if(s===nh)return n.UNSIGNED_SHORT_4_4_4_4;if(s===ih)return n.UNSIGNED_SHORT_5_5_5_1;if(s===ep)return n.BYTE;if(s===tp)return n.SHORT;if(s===Xl)return n.UNSIGNED_SHORT;if(s===th)return n.INT;if(s===ci)return n.UNSIGNED_INT;if(s===ui)return n.FLOAT;if(s===Fi)return i?n.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===np)return n.ALPHA;if(s===An)return n.RGBA;if(s===ip)return n.LUMINANCE;if(s===rp)return n.LUMINANCE_ALPHA;if(s===Ui)return n.DEPTH_COMPONENT;if(s===br)return n.DEPTH_STENCIL;if(s===rl)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===sp)return n.RED;if(s===rh)return n.RED_INTEGER;if(s===op)return n.RG;if(s===sh)return n.RG_INTEGER;if(s===oh)return n.RGBA_INTEGER;if(s===ga||s===xa||s===_a||s===ya)if(l===gt)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===ga)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===xa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===_a)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===ya)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===ga)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===xa)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===_a)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===ya)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===Rc||s===Cc||s===Pc||s===Ic)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===Rc)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===Cc)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Pc)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Ic)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===ah)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===Lc||s===Dc)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===Lc)return l===gt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===Dc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===Uc||s===Nc||s===Oc||s===Fc||s===zc||s===kc||s===Bc||s===Gc||s===Hc||s===Vc||s===Wc||s===Xc||s===qc||s===Yc)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===Uc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Nc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Oc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===Fc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===zc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===kc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Bc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Gc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===Hc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Vc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Wc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Xc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===qc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Yc)return l===gt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===va||s===Kc||s===Zc)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===va)return l===gt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Kc)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Zc)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===ap||s===Jc||s===$c||s===jc)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===va)return a.COMPRESSED_RED_RGTC1_EXT;if(s===Jc)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===$c)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===jc)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===Di?i?n.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):n[s]!==void 0?n[s]:null}return{convert:r}}var vl=class extends tn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Te=class extends qt{constructor(){super(),this.isGroup=!0,this.type="Group"}},l_={type:"move"},Zr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Te,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Te,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Te,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let x of e.hand.values()){let p=t.getJointPose(x,i),m=this._getHandJoint(c,x);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(l_)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Te;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},bl=class extends mi{constructor(e,t){super();let i=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,f=null,d=null,g=null,x=t.getContextAttributes(),p=null,m=null,y=[],_=[],b=new j,E=null,S=new tn;S.layers.enable(1),S.viewport=new vt;let A=new tn;A.layers.enable(2),A.viewport=new vt;let C=[S,A],v=new vl;v.layers.enable(1),v.layers.enable(2);let M=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(V){let te=y[V];return te===void 0&&(te=new Zr,y[V]=te),te.getTargetRaySpace()},this.getControllerGrip=function(V){let te=y[V];return te===void 0&&(te=new Zr,y[V]=te),te.getGripSpace()},this.getHand=function(V){let te=y[V];return te===void 0&&(te=new Zr,y[V]=te),te.getHandSpace()};function O(V){let te=_.indexOf(V.inputSource);if(te===-1)return;let Se=y[te];Se!==void 0&&(Se.update(V.inputSource,V.frame,c||o),Se.dispatchEvent({type:V.type,data:V.inputSource}))}function Y(){r.removeEventListener("select",O),r.removeEventListener("selectstart",O),r.removeEventListener("selectend",O),r.removeEventListener("squeeze",O),r.removeEventListener("squeezestart",O),r.removeEventListener("squeezeend",O),r.removeEventListener("end",Y),r.removeEventListener("inputsourceschange",I);for(let V=0;V<y.length;V++){let te=_[V];te!==null&&(_[V]=null,y[V].disconnect(te))}M=null,D=null,e.setRenderTarget(p),d=null,f=null,h=null,r=null,m=null,Q.stop(),i.isPresenting=!1,e.setPixelRatio(E),e.setSize(b.width,b.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(V){s=V,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(V){a=V,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(V){c=V},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(V){if(r=V,r!==null){if(p=e.getRenderTarget(),r.addEventListener("select",O),r.addEventListener("selectstart",O),r.addEventListener("selectend",O),r.addEventListener("squeeze",O),r.addEventListener("squeezestart",O),r.addEventListener("squeezeend",O),r.addEventListener("end",Y),r.addEventListener("inputsourceschange",I),x.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(b),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){let te={antialias:r.renderState.layers===void 0?x.antialias:!0,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(r,t,te),r.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),m=new $t(d.framebufferWidth,d.framebufferHeight,{format:An,type:di,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let te=null,Se=null,Le=null;x.depth&&(Le=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=x.stencil?br:Ui,Se=x.stencil?Di:ci);let _e={colorFormat:t.RGBA8,depthFormat:Le,scaleFactor:s};h=new XRWebGLBinding(r,t),f=h.createProjectionLayer(_e),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),m=new $t(f.textureWidth,f.textureHeight,{format:An,type:di,depthTexture:new vo(f.textureWidth,f.textureHeight,Se,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0});let Fe=e.properties.get(m);Fe.__ignoreDepthValues=f.ignoreDepthValues}m.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),Q.setContext(r),Q.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function I(V){for(let te=0;te<V.removed.length;te++){let Se=V.removed[te],Le=_.indexOf(Se);Le>=0&&(_[Le]=null,y[Le].disconnect(Se))}for(let te=0;te<V.added.length;te++){let Se=V.added[te],Le=_.indexOf(Se);if(Le===-1){for(let Fe=0;Fe<y.length;Fe++)if(Fe>=_.length){_.push(Se),Le=Fe;break}else if(_[Fe]===null){_[Fe]=Se,Le=Fe;break}if(Le===-1)break}let _e=y[Le];_e&&_e.connect(Se)}}let z=new P,W=new P;function $(V,te,Se){z.setFromMatrixPosition(te.matrixWorld),W.setFromMatrixPosition(Se.matrixWorld);let Le=z.distanceTo(W),_e=te.projectionMatrix.elements,Fe=Se.projectionMatrix.elements,ze=_e[14]/(_e[10]-1),ce=_e[14]/(_e[10]+1),ge=(_e[9]+1)/_e[5],L=(_e[9]-1)/_e[5],de=(_e[8]-1)/_e[0],Z=(Fe[8]+1)/Fe[0],he=ze*de,K=ze*Z,Re=Le/(-de+Z),pe=Re*-de;te.matrixWorld.decompose(V.position,V.quaternion,V.scale),V.translateX(pe),V.translateZ(Re),V.matrixWorld.compose(V.position,V.quaternion,V.scale),V.matrixWorldInverse.copy(V.matrixWorld).invert();let R=ze+Re,w=ce+Re,F=he-pe,le=K+(Le-pe),se=ge*ce/w*R,ee=L*ce/w*R;V.projectionMatrix.makePerspective(F,le,se,ee,R,w),V.projectionMatrixInverse.copy(V.projectionMatrix).invert()}function J(V,te){te===null?V.matrixWorld.copy(V.matrix):V.matrixWorld.multiplyMatrices(te.matrixWorld,V.matrix),V.matrixWorldInverse.copy(V.matrixWorld).invert()}this.updateCamera=function(V){if(r===null)return;v.near=A.near=S.near=V.near,v.far=A.far=S.far=V.far,(M!==v.near||D!==v.far)&&(r.updateRenderState({depthNear:v.near,depthFar:v.far}),M=v.near,D=v.far);let te=V.parent,Se=v.cameras;J(v,te);for(let Le=0;Le<Se.length;Le++)J(Se[Le],te);Se.length===2?$(v,S,A):v.projectionMatrix.copy(S.projectionMatrix),q(V,v,te)};function q(V,te,Se){Se===null?V.matrix.copy(te.matrixWorld):(V.matrix.copy(Se.matrixWorld),V.matrix.invert(),V.matrix.multiply(te.matrixWorld)),V.matrix.decompose(V.position,V.quaternion,V.scale),V.updateMatrixWorld(!0),V.projectionMatrix.copy(te.projectionMatrix),V.projectionMatrixInverse.copy(te.projectionMatrixInverse),V.isPerspectiveCamera&&(V.fov=sl*2*Math.atan(1/V.projectionMatrix.elements[5]),V.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(V){l=V,f!==null&&(f.fixedFoveation=V),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=V)};let re=null;function k(V,te){if(u=te.getViewerPose(c||o),g=te,u!==null){let Se=u.views;d!==null&&(e.setRenderTargetFramebuffer(m,d.framebuffer),e.setRenderTarget(m));let Le=!1;Se.length!==v.cameras.length&&(v.cameras.length=0,Le=!0);for(let _e=0;_e<Se.length;_e++){let Fe=Se[_e],ze=null;if(d!==null)ze=d.getViewport(Fe);else{let ge=h.getViewSubImage(f,Fe);ze=ge.viewport,_e===0&&(e.setRenderTargetTextures(m,ge.colorTexture,f.ignoreDepthValues?void 0:ge.depthStencilTexture),e.setRenderTarget(m))}let ce=C[_e];ce===void 0&&(ce=new tn,ce.layers.enable(_e),ce.viewport=new vt,C[_e]=ce),ce.matrix.fromArray(Fe.transform.matrix),ce.matrix.decompose(ce.position,ce.quaternion,ce.scale),ce.projectionMatrix.fromArray(Fe.projectionMatrix),ce.projectionMatrixInverse.copy(ce.projectionMatrix).invert(),ce.viewport.set(ze.x,ze.y,ze.width,ze.height),_e===0&&(v.matrix.copy(ce.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),Le===!0&&v.cameras.push(ce)}}for(let Se=0;Se<y.length;Se++){let Le=_[Se],_e=y[Se];Le!==null&&_e!==void 0&&_e.update(Le,te,c||o)}re&&re(V,te),te.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:te}),g=null}let Q=new mh;Q.setAnimationLoop(k),this.setAnimationLoop=function(V){re=V},this.dispose=function(){}}};function c_(n,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function i(p,m){m.color.getRGB(p.fogColor.value,ph(n)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function r(p,m,y,_,b){m.isMeshBasicMaterial||m.isMeshLambertMaterial?s(p,m):m.isMeshToonMaterial?(s(p,m),h(p,m)):m.isMeshPhongMaterial?(s(p,m),u(p,m)):m.isMeshStandardMaterial?(s(p,m),f(p,m),m.isMeshPhysicalMaterial&&d(p,m,b)):m.isMeshMatcapMaterial?(s(p,m),g(p,m)):m.isMeshDepthMaterial?s(p,m):m.isMeshDistanceMaterial?(s(p,m),x(p,m)):m.isMeshNormalMaterial?s(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,y,_):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Lt&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Lt&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let y=e.get(m).envMap;if(y&&(p.envMap.value=y,p.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap){p.lightMap.value=m.lightMap;let _=n._useLegacyLights===!0?Math.PI:1;p.lightMapIntensity.value=m.lightMapIntensity*_,t(m.lightMap,p.lightMapTransform)}m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,y,_){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*y,p.scale.value=_*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function h(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function f(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),e.get(m).envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function d(p,m,y){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Lt&&p.clearcoatNormalScale.value.negate())),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=y.texture,p.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function x(p,m){let y=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(y.matrixWorld),p.nearDistance.value=y.shadow.camera.near,p.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function u_(n,e,t,i){let r={},s={},o=[],a=t.isWebGL2?n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(y,_){let b=_.program;i.uniformBlockBinding(y,b)}function c(y,_){let b=r[y.id];b===void 0&&(g(y),b=u(y),r[y.id]=b,y.addEventListener("dispose",p));let E=_.program;i.updateUBOMapping(y,E);let S=e.render.frame;s[y.id]!==S&&(f(y),s[y.id]=S)}function u(y){let _=h();y.__bindingPointIndex=_;let b=n.createBuffer(),E=y.__size,S=y.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,E,S),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,_,b),b}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(y){let _=r[y.id],b=y.uniforms,E=y.__cache;n.bindBuffer(n.UNIFORM_BUFFER,_);for(let S=0,A=b.length;S<A;S++){let C=Array.isArray(b[S])?b[S]:[b[S]];for(let v=0,M=C.length;v<M;v++){let D=C[v];if(d(D,S,v,E)===!0){let O=D.__offset,Y=Array.isArray(D.value)?D.value:[D.value],I=0;for(let z=0;z<Y.length;z++){let W=Y[z],$=x(W);typeof W=="number"||typeof W=="boolean"?(D.__data[0]=W,n.bufferSubData(n.UNIFORM_BUFFER,O+I,D.__data)):W.isMatrix3?(D.__data[0]=W.elements[0],D.__data[1]=W.elements[1],D.__data[2]=W.elements[2],D.__data[3]=0,D.__data[4]=W.elements[3],D.__data[5]=W.elements[4],D.__data[6]=W.elements[5],D.__data[7]=0,D.__data[8]=W.elements[6],D.__data[9]=W.elements[7],D.__data[10]=W.elements[8],D.__data[11]=0):(W.toArray(D.__data,I),I+=$.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,O,D.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(y,_,b,E){let S=y.value,A=_+"_"+b;if(E[A]===void 0)return typeof S=="number"||typeof S=="boolean"?E[A]=S:E[A]=S.clone(),!0;{let C=E[A];if(typeof S=="number"||typeof S=="boolean"){if(C!==S)return E[A]=S,!0}else if(C.equals(S)===!1)return C.copy(S),!0}return!1}function g(y){let _=y.uniforms,b=0,E=16;for(let A=0,C=_.length;A<C;A++){let v=Array.isArray(_[A])?_[A]:[_[A]];for(let M=0,D=v.length;M<D;M++){let O=v[M],Y=Array.isArray(O.value)?O.value:[O.value];for(let I=0,z=Y.length;I<z;I++){let W=Y[I],$=x(W),J=b%E;J!==0&&E-J<$.boundary&&(b+=E-J),O.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=b,b+=$.storage}}}let S=b%E;return S>0&&(b+=E-S),y.__size=b,y.__cache={},this}function x(y){let _={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(_.boundary=4,_.storage=4):y.isVector2?(_.boundary=8,_.storage=8):y.isVector3||y.isColor?(_.boundary=16,_.storage=12):y.isVector4?(_.boundary=16,_.storage=16):y.isMatrix3?(_.boundary=48,_.storage=48):y.isMatrix4?(_.boundary=64,_.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),_}function p(y){let _=y.target;_.removeEventListener("dispose",p);let b=o.indexOf(_.__bindingPointIndex);o.splice(b,1),n.deleteBuffer(r[_.id]),delete r[_.id],delete s[_.id]}function m(){for(let y in r)n.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:c,dispose:m}}var es=class{constructor(e={}){let{canvas:t=yp(),context:i=null,depth:r=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let f;i!==null?f=i.getContextAttributes().alpha:f=o;let d=new Uint32Array(4),g=new Int32Array(4),x=null,p=null,m=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=yt,this._useLegacyLights=!1,this.toneMapping=Rn,this.toneMappingExposure=1;let _=this,b=!1,E=0,S=0,A=null,C=-1,v=null,M=new vt,D=new vt,O=null,Y=new Ze(0),I=0,z=t.width,W=t.height,$=1,J=null,q=null,re=new vt(0,0,z,W),k=new vt(0,0,z,W),Q=!1,V=new Qr,te=!1,Se=!1,Le=null,_e=new pt,Fe=new j,ze=new P,ce={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function ge(){return A===null?$:1}let L=i;function de(T,N){for(let B=0;B<T.length;B++){let H=T[B],G=t.getContext(H,N);if(G!==null)return G}return null}try{let T={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r160"),t.addEventListener("webglcontextlost",fe,!1),t.addEventListener("webglcontextrestored",U,!1),t.addEventListener("webglcontextcreationerror",ve,!1),L===null){let N=["webgl2","webgl","experimental-webgl"];if(_.isWebGL1Renderer===!0&&N.shift(),L=de(N,T),L===null)throw de(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&L instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),L.getShaderPrecisionFormat===void 0&&(L.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let Z,he,K,Re,pe,R,w,F,le,se,ee,Pe,ye,we,ke,Je,ae,it,et,Ye,Ne,Ee,Ge,rt;function xt(){Z=new Cg(L),he=new Sg(L,Z,e),Z.init(he),Ee=new a_(L,Z,he),K=new s_(L,Z,he),Re=new Lg(L),pe=new Yx,R=new o_(L,Z,K,pe,he,Ee,Re),w=new Eg(_),F=new Rg(_),le=new Bp(L,he),Ge=new bg(L,Z,le,he),se=new Pg(L,le,Re,Ge),ee=new Og(L,se,le,Re),et=new Ng(L,he,R),Je=new wg(pe),Pe=new qx(_,w,F,Z,he,Ge,Je),ye=new c_(_,pe),we=new Zx,ke=new t_(Z,he),it=new vg(_,w,F,K,ee,f,l),ae=new r_(_,ee,he),rt=new u_(L,Re,he,K),Ye=new Mg(L,Z,Re,he),Ne=new Ig(L,Z,Re,he),Re.programs=Pe.programs,_.capabilities=he,_.extensions=Z,_.properties=pe,_.renderLists=we,_.shadowMap=ae,_.state=K,_.info=Re}xt();let je=new bl(_,L);this.xr=je,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let T=Z.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=Z.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(T){T!==void 0&&($=T,this.setSize(z,W,!1))},this.getSize=function(T){return T.set(z,W)},this.setSize=function(T,N,B=!0){if(je.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}z=T,W=N,t.width=Math.floor(T*$),t.height=Math.floor(N*$),B===!0&&(t.style.width=T+"px",t.style.height=N+"px"),this.setViewport(0,0,T,N)},this.getDrawingBufferSize=function(T){return T.set(z*$,W*$).floor()},this.setDrawingBufferSize=function(T,N,B){z=T,W=N,$=B,t.width=Math.floor(T*B),t.height=Math.floor(N*B),this.setViewport(0,0,T,N)},this.getCurrentViewport=function(T){return T.copy(M)},this.getViewport=function(T){return T.copy(re)},this.setViewport=function(T,N,B,H){T.isVector4?re.set(T.x,T.y,T.z,T.w):re.set(T,N,B,H),K.viewport(M.copy(re).multiplyScalar($).floor())},this.getScissor=function(T){return T.copy(k)},this.setScissor=function(T,N,B,H){T.isVector4?k.set(T.x,T.y,T.z,T.w):k.set(T,N,B,H),K.scissor(D.copy(k).multiplyScalar($).floor())},this.getScissorTest=function(){return Q},this.setScissorTest=function(T){K.setScissorTest(Q=T)},this.setOpaqueSort=function(T){J=T},this.setTransparentSort=function(T){q=T},this.getClearColor=function(T){return T.copy(it.getClearColor())},this.setClearColor=function(){it.setClearColor.apply(it,arguments)},this.getClearAlpha=function(){return it.getClearAlpha()},this.setClearAlpha=function(){it.setClearAlpha.apply(it,arguments)},this.clear=function(T=!0,N=!0,B=!0){let H=0;if(T){let G=!1;if(A!==null){let xe=A.texture.format;G=xe===oh||xe===sh||xe===rh}if(G){let xe=A.texture.type,Ce=xe===di||xe===ci||xe===Xl||xe===Di||xe===nh||xe===ih,Ae=it.getClearColor(),Ue=it.getClearAlpha(),We=Ae.r,Ie=Ae.g,Xe=Ae.b;Ce?(d[0]=We,d[1]=Ie,d[2]=Xe,d[3]=Ue,L.clearBufferuiv(L.COLOR,0,d)):(g[0]=We,g[1]=Ie,g[2]=Xe,g[3]=Ue,L.clearBufferiv(L.COLOR,0,g))}else H|=L.COLOR_BUFFER_BIT}N&&(H|=L.DEPTH_BUFFER_BIT),B&&(H|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",fe,!1),t.removeEventListener("webglcontextrestored",U,!1),t.removeEventListener("webglcontextcreationerror",ve,!1),we.dispose(),ke.dispose(),pe.dispose(),w.dispose(),F.dispose(),ee.dispose(),Ge.dispose(),rt.dispose(),Pe.dispose(),je.dispose(),je.removeEventListener("sessionstart",Et),je.removeEventListener("sessionend",at),Le&&(Le.dispose(),Le=null),Tt.stop()};function fe(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),b=!0}function U(){console.log("THREE.WebGLRenderer: Context Restored."),b=!1;let T=Re.autoReset,N=ae.enabled,B=ae.autoUpdate,H=ae.needsUpdate,G=ae.type;xt(),Re.autoReset=T,ae.enabled=N,ae.autoUpdate=B,ae.needsUpdate=H,ae.type=G}function ve(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function be(T){let N=T.target;N.removeEventListener("dispose",be),Ve(N)}function Ve(T){Be(T),pe.remove(T)}function Be(T){let N=pe.get(T).programs;N!==void 0&&(N.forEach(function(B){Pe.releaseProgram(B)}),T.isShaderMaterial&&Pe.releaseShaderCache(T))}this.renderBufferDirect=function(T,N,B,H,G,xe){N===null&&(N=ce);let Ce=G.isMesh&&G.matrixWorld.determinant()<0,Ae=Ke(T,N,B,H,G);K.setMaterial(H,Ce);let Ue=B.index,We=1;if(H.wireframe===!0){if(Ue=se.getWireframeAttribute(B),Ue===void 0)return;We=2}let Ie=B.drawRange,Xe=B.attributes.position,ct=Ie.start*We,kt=(Ie.start+Ie.count)*We;xe!==null&&(ct=Math.max(ct,xe.start*We),kt=Math.min(kt,(xe.start+xe.count)*We)),Ue!==null?(ct=Math.max(ct,0),kt=Math.min(kt,Ue.count)):Xe!=null&&(ct=Math.max(ct,0),kt=Math.min(kt,Xe.count));let Ft=kt-ct;if(Ft<0||Ft===1/0)return;Ge.setup(G,H,Ae,B,Ue);let Gn,St=Ye;if(Ue!==null&&(Gn=le.get(Ue),St=Ne,St.setIndex(Gn)),G.isMesh)H.wireframe===!0?(K.setLineWidth(H.wireframeLinewidth*ge()),St.setMode(L.LINES)):St.setMode(L.TRIANGLES);else if(G.isLine){let tt=H.linewidth;tt===void 0&&(tt=1),K.setLineWidth(tt*ge()),G.isLineSegments?St.setMode(L.LINES):G.isLineLoop?St.setMode(L.LINE_LOOP):St.setMode(L.LINE_STRIP)}else G.isPoints?St.setMode(L.POINTS):G.isSprite&&St.setMode(L.TRIANGLES);if(G.isBatchedMesh)St.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else if(G.isInstancedMesh)St.renderInstances(ct,Ft,G.count);else if(B.isInstancedBufferGeometry){let tt=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,ha=Math.min(B.instanceCount,tt);St.renderInstances(ct,Ft,ha)}else St.render(ct,Ft)};function ut(T,N,B){T.transparent===!0&&T.side===pn&&T.forceSinglePass===!1?(T.side=Lt,T.needsUpdate=!0,ue(T,N,B),T.side=pi,T.needsUpdate=!0,ue(T,N,B),T.side=pn):ue(T,N,B)}this.compile=function(T,N,B=null){B===null&&(B=T),p=ke.get(B),p.init(),y.push(p),B.traverseVisible(function(G){G.isLight&&G.layers.test(N.layers)&&(p.pushLight(G),G.castShadow&&p.pushShadow(G))}),T!==B&&T.traverseVisible(function(G){G.isLight&&G.layers.test(N.layers)&&(p.pushLight(G),G.castShadow&&p.pushShadow(G))}),p.setupLights(_._useLegacyLights);let H=new Set;return T.traverse(function(G){let xe=G.material;if(xe)if(Array.isArray(xe))for(let Ce=0;Ce<xe.length;Ce++){let Ae=xe[Ce];ut(Ae,B,G),H.add(Ae)}else ut(xe,B,G),H.add(xe)}),y.pop(),p=null,H},this.compileAsync=function(T,N,B=null){let H=this.compile(T,N,B);return new Promise(G=>{function xe(){if(H.forEach(function(Ce){pe.get(Ce).currentProgram.isReady()&&H.delete(Ce)}),H.size===0){G(T);return}setTimeout(xe,10)}Z.get("KHR_parallel_shader_compile")!==null?xe():setTimeout(xe,10)})};let ht=null;function Mt(T){ht&&ht(T)}function Et(){Tt.stop()}function at(){Tt.start()}let Tt=new mh;Tt.setAnimationLoop(Mt),typeof self<"u"&&Tt.setContext(self),this.setAnimationLoop=function(T){ht=T,je.setAnimationLoop(T),T===null?Tt.stop():Tt.start()},je.addEventListener("sessionstart",Et),je.addEventListener("sessionend",at),this.render=function(T,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(b===!0)return;T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),je.enabled===!0&&je.isPresenting===!0&&(je.cameraAutoUpdate===!0&&je.updateCamera(N),N=je.getCamera()),T.isScene===!0&&T.onBeforeRender(_,T,N,A),p=ke.get(T,y.length),p.init(),y.push(p),_e.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),V.setFromProjectionMatrix(_e),Se=this.localClippingEnabled,te=Je.init(this.clippingPlanes,Se),x=we.get(T,m.length),x.init(),m.push(x),nn(T,N,0,_.sortObjects),x.finish(),_.sortObjects===!0&&x.sort(J,q),this.info.render.frame++,te===!0&&Je.beginShadows();let B=p.state.shadowsArray;if(ae.render(B,T,N),te===!0&&Je.endShadows(),this.info.autoReset===!0&&this.info.reset(),it.render(x,T),p.setupLights(_._useLegacyLights),N.isArrayCamera){let H=N.cameras;for(let G=0,xe=H.length;G<xe;G++){let Ce=H[G];Or(x,T,Ce,Ce.viewport)}}else Or(x,T,N);A!==null&&(R.updateMultisampleRenderTarget(A),R.updateRenderTargetMipmap(A)),T.isScene===!0&&T.onAfterRender(_,T,N),Ge.resetDefaultState(),C=-1,v=null,y.pop(),y.length>0?p=y[y.length-1]:p=null,m.pop(),m.length>0?x=m[m.length-1]:x=null};function nn(T,N,B,H){if(T.visible===!1)return;if(T.layers.test(N.layers)){if(T.isGroup)B=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(N);else if(T.isLight)p.pushLight(T),T.castShadow&&p.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||V.intersectsSprite(T)){H&&ze.setFromMatrixPosition(T.matrixWorld).applyMatrix4(_e);let Ce=ee.update(T),Ae=T.material;Ae.visible&&x.push(T,Ce,Ae,B,ze.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||V.intersectsObject(T))){let Ce=ee.update(T),Ae=T.material;if(H&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),ze.copy(T.boundingSphere.center)):(Ce.boundingSphere===null&&Ce.computeBoundingSphere(),ze.copy(Ce.boundingSphere.center)),ze.applyMatrix4(T.matrixWorld).applyMatrix4(_e)),Array.isArray(Ae)){let Ue=Ce.groups;for(let We=0,Ie=Ue.length;We<Ie;We++){let Xe=Ue[We],ct=Ae[Xe.materialIndex];ct&&ct.visible&&x.push(T,Ce,ct,B,ze.z,Xe)}}else Ae.visible&&x.push(T,Ce,Ae,B,ze.z,null)}}let xe=T.children;for(let Ce=0,Ae=xe.length;Ce<Ae;Ce++)nn(xe[Ce],N,B,H)}function Or(T,N,B,H){let G=T.opaque,xe=T.transmissive,Ce=T.transparent;p.setupLightsView(B),te===!0&&Je.setGlobalState(_.clippingPlanes,B),xe.length>0&&Es(G,xe,N,B),H&&K.viewport(M.copy(H)),G.length>0&&Mi(G,N,B),xe.length>0&&Mi(xe,N,B),Ce.length>0&&Mi(Ce,N,B),K.buffers.depth.setTest(!0),K.buffers.depth.setMask(!0),K.buffers.color.setMask(!0),K.setPolygonOffset(!1)}function Es(T,N,B,H){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;let xe=he.isWebGL2;Le===null&&(Le=new $t(1,1,{generateMipmaps:!0,type:Z.has("EXT_color_buffer_half_float")?Fi:di,minFilter:jr,samples:xe?4:0})),_.getDrawingBufferSize(Fe),xe?Le.setSize(Fe.x,Fe.y):Le.setSize(ol(Fe.x),ol(Fe.y));let Ce=_.getRenderTarget();_.setRenderTarget(Le),_.getClearColor(Y),I=_.getClearAlpha(),I<1&&_.setClearColor(16777215,.5),_.clear();let Ae=_.toneMapping;_.toneMapping=Rn,Mi(T,B,H),R.updateMultisampleRenderTarget(Le),R.updateRenderTargetMipmap(Le);let Ue=!1;for(let We=0,Ie=N.length;We<Ie;We++){let Xe=N[We],ct=Xe.object,kt=Xe.geometry,Ft=Xe.material,Gn=Xe.group;if(Ft.side===pn&&ct.layers.test(H.layers)){let St=Ft.side;Ft.side=Lt,Ft.needsUpdate=!0,ne(ct,B,H,kt,Ft,Gn),Ft.side=St,Ft.needsUpdate=!0,Ue=!0}}Ue===!0&&(R.updateMultisampleRenderTarget(Le),R.updateRenderTargetMipmap(Le)),_.setRenderTarget(Ce),_.setClearColor(Y,I),_.toneMapping=Ae}function Mi(T,N,B){let H=N.isScene===!0?N.overrideMaterial:null;for(let G=0,xe=T.length;G<xe;G++){let Ce=T[G],Ae=Ce.object,Ue=Ce.geometry,We=H===null?Ce.material:H,Ie=Ce.group;Ae.layers.test(B.layers)&&ne(Ae,N,B,Ue,We,Ie)}}function ne(T,N,B,H,G,xe){T.onBeforeRender(_,N,B,H,G,xe),T.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),G.onBeforeRender(_,N,B,H,T,xe),G.transparent===!0&&G.side===pn&&G.forceSinglePass===!1?(G.side=Lt,G.needsUpdate=!0,_.renderBufferDirect(B,N,H,G,T,xe),G.side=pi,G.needsUpdate=!0,_.renderBufferDirect(B,N,H,G,T,xe),G.side=pn):_.renderBufferDirect(B,N,H,G,T,xe),T.onAfterRender(_,N,B,H,G,xe)}function ue(T,N,B){N.isScene!==!0&&(N=ce);let H=pe.get(T),G=p.state.lights,xe=p.state.shadowsArray,Ce=G.state.version,Ae=Pe.getParameters(T,G.state,xe,N,B),Ue=Pe.getProgramCacheKey(Ae),We=H.programs;H.environment=T.isMeshStandardMaterial?N.environment:null,H.fog=N.fog,H.envMap=(T.isMeshStandardMaterial?F:w).get(T.envMap||H.environment),We===void 0&&(T.addEventListener("dispose",be),We=new Map,H.programs=We);let Ie=We.get(Ue);if(Ie!==void 0){if(H.currentProgram===Ie&&H.lightsStateVersion===Ce)return Oe(T,Ae),Ie}else Ae.uniforms=Pe.getUniforms(T),T.onBuild(B,Ae,_),T.onBeforeCompile(Ae,_),Ie=Pe.acquireProgram(Ae,Ue),We.set(Ue,Ie),H.uniforms=Ae.uniforms;let Xe=H.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Xe.clippingPlanes=Je.uniform),Oe(T,Ae),H.needsLights=st(T),H.lightsStateVersion=Ce,H.needsLights&&(Xe.ambientLightColor.value=G.state.ambient,Xe.lightProbe.value=G.state.probe,Xe.directionalLights.value=G.state.directional,Xe.directionalLightShadows.value=G.state.directionalShadow,Xe.spotLights.value=G.state.spot,Xe.spotLightShadows.value=G.state.spotShadow,Xe.rectAreaLights.value=G.state.rectArea,Xe.ltc_1.value=G.state.rectAreaLTC1,Xe.ltc_2.value=G.state.rectAreaLTC2,Xe.pointLights.value=G.state.point,Xe.pointLightShadows.value=G.state.pointShadow,Xe.hemisphereLights.value=G.state.hemi,Xe.directionalShadowMap.value=G.state.directionalShadowMap,Xe.directionalShadowMatrix.value=G.state.directionalShadowMatrix,Xe.spotShadowMap.value=G.state.spotShadowMap,Xe.spotLightMatrix.value=G.state.spotLightMatrix,Xe.spotLightMap.value=G.state.spotLightMap,Xe.pointShadowMap.value=G.state.pointShadowMap,Xe.pointShadowMatrix.value=G.state.pointShadowMatrix),H.currentProgram=Ie,H.uniformsList=null,Ie}function Me(T){if(T.uniformsList===null){let N=T.currentProgram.getUniforms();T.uniformsList=xr.seqWithValue(N.seq,T.uniforms)}return T.uniformsList}function Oe(T,N){let B=pe.get(T);B.outputColorSpace=N.outputColorSpace,B.batching=N.batching,B.instancing=N.instancing,B.instancingColor=N.instancingColor,B.skinning=N.skinning,B.morphTargets=N.morphTargets,B.morphNormals=N.morphNormals,B.morphColors=N.morphColors,B.morphTargetsCount=N.morphTargetsCount,B.numClippingPlanes=N.numClippingPlanes,B.numIntersection=N.numClipIntersection,B.vertexAlphas=N.vertexAlphas,B.vertexTangents=N.vertexTangents,B.toneMapping=N.toneMapping}function Ke(T,N,B,H,G){N.isScene!==!0&&(N=ce),R.resetTextureUnits();let xe=N.fog,Ce=H.isMeshStandardMaterial?N.environment:null,Ae=A===null?_.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:jn,Ue=(H.isMeshStandardMaterial?F:w).get(H.envMap||Ce),We=H.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Ie=!!B.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Xe=!!B.morphAttributes.position,ct=!!B.morphAttributes.normal,kt=!!B.morphAttributes.color,Ft=Rn;H.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Ft=_.toneMapping);let Gn=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,St=Gn!==void 0?Gn.length:0,tt=pe.get(H),ha=p.state.lights;if(te===!0&&(Se===!0||T!==v)){let hn=T===v&&H.id===C;Je.setState(H,T,hn)}let At=!1;H.version===tt.__version?(tt.needsLights&&tt.lightsStateVersion!==ha.state.version||tt.outputColorSpace!==Ae||G.isBatchedMesh&&tt.batching===!1||!G.isBatchedMesh&&tt.batching===!0||G.isInstancedMesh&&tt.instancing===!1||!G.isInstancedMesh&&tt.instancing===!0||G.isSkinnedMesh&&tt.skinning===!1||!G.isSkinnedMesh&&tt.skinning===!0||G.isInstancedMesh&&tt.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&tt.instancingColor===!1&&G.instanceColor!==null||tt.envMap!==Ue||H.fog===!0&&tt.fog!==xe||tt.numClippingPlanes!==void 0&&(tt.numClippingPlanes!==Je.numPlanes||tt.numIntersection!==Je.numIntersection)||tt.vertexAlphas!==We||tt.vertexTangents!==Ie||tt.morphTargets!==Xe||tt.morphNormals!==ct||tt.morphColors!==kt||tt.toneMapping!==Ft||he.isWebGL2===!0&&tt.morphTargetsCount!==St)&&(At=!0):(At=!0,tt.__version=H.version);let Si=tt.currentProgram;At===!0&&(Si=ue(H,N,G));let vc=!1,Fr=!1,da=!1,Ht=Si.getUniforms(),wi=tt.uniforms;if(K.useProgram(Si.program)&&(vc=!0,Fr=!0,da=!0),H.id!==C&&(C=H.id,Fr=!0),vc||v!==T){Ht.setValue(L,"projectionMatrix",T.projectionMatrix),Ht.setValue(L,"viewMatrix",T.matrixWorldInverse);let hn=Ht.map.cameraPosition;hn!==void 0&&hn.setValue(L,ze.setFromMatrixPosition(T.matrixWorld)),he.logarithmicDepthBuffer&&Ht.setValue(L,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&Ht.setValue(L,"isOrthographic",T.isOrthographicCamera===!0),v!==T&&(v=T,Fr=!0,da=!0)}if(G.isSkinnedMesh){Ht.setOptional(L,G,"bindMatrix"),Ht.setOptional(L,G,"bindMatrixInverse");let hn=G.skeleton;hn&&(he.floatVertexTextures?(hn.boneTexture===null&&hn.computeBoneTexture(),Ht.setValue(L,"boneTexture",hn.boneTexture,R)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}G.isBatchedMesh&&(Ht.setOptional(L,G,"batchingTexture"),Ht.setValue(L,"batchingTexture",G._matricesTexture,R));let fa=B.morphAttributes;if((fa.position!==void 0||fa.normal!==void 0||fa.color!==void 0&&he.isWebGL2===!0)&&et.update(G,B,Si),(Fr||tt.receiveShadow!==G.receiveShadow)&&(tt.receiveShadow=G.receiveShadow,Ht.setValue(L,"receiveShadow",G.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(wi.envMap.value=Ue,wi.flipEnvMap.value=Ue.isCubeTexture&&Ue.isRenderTargetTexture===!1?-1:1),Fr&&(Ht.setValue(L,"toneMappingExposure",_.toneMappingExposure),tt.needsLights&&mt(wi,da),xe&&H.fog===!0&&ye.refreshFogUniforms(wi,xe),ye.refreshMaterialUniforms(wi,H,$,W,Le),xr.upload(L,Me(tt),wi,R)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(xr.upload(L,Me(tt),wi,R),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&Ht.setValue(L,"center",G.center),Ht.setValue(L,"modelViewMatrix",G.modelViewMatrix),Ht.setValue(L,"normalMatrix",G.normalMatrix),Ht.setValue(L,"modelMatrix",G.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){let hn=H.uniformsGroups;for(let pa=0,bf=hn.length;pa<bf;pa++)if(he.isWebGL2){let bc=hn[pa];rt.update(bc,Si),rt.bind(bc,Si)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Si}function mt(T,N){T.ambientLightColor.needsUpdate=N,T.lightProbe.needsUpdate=N,T.directionalLights.needsUpdate=N,T.directionalLightShadows.needsUpdate=N,T.pointLights.needsUpdate=N,T.pointLightShadows.needsUpdate=N,T.spotLights.needsUpdate=N,T.spotLightShadows.needsUpdate=N,T.rectAreaLights.needsUpdate=N,T.hemisphereLights.needsUpdate=N}function st(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(T,N,B){pe.get(T.texture).__webglTexture=N,pe.get(T.depthTexture).__webglTexture=B;let H=pe.get(T);H.__hasExternalTextures=!0,H.__hasExternalTextures&&(H.__autoAllocateDepthBuffer=B===void 0,H.__autoAllocateDepthBuffer||Z.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(T,N){let B=pe.get(T);B.__webglFramebuffer=N,B.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(T,N=0,B=0){A=T,E=N,S=B;let H=!0,G=null,xe=!1,Ce=!1;if(T){let Ue=pe.get(T);Ue.__useDefaultFramebuffer!==void 0?(K.bindFramebuffer(L.FRAMEBUFFER,null),H=!1):Ue.__webglFramebuffer===void 0?R.setupRenderTarget(T):Ue.__hasExternalTextures&&R.rebindTextures(T,pe.get(T.texture).__webglTexture,pe.get(T.depthTexture).__webglTexture);let We=T.texture;(We.isData3DTexture||We.isDataArrayTexture||We.isCompressedArrayTexture)&&(Ce=!0);let Ie=pe.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Ie[N])?G=Ie[N][B]:G=Ie[N],xe=!0):he.isWebGL2&&T.samples>0&&R.useMultisampledRTT(T)===!1?G=pe.get(T).__webglMultisampledFramebuffer:Array.isArray(Ie)?G=Ie[B]:G=Ie,M.copy(T.viewport),D.copy(T.scissor),O=T.scissorTest}else M.copy(re).multiplyScalar($).floor(),D.copy(k).multiplyScalar($).floor(),O=Q;if(K.bindFramebuffer(L.FRAMEBUFFER,G)&&he.drawBuffers&&H&&K.drawBuffers(T,G),K.viewport(M),K.scissor(D),K.setScissorTest(O),xe){let Ue=pe.get(T.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+N,Ue.__webglTexture,B)}else if(Ce){let Ue=pe.get(T.texture),We=N||0;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ue.__webglTexture,B||0,We)}C=-1},this.readRenderTargetPixels=function(T,N,B,H,G,xe,Ce){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ae=pe.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ce!==void 0&&(Ae=Ae[Ce]),Ae){K.bindFramebuffer(L.FRAMEBUFFER,Ae);try{let Ue=T.texture,We=Ue.format,Ie=Ue.type;if(We!==An&&Ee.convert(We)!==L.getParameter(L.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let Xe=Ie===Fi&&(Z.has("EXT_color_buffer_half_float")||he.isWebGL2&&Z.has("EXT_color_buffer_float"));if(Ie!==di&&Ee.convert(Ie)!==L.getParameter(L.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ie===ui&&(he.isWebGL2||Z.has("OES_texture_float")||Z.has("WEBGL_color_buffer_float")))&&!Xe){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=T.width-H&&B>=0&&B<=T.height-G&&L.readPixels(N,B,H,G,Ee.convert(We),Ee.convert(Ie),xe)}finally{let Ue=A!==null?pe.get(A).__webglFramebuffer:null;K.bindFramebuffer(L.FRAMEBUFFER,Ue)}}},this.copyFramebufferToTexture=function(T,N,B=0){let H=Math.pow(2,-B),G=Math.floor(N.image.width*H),xe=Math.floor(N.image.height*H);R.setTexture2D(N,0),L.copyTexSubImage2D(L.TEXTURE_2D,B,0,0,T.x,T.y,G,xe),K.unbindTexture()},this.copyTextureToTexture=function(T,N,B,H=0){let G=N.image.width,xe=N.image.height,Ce=Ee.convert(B.format),Ae=Ee.convert(B.type);R.setTexture2D(B,0),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,B.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,B.unpackAlignment),N.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,H,T.x,T.y,G,xe,Ce,Ae,N.image.data):N.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,H,T.x,T.y,N.mipmaps[0].width,N.mipmaps[0].height,Ce,N.mipmaps[0].data):L.texSubImage2D(L.TEXTURE_2D,H,T.x,T.y,Ce,Ae,N.image),H===0&&B.generateMipmaps&&L.generateMipmap(L.TEXTURE_2D),K.unbindTexture()},this.copyTextureToTexture3D=function(T,N,B,H,G=0){if(_.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let xe=T.max.x-T.min.x+1,Ce=T.max.y-T.min.y+1,Ae=T.max.z-T.min.z+1,Ue=Ee.convert(H.format),We=Ee.convert(H.type),Ie;if(H.isData3DTexture)R.setTexture3D(H,0),Ie=L.TEXTURE_3D;else if(H.isDataArrayTexture||H.isCompressedArrayTexture)R.setTexture2DArray(H,0),Ie=L.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,H.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,H.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,H.unpackAlignment);let Xe=L.getParameter(L.UNPACK_ROW_LENGTH),ct=L.getParameter(L.UNPACK_IMAGE_HEIGHT),kt=L.getParameter(L.UNPACK_SKIP_PIXELS),Ft=L.getParameter(L.UNPACK_SKIP_ROWS),Gn=L.getParameter(L.UNPACK_SKIP_IMAGES),St=B.isCompressedTexture?B.mipmaps[G]:B.image;L.pixelStorei(L.UNPACK_ROW_LENGTH,St.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,St.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,T.min.x),L.pixelStorei(L.UNPACK_SKIP_ROWS,T.min.y),L.pixelStorei(L.UNPACK_SKIP_IMAGES,T.min.z),B.isDataTexture||B.isData3DTexture?L.texSubImage3D(Ie,G,N.x,N.y,N.z,xe,Ce,Ae,Ue,We,St.data):B.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),L.compressedTexSubImage3D(Ie,G,N.x,N.y,N.z,xe,Ce,Ae,Ue,St.data)):L.texSubImage3D(Ie,G,N.x,N.y,N.z,xe,Ce,Ae,Ue,We,St),L.pixelStorei(L.UNPACK_ROW_LENGTH,Xe),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ct),L.pixelStorei(L.UNPACK_SKIP_PIXELS,kt),L.pixelStorei(L.UNPACK_SKIP_ROWS,Ft),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Gn),G===0&&H.generateMipmaps&&L.generateMipmap(Ie),K.unbindTexture()},this.initTexture=function(T){T.isCubeTexture?R.setTextureCube(T,0):T.isData3DTexture?R.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?R.setTexture2DArray(T,0):R.setTexture2D(T,0),K.unbindTexture()},this.resetState=function(){E=0,S=0,A=null,K.reset(),Ge.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Jn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===Yl?"display-p3":"srgb",t.unpackColorSpace=dt.workingColorSpace===Fo?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===yt?Ni:lh}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===Ni?yt:jn}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}},Ml=class extends es{};Ml.prototype.isWebGL1Renderer=!0;var Pn=class extends qt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}},bo=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=il,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=$n()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=$n()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=$n()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Kt=new P,ts=class n{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Kt.fromBufferAttribute(this,t),Kt.applyMatrix4(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Kt.fromBufferAttribute(this,t),Kt.applyNormalMatrix(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Kt.fromBufferAttribute(this,t),Kt.transformDirection(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Zn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Zn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Zn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Zn(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array),r=ft(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),i=ft(i,this.array),r=ft(r,this.array),s=ft(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Xt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new n(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},ns=class extends Qn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ze(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ar,Hr=new P,lr=new P,cr=new P,ur=new j,Vr=new j,bh=new pt,Ks=new P,Wr=new P,Zs=new P,Hu=new j,qa=new j,Vu=new j,Mo=class extends qt{constructor(e=new ns){if(super(),this.isSprite=!0,this.type="Sprite",ar===void 0){ar=new Rt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new bo(t,5);ar.setIndex([0,1,2,0,2,3]),ar.setAttribute("position",new ts(i,3,0,!1)),ar.setAttribute("uv",new ts(i,2,3,!1))}this.geometry=ar,this.material=e,this.center=new j(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),lr.setFromMatrixScale(this.matrixWorld),bh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),cr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&lr.multiplyScalar(-cr.z);let i=this.material.rotation,r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));let o=this.center;Js(Ks.set(-.5,-.5,0),cr,o,lr,r,s),Js(Wr.set(.5,-.5,0),cr,o,lr,r,s),Js(Zs.set(.5,.5,0),cr,o,lr,r,s),Hu.set(0,0),qa.set(1,0),Vu.set(1,1);let a=e.ray.intersectTriangle(Ks,Wr,Zs,!1,Hr);if(a===null&&(Js(Wr.set(-.5,.5,0),cr,o,lr,r,s),qa.set(0,1),a=e.ray.intersectTriangle(Ks,Zs,Wr,!1,Hr),a===null))return;let l=e.ray.origin.distanceTo(Hr);l<e.near||l>e.far||t.push({distance:l,point:Hr.clone(),uv:Li.getInterpolation(Hr,Ks,Wr,Zs,Hu,qa,Vu,new j),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Js(n,e,t,i,r,s){ur.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(Vr.x=s*ur.x-r*ur.y,Vr.y=r*ur.x+s*ur.y):Vr.copy(ur),n.copy(e),n.x+=Vr.x,n.y+=Vr.y,n.applyMatrix4(bh)}var is=class extends Xt{constructor(e,t,i,r=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},hr=new pt,Wu=new pt,$s=[],Xu=new Cn,h_=new pt,Xr=new oe,qr=new zi,So=class extends oe{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new is(new Float32Array(i*16),16),this.instanceColor=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,h_)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Cn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,hr),Xu.copy(e.boundingBox).applyMatrix4(hr),this.boundingBox.union(Xu)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new zi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,hr),qr.copy(e.boundingSphere).applyMatrix4(hr),this.boundingSphere.union(qr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){let i=this.matrixWorld,r=this.count;if(Xr.geometry=this.geometry,Xr.material=this.material,Xr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),qr.copy(this.boundingSphere),qr.applyMatrix4(i),e.ray.intersectsSphere(qr)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,hr),Wu.multiplyMatrices(i,hr),Xr.matrixWorld=Wu,Xr.raycast(e,$s);for(let o=0,a=$s.length;o<a;o++){let l=$s[o];l.instanceId=s,l.object=this,t.push(l)}$s.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new is(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}};var xi=class extends gn{constructor(e,t,i,r,s,o,a,l,c){super(e,t,i,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},_n=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),t.push(s),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let i=this.getLengths(),r=0,s=i.length,o;t?o=t:o=e*i[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=i[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,i[r]===o)return r/(s-1);let u=i[r],f=i[r+1]-u,d=(o-u)/f;return(r+d)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new j:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){let i=new P,r=[],s=[],o=[],a=new P,l=new pt;for(let d=0;d<=e;d++){let g=d/e;r[d]=this.getTangentAt(g,new P)}s[0]=new P,o[0]=new P;let c=Number.MAX_VALUE,u=Math.abs(r[0].x),h=Math.abs(r[0].y),f=Math.abs(r[0].z);u<=c&&(c=u,i.set(1,0,0)),h<=c&&(c=h,i.set(0,1,0)),f<=c&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let d=1;d<=e;d++){if(s[d]=s[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(r[d-1],r[d]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(Bt(r[d-1].dot(r[d]),-1,1));s[d].applyMatrix4(l.makeRotationAxis(a,g))}o[d].crossVectors(r[d],s[d])}if(t===!0){let d=Math.acos(Bt(s[0].dot(s[e]),-1,1));d/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(d=-d);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],d*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},rs=class extends _n{constructor(e=0,t=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){let i=t||new j,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*u-d*h+this.aX,c=f*h+d*u+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Sl=class extends rs{constructor(e,t,i,r,s,o){super(e,t,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Zl(){let n=0,e=0,t=0,i=0;function r(s,o,a,l){n=s,e=a,t=-3*s+3*o-2*a-l,i=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,h){let f=(o-s)/c-(a-s)/(c+u)+(a-o)/u,d=(a-o)/u-(l-o)/(u+h)+(l-a)/h;f*=u,d*=u,r(o,a,f,d)},calc:function(s){let o=s*s,a=o*s;return n+e*s+t*o+i*a}}}var js=new P,Ya=new Zl,Ka=new Zl,Za=new Zl,ss=class extends _n{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new P){let i=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(js.subVectors(r[0],r[1]).add(r[0]),c=js);let h=r[a%s],f=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(js.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=js),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(h),d),x=Math.pow(h.distanceToSquared(f),d),p=Math.pow(f.distanceToSquared(u),d);x<1e-4&&(x=1),g<1e-4&&(g=x),p<1e-4&&(p=x),Ya.initNonuniformCatmullRom(c.x,h.x,f.x,u.x,g,x,p),Ka.initNonuniformCatmullRom(c.y,h.y,f.y,u.y,g,x,p),Za.initNonuniformCatmullRom(c.z,h.z,f.z,u.z,g,x,p)}else this.curveType==="catmullrom"&&(Ya.initCatmullRom(c.x,h.x,f.x,u.x,this.tension),Ka.initCatmullRom(c.y,h.y,f.y,u.y,this.tension),Za.initCatmullRom(c.z,h.z,f.z,u.z,this.tension));return i.set(Ya.calc(l),Ka.calc(l),Za.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new P().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function qu(n,e,t,i,r){let s=(i-e)*.5,o=(r-t)*.5,a=n*n,l=n*a;return(2*t-2*i+s+o)*l+(-3*t+3*i-2*s-o)*a+s*n+t}function d_(n,e){let t=1-n;return t*t*e}function f_(n,e){return 2*(1-n)*n*e}function p_(n,e){return n*n*e}function Jr(n,e,t,i){return d_(n,e)+f_(n,t)+p_(n,i)}function m_(n,e){let t=1-n;return t*t*t*e}function g_(n,e){let t=1-n;return 3*t*t*n*e}function x_(n,e){return 3*(1-n)*n*n*e}function __(n,e){return n*n*n*e}function $r(n,e,t,i,r){return m_(n,e)+g_(n,t)+x_(n,i)+__(n,r)}var wo=class extends _n{constructor(e=new j,t=new j,i=new j,r=new j){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new j){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set($r(e,r.x,s.x,o.x,a.x),$r(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},wl=class extends _n{constructor(e=new P,t=new P,i=new P,r=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new P){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set($r(e,r.x,s.x,o.x,a.x),$r(e,r.y,s.y,o.y,a.y),$r(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Eo=class extends _n{constructor(e=new j,t=new j){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new j){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new j){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},El=class extends _n{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},To=class extends _n{constructor(e=new j,t=new j,i=new j){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new j){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(Jr(e,r.x,s.x,o.x),Jr(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ao=class extends _n{constructor(e=new P,t=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new P){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(Jr(e,r.x,s.x,o.x),Jr(e,r.y,s.y,o.y),Jr(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ro=class extends _n{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new j){let i=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return i.set(qu(a,l.x,c.x,u.x,h.x),qu(a,l.y,c.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new j().fromArray(r))}return this}},Co=Object.freeze({__proto__:null,ArcCurve:Sl,CatmullRomCurve3:ss,CubicBezierCurve:wo,CubicBezierCurve3:wl,EllipseCurve:rs,LineCurve:Eo,LineCurve3:El,QuadraticBezierCurve:To,QuadraticBezierCurve3:Ao,SplineCurve:Ro}),Tl=class extends _n{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Co[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=i){let o=r[s]-i,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(new Co[r.type]().fromJSON(r))}return this}},wr=class extends Tl{constructor(e){super(),this.type="Path",this.currentPoint=new j,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new Eo(this.currentPoint.clone(),new j(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){let s=new To(this.currentPoint.clone(),new j(e,t),new j(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,s,o){let a=new wo(this.currentPoint.clone(),new j(e,t),new j(i,r),new j(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new Ro(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,r,s,o),this}absarc(e,t,i,r,s,o){return this.absellipse(e,t,i,i,r,s,o),this}ellipse(e,t,i,r,s,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,i,r,s,o,a,l),this}absellipse(e,t,i,r,s,o,a,l){let c=new rs(e,t,i,r,s,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Er=class n extends Rt{constructor(e=[new j(0,-.5),new j(.5,0),new j(0,.5)],t=12,i=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:r},t=Math.floor(t),r=Bt(r,0,Math.PI*2);let s=[],o=[],a=[],l=[],c=[],u=1/t,h=new P,f=new j,d=new P,g=new P,x=new P,p=0,m=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,d.x=m*1,d.y=-p,d.z=m*0,x.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case e.length-1:l.push(x.x,x.y,x.z);break;default:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,d.x=m*1,d.y=-p,d.z=m*0,g.copy(d),d.x+=x.x,d.y+=x.y,d.z+=x.z,d.normalize(),l.push(d.x,d.y,d.z),x.copy(g)}for(let y=0;y<=t;y++){let _=i+y*u*r,b=Math.sin(_),E=Math.cos(_);for(let S=0;S<=e.length-1;S++){h.x=e[S].x*b,h.y=e[S].y,h.z=e[S].x*E,o.push(h.x,h.y,h.z),f.x=y/t,f.y=S/(e.length-1),a.push(f.x,f.y);let A=l[3*S+0]*b,C=l[3*S+1],v=l[3*S+0]*E;c.push(A,C,v)}}for(let y=0;y<t;y++)for(let _=0;_<e.length-1;_++){let b=_+y*e.length,E=b,S=b+e.length,A=b+e.length+1,C=b+1;s.push(E,S,C),s.push(A,C,S)}this.setIndex(s),this.setAttribute("position",new $e(o,3)),this.setAttribute("uv",new $e(a,2)),this.setAttribute("normal",new $e(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.points,e.segments,e.phiStart,e.phiLength)}};var Po=class n extends Rt{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],c=new P,u=new j;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,f=3;h<=t;h++,f+=3){let d=i+h/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[f]/e+1)/2,u.y=(o[f+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new $e(o,3)),this.setAttribute("normal",new $e(a,3)),this.setAttribute("uv",new $e(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}},yn=class n extends Rt{constructor(e=1,t=1,i=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let u=[],h=[],f=[],d=[],g=0,x=[],p=i/2,m=0;y(),o===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(u),this.setAttribute("position",new $e(h,3)),this.setAttribute("normal",new $e(f,3)),this.setAttribute("uv",new $e(d,2));function y(){let b=new P,E=new P,S=0,A=(t-e)/i;for(let C=0;C<=s;C++){let v=[],M=C/s,D=M*(t-e)+e;for(let O=0;O<=r;O++){let Y=O/r,I=Y*l+a,z=Math.sin(I),W=Math.cos(I);E.x=D*z,E.y=-M*i+p,E.z=D*W,h.push(E.x,E.y,E.z),b.set(z,A,W).normalize(),f.push(b.x,b.y,b.z),d.push(Y,1-M),v.push(g++)}x.push(v)}for(let C=0;C<r;C++)for(let v=0;v<s;v++){let M=x[v][C],D=x[v+1][C],O=x[v+1][C+1],Y=x[v][C+1];u.push(M,D,Y),u.push(D,O,Y),S+=6}c.addGroup(m,S,0),m+=S}function _(b){let E=g,S=new j,A=new P,C=0,v=b===!0?e:t,M=b===!0?1:-1;for(let O=1;O<=r;O++)h.push(0,p*M,0),f.push(0,M,0),d.push(.5,.5),g++;let D=g;for(let O=0;O<=r;O++){let I=O/r*l+a,z=Math.cos(I),W=Math.sin(I);A.x=v*W,A.y=p*M,A.z=v*z,h.push(A.x,A.y,A.z),f.push(0,M,0),S.x=z*.5+.5,S.y=W*.5*M+.5,d.push(S.x,S.y),g++}for(let O=0;O<r;O++){let Y=E+O,I=D+O;b===!0?u.push(I,I+1,Y):u.push(I+1,I,Y),C+=3}c.addGroup(m,C,b===!0?1:2),m+=C}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Yt=class n extends yn{constructor(e=1,t=1,i=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,i,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Al=class n extends Rt{constructor(e=[],t=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:r};let s=[],o=[];a(r),c(i),u(),this.setAttribute("position",new $e(s,3)),this.setAttribute("normal",new $e(s.slice(),3)),this.setAttribute("uv",new $e(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let _=new P,b=new P,E=new P;for(let S=0;S<t.length;S+=3)d(t[S+0],_),d(t[S+1],b),d(t[S+2],E),l(_,b,E,y)}function l(y,_,b,E){let S=E+1,A=[];for(let C=0;C<=S;C++){A[C]=[];let v=y.clone().lerp(b,C/S),M=_.clone().lerp(b,C/S),D=S-C;for(let O=0;O<=D;O++)O===0&&C===S?A[C][O]=v:A[C][O]=v.clone().lerp(M,O/D)}for(let C=0;C<S;C++)for(let v=0;v<2*(S-C)-1;v++){let M=Math.floor(v/2);v%2===0?(f(A[C][M+1]),f(A[C+1][M]),f(A[C][M])):(f(A[C][M+1]),f(A[C+1][M+1]),f(A[C+1][M]))}}function c(y){let _=new P;for(let b=0;b<s.length;b+=3)_.x=s[b+0],_.y=s[b+1],_.z=s[b+2],_.normalize().multiplyScalar(y),s[b+0]=_.x,s[b+1]=_.y,s[b+2]=_.z}function u(){let y=new P;for(let _=0;_<s.length;_+=3){y.x=s[_+0],y.y=s[_+1],y.z=s[_+2];let b=p(y)/2/Math.PI+.5,E=m(y)/Math.PI+.5;o.push(b,1-E)}g(),h()}function h(){for(let y=0;y<o.length;y+=6){let _=o[y+0],b=o[y+2],E=o[y+4],S=Math.max(_,b,E),A=Math.min(_,b,E);S>.9&&A<.1&&(_<.2&&(o[y+0]+=1),b<.2&&(o[y+2]+=1),E<.2&&(o[y+4]+=1))}}function f(y){s.push(y.x,y.y,y.z)}function d(y,_){let b=y*3;_.x=e[b+0],_.y=e[b+1],_.z=e[b+2]}function g(){let y=new P,_=new P,b=new P,E=new P,S=new j,A=new j,C=new j;for(let v=0,M=0;v<s.length;v+=9,M+=6){y.set(s[v+0],s[v+1],s[v+2]),_.set(s[v+3],s[v+4],s[v+5]),b.set(s[v+6],s[v+7],s[v+8]),S.set(o[M+0],o[M+1]),A.set(o[M+2],o[M+3]),C.set(o[M+4],o[M+5]),E.copy(y).add(_).add(b).divideScalar(3);let D=p(E);x(S,M+0,y,D),x(A,M+2,_,D),x(C,M+4,b,D)}}function x(y,_,b,E){E<0&&y.x===1&&(o[_]=y.x-1),b.x===0&&b.z===0&&(o[_]=E/2/Math.PI+.5)}function p(y){return Math.atan2(y.z,-y.x)}function m(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.details)}};var an=class extends wr{constructor(e){super(e),this.uuid=$n(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(new wr().fromJSON(r))}return this}},y_={triangulate:function(n,e,t=2){let i=e&&e.length,r=i?e[0]*t:n.length,s=Mh(n,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c,u,h,f,d;if(i&&(s=w_(n,e,s,t)),n.length>80*t){a=c=n[0],l=u=n[1];for(let g=t;g<r;g+=t)h=n[g],f=n[g+1],h<a&&(a=h),f<l&&(l=f),h>c&&(c=h),f>u&&(u=f);d=Math.max(c-a,u-l),d=d!==0?32767/d:0}return os(s,o,t,a,l,d,0),o}};function Mh(n,e,t,i,r){let s,o;if(r===N_(n,e,t,i)>0)for(s=e;s<t;s+=i)o=Yu(s,n[s],n[s+1],o);else for(s=t-i;s>=e;s-=i)o=Yu(s,n[s],n[s+1],o);return o&&ko(o,o.next)&&(ls(o),o=o.next),o}function ki(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(ko(t,t.next)||wt(t.prev,t,t.next)===0)){if(ls(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function os(n,e,t,i,r,s,o){if(!n)return;!o&&s&&C_(n,i,r,s);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,s?b_(n,i,r,s):v_(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),ls(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=M_(ki(n),e,t),os(n,e,t,i,r,s,2)):o===2&&S_(n,e,t,i,r,s):os(ki(n),e,t,i,r,s,1);break}}}function v_(n){let e=n.prev,t=n,i=n.next;if(wt(e,t,i)>=0)return!1;let r=e.x,s=t.x,o=i.x,a=e.y,l=t.y,c=i.y,u=r<s?r<o?r:o:s<o?s:o,h=a<l?a<c?a:c:l<c?l:c,f=r>s?r>o?r:o:s>o?s:o,d=a>l?a>c?a:c:l>c?l:c,g=i.next;for(;g!==e;){if(g.x>=u&&g.x<=f&&g.y>=h&&g.y<=d&&pr(r,a,s,l,o,c,g.x,g.y)&&wt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function b_(n,e,t,i){let r=n.prev,s=n,o=n.next;if(wt(r,s,o)>=0)return!1;let a=r.x,l=s.x,c=o.x,u=r.y,h=s.y,f=o.y,d=a<l?a<c?a:c:l<c?l:c,g=u<h?u<f?u:f:h<f?h:f,x=a>l?a>c?a:c:l>c?l:c,p=u>h?u>f?u:f:h>f?h:f,m=Rl(d,g,e,t,i),y=Rl(x,p,e,t,i),_=n.prevZ,b=n.nextZ;for(;_&&_.z>=m&&b&&b.z<=y;){if(_.x>=d&&_.x<=x&&_.y>=g&&_.y<=p&&_!==r&&_!==o&&pr(a,u,l,h,c,f,_.x,_.y)&&wt(_.prev,_,_.next)>=0||(_=_.prevZ,b.x>=d&&b.x<=x&&b.y>=g&&b.y<=p&&b!==r&&b!==o&&pr(a,u,l,h,c,f,b.x,b.y)&&wt(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;_&&_.z>=m;){if(_.x>=d&&_.x<=x&&_.y>=g&&_.y<=p&&_!==r&&_!==o&&pr(a,u,l,h,c,f,_.x,_.y)&&wt(_.prev,_,_.next)>=0)return!1;_=_.prevZ}for(;b&&b.z<=y;){if(b.x>=d&&b.x<=x&&b.y>=g&&b.y<=p&&b!==r&&b!==o&&pr(a,u,l,h,c,f,b.x,b.y)&&wt(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function M_(n,e,t){let i=n;do{let r=i.prev,s=i.next.next;!ko(r,s)&&Sh(r,i,i.next,s)&&as(r,s)&&as(s,r)&&(e.push(r.i/t|0),e.push(i.i/t|0),e.push(s.i/t|0),ls(i),ls(i.next),i=n=s),i=i.next}while(i!==n);return ki(i)}function S_(n,e,t,i,r,s){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&L_(o,a)){let l=wh(o,a);o=ki(o,o.next),l=ki(l,l.next),os(o,e,t,i,r,s,0),os(l,e,t,i,r,s,0);return}a=a.next}o=o.next}while(o!==n)}function w_(n,e,t,i){let r=[],s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*i,l=s<o-1?e[s+1]*i:n.length,c=Mh(n,a,l,i,!1),c===c.next&&(c.steiner=!0),r.push(I_(c));for(r.sort(E_),s=0;s<r.length;s++)t=T_(r[s],t);return t}function E_(n,e){return n.x-e.x}function T_(n,e){let t=A_(n,e);if(!t)return e;let i=wh(t,n);return ki(i,i.next),ki(t,t.next)}function A_(n,e){let t=e,i=-1/0,r,s=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let f=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=s&&f>i&&(i=f,r=t.x<t.next.x?t:t.next,f===s))return r}t=t.next}while(t!==e);if(!r)return null;let a=r,l=r.x,c=r.y,u=1/0,h;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&pr(o<c?s:i,o,l,c,o<c?i:s,o,t.x,t.y)&&(h=Math.abs(o-t.y)/(s-t.x),as(t,n)&&(h<u||h===u&&(t.x>r.x||t.x===r.x&&R_(r,t)))&&(r=t,u=h)),t=t.next;while(t!==a);return r}function R_(n,e){return wt(n.prev,n,e.prev)<0&&wt(e.next,n,n.next)<0}function C_(n,e,t,i){let r=n;do r.z===0&&(r.z=Rl(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,P_(r)}function P_(n){let e,t,i,r,s,o,a,l,c=1;do{for(t=n,n=null,s=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(r=t,t=t.nextZ,a--):(r=i,i=i.nextZ,l--),s?s.nextZ=r:n=r,r.prevZ=s,s=r;t=i}s.nextZ=null,c*=2}while(o>1);return n}function Rl(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function I_(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function pr(n,e,t,i,r,s,o,a){return(r-o)*(e-a)>=(n-o)*(s-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(i-a)}function L_(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!D_(n,e)&&(as(n,e)&&as(e,n)&&U_(n,e)&&(wt(n.prev,n,e.prev)||wt(n,e.prev,e))||ko(n,e)&&wt(n.prev,n,n.next)>0&&wt(e.prev,e,e.next)>0)}function wt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function ko(n,e){return n.x===e.x&&n.y===e.y}function Sh(n,e,t,i){let r=eo(wt(n,e,t)),s=eo(wt(n,e,i)),o=eo(wt(t,i,n)),a=eo(wt(t,i,e));return!!(r!==s&&o!==a||r===0&&Qs(n,t,e)||s===0&&Qs(n,i,e)||o===0&&Qs(t,n,i)||a===0&&Qs(t,e,i))}function Qs(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function eo(n){return n>0?1:n<0?-1:0}function D_(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Sh(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function as(n,e){return wt(n.prev,n,n.next)<0?wt(n,e,n.next)>=0&&wt(n,n.prev,e)>=0:wt(n,e,n.prev)<0||wt(n,n.next,e)<0}function U_(n,e){let t=n,i=!1,r=(n.x+e.x)/2,s=(n.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function wh(n,e){let t=new Cl(n.i,n.x,n.y),i=new Cl(e.i,e.x,e.y),r=n.next,s=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function Yu(n,e,t,i){let r=new Cl(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function ls(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Cl(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function N_(n,e,t,i){let r=0;for(let s=e,o=t-i;s<t;s+=i)r+=(n[o]-n[s])*(n[s+1]+n[o+1]),o=s;return r}var fi=class n{static area(e){let t=e.length,i=0;for(let r=t-1,s=0;s<t;r=s++)i+=e[r].x*e[s].y-e[s].x*e[r].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],r=[],s=[];Ku(e),Zu(i,e);let o=e.length;t.forEach(Ku);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,Zu(i,t[l]);let a=y_.triangulate(i,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function Ku(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function Zu(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var Bi=class n extends Rt{constructor(e=new an([new j(.5,.5),new j(-.5,.5),new j(-.5,-.5),new j(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new $e(r,3)),this.setAttribute("uv",new $e(s,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:d-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,p=t.bevelSegments!==void 0?t.bevelSegments:3,m=t.extrudePath,y=t.UVGenerator!==void 0?t.UVGenerator:O_,_,b=!1,E,S,A,C;m&&(_=m.getSpacedPoints(u),b=!0,f=!1,E=m.computeFrenetFrames(u,!1),S=new P,A=new P,C=new P),f||(p=0,d=0,g=0,x=0);let v=a.extractPoints(c),M=v.shape,D=v.holes;if(!fi.isClockWise(M)){M=M.reverse();for(let L=0,de=D.length;L<de;L++){let Z=D[L];fi.isClockWise(Z)&&(D[L]=Z.reverse())}}let Y=fi.triangulateShape(M,D),I=M;for(let L=0,de=D.length;L<de;L++){let Z=D[L];M=M.concat(Z)}function z(L,de,Z){return de||console.error("THREE.ExtrudeGeometry: vec does not exist"),L.clone().addScaledVector(de,Z)}let W=M.length,$=Y.length;function J(L,de,Z){let he,K,Re,pe=L.x-de.x,R=L.y-de.y,w=Z.x-L.x,F=Z.y-L.y,le=pe*pe+R*R,se=pe*F-R*w;if(Math.abs(se)>Number.EPSILON){let ee=Math.sqrt(le),Pe=Math.sqrt(w*w+F*F),ye=de.x-R/ee,we=de.y+pe/ee,ke=Z.x-F/Pe,Je=Z.y+w/Pe,ae=((ke-ye)*F-(Je-we)*w)/(pe*F-R*w);he=ye+pe*ae-L.x,K=we+R*ae-L.y;let it=he*he+K*K;if(it<=2)return new j(he,K);Re=Math.sqrt(it/2)}else{let ee=!1;pe>Number.EPSILON?w>Number.EPSILON&&(ee=!0):pe<-Number.EPSILON?w<-Number.EPSILON&&(ee=!0):Math.sign(R)===Math.sign(F)&&(ee=!0),ee?(he=-R,K=pe,Re=Math.sqrt(le)):(he=pe,K=R,Re=Math.sqrt(le/2))}return new j(he/Re,K/Re)}let q=[];for(let L=0,de=I.length,Z=de-1,he=L+1;L<de;L++,Z++,he++)Z===de&&(Z=0),he===de&&(he=0),q[L]=J(I[L],I[Z],I[he]);let re=[],k,Q=q.concat();for(let L=0,de=D.length;L<de;L++){let Z=D[L];k=[];for(let he=0,K=Z.length,Re=K-1,pe=he+1;he<K;he++,Re++,pe++)Re===K&&(Re=0),pe===K&&(pe=0),k[he]=J(Z[he],Z[Re],Z[pe]);re.push(k),Q=Q.concat(k)}for(let L=0;L<p;L++){let de=L/p,Z=d*Math.cos(de*Math.PI/2),he=g*Math.sin(de*Math.PI/2)+x;for(let K=0,Re=I.length;K<Re;K++){let pe=z(I[K],q[K],he);_e(pe.x,pe.y,-Z)}for(let K=0,Re=D.length;K<Re;K++){let pe=D[K];k=re[K];for(let R=0,w=pe.length;R<w;R++){let F=z(pe[R],k[R],he);_e(F.x,F.y,-Z)}}}let V=g+x;for(let L=0;L<W;L++){let de=f?z(M[L],Q[L],V):M[L];b?(A.copy(E.normals[0]).multiplyScalar(de.x),S.copy(E.binormals[0]).multiplyScalar(de.y),C.copy(_[0]).add(A).add(S),_e(C.x,C.y,C.z)):_e(de.x,de.y,0)}for(let L=1;L<=u;L++)for(let de=0;de<W;de++){let Z=f?z(M[de],Q[de],V):M[de];b?(A.copy(E.normals[L]).multiplyScalar(Z.x),S.copy(E.binormals[L]).multiplyScalar(Z.y),C.copy(_[L]).add(A).add(S),_e(C.x,C.y,C.z)):_e(Z.x,Z.y,h/u*L)}for(let L=p-1;L>=0;L--){let de=L/p,Z=d*Math.cos(de*Math.PI/2),he=g*Math.sin(de*Math.PI/2)+x;for(let K=0,Re=I.length;K<Re;K++){let pe=z(I[K],q[K],he);_e(pe.x,pe.y,h+Z)}for(let K=0,Re=D.length;K<Re;K++){let pe=D[K];k=re[K];for(let R=0,w=pe.length;R<w;R++){let F=z(pe[R],k[R],he);b?_e(F.x,F.y+_[u-1].y,_[u-1].x+Z):_e(F.x,F.y,h+Z)}}}te(),Se();function te(){let L=r.length/3;if(f){let de=0,Z=W*de;for(let he=0;he<$;he++){let K=Y[he];Fe(K[2]+Z,K[1]+Z,K[0]+Z)}de=u+p*2,Z=W*de;for(let he=0;he<$;he++){let K=Y[he];Fe(K[0]+Z,K[1]+Z,K[2]+Z)}}else{for(let de=0;de<$;de++){let Z=Y[de];Fe(Z[2],Z[1],Z[0])}for(let de=0;de<$;de++){let Z=Y[de];Fe(Z[0]+W*u,Z[1]+W*u,Z[2]+W*u)}}i.addGroup(L,r.length/3-L,0)}function Se(){let L=r.length/3,de=0;Le(I,de),de+=I.length;for(let Z=0,he=D.length;Z<he;Z++){let K=D[Z];Le(K,de),de+=K.length}i.addGroup(L,r.length/3-L,1)}function Le(L,de){let Z=L.length;for(;--Z>=0;){let he=Z,K=Z-1;K<0&&(K=L.length-1);for(let Re=0,pe=u+p*2;Re<pe;Re++){let R=W*Re,w=W*(Re+1),F=de+he+R,le=de+K+R,se=de+K+w,ee=de+he+w;ze(F,le,se,ee)}}}function _e(L,de,Z){l.push(L),l.push(de),l.push(Z)}function Fe(L,de,Z){ce(L),ce(de),ce(Z);let he=r.length/3,K=y.generateTopUV(i,r,he-3,he-2,he-1);ge(K[0]),ge(K[1]),ge(K[2])}function ze(L,de,Z,he){ce(L),ce(de),ce(he),ce(de),ce(Z),ce(he);let K=r.length/3,Re=y.generateSideWallUV(i,r,K-6,K-3,K-2,K-1);ge(Re[0]),ge(Re[1]),ge(Re[3]),ge(Re[1]),ge(Re[2]),ge(Re[3])}function ce(L){r.push(l[L*3+0]),r.push(l[L*3+1]),r.push(l[L*3+2])}function ge(L){s.push(L.x),s.push(L.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return F_(t,i,e)}static fromJSON(e,t){let i=[];for(let s=0,o=e.shapes.length;s<o;s++){let a=t[e.shapes[s]];i.push(a)}let r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new Co[r.type]().fromJSON(r)),new n(i,e.options)}},O_={generateTopUV:function(n,e,t,i,r){let s=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],c=e[r*3],u=e[r*3+1];return[new j(s,o),new j(a,l),new j(c,u)]},generateSideWallUV:function(n,e,t,i,r,s){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[i*3],u=e[i*3+1],h=e[i*3+2],f=e[r*3],d=e[r*3+1],g=e[r*3+2],x=e[s*3],p=e[s*3+1],m=e[s*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new j(o,1-l),new j(c,1-h),new j(f,1-g),new j(x,1-m)]:[new j(a,1-l),new j(u,1-h),new j(d,1-g),new j(p,1-m)]}};function F_(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,r=n.length;i<r;i++){let s=n[i];t.shapes.push(s.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Tr=class n extends Al{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,r=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var _i=class n extends Rt{constructor(e=.5,t=1,i=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:o},i=Math.max(3,i),r=Math.max(1,r);let a=[],l=[],c=[],u=[],h=e,f=(t-e)/r,d=new P,g=new j;for(let x=0;x<=r;x++){for(let p=0;p<=i;p++){let m=s+p/i*o;d.x=h*Math.cos(m),d.y=h*Math.sin(m),l.push(d.x,d.y,d.z),c.push(0,0,1),g.x=(d.x/t+1)/2,g.y=(d.y/t+1)/2,u.push(g.x,g.y)}h+=f}for(let x=0;x<r;x++){let p=x*(i+1);for(let m=0;m<i;m++){let y=m+p,_=y,b=y+i+1,E=y+i+2,S=y+1;a.push(_,b,S),a.push(b,E,S)}}this.setIndex(a),this.setAttribute("position",new $e(l,3)),this.setAttribute("normal",new $e(c,3)),this.setAttribute("uv",new $e(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Ar=class n extends Rt{constructor(e=new an([new j(0,.5),new j(-.5,-.5),new j(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new $e(r,3)),this.setAttribute("normal",new $e(s,3)),this.setAttribute("uv",new $e(o,2));function c(u){let h=r.length/3,f=u.extractPoints(t),d=f.shape,g=f.holes;fi.isClockWise(d)===!1&&(d=d.reverse());for(let p=0,m=g.length;p<m;p++){let y=g[p];fi.isClockWise(y)===!0&&(g[p]=y.reverse())}let x=fi.triangulateShape(d,g);for(let p=0,m=g.length;p<m;p++){let y=g[p];d=d.concat(y)}for(let p=0,m=d.length;p<m;p++){let y=d[p];r.push(y.x,y.y,0),s.push(0,0,1),o.push(y.x,y.y)}for(let p=0,m=x.length;p<m;p++){let y=x[p],_=y[0]+h,b=y[1]+h,E=y[2]+h;i.push(_,b,E),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return z_(t,e)}static fromJSON(e,t){let i=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];i.push(o)}return new n(i,e.curveSegments)}};function z_(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let r=n[t];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e}var In=class n extends Rt{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new P,f=new P,d=[],g=[],x=[],p=[];for(let m=0;m<=i;m++){let y=[],_=m/i,b=0;m===0&&o===0?b=.5/t:m===i&&l===Math.PI&&(b=-.5/t);for(let E=0;E<=t;E++){let S=E/t;h.x=-e*Math.cos(r+S*s)*Math.sin(o+_*a),h.y=e*Math.cos(o+_*a),h.z=e*Math.sin(r+S*s)*Math.sin(o+_*a),g.push(h.x,h.y,h.z),f.copy(h).normalize(),x.push(f.x,f.y,f.z),p.push(S+b,1-_),y.push(c++)}u.push(y)}for(let m=0;m<i;m++)for(let y=0;y<t;y++){let _=u[m][y+1],b=u[m][y],E=u[m+1][y],S=u[m+1][y+1];(m!==0||o>0)&&d.push(_,b,S),(m!==i-1||l<Math.PI)&&d.push(b,E,S)}this.setIndex(d),this.setAttribute("position",new $e(g,3)),this.setAttribute("normal",new $e(x,3)),this.setAttribute("uv",new $e(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var vn=class n extends Rt{constructor(e=1,t=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);let o=[],a=[],l=[],c=[],u=new P,h=new P,f=new P;for(let d=0;d<=i;d++)for(let g=0;g<=r;g++){let x=g/r*s,p=d/i*Math.PI*2;h.x=(e+t*Math.cos(p))*Math.cos(x),h.y=(e+t*Math.cos(p))*Math.sin(x),h.z=t*Math.sin(p),a.push(h.x,h.y,h.z),u.x=e*Math.cos(x),u.y=e*Math.sin(x),f.subVectors(h,u).normalize(),l.push(f.x,f.y,f.z),c.push(g/r),c.push(d/i)}for(let d=1;d<=i;d++)for(let g=1;g<=r;g++){let x=(r+1)*d+g-1,p=(r+1)*(d-1)+g-1,m=(r+1)*(d-1)+g,y=(r+1)*d+g;o.push(x,p,y),o.push(p,m,y)}this.setIndex(o),this.setAttribute("position",new $e(a,3)),this.setAttribute("normal",new $e(l,3)),this.setAttribute("uv",new $e(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var Io=class n extends Rt{constructor(e=new Ao(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,i=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:r,closed:s};let o=e.computeFrenetFrames(t,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new P,l=new P,c=new j,u=new P,h=[],f=[],d=[],g=[];x(),this.setIndex(g),this.setAttribute("position",new $e(h,3)),this.setAttribute("normal",new $e(f,3)),this.setAttribute("uv",new $e(d,2));function x(){for(let _=0;_<t;_++)p(_);p(s===!1?t:0),y(),m()}function p(_){u=e.getPointAt(_/t,u);let b=o.normals[_],E=o.binormals[_];for(let S=0;S<=r;S++){let A=S/r*Math.PI*2,C=Math.sin(A),v=-Math.cos(A);l.x=v*b.x+C*E.x,l.y=v*b.y+C*E.y,l.z=v*b.z+C*E.z,l.normalize(),f.push(l.x,l.y,l.z),a.x=u.x+i*l.x,a.y=u.y+i*l.y,a.z=u.z+i*l.z,h.push(a.x,a.y,a.z)}}function m(){for(let _=1;_<=t;_++)for(let b=1;b<=r;b++){let E=(r+1)*(_-1)+(b-1),S=(r+1)*_+(b-1),A=(r+1)*_+b,C=(r+1)*(_-1)+b;g.push(E,S,C),g.push(S,A,C)}}function y(){for(let _=0;_<=t;_++)for(let b=0;b<=r;b++)c.x=_/t,c.y=b/r,d.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new n(new Co[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var Ln=class extends Qn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ze(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ql,this.normalScale=new j(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Lo=class extends Qn{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Ze(16777215),this.specular=new Ze(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ql,this.normalScale=new j(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Wl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function to(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function k_(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var Rr=class{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,r=t[i],s=t[i-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=t[--i-1],e>=s)break e}o=i,i=0;break t}break n}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Pl=class extends Rr{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Qc,endingEnd:Qc}}intervalChanged_(e,t,i){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case eu:s=e,a=2*t-i;break;case tu:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case eu:o=e,l=2*i-t;break;case tu:o=1,l=i+r[1]-r[0];break;default:o=e-1,l=t}let c=(i-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,d=this._weightNext,g=(i-t)/(r-t),x=g*g,p=x*g,m=-f*p+2*f*x-f*g,y=(1+f)*p+(-1.5-2*f)*x+(-.5+f)*g+1,_=(-1-d)*p+(1.5+d)*x+.5*g,b=d*p-d*x;for(let E=0;E!==a;++E)s[E]=m*o[u+E]+y*o[c+E]+_*o[l+E]+b*o[h+E];return s}},Il=class extends Rr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(i-t)/(r-t),h=1-u;for(let f=0;f!==a;++f)s[f]=o[c+f]*h+o[l+f]*u;return s}},Ll=class extends Rr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Dn=class{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=to(t,this.TimeBufferType),this.values=to(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:to(e.times,Array),values:to(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Ll(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Il(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Pl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case io:t=this.InterpolantFactoryMethodDiscrete;break;case ro:t=this.InterpolantFactoryMethodLinear;break;case ba:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return io;case this.InterpolantFactoryMethodLinear:return ro;case this.InterpolantFactoryMethodSmooth:return ba}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e}return this}trim(e,t){let i=this.times,r=i.length,s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&k_(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===ba,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{let h=a*i,f=h-i,d=h+i;for(let g=0;g!==i;++g){let x=t[h+g];if(x!==t[f+g]||x!==t[d+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*i,f=o*i;for(let d=0;d!==i;++d)t[f+d]=t[h+d]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Dn.prototype.TimeBufferType=Float32Array;Dn.prototype.ValueBufferType=Float32Array;Dn.prototype.DefaultInterpolation=ro;var Gi=class extends Dn{};Gi.prototype.ValueTypeName="bool";Gi.prototype.ValueBufferType=Array;Gi.prototype.DefaultInterpolation=io;Gi.prototype.InterpolantFactoryMethodLinear=void 0;Gi.prototype.InterpolantFactoryMethodSmooth=void 0;var Dl=class extends Dn{};Dl.prototype.ValueTypeName="color";var Ul=class extends Dn{};Ul.prototype.ValueTypeName="number";var Nl=class extends Rr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(r-t),c=e*a;for(let u=c+a;c!==u;c+=4)gi.slerpFlat(s,0,o,c-a,o,c,l);return s}},cs=class extends Dn{InterpolantFactoryMethodLinear(e){return new Nl(this.times,this.values,this.getValueSize(),e)}};cs.prototype.ValueTypeName="quaternion";cs.prototype.DefaultInterpolation=ro;cs.prototype.InterpolantFactoryMethodSmooth=void 0;var Hi=class extends Dn{};Hi.prototype.ValueTypeName="string";Hi.prototype.ValueBufferType=Array;Hi.prototype.DefaultInterpolation=io;Hi.prototype.InterpolantFactoryMethodLinear=void 0;Hi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ol=class extends Dn{};Ol.prototype.ValueTypeName="vector";var Fl=class{constructor(e,t,i){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=c.length;h<f;h+=2){let d=c[h],g=c[h+1];if(d.global&&(d.lastIndex=0),d.test(u))return g}return null}}},B_=new Fl,zl=class{constructor(e){this.manager=e!==void 0?e:B_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};zl.DEFAULT_MATERIAL_NAME="__DEFAULT";var Cr=class extends qt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ze(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}},Pr=class extends Cr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(qt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ze(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Ja=new pt,Ju=new P,$u=new P,Do=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new j(512,512),this.map=null,this.mapPass=null,this.matrix=new pt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Qr,this._frameExtents=new j(1,1),this._viewportCount=1,this._viewports=[new vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;Ju.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ju),$u.setFromMatrixPosition(e.target.matrixWorld),t.lookAt($u),t.updateMatrixWorld(),Ja.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ja),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Ja)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var ju=new pt,Yr=new P,$a=new P,kl=class extends Do{constructor(){super(new tn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new j(4,2),this._viewportCount=6,this._viewports=[new vt(2,1,1,1),new vt(0,1,1,1),new vt(3,1,1,1),new vt(1,1,1,1),new vt(3,0,1,1),new vt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){let i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),Yr.setFromMatrixPosition(e.matrixWorld),i.position.copy(Yr),$a.copy(i.position),$a.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt($a),i.updateMatrixWorld(),r.makeTranslation(-Yr.x,-Yr.y,-Yr.z),ju.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ju)}},bn=class extends Cr{constructor(e,t,i=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new kl}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Bl=class extends Do{constructor(){super(new Fn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ei=class extends Cr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(qt.DEFAULT_UP),this.updateMatrix(),this.target=new qt,this.shadow=new Bl}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Uo=class extends Cr{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var Jl="\\[\\]\\.:\\/",G_=new RegExp("["+Jl+"]","g"),$l="[^"+Jl+"]",H_="[^"+Jl.replace("\\.","")+"]",V_=/((?:WC+[\/:])*)/.source.replace("WC",$l),W_=/(WCOD+)?/.source.replace("WCOD",H_),X_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",$l),q_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",$l),Y_=new RegExp("^"+V_+W_+X_+q_+"$"),K_=["material","materials","bones","map"],Gl=class{constructor(e,t,i){let r=i||_t.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},_t=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(G_,"")}static parseTrackName(e){let t=Y_.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);K_.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};_t.Composite=Gl;_t.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};_t.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};_t.prototype.GetterByBindingType=[_t.prototype._getValue_direct,_t.prototype._getValue_array,_t.prototype._getValue_arrayElement,_t.prototype._getValue_toArray];_t.prototype.SetterByBindingTypeAndVersioning=[[_t.prototype._setValue_direct,_t.prototype._setValue_direct_setNeedsUpdate,_t.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_array,_t.prototype._setValue_array_setNeedsUpdate,_t.prototype._setValue_array_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_arrayElement,_t.prototype._setValue_arrayElement_setNeedsUpdate,_t.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_fromArray,_t.prototype._setValue_fromArray_setNeedsUpdate,_t.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var cb=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");var Lr=["up","down","left","right"];var jl={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},ot=(n,e,t,i={},r,s=e)=>({char:n,minotaur:e,block:t,hazard:s,...i,sprites:r??[]}),ln={floor:ot(".",!0,!0,{},["floor"]),wall:ot("#",!1,!1,{},["wall"]),exit:ot("E",!1,!1,{},["exit"]),gate:ot("|",!1,!1,{},["gate-closed","gate-open"]),water:ot("~",!1,!0,{needs:"flippers"},["water"]),fire:ot("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:ot("=",!0,!0,{slides:"skates"},["ice"]),"force-up":ot("^",!0,!0,{carries:"up"},["force-up"]),"force-down":ot("v",!0,!0,{carries:"down"},["force-down"]),"force-left":ot("<",!0,!0,{carries:"left"},["force-left"]),"force-right":ot(">",!0,!0,{carries:"right"},["force-right"]),dirt:ot("%",!0,!0,{},["dirt"]),safe:ot("S",!1,!1,{},["safe"]),button:ot("_",!0,!0,{},["button"]),"toggle-open":ot("t",!0,!1,{},["toggle-open"]),"toggle-closed":ot("T",!1,!1,{},["toggle-closed"]),"door-red":ot("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":ot("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":ot("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":ot("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:ot("&",!0,!0,{},["trap"]),"button-brown":ot("-",!0,!0,{},["button-brown"]),"button-red":ot("+",!0,!0,{},["button-red"]),popup:ot(";",!1,!1,{},["popup"]),gravel:ot(":",!1,!1,{},["gravel"]),"fake-wall":ot("W",!1,!1,{},["wall"]),"invisible-wall":ot("I",!1,!1,{},["floor"]),teleport:ot("@",!1,!1,{},["teleport"]),thief:ot("$",!0,!0,{},["thief"]),bomb:ot("!",!1,!0,{},["bomb"],!0),clone:ot("C",!1,!1,{},Lr.map(n=>`clone-${n}`))},Un={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var Nn={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:jl.mirror.name},cake:{char:"x",sprite:"cake",name:jl.cake.name},cow:{char:"c",sprite:"cow",name:jl.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},Z_=["theseus","minotaur","minotaur-stone","cow-standing"],J_=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],hb=[...new Set([...Object.values(ln).flatMap(n=>n.sprites),...J_,...Object.values(Nn).map(n=>n.sprite),...Z_,...Object.values(Un).map(n=>n.sprite)])];var Ql=4,$_=900,j_=500,Q_=.22,Eh=[[.3,420],[.36,160],[.3,200],[.36,160],[.3,380],[-.12,520],[0,400]],ey=Eh.reduce((n,[,e])=>n+e,0),ty=[[-1,0],[1,0],[0,-1],[0,1]],us=(n,e,t)=>e<0||t<0||e>=n.level.rows||t>=n.level.cols||n.terrain[e*n.level.cols+t]==="wall";function ec(n,e,t){return(us(n,e-1,t)||us(n,e+1,t))&&!(us(n,e,t-1)&&us(n,e,t+1))?"h":"v"}function Bo(n,e){return n.terrain[e]!=="floor"?null:ln[n.level.terrain[e]].door??null}function Th(n,e,t){for(let i of ty){let r=e+i[0],s=t+i[1];if(!us(n,r,s)&&n.terrain[r*n.level.cols+s]==="gate")return i}return null}function Go(n,e,t=0){let i=Math.round(e.r),r=Math.round(e.c),s=Th(n,i,r);if(!s)return e;let o=Math.max(0,1-2*Math.max(Math.abs(e.r-i),Math.abs(e.c-r))),a=-Q_*o+t;return{r:e.r+s[0]*a,c:e.c+s[1]*a}}var hs={bars:new Map,doors:new Map,hoof:0,busy:!1},Ah=n=>n*n*(3-2*n);function ny(n){let e=0,t=0;for(let[i,r]of Eh){if(n<e+r)return t+(i-t)*Ah((n-e)/r);e+=r,t=i}return 0}function Rh(){let n=null,e=!1,t=new Map,i={move:null},r=new Map,s=!1,o=null,a=(c,u)=>{let h=Math.min(1,Math.max(0,(u-c.t0)/c.ms));return c.from+(c.to-c.from)*Ah(h)},l=(c,u,h,f)=>{let d=c?a(c,h):1-u;return{from:d,to:u,t0:h,ms:f*Math.abs(u-d)}};return{at(c,u,h,f,d){let{cols:g}=c.level,x=[];c.level.terrain.forEach((C,v)=>{ln[C].door&&x.push(v)});let p=C=>{let v=Math.floor(C/g),M=C%g;return Math.abs(u.player.r-v)+Math.abs(u.player.c-M)<.999},m=new Map(x.map(C=>[C,c.terrain[C]==="floor"||p(C)])),y=c.relicsLeft===0;if(c.level!==n)n=c.level,i.move=null,r.clear(),s=!1,o=null;else if(!f){y!==e&&(i.move=l(i.move,y?1:0,h,$_));for(let[C,v]of m)t.get(C)!==v&&r.set(C,l(r.get(C),v?1:0,h,j_))}e=y,t=m,f&&(i.move=null,r.clear());let _=!1,b=new Map;if(i.move)if(h-i.move.t0>=i.move.ms)i.move=null;else{let C=a(i.move,h);c.terrain.forEach((v,M)=>{v==="gate"&&b.set(M,C)}),_=!0}let E=new Map;for(let[C,v]of r)h-v.t0>=v.ms?r.delete(C):(E.set(C,a(v,h)),_=!0);c.moves===0&&(s=!1),o&&o.s!==c&&(o=null);let S=c.minotaur;!s&&!f&&d&&y&&c.outcome==="playing"&&S&&c.stone===0&&Th(c,S.r,S.c)&&(s=!0,o={s:c,t0:h});let A=0;return o&&(h-o.t0>=ey?o=null:(A=ny(h-o.t0),_=!0)),_?{bars:b,doors:E,hoof:A,busy:_}:hs}}}function Ho(n){return Math.max(10,Math.min(90,n))}function Ph(n,e){let t=n*Math.PI/180;return Math.max(40,e/2*Math.cos(t)/Math.max(.05,Math.sin(t))+4)}var ds=n=>Math.sin(n*Math.PI/180);function Ih(n,e,t,i){let r=i?1:1-Math.exp(-t*11),s=!1;for(let o of["yaw","pitch","tx","tz","zoom"]){let a=e[o]-n[o];a!==0&&(n[o]=Math.abs(a)>(o==="yaw"||o==="pitch"?.02:.002)&&!i?n[o]+a*r:e[o],n[o]!==e[o]&&(s=!0))}return s}var Ch=(n,e)=>Math.max(-Math.max(0,e),Math.min(Math.max(0,e),n));function Vo(n,e,t,i){let r=n.yaw*Math.PI/180,s=Math.cos(r),o=Math.sin(r),a=n.tx*s-n.tz*o,l=-n.tx*o-n.tz*s,c=(e*Math.abs(s)+t*Math.abs(o))/2,u=(e*Math.abs(o)+t*Math.abs(s))/2,h=Ch(a,c+1-n.zoom*i/2),f=Ch(l,u+1-n.zoom/2/ds(n.pitch));return{...n,tx:h*s-f*o,tz:-h*o-f*s}}function Lh(n,e,t,i){let r=n.yaw*Math.PI/180,s=Math.cos(r),o=-Math.sin(r),a=-Math.sin(r),l=-Math.cos(r),c=e*i,u=t*i/ds(n.pitch);return{...n,tx:n.tx-s*c+a*u,tz:n.tz-o*c+l*u}}function Dh(n,e){return n+360*Math.round((e-n)/360)}var tc=5,cn=1.25,Uh=n=>2*cn*Math.cos(n*Math.PI/180);function Nh(n,e,t,i,r){let s=r*Math.PI/180,o=Math.abs(Math.cos(s)),a=Math.abs(Math.sin(s)),l=e,c=t,u=l*o+c*a,h=(l*a+c*o)*ds(i);return Math.max(tc,h+Uh(i),u/n)}function Oh(n,e,t,i){let r=Math.hypot(e+2,t+2);return{min:tc,max:Math.max(tc,r*ds(i)+Uh(i),r/n)}}var Wo=(n,e)=>Math.max(e.min,Math.min(e.max,n));function Vi(n,e,t){let i=n.yaw*Math.PI/180,r=t/ds(n.pitch);return{x:n.tx+Math.cos(i)*e-Math.sin(i)*r,z:n.tz-Math.sin(i)*e-Math.cos(i)*r}}function Fh(n,e,t,i,r){let s=Wo(n.zoom*e,r),o=n.zoom-s,a=Vi(n,t*o,i*o);return{...n,zoom:s,tx:a.x,tz:a.z}}function zh(n,e){let t=n.zoom/2,i=t*e;return{corners:[Vi(n,-i,t),Vi(n,i,t),Vi(n,i,-t),Vi(n,-i,-t)],tick:[Vi(n,0,0),Vi(n,0,t*.4)]}}function kh(n,e,t,i){let r=n<520?8:11,s=Math.min(Math.floor(n*.5/t),Math.floor(e*.4/i));return Math.max(2,Math.min(r,s))}function Bh(n,e,t,i,r){return[(n.x+e/2)*i,r+(n.z+t/2)*i]}function Gh(n,e,t,i,r,s){return{x:n/r-t/2,z:(e-s)/r-i/2}}var Hh={items:"plate",beacon:!1,cutaway:!1,caps:!1},Vh="crete-variant";function iy(n){let e={...Hh};if(!n)return e;let t;try{t=JSON.parse(n)}catch{return e}if(!t||typeof t!="object")return e;let i=t;(i.items==="cyan"||i.items==="white"||i.items==="plate")&&(e.items=i.items);for(let r of["beacon","cutaway","caps"])typeof i[r]=="boolean"&&(e[r]=i[r]);return e}var Wh=Hh;function un(){return Wh}function Xh(n){Wh=iy(n)}var sy=12,oy=.6,ay=.4,ly=.4;function Yh(){let n=null,e={down(t,i,r){return n?[]:(n={id:t,x0:i,y0:r,x:i,y:r,dragging:!1},[])},move(t,i,r){if(!n||n.id!==t)return[];if(!n.dragging){if(Math.hypot(i-n.x0,r-n.y0)<sy)return[];n.dragging=!0}let s=i-n.x,o=r-n.y;n.x=i,n.y=r;let a=[];return s!==0&&a.push({kind:"turn",deg:-s*oy}),o!==0&&a.push({kind:"tilt",deg:o*ay}),a},up(t,i,r){if(!n||n.id!==t)return[];let s=e.move(t,i,r),o=n.dragging;return n=null,o?s:[{kind:"reset"}]},cancel(t){return n?.id===t&&(n=null),[]}};return e}function Kh(n){let e=Ho(n.pitch);return{needle:n.yaw,squash:Math.max(ly,Math.sin(e*Math.PI/180)),tilt:(90-e)/80}}function Zh(n,e,t){return t>700||Math.hypot(n,e)<24?null:Math.abs(n)>Math.abs(e)?n>0?"right":"left":e>0?"down":"up"}var cy=.35,Jh=.3,fs=10,uy=280,hy=12,dy=320,fy=40,py=.0015,$h=10;function jh(n){let e=new Map,t=null,i=null,r=!1,s=null,o=null,a=()=>{let[l,c]=[...e.values()];return!l||!c?{ang:0,d:0,mx:0,my:0}:{ang:Math.atan2(c.y-l.y,c.x-l.x),d:Math.hypot(c.x-l.x,c.y-l.y),mx:(l.x+c.x)/2,my:(l.y+c.y)/2}};return{down(l){e.set(l.id,{x:l.x,y:l.y,sx:l.x,sy:l.y,x0:l.x,y0:l.y,t0:n(),type:l.type,button:l.button});for(let c of e.values())c.sx=c.x,c.sy=c.y;return t=e.size===2?a():null,o=t,s=null,e.size>1&&(r=!0),[]},move(l){let c=e.get(l.id);if(!c)return[];let u=l.x-c.x,h=l.y-c.y;c.x=l.x,c.y=l.y;let f=[];if(e.size===1){if(c.type!=="mouse")return f;c.button===1||c.button===2?(u!==0||h!==0)&&f.push({kind:"pan",dx:u,dy:h}):(u!==0&&f.push({kind:"turn",deg:-u*cy}),h!==0&&f.push({kind:"tilt",deg:h*Jh}))}else if(e.size===2&&t&&o){let d=a();if(!s){let[y,_]=[...e.values()],b=y.y-y.sy,E=_.y-_.sy,S=y.x-y.sx,A=_.x-_.sx,C=Math.min(Math.hypot(S,b),Math.hypot(A,E)),v=Math.max(Math.hypot(S,b),Math.hypot(A,E));if(!(Math.abs(d.d-o.d)>=fs)&&(v<fs||C<fs/2&&v<2*fs))return f;let D=Math.abs(Math.sin(o.ang))<Math.sin(35*Math.PI/180),O=Math.sign(b)===Math.sign(E)&&Math.min(Math.abs(b),Math.abs(E))>fs/2&&Math.abs(b-E)<Math.max(Math.abs(b),Math.abs(E))/2,Y=Math.abs(S)<Math.abs(b)/2&&Math.abs(A)<Math.abs(E)/2;s=D&&O&&Y?"tilt":"free"}if(s==="tilt"){let y=d.my-t.my;return y!==0&&f.push({kind:"tilt",deg:y*Jh}),t=d,f}let g=d.ang-t.ang;g>Math.PI&&(g-=2*Math.PI),g<-Math.PI&&(g+=2*Math.PI),g!==0&&f.push({kind:"turn",deg:g*180/Math.PI});let x=d.mx-t.mx,p=d.my-t.my;(x!==0||p!==0)&&f.push({kind:"pan",dx:x,dy:p});let m=Math.max($h,t.d)/Math.max($h,d.d);m!==1&&f.push({kind:"zoom",factor:m,x:d.mx,y:d.my}),t=d}return f},up(l){let c=e.get(l.id);if(!c)return[];e.delete(l.id),t=null,o=null;let u=r;if(e.size===0&&(r=!1),c.type==="mouse"||e.size!==0||u)return[];let h=n(),f=Zh(l.x-c.x0,l.y-c.y0,h-c.t0);return f?(i=null,[{kind:"swipe",dir:f}]):h-c.t0>=uy||Math.hypot(l.x-c.x0,l.y-c.y0)>=hy?[]:i&&h-i.t<dy&&Math.hypot(l.x-i.x,l.y-i.y)<fy?(i=null,[{kind:"reset"}]):(i={t:h,x:l.x,y:l.y},[])},cancel(l){return e.delete(l),t=null,o=null,e.size===0&&(r=!1),[]},wheel(l,c,u){return l===0?[]:[{kind:"zoom",factor:Math.exp(l*py),x:c,y:u}]}}}var nc="crete-view-hint";function ic(n){try{let e=n?JSON.parse(n):{};return{shows:Number.isInteger(e.shows)&&e.shows>0?e.shows:0,moved:e.moved===!0}}catch{return{shows:0,moved:!1}}}function Qh(n){return n?"Drag two fingers to tilt and twist · Tap the compass to reset":"Drag to turn and tilt · Right-drag to pan · Tap the compass to reset"}function ed(n,e){let t={...n},i=t.moved||t.shows>=2?"done":"waiting",r=e,s=0,o=()=>{let a=i;return i="done",a==="shown"?"hide":null};return{record:()=>({...t}),tick(a,l){return i==="waiting"?l?(r=a,null):a-r<1500?null:(i="shown",s=a,t.shows++,"show"):i==="shown"&&(l||a-s>=8e3)?o():null},moved(){return t.moved=!0,o()},dismiss(){return i==="shown"?o():null},show(a){return s=a,i==="shown"?null:(i="shown","show")},over:()=>i==="done"}}var td=90,nd=15,id=10,rd=1.2,my=16,gy='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/></svg>',xy='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v4h-4"/></svg>',_y='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',yy='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',vy='<span class="tilt-ring" aria-hidden="true"></span><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dial" cx="12" cy="12" r="11"/><path class="n" d="M12 3l3.5 9h-7z"/><path class="s" d="M12 21l-3.5-9h7z"/></svg>',by=600,sd=250;function Dr(n,e,t,i){let r=document.createElement("button");return r.type="button",r.id=n,r.className=i,r.setAttribute("aria-label",e),r.title=e,r.innerHTML=t,r}function od(n,e,t,i){let r=!1,s=()=>{let k=Y.moved();r||(r=!0,J()),q(k)},o={turn:(k,Q)=>{s(),i.turn(k,Q)},pan:(k,Q)=>{s(),i.pan(k,Q)},zoom:(k,Q,V,te)=>{s(),i.zoom(k,Q,V,te)},tilt:(k,Q)=>{s(),i.tilt(k,Q)},reset:()=>{s(),i.reset()}},a="",l=jh(()=>performance.now()),c=k=>({id:k.pointerId,x:k.clientX,y:k.clientY,type:k.pointerType==="touch"||k.pointerType==="pen"?k.pointerType:"mouse",button:k.button}),u=k=>{if(!(!k.length||t.blocked())){t.gesture();for(let Q of k)if(Q.kind==="swipe")t.swipe(Q.dir);else if(Q.kind==="turn")o.turn(Q.deg,!1);else if(Q.kind==="tilt")o.tilt(Q.deg,!1);else if(Q.kind==="pan")o.pan(Q.dx,Q.dy);else if(Q.kind==="zoom"){let V=n.getBoundingClientRect();o.zoom(Q.factor,(Q.x-V.left)/(V.width||1)-.5,.5-(Q.y-V.top)/(V.height||1),!1)}else o.reset()}},h=k=>{if(a=k.pointerType,!t.blocked()){try{n.setPointerCapture(k.pointerId)}catch{}u(l.down(c(k)))}},f=k=>u(l.move(c(k))),d=k=>u(l.up(c(k))),g=k=>u(l.cancel(k.pointerId)),x=()=>{t.blocked()||(t.gesture(),o.reset())},p=k=>k.preventDefault(),m=k=>{if(t.blocked())return;k.preventDefault();let Q=k.deltaMode===1?my:k.deltaMode===2?n.clientHeight:1;u(l.wheel(k.deltaY*Q,k.clientX,k.clientY))};n.style.touchAction="none",n.addEventListener("pointerdown",h),n.addEventListener("pointermove",f),n.addEventListener("pointerup",d),n.addEventListener("pointercancel",g),n.addEventListener("dblclick",x),n.addEventListener("contextmenu",p),n.addEventListener("wheel",m,{passive:!1});let y=document.createElement("button");y.type="button",y.className="modern-viewbtn",y.textContent="View",y.setAttribute("aria-expanded","false"),y.setAttribute("aria-controls","cam-buttons");let _=document.createElement("div");_.id="cam-buttons",_.className="cam",_.setAttribute("role","group"),_.setAttribute("aria-label","Camera");let b=Dr("cam-left","Turn left",gy,"cbtn"),E=Dr("cam-right","Turn right",xy,"cbtn"),S=Dr("cam-zoom-in","Zoom in",_y,"cbtn"),A=Dr("cam-zoom-out","Zoom out",yy,"cbtn"),C=Dr("cam-reset","Reset view","Reset","cbtn wide");_.append(b,E,S,A,C);let v=My("cam-compass",t,o,k=>{a=k}),M=v.button;e.append(y,_,M);let D=k=>()=>{t.blocked()||(t.gesture(),k())};b.addEventListener("click",D(()=>o.turn(-td,!0))),E.addEventListener("click",D(()=>o.turn(td,!0))),S.addEventListener("click",D(()=>o.zoom(1/rd,0,0,!0))),A.addEventListener("click",D(()=>o.zoom(rd,0,0,!0))),C.addEventListener("click",D(()=>o.reset())),y.addEventListener("click",()=>{let k=_.classList.toggle("open");y.setAttribute("aria-expanded",String(k))});let O=ic(null);try{O=ic(localStorage.getItem(nc))}catch{}let Y=ed(O,performance.now()),I=document.createElement("p");I.className="view-hint",I.id="view-hint",I.hidden=!0,I.setAttribute("role","status"),e.append(I);let z=0,W=0,$=()=>q(Y.tick(performance.now(),re()));function J(){try{localStorage.setItem(nc,JSON.stringify(Y.record()))}catch{}}function q(k){if(k){if(J(),k==="show"){let Q=a?a!=="mouse":matchMedia("(pointer: coarse)").matches;I.textContent=Qh(Q),clearTimeout(W),I.hidden=!1,requestAnimationFrame(()=>I.classList.add("on")),M.classList.remove("wiggle"),M.offsetWidth,M.classList.add("wiggle");return}clearInterval(z),I.classList.remove("on"),M.classList.remove("wiggle"),W=window.setTimeout(()=>{I.hidden=!0},300)}}let re=()=>t.covered()||document.hidden||e.closest("[hidden]")!==null;return Y.over()||(z=window.setInterval($,sd)),I.addEventListener("click",()=>q(Y.dismiss())),{setView:v.setView,showTips(){let k=Y.show(performance.now());k&&(clearInterval(z),z=window.setInterval($,sd)),q(k)},dispose(){clearInterval(z),clearTimeout(W),I.remove(),n.removeEventListener("pointerdown",h),n.removeEventListener("pointermove",f),n.removeEventListener("pointerup",d),n.removeEventListener("pointercancel",g),n.removeEventListener("dblclick",x),n.removeEventListener("contextmenu",p),n.removeEventListener("wheel",m),y.remove(),_.remove(),M.remove()}}}function My(n,e,t,i=()=>{}){let r=Dr(n,"Compass: drag or use the arrow keys to turn and tilt the view, tap to reset it",vy,"compass");r.title="Compass";let s=r.querySelector("svg"),o=Yh(),a=-1e9,l=u=>{if(u.length){e.gesture();for(let h of u)h.kind==="turn"?t.turn(h.deg,!0):h.kind==="tilt"?t.tilt(h.deg,!0):h.kind==="reset"&&t.reset()}};r.style.touchAction="none",r.addEventListener("pointerdown",u=>{if(i(u.pointerType),!(e.blocked()||u.pointerType==="mouse"&&u.button!==0)){u.preventDefault();try{r.setPointerCapture(u.pointerId)}catch{}l(o.down(u.pointerId,u.clientX,u.clientY))}}),r.addEventListener("pointermove",u=>{e.blocked()||l(o.move(u.pointerId,u.clientX,u.clientY))}),r.addEventListener("pointerup",u=>{let h=o.up(u.pointerId,u.clientX,u.clientY);h.length&&(a=performance.now()),e.blocked()||l(h)}),r.addEventListener("pointercancel",u=>l(o.cancel(u.pointerId)));let c={ArrowLeft:()=>t.turn(-nd,!0),ArrowRight:()=>t.turn(nd,!0),ArrowUp:()=>t.tilt(-id,!0),ArrowDown:()=>t.tilt(id,!0)};return r.addEventListener("keydown",u=>{let h=c[u.key];h&&(u.preventDefault(),u.stopPropagation(),!e.blocked()&&(e.gesture(),h()))}),r.addEventListener("click",()=>{performance.now()-a<by||e.blocked()||(e.gesture(),t.reset())}),{button:r,setView(u,h){let f=Kh({yaw:u,pitch:h});s&&(s.style.transform=`scale(1, ${f.squash.toFixed(3)}) rotate(${f.needle.toFixed(1)}deg)`),r.style.setProperty("--tilt",f.tilt.toFixed(3)),r.dataset.heading=String(Math.round(u)),r.dataset.pitch=String(Math.round(h))}}}function ad(n,e){let t=[];for(let i=0;i<n.terrain.length;i++)(n.terrain[i]!==e.terrain[i]||n.objects[i]!==e.objects[i])&&t.push(i);return t}function rc(n,e){let t=[];return n.forEach((i,r)=>{i==="water"&&e[r]==="dirt"&&t.push(r)}),t}function ld(n,e){if(n<=0)return e;if(n<.25){let t=n/.25;return e+(-.2-e)*t*t}if(n<.25+.35){let t=(n-.25)/.35;return-.2+(.065- -.2)*(1-(1-t)**3)}return .065}function cd(n,e){return e?0:.012*Math.sin(2*Math.PI*n/3)}var Sy=n=>Math.max(0,Math.min(1,n)),wy=.06666666666666667;function ud(n){return 1-.67*Sy(n)}function hd(n,e,t){let i=e-n;return Math.abs(i)<.005?e:n+i*(1-Math.exp(-t/wy))}function dd(n,e,t){let i=e?[e]:[];return n==="ghosted"?[...i,...t]:i}var fd={minotaur:16730682,theseus:3593324,hazard:12614911,item:3859711},pd=657414,Ey=14;function md(n){return Math.max(1,Ey/(ps*Math.max(n,1e-6)))}var ps=.26,Xo=.44,Ty=.06,Ay=.02,Ry=2.4,Cy=new Set(Object.values(Un).map(n=>n.sprite)),Py=new Set(Object.values(Nn).map(n=>n.sprite).filter(n=>n!==Nn.block.sprite));function gd(n,e=un().items){return n.id?.startsWith("machine")?null:n.model==="theseus"?"theseus":n.model==="minotaur"||n.model==="minotaur-stone"?"minotaur":e==="plate"?null:Cy.has(n.model)?"hazard":Py.has(n.model)?"item":null}function xd(n,e,t=0){let i=e*Math.PI/180;return n*Math.cos(i)+t*Math.sin(i)+Ty}function _d(n,e){return e?0:-Ay*(1-Math.cos(2*Math.PI*n/Ry))}var yd=.08;function vd(n,e,t,i,r,s,o){let a=(l,c,u)=>c>u?0:Math.max(c,Math.min(u,l))-l;return[a(n,-r+o+t/2,r-o-t/2),a(e,-s+o,s-o-i)]}function xs(n,e){let t=n[e],i=n[e+1];return!t||!i||i.jump?null:i.r<t.r?"up":i.r>t.r?"down":i.c<t.c?"left":"right"}function Zo(n){return n.length<2?null:xs(n,0)??n[0].way??null}var _s=1.4,Ly=1.2;function Jo(n){return 1+.05*(1-Math.cos(2*Math.PI*n/Ly))}function Ed(n,e,t){let i=n.getContext("2d"),r=e.rise/e.cell,s=16,o=0;return{size(a,l,c){let u=window.devicePixelRatio||1;s=Math.max(1,Math.round(c*u)),o=Math.round(r*s),n.width=a*s,n.height=l*s+o,n.style.width=`${n.width/u}px`,n.style.height=`${n.height/u}px`,n.dataset.cell=String(c),i.setTransform(1,0,0,1,0,0),i.imageSmoothingEnabled=!0,i.imageSmoothingQuality="high"},paint(a,l,c){i.clearRect(0,0,n.width,n.height);let u=e.cell,h=e.cell+e.rise;for(let f of a){let d=e.sprites[f.sprite];if(!d)continue;let g=Math.round(f.x*s),x=Math.round(f.y*s);if(f.sink){i.save(),i.beginPath(),i.rect(g,x,s,s+o),i.clip(),i.drawImage(t,d.x+f.frame*u,d.y,u,h,g,x+Math.round(f.sink*(s+o)),s,s+o),i.restore();continue}i.drawImage(t,d.x+f.frame*u,d.y,u,h,g,x,s,s+o)}l&&l.length>1&&Gy(i,l,s,o,c===void 0?1:Jo(c))}}}var Dy="#8f291f",Uy="#bb4131",Ny="#ffd23f",wd="#1c0402",Oy=12,Fy=.42,zy=.14,ky=.2,By={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function Gy(n,e,t,i,r){let s=u=>[(u.c+.5)*t,(u.r+.5)*t+i],o=Math.max(1.5,t/12),a=Math.max(.75,t/30);if(n.lineJoin="round",n.lineCap="round",n.beginPath(),e.forEach((u,h)=>{let[f,d]=s(u);h===0||u.jump?n.moveTo(f,d):n.lineTo(f,d)}),n.strokeStyle=wd,n.lineWidth=o+2*a,n.stroke(),n.strokeStyle=Dy,n.lineWidth=o,n.stroke(),t<Oy)return;let l=(u,h,f,d)=>{let g=t*Fy*f,x=t*zy*f,[p,m]=s(e[u]);n.save(),n.translate(p,m),n.rotate(By[h]),n.translate(t*ky,0),n.beginPath(),n.moveTo(g/2,0),n.lineTo(-g/2,-x),n.lineTo(-g/4,0),n.lineTo(-g/2,x),n.closePath(),n.lineWidth=Math.max(1,t/21*f),n.strokeStyle=wd,n.stroke(),n.fillStyle=d,n.fill(),n.restore()};n.lineJoin="miter";for(let u=1;u<e.length;u++){let h=xs(e,u);h&&l(u,h,1,Uy)}let c=Zo(e);c&&l(0,c,_s*r,Ny)}function Hy(n,e,t){let i=n.sprites[e];return!i||i.frames<=1||i.fps<=0?0:Math.floor(t*i.fps/1e3)%i.frames}function Vy(n,e){let t=n.sprites["gate-slide"]?.frames??1;return Math.max(-1,Math.min(t,Math.round(e*(t+1))-1))}function Td(n,e,t,i,r=hs){let s=[],o=(d,g,x)=>s.push({sprite:d,frame:Hy(t,d,i),x:g,y:x}),a=(d,g,x)=>{let p=ec(n,g,d)==="v"?"-v":"",m=Vy(t,x),y=t.sprites["gate-slide"]?.frames??1;m<0?o("gate-closed"+p,d,g):m>=y?o("gate-open"+p,d,g):s.push({sprite:"gate-slide"+p,frame:m,x:d,y:g})},l=(d,g,x,p)=>{o(`door-${d}-sill${ec(n,x,g)==="v"?"-v":""}`,g,x),p<1&&s.push({sprite:`door-${d}`,frame:0,x:g,y:x,sink:p})},{rows:c,cols:u}=n.level,h=(d,g)=>!!d&&Math.ceil(d.r-1e-9)===g,f=e.minotaur&&Go(n,e.minotaur,r.hoof);for(let d=0;d<c;d++){for(let g=0;g<u;g++){let x=n.terrain[d*u+g],p=ln[x].sprites,m=x==="clone"?n.level.machines.find(b=>b.at.r===d&&b.at.c===g):void 0,y=d*u+g,_=ln[x].door??Bo(n,y);m?o(p[Lr.indexOf(m.dir)],g,d):x==="gate"?a(g,d,r.bars.get(y)??(n.relicsLeft===0?1:0)):_&&(x==="floor"||r.doors.has(y))?l(_,g,d,r.doors.get(y)??1):o(p[0],g,d)}for(let g=0;g<u;g++){let x=n.objects[d*u+g];x==="block"&&e.blocks?.some(p=>p.origin.r===d&&p.origin.c===g)||x&&o(Nn[x].sprite,g,d)}for(let g of n.level.machines)g.at.r===d&&o(g.template==="block"?Nn.block.sprite:Un[g.template].sprite,g.at.c,d);for(let g of e.blocks??[])h(g.at,d)&&o(Nn.block.sprite,g.at.c,g.at.r);for(let g of e.hazards)h(g.at,d)&&o(Un[g.kind].sprite,g.at.c,g.at.r);n.cow&&n.cow.r===d&&o("cow-standing",n.cow.c,d),f&&h(f,d)&&o(n.stone>0?"minotaur-stone":"minotaur",f.c,f.r),h(e.player,d)&&o("theseus",e.player.c,e.player.r)}return s}function Ad(n){return!(n instanceof HTMLImageElement)||n.complete&&n.naturalWidth>0}function Rd(n,e,t,i){let r=document.createElement("div");r.className="minimap",r.hidden=!0;let s=document.createElement("canvas");s.id="minimap",s.setAttribute("aria-hidden","true");let o=document.createElement("canvas");o.id="minimap-view",o.setAttribute("role","img"),o.setAttribute("aria-label","Mini map: the whole level from above; the outline is what the camera sees. Tap to look there."),r.append(s,o),n.append(r);let a=Ed(s,e,t),l=o.getContext("2d"),c=null,u=null,h=0,f=0,d=0,g=0,x=0,p=1,m=0;function y(){if(!c)return;let D=c.s.level.cols,O=c.s.level.rows,Y=kh(h||1280,f||800,D,O);if(D===d&&O===g&&Y===x)return;d=D,g=O,x=Y,a.size(d,g,x);let I=window.devicePixelRatio||1;o.width=s.width,o.height=s.height,o.style.width=s.style.width,o.style.height=s.style.height,p=s.width/I/d,m=s.height/I-g*p}function _(){!c||!Ad(t)||a.paint(Td(c.s,c.f,e,0),c.thread??void 0)}function b(){if(!u||!d)return;let D=window.devicePixelRatio||1;l.setTransform(1,0,0,1,0,0),l.clearRect(0,0,o.width,o.height),l.setTransform(D,0,0,D,0,0);let O=zh(u.c,u.aspect),Y=W=>Bh(W,d,g,p,m);l.save(),l.beginPath(),l.rect(0,m,d*p,g*p),l.clip(),l.beginPath(),O.corners.map(Y).forEach(([W,$],J)=>J?l.lineTo(W,$):l.moveTo(W,$)),l.closePath(),l.fillStyle="rgba(255,230,180,0.10)",l.fill(),l.lineWidth=1.5,l.strokeStyle="#ffd890",l.stroke();let[I,z]=O.tick.map(Y);l.beginPath(),l.moveTo(I[0],I[1]),l.lineTo(z[0],z[1]),l.stroke(),l.restore()}let E=()=>_();Ad(t)||t.addEventListener("load",E,{once:!0});let S=!1,A=D=>{if(i.blocked()||!d)return;let O=o.getBoundingClientRect();i.look(Gh(D.clientX-O.left,D.clientY-O.top,d,g,p,m))},C=D=>{if(!i.blocked()){S=!0;try{o.setPointerCapture(D.pointerId)}catch{}A(D)}},v=D=>{S&&A(D)},M=()=>{S=!1};return o.addEventListener("pointerdown",C),o.addEventListener("pointermove",v),o.addEventListener("pointerup",M),o.addEventListener("pointercancel",M),{show(D){r.hidden=!D},paint(D,O,Y){c={s:D,f:O,thread:Y},y(),_(),b()},view(D,O){u={c:{...D},aspect:O},b()},fit(D,O){h=D,f=O;let Y=x;y(),x!==Y&&(_(),b())},dispose(){t.removeEventListener("load",E),r.remove()}}}var ys={floor:"flag",wall:"none",exit:"none","gate-closed":"flag","gate-open":"flag",water:"water",fire:"ember",ice:"ice","force-up":"force","force-down":"force","force-left":"force","force-right":"force",dirt:"dirt",safe:"flag",button:"flag","toggle-open":"flag","toggle-closed":"flag","door-red":"flag","door-blue":"flag","door-yellow":"flag","door-green":"flag","door-red-sill":"flag","door-blue-sill":"flag","door-yellow-sill":"flag","door-green-sill":"flag",trap:"flag","button-brown":"flag","button-red":"flag",popup:"flag",gravel:"gravel",teleport:"flag",thief:"flag",bomb:"flag","clone-up":"flag","clone-down":"flag","clone-left":"flag","clone-right":"flag"};function Cd(n,e){let t=n.terrain[e],i=ln[t].sprites;if(t==="clone"){let s=Math.floor(e/n.level.cols),o=e%n.level.cols,a=n.level.machines.find(l=>l.at.r===s&&l.at.c===o);return i[Lr.indexOf(a?.dir??"up")]}let r=Bo(n,e);return r?`door-${r}-sill`:t==="gate"&&n.relicsLeft===0?i[1]:i[0]}var Pd=["theseus","minotaur","minotaur-stone"];function Id(n,e,t=0){let i=[],r=n.level.cols;n.objects.forEach((s,o)=>{if(!s)return;let a=Math.floor(o/r),l=o%r;s==="block"&&e.blocks?.some(c=>c.origin.r===a&&c.origin.c===l)||i.push({model:Nn[s].sprite,r:a,c:l,id:`o${o}`})});for(let s of n.level.machines){let o=s.template==="block"?Nn.block.sprite:Un[s.template].sprite;i.push({model:o,r:s.at.r,c:s.at.c,id:`machine${s.at.r*r+s.at.c}`,dir:s.dir})}for(let s of e.blocks??[])i.push({model:"block",r:s.at.r,c:s.at.c,id:null});for(let s of e.hazards){let o=n.hazards.find(a=>a.kind===s.kind&&a.at.r===s.at.r&&a.at.c===s.at.c);i.push({model:Un[s.kind].sprite,r:s.at.r,c:s.at.c,id:null,dir:o?.dir})}if(n.cow&&i.push({model:"cow-standing",r:n.cow.r,c:n.cow.c,id:"cow"}),e.minotaur){let s=Go(n,e.minotaur,t);i.push({model:n.stone>0?"minotaur-stone":"minotaur",r:s.r,c:s.c,id:"minotaur"})}return i.push({model:"theseus",r:e.player.r,c:e.player.c,id:"theseus"}),i}function Ld(){return{q:3,gaps:[],skip:10,fails:[0,0,0,0]}}function vs(n){n.gaps=[],n.skip=10}function $o(n,e){let t=0;for(let i=n.length-1;i>=0;i--)if(t+=n[i],t>=e)return(n.length-i)*1e3/t;return null}function Dd(n,e){if(e>250)return n.q;if(n.skip>0)return n.skip--,n.q;n.gaps.push(e);let t=0,i=0;for(let s=n.gaps.length-1;s>=0&&t<3e3;s--,i++)t+=n.gaps[s];i<n.gaps.length&&(n.gaps=n.gaps.slice(-i));let r=$o(n.gaps,2e3);if(r!==null&&r<40&&n.q>0)n.fails[n.q]++,n.q=n.q-1,vs(n);else if(n.q<3&&(n.fails[n.q+1]??0)<2){let s=$o(n.gaps,3e3);s!==null&&s>55&&(n.q=n.q+1,vs(n))}return n.q}function Ud(n,e){return n?e:null}var bs=new P;function Mn(n,e,t,i,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;bs.copy(e),bs[i]=0,bs.normalize();let c=.5*o/(o+a),u=1-bs.angleTo(n)/l;return Math.sign(bs[t])===1?u*c:a/(o+a)+c+c*(1-u)}var zn=class extends on{constructor(e=1,t=1,i=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,t/2,i/2,s),super(1,1,1,r,r,r),r===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new P,l=new P,c=new P(e,t,i).divideScalar(2).subScalar(s),u=this.attributes.position.array,h=this.attributes.normal.array,f=this.attributes.uv.array,d=u.length/6,g=new P,x=.5/r;for(let p=0,m=0;p<u.length;p+=3,m+=2)switch(a.fromArray(u,p),l.copy(a),l.x-=Math.sign(l.x)*x,l.y-=Math.sign(l.y)*x,l.z-=Math.sign(l.z)*x,l.normalize(),u[p+0]=c.x*Math.sign(a.x)+l.x*s,u[p+1]=c.y*Math.sign(a.y)+l.y*s,u[p+2]=c.z*Math.sign(a.z)+l.z*s,h[p+0]=l.x,h[p+1]=l.y,h[p+2]=l.z,Math.floor(p/d)){case 0:g.set(1,0,0),f[m+0]=Mn(g,l,"z","y",s,i),f[m+1]=1-Mn(g,l,"y","z",s,t);break;case 1:g.set(-1,0,0),f[m+0]=1-Mn(g,l,"z","y",s,i),f[m+1]=1-Mn(g,l,"y","z",s,t);break;case 2:g.set(0,1,0),f[m+0]=1-Mn(g,l,"x","z",s,e),f[m+1]=Mn(g,l,"z","x",s,i);break;case 3:g.set(0,-1,0),f[m+0]=1-Mn(g,l,"x","z",s,e),f[m+1]=1-Mn(g,l,"z","x",s,i);break;case 4:g.set(0,0,1),f[m+0]=1-Mn(g,l,"x","y",s,e),f[m+1]=1-Mn(g,l,"y","x",s,t);break;case 5:g.set(0,0,-1),f[m+0]=Mn(g,l,"x","y",s,e),f[m+1]=1-Mn(g,l,"y","x",s,t);break}}};var jo=class extends Pn{constructor(e=null){super();let t=new on;t.deleteAttribute("uv");let i=new Ln({side:Lt}),r=new Ln,s=5;e!==null&&e._useLegacyLights===!1&&(s=900);let o=new bn(16777215,s,28,2);o.position.set(.418,16.199,.3),this.add(o);let a=new oe(t,i);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let l=new oe(t,r);l.position.set(-10.906,2.009,1.846),l.rotation.set(0,-.195,0),l.scale.set(2.328,7.905,4.651),this.add(l);let c=new oe(t,r);c.position.set(-5.607,-.754,-.758),c.rotation.set(0,.994,0),c.scale.set(1.97,1.534,3.955),this.add(c);let u=new oe(t,r);u.position.set(6.167,.857,7.803),u.rotation.set(0,.561,0),u.scale.set(3.927,6.285,3.687),this.add(u);let h=new oe(t,r);h.position.set(-2.017,.018,6.124),h.rotation.set(0,.333,0),h.scale.set(2.002,4.566,2.064),this.add(h);let f=new oe(t,r);f.position.set(2.291,-.756,-2.621),f.rotation.set(0,-.286,0),f.scale.set(1.546,1.552,1.496),this.add(f);let d=new oe(t,r);d.position.set(-2.193,-.369,-5.547),d.rotation.set(0,.516,0),d.scale.set(3.875,3.487,2.986),this.add(d);let g=new oe(t,Ur(50));g.position.set(-16.116,14.37,8.208),g.scale.set(.1,2.428,2.739),this.add(g);let x=new oe(t,Ur(50));x.position.set(-16.109,18.021,-8.207),x.scale.set(.1,2.425,2.751),this.add(x);let p=new oe(t,Ur(17));p.position.set(14.904,12.198,-1.832),p.scale.set(.15,4.265,6.331),this.add(p);let m=new oe(t,Ur(43));m.position.set(-.462,8.89,14.52),m.scale.set(4.38,5.441,.088),this.add(m);let y=new oe(t,Ur(20));y.position.set(3.235,11.486,-12.541),y.scale.set(2.5,2,.1),this.add(y);let _=new oe(t,Ur(100));_.position.set(0,20,0),_.scale.set(1,.1,1),this.add(_)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Ur(n){let e=new lt;return e.color.setScalar(n),e}function Dt(n){return()=>(n=n*1664525+1013904223>>>0,n/4294967296)}function Qt(n,e,t=!0){let i=document.createElement("canvas");i.width=i.height=n,e(i.getContext("2d"),n);let r=new xi(i);return t&&(r.colorSpace=yt),r.wrapS=r.wrapT=vr,r.anisotropy=8,r}function bt(n,e,t,i,r,s,o,a,l=!0){for(let c=0;c<i;c++){let u=t()*e,h=t()*e,f=o+t()*(a-o);n.fillStyle=`rgba(${r},${(s*(.3+.7*t())).toFixed(3)})`;let d=l?[-e,0,e]:[0];for(let g of d)for(let x of d)l&&(Math.abs(u+g-e/2)>e/2+f||Math.abs(h+x-e/2)>e/2+f)||(n.beginPath(),n.arc(u+g,h+x,f,0,7),n.fill())}}function Ms(n,e,t){let i=n.createRadialGradient(e/2,e/2,e*.3,e/2,e/2,e*.72);i.addColorStop(0,"rgba(0,0,0,0)"),i.addColorStop(1,`rgba(20,14,10,${t})`),n.fillStyle=i,n.fillRect(0,0,e,e)}function sc(n,e,t,i,r,s,o){n.strokeStyle=r,n.lineWidth=s;for(let a=0;a<i;a++){n.beginPath();let l=t()*e,c=t()*e;n.moveTo(l,c);for(let u=0;u<6;u++)l+=(t()-.5)*o,c+=(t()-.5)*o,n.lineTo(l,c);n.stroke()}}var Wy=n=>Qt(256,(e,t)=>{let i=Dt(n);e.fillStyle="#dcc699",e.fillRect(0,0,t,t),bt(e,t,i,260,"150,120,80",.06,6,26,!1),bt(e,t,i,220,"242,226,192",.1,5,20,!1),bt(e,t,i,1800,"120,96,66",.1,.6,2,!1),bt(e,t,i,900,"250,238,212",.12,.6,1.6,!1),sc(e,t,i,2,"rgba(120,94,62,.4)",1.3,60),Ms(e,t,.12)}),Xy=()=>Qt(256,(n,e)=>{let t=Dt(7);n.fillStyle="#15171a",n.fillRect(0,0,e,e);let i=e/4,r=e/2;for(let s=0;s<4;s++){let o=s%2?r/2:0;for(let a=-1;a<3;a++){let l=a*r+o,c=s*i,u=.75+t()*.35;n.fillStyle=`rgb(${90*u|0},${94*u|0},${100*u|0})`;for(let h of[0,e])n.fillRect(l+3-h,c+3,r-6,i-6)}}bt(n,e,t,1400,"16,18,22",.25,.7,2.2),bt(n,e,t,500,"150,156,166",.14,.7,2),bt(n,e,t,60,"20,22,26",.25,4,12)}),qy=()=>Qt(256,(n,e)=>{let t=Dt(11);n.fillStyle="#7a7e86",n.fillRect(0,0,e,e),bt(n,e,t,200,"26,28,32",.2,6,24),bt(n,e,t,1500,"16,18,20",.25,.6,2),bt(n,e,t,600,"140,146,156",.12,.6,1.8)});function Yy(){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d"),i=t.createImageData(128,128),r=[[1,2,.3],[3,-1,1.7],[-2,3,4.1],[4,1,2.2],[-3,-4,5.3],[5,-3,.9]],s=(l,c)=>r.reduce((u,[h,f,d],g)=>u+Math.sin(2*Math.PI*(h*l+f*c)/128+d)/(1+g*.6),0),o=new P;for(let l=0;l<128;l++)for(let c=0;c<128;c++){let u=s(c+1,l)-s(c-1,l),h=s(c,l+1)-s(c,l-1);o.set(-u*1.4,-h*1.4,1).normalize();let f=(l*128+c)*4;i.data[f]=(o.x*.5+.5)*255,i.data[f+1]=(o.y*.5+.5)*255,i.data[f+2]=(o.z*.5+.5)*255,i.data[f+3]=255}t.putImageData(i,0,0);let a=new xi(e);return a.wrapS=a.wrapT=vr,a}var Ky=()=>Qt(256,(n,e)=>{let t=Dt(21);n.fillStyle="#1c120d",n.fillRect(0,0,e,e),bt(n,e,t,200,"50,30,20",.3,4,18,!1),n.lineCap="round";for(let i=0;i<14;i++){n.strokeStyle=`rgba(${200+t()*55|0},${70+t()*80|0},20,.9)`,n.lineWidth=1+t()*2.5,n.shadowColor="#ff6a10",n.shadowBlur=8,n.beginPath();let r=t()*e,s=t()*e;n.moveTo(r,s);for(let o=0;o<5;o++)r+=(t()-.5)*70,s+=(t()-.5)*70,n.lineTo(r,s);n.stroke()}n.shadowBlur=0,Ms(n,e,.7)}),Zy=()=>Qt(256,(n,e)=>{let t=Dt(31);for(let i=0;i<5;i++){let r=.85+t()*.25;n.fillStyle=`rgb(${196*r|0},${150*r|0},${98*r|0})`,n.fillRect(i*e/5,0,e/5,e),n.fillStyle="rgba(60,36,18,.6)",n.fillRect(i*e/5,0,2,e)}for(let i=0;i<160;i++){n.strokeStyle=`rgba(90,58,30,${.08+t()*.15})`,n.lineWidth=.6+t();let r=t()*e;n.beginPath(),n.moveTo(r,0),n.bezierCurveTo(r+(t()-.5)*8,e*.3,r+(t()-.5)*8,e*.7,r+(t()-.5)*6,e),n.stroke()}}),Jy=()=>Qt(256,(n,e)=>{let t=Dt(51);n.fillStyle="#3a2414",n.fillRect(0,0,e,e),bt(n,e,t,500,"20,12,6",.25,.6,2.4,!1),bt(n,e,t,80,"90,60,34",.15,4,16,!1),n.strokeStyle="#d8a640",n.lineWidth=22,n.lineJoin="miter";for(let i of[78,178])n.beginPath(),n.moveTo(40,i+38),n.lineTo(128,i-34),n.lineTo(216,i+38),n.stroke();n.strokeStyle="rgba(0,0,0,.6)",n.lineWidth=10,n.strokeRect(5,5,e-10,e-10)}),$y=()=>Qt(256,(n,e)=>{let t=Dt(61);n.fillStyle="#b6dcea",n.fillRect(0,0,e,e),bt(n,e,t,120,"230,246,252",.25,6,30,!1),bt(n,e,t,90,"120,170,196",.15,6,24,!1),sc(n,e,t,6,"rgba(250,254,255,.8)",1.6,90),Ms(n,e,.25)}),jy=()=>Qt(256,(n,e)=>{let t=Dt(71);n.fillStyle="#6a4626",n.fillRect(0,0,e,e),bt(n,e,t,260,"40,24,12",.22,4,20,!1),bt(n,e,t,200,"140,98,58",.16,3,14,!1),bt(n,e,t,2200,"30,18,8",.25,.6,2,!1),bt(n,e,t,40,"170,160,150",.7,2,4.5,!1),Ms(n,e,.45)}),Qy=()=>Qt(256,(n,e)=>{let t=Dt(81);n.fillStyle="#5e5a54",n.fillRect(0,0,e,e),bt(n,e,t,1600,"30,28,26",.3,.8,3,!1),bt(n,e,t,500,"160,154,146",.25,1,4,!1),Ms(n,e,.45)}),ev=()=>{let n=Qt(256,(e,t)=>{e.translate(t/2,t/2),e.strokeStyle="rgba(214,200,160,.55)",e.lineWidth=3,e.beginPath();for(let i=0;i<6;i++){let r=i/6*Math.PI*2+.3;e.lineTo(Math.cos(r)*112,Math.sin(r)*112)}e.closePath(),e.stroke();for(let i=0;i<28;i++){let r=i/28*Math.PI*2;e.save(),e.rotate(r),e.translate(76,0),e.rotate(i%2?.6:-.6),e.fillStyle=i%2?"#4f7a3a":"#3d6a30",e.beginPath(),e.ellipse(0,0,14,6,0,0,7),e.fill(),e.restore()}});return n.wrapS=n.wrapT=Gt,n},tv=()=>{let n=Qt(256,(e,t)=>{let i=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);i.addColorStop(0,"#f2fbff"),i.addColorStop(.35,"#6fc0ef"),i.addColorStop(1,"#1a4f9a"),e.fillStyle=i,e.fillRect(0,0,t,t),e.translate(t/2,t/2),e.lineCap="round";for(let r=0;r<3;r++){e.strokeStyle="rgba(255,255,255,.85)",e.lineWidth=9,e.beginPath();for(let s=0;s<=60;s++){let o=s/60,a=r*(Math.PI*2/3)+o*4.2,l=8+o*110;e.lineTo(Math.cos(a)*l,Math.sin(a)*l)}e.stroke()}});return n.wrapS=n.wrapT=Gt,n},nv=()=>{let n=Qt(256,(e,t)=>{e.fillStyle="#3a1f52",e.fillRect(0,0,t,t),bt(e,t,Dt(91),300,"20,10,30",.3,1,4,!1),e.fillStyle="#e0a838",e.translate(t/2,t/2+18),e.beginPath(),e.roundRect(-46,-30,92,92,30),e.fill();for(let[i,r,s]of[[-34,70,18],[-12,92,19],[12,96,19],[35,78,18]])e.beginPath(),e.roundRect(i-s/2,-30-r,s,r+20,s/2),e.fill();e.save(),e.translate(-50,14),e.rotate(-.8),e.beginPath(),e.roundRect(-11,-58,22,66,11),e.fill(),e.restore()});return n.wrapS=n.wrapT=Gt,n},iv=()=>Qt(256,(n,e)=>{let t=Dt(41);n.fillStyle="#ad9f86",n.fillRect(0,0,e,e),bt(n,e,t,300,"60,52,44",.15,4,20,!1),bt(n,e,t,1500,"50,44,38",.2,.6,2,!1),sc(n,e,t,4,"rgba(60,50,40,.45)",2,40);let i=(r,s,o)=>{n.save(),n.translate(e/2+r,e/2+s),n.fillStyle=o,n.fillRect(-7,-80,14,160);for(let a of[-1,1])n.beginPath(),n.moveTo(0,-38),n.quadraticCurveTo(a*60,-70,a*78,-50),n.quadraticCurveTo(a*58,0,a*78,50),n.quadraticCurveTo(a*60,70,0,38),n.fill();n.restore()};i(3,3,"rgba(225,210,185,.35)"),i(0,0,"rgba(40,32,26,.4)"),n.strokeStyle="rgba(40,32,26,.6)",n.lineWidth=6,n.strokeRect(10,10,e-20,e-20)}),rv=()=>{let n=Qt(64,(e,t)=>{let i=e.createLinearGradient(0,0,0,t);i.addColorStop(0,"rgba(0,0,0,0.85)"),i.addColorStop(.18,"rgba(0,0,0,0.6)"),i.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=i,e.fillRect(0,0,t,t)});return n.wrapS=n.wrapT=Gt,n},sv=()=>{let n=Qt(64,(e,t)=>{let i=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);i.addColorStop(0,"rgba(255,220,160,1)"),i.addColorStop(.35,"rgba(255,150,60,.45)"),i.addColorStop(1,"rgba(255,120,40,0)"),e.fillStyle=i,e.fillRect(0,0,t,t)});return n.wrapS=n.wrapT=Gt,n},De=(n,e={})=>new Ln({color:n,roughness:.8,metalness:0,...e}),ti=(n,e=.9)=>new lt({color:n,transparent:!0,opacity:e,blending:Oi,depthWrite:!1}),ov=.022;function av(){let n=new lt({color:656900,side:Lt});return n.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${ov.toFixed(3)};`)},n}function Nd(n){let e=new Sr(n),t=new jo(n),i=e.fromScene(t,.04).texture;t.dispose(),e.dispose();let r=(c,u=.35,h={})=>De(c,{roughness:u,metalness:.85,envMap:i,envMapIntensity:.55,...h}),s={brick:Xy(),cap:qy(),water:Yy(),ember:Ky(),wood:Zy(),force:Jy(),ice:$y(),dirt:jy(),gravel:Qy(),wreath:ev(),swirl:tv(),hand:nv(),halo:sv(),ao:rv(),block:iv(),flags:[101,202,303].map(Wy)},o={under:De(789e3,{roughness:1}),mortar:De(un().caps?1972242:7232580,{roughness:1}),ao:new lt({map:s.ao,transparent:!0,depthWrite:!1}),edge:De(789776,{roughness:1,side:pn}),flags:s.flags.map(c=>De(16777215,{map:c,roughness:.88})),ember:De(16777215,{map:s.ember,emissiveMap:s.ember,emissive:16742960,emissiveIntensity:.9,roughness:.9}),ice:De(10274004,{map:s.ice,roughness:.08,metalness:.1,envMap:i,envMapIntensity:.35}),force:De(16777215,{map:s.force,roughness:.7}),dirt:De(16777215,{map:s.dirt,roughness:.97}),gravelBed:De(16777215,{map:s.gravel,roughness:.95}),pebble:De(9076850,{roughness:.9}),water:De(1722962,{roughness:.14,metalness:.1,normalMap:s.water,normalScale:new j(.55,.55),emissive:399388,envMap:i,envMapIntensity:.25}),basin:De(925216,{roughness:.9}),side:De(11843776,{map:s.brick,roughness:.93}),top:De(un().caps?15921128:10791602,{map:s.cap,roughness:.95}),wood:De(16777215,{map:s.wood,roughness:.75}),darkWood:De(9071178,{map:s.wood,roughness:.8}),iron:r(3025446,.6),bronze:r(12618308,.4,{emissive:2758664}),gold:r(15250496,.3,{emissive:5912064}),stone:De(9075818),paleStone:De(13285530,{roughness:.85}),dark:De(657415),glow:new lt({color:16751168}),keyColor:{red:De(14692382,{roughness:.45,emissive:5901316}),blue:De(3108576,{roughness:.45,emissive:794202}),yellow:De(15910968,{roughness:.45,emissive:5915648}),green:De(3127388,{roughness:.45,emissive:805406})},brownButton:De(6962718,{roughness:.55}),redButton:De(11545116,{roughness:.45,emissive:2753538}),cream:De(15260864,{roughness:.6}),wreath:new Ln({map:s.wreath,transparent:!0,roughness:.8,depthWrite:!1}),swirl:new Ln({map:s.swirl,emissiveMap:s.swirl,emissive:new Ze(6994175),emissiveIntensity:.9,roughness:.3}),hand:De(16777215,{map:s.hand,roughness:.6}),clay:De(11564104,{roughness:.75}),block:De(16777215,{map:s.block,roughness:.85}),skin:De(12618338,{roughness:.7}),tunic:De(2383482,{roughness:.8}),cloak:De(9054750),leather:De(5913122,{roughness:.8}),steel:r(13225424,.3),heroSkin:De(15118472,{roughness:.6,emissive:3020298}),heroTunic:De(3117008,{roughness:.55,emissive:666180}),heroCloak:De(14170660,{roughness:.65,emissive:4328452}),heroLeather:De(9067058,{roughness:.7,emissive:1707012}),heroHair:De(5911576,{roughness:.8,emissive:1312770}),heroRing:new lt({color:1284676,depthWrite:!1}),heroRingEdge:new lt({color:398346,transparent:!0,opacity:.8,depthWrite:!1}),itemShade:new lt({color:656900,transparent:!0,opacity:.9,depthWrite:!1}),itemRing:new lt({color:16773304,depthWrite:!1}),heroBeam:new lt({color:3593324,transparent:!0,opacity:.3,blending:Oi,depthTest:!1,depthWrite:!1,side:pn}),heroXray:new lt({color:6090890,transparent:!0,opacity:.6,depthFunc:Vl,depthWrite:!1,stencilWrite:!0,stencilRef:1,stencilFunc:uh}),outline:av(),fur:De(5912096,{roughness:.9,emissive:1181700}),furDark:De(3941396,{roughness:.9}),snout:De(6965814),ivory:De(14866106,{roughness:.5}),kilt:De(11545116,{emissive:2754050}),hoof:De(1314832),eye:new lt({color:16730650}),statue:De(9342088,{roughness:.9}),statueDark:De(6973540,{roughness:.92}),parchment:De(15785648,{emissive:3024920}),teal:De(3193004,{roughness:.4,emissive:670262}),boot:De(12596762,{roughness:.55,emissive:3804164}),bootTrim:De(14715424,{emissive:5906944}),skate:De(13162728,{roughness:.45,emissive:2634300}),suction:De(3445854,{roughness:.5,emissive:798234}),mirror:r(15132390,.08,{envMapIntensity:1,emissive:4211784}),gorgon:De(3450970,{roughness:.5,emissive:798744}),cake:De(15773768,{roughness:.55,emissive:4203528}),hide:De(16051938,{roughness:.65,emissive:2894374}),patch:De(5911072,{roughness:.8}),feather:De(9067058,{roughness:.8,emissive:1970184}),halo:s.halo,env:i},a=new Set([i,...s.flags,...Object.values(s).filter(c=>c instanceof xi)]);for(let c of Object.values(o))c&&typeof c=="object"&&"isMaterial"in c?a.add(c):Array.isArray(c)&&c.forEach(u=>a.add(u));for(let c of Object.values(o.keyColor))a.add(c);return{t:s,m:o,metal:r,std:De,keeps:a,dispose:()=>{for(let c of a)c.dispose()}}}var ie=.1,yi=.035,Ct=(n,e)=>n-(e-1)/2,Pt=(n,e)=>n-(e-1)/2,lv={"force-up":0,"force-left":Math.PI/2,"force-down":Math.PI,"force-right":-Math.PI/2},Od=26;function Fd(n){let{m:e}=n,t=new Te,i=new zn(.97,.12,.97,2,.02);i.translate(0,ie-.06,0);let r=new jt(1,1);r.rotateX(-Math.PI/2),r.translate(0,yi,0);let s=new Tr(.045,0),o=new oe(new jt(1,1),e.under);o.rotation.x=-Math.PI/2,o.position.y=-.02,o.receiveShadow=!0,t.add(o);let a=new jt(1,1);a.rotateX(-Math.PI/2);let l=[],c=(h,f,d)=>{let g=new So(h,f,Math.max(1,d));return g.count=d,g.receiveShadow=!0,l.push(g),t.add(g),g},u=()=>{for(let h of l)t.remove(h),h.dispose();l=[]};return{group:t,set(h,f,d){u();let g=new an([new j(-100,-100),new j(100,-100),new j(100,100),new j(-100,100)]);g.holes.push(new wr([new j(-d/2,-f/2),new j(-d/2,f/2),new j(d/2,f/2),new j(d/2,-f/2)])),o.geometry.dispose(),o.geometry=new Ar(g);let x=[[],[],[]],p={ember:[],ice:[],force:[],dirt:[],gravel:[],water:[],mortar:[]};h.forEach((S,A)=>{let C=ys[S];S!=="exit"&&p.mortar.push(A),C==="flag"?x[Dt(A*2654435761+7)()*3|0].push(A):C!=="none"&&p[C].push(A)});let m=new pt,y=new Ze,_=(S,A,C,v)=>{A.forEach((M,D)=>{let O=Dt(M*40503+11);if(m.makeRotationY(C(M,O)).setPosition(Ct(M%d,d),0,Pt(Math.floor(M/d),f)),S.setMatrixAt(D,m),v){let Y=.78+O()*.3;S.setColorAt(D,y.setRGB(Y*(1+(O()-.5)*.06),Y,Y*(1-O()*.06)))}})},b=(S,A)=>(A()*4|0)*(Math.PI/2);_(c(a,e.mortar,p.mortar.length),p.mortar,()=>0,!1),x.forEach((S,A)=>_(c(i,e.flags[A],S.length),S,b,!0)),_(c(i,e.ember,p.ember.length),p.ember,b,!1),_(c(i,e.ice,p.ice.length),p.ice,b,!1),_(c(i,e.dirt,p.dirt.length),p.dirt,b,!0),_(c(i,e.gravelBed,p.gravel.length),p.gravel,b,!0),_(c(i,e.force,p.force.length),p.force,S=>lv[h[S]]??0,!1),_(c(r,e.water,p.water.length),p.water,()=>0,!1);let E=p.gravel;if(E.length){let S=c(s,e.pebble,E.length*Od);S.castShadow=!0;let A=0;for(let C of E){let v=Dt(C*7919+3);for(let M=0;M<Od;M++){let D=.7+v()*.5;m.makeScale(D,.6*D,D).setPosition(Ct(C%d,d)+(v()-.5)*.8,ie+.015,Pt(Math.floor(C/d),f)+(v()-.5)*.8),S.setMatrixAt(A,m),S.setColorAt(A++,y.setScalar(.75+v()*.5))}}}},loop(h){n.t.water.offset.set(Math.sin(h*.5)*.04,h*.025%1),e.water.emissiveIntensity=1+.15*Math.sin(h*1.3)},dispose(){u(),i.dispose(),r.dispose(),s.dispose(),a.dispose(),o.geometry.dispose()}}}function Qo(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),r=new Set(Object.keys(n[0].morphAttributes)),s={},o={},a=n[0].morphTargetsRelative,l=new Rt,c=0;for(let u=0;u<n.length;++u){let h=n[u],f=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let d in h.attributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;s[d]===void 0&&(s[d]=[]),s[d].push(h.attributes[d]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let d in h.morphAttributes){if(!r.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[d]===void 0&&(o[d]=[]),o[d].push(h.morphAttributes[d])}if(e){let d;if(t)d=h.index.count;else if(h.attributes.position!==void 0)d=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,u),c+=d}}if(t){let u=0,h=[];for(let f=0;f<n.length;++f){let d=n[f].index;for(let g=0;g<d.count;++g)h.push(d.getX(g)+u);u+=n[f].attributes.position.count}l.setIndex(h)}for(let u in s){let h=zd(s[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let f=0;f<h;++f){let d=[];for(let x=0;x<o[u].length;++x)d.push(o[u][x][f]);let g=zd(d);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(g)}}return l}function zd(n){let e,t,i,r=-1,s=0;for(let c=0;c<n.length;++c){let u=n[c];if(u.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=u.normalized),i!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=u.gpuType),r!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=u.array.length}let o=new e(s),a=0;for(let c=0;c<n.length;++c)o.set(n[c].array,a),a+=n[c].array.length;let l=new Xt(o,t,i);return r!==void 0&&(l.gpuType=r),l}var Nr=.38,cv=.16,oc=.26,uv=.05,hv={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};function dv(n){let[e,,t]=Sn[n].n,i=1.002,r=.5,s=.5-uv,o=e!==0?[[e*s,i,-.5*e],[e*s,i,.5*e],[e*r,i,.5*e],[e*r,i,-.5*e]]:[[.5*t,i,t*s],[-.5*t,i,t*s],[-.5*t,i,t*r],[.5*t,i,t*r]];return(e<0||t<0)&&o.reverse(),{v:o,n:[0,1,0],uvs:[[0,0],[1,0],[1,1],[0,1]],mat:2}}var Sn={n:{d:[-1,0],v:[[.5,0,-.5],[-.5,0,-.5],[-.5,1,-.5],[.5,1,-.5]],n:[0,0,-1],u:n=>-n[0]},s:{d:[1,0],v:[[-.5,0,.5],[.5,0,.5],[.5,1,.5],[-.5,1,.5]],n:[0,0,1],u:n=>n[0]},w:{d:[0,-1],v:[[-.5,0,-.5],[-.5,0,.5],[-.5,1,.5],[-.5,1,-.5]],n:[-1,0,0],u:n=>n[2]},e:{d:[0,1],v:[[.5,0,.5],[.5,0,-.5],[.5,1,-.5],[.5,1,.5]],n:[1,0,0],u:n=>-n[2]}},fv=Object.keys(Sn);function kd(n){let e=[],t=[],i=[],r=[],s=new Rt,o=0;for(let{v:a,n:l,uvs:c,mat:u}of n){let h=e.length/3;a.forEach((f,d)=>{e.push(...f),t.push(...l),i.push(...c[d])}),r.push(h,h+1,h+2,h,h+2,h+3),s.addGroup(o,6,u),o+=6}return s.setAttribute("position",new $e(e,3)),s.setAttribute("normal",new $e(t,3)),s.setAttribute("uv",new $e(i,2)),s.setIndex(r),s}var Bd=(n,e,t)=>({v:Sn[n].v,n:Sn[n].n,mat:0,uvs:Sn[n].v.map(i=>[Sn[n].u([i[0]+e,0,i[2]+t]),i[1]*cn])}),ac=[];for(let n of[.15,.5,.85])for(let e of[.15,.5,.85])for(let t of[.15,.5,.85])ac.push([n,e,t]);function pv(n,e,t,i){let r=-1e9,s=1e9;for(let o=0;o<3;o++){if(Math.abs(e[o])<1e-9){if(n[o]<t[o]||n[o]>i[o])return-1;continue}let a=(t[o]-n[o])/e[o],l=(i[o]-n[o])/e[o];if(a>l&&([a,l]=[l,a]),a>r&&(r=a),l<s&&(s=l),r>s)return-1}return r}function Gd(n){let e=new Te,t=[],i=new jt(1,oc);i.rotateX(-Math.PI/2);let r=[],s=new Map,o=0,a="solid",l=new P,c=h=>{let f=h.op<.999;for(let d of h.mats)d.transparent!==f&&(d.transparent=f,d.needsUpdate=!0),d.opacity=h.op},u=()=>{for(let h of t){e.remove(h.mesh),h.mesh.geometry.dispose();for(let f of h.inner)f.mesh.geometry.dispose();for(let f of h.mats)f.dispose()}t=[],s.clear();for(let h of r)e.remove(h);r=[]};return{group:e,list:()=>t,at:(h,f)=>s.get(h*o+f),build(h,f,d){u(),o=d;let g=(p,m)=>p<0||m<0||p>=f||m>=o||h[p*o+m]==="wall",x=a==="low"?Nr:cn;for(let p=0;p<f;p++)for(let m=0;m<o;m++){if(h[p*o+m]!=="wall")continue;let y=Ct(m,o),_=Pt(p,f),b=[{v:[[-.5,1,.5],[.5,1,.5],[.5,1,-.5],[-.5,1,-.5]],n:[0,1,0],mat:1,uvs:[[y-.5,-_-.5],[y+.5,-_-.5],[y+.5,-_+.5],[y-.5,-_+.5]]}],E=[];for(let M of fv){let[D,O]=Sn[M].d,Y=p+D,I=m+O;if(g(Y,I)&&Y>=0&&I>=0&&Y<f&&I<o?E.push(M):b.push(Bd(M,y,_)),g(Y,I))continue;b.push(dv(M));let[z,,W]=Sn[M].n,$=new oe(i,n.m.ao);$.position.set(y+z*(.5+oc/2),ie+.003,_+W*(.5+oc/2)),$.rotation.y=hv[M],$.renderOrder=1,e.add($),r.push($)}let S=[n.m.side.clone(),n.m.top.clone(),n.m.edge.clone()],A=p===0||m===0||p===f-1||m===o-1;if(!A){A=!0;for(let M=-1;M<=1;M++)for(let D=-1;D<=1;D++)g(p+M,m+D)||(A=!1)}A&&S[1].color.multiplyScalar(cv);let C=new oe(kd(b),S);C.position.set(y,0,_),C.scale.y=x,C.castShadow=C.receiveShadow=!0,e.add(C);let v={r:p,c:m,x:y,z:_,mesh:C,mats:S,op:1,target:1,inner:[]};for(let M of E){let D=new oe(kd([Bd(M,y,_)]),[S[0]]);D.visible=!1,C.add(D),v.inner.push({k:M,mesh:D,nb:null})}t.push(v),s.set(p*o+m,v)}for(let p of t)for(let m of p.inner){let[y,_]=Sn[m.k].d;m.nb=s.get((p.r+y)*o+p.c+_)??null}},setMode(h){a=h;let f=h==="low"?Nr:cn;for(let d of t)d.mesh.scale.y=f},aim(h,f){let d=new Map,g=a==="low"?Nr:cn;h.getWorldDirection(l);let x=[l.x,l.y,l.z],p=30,m=Math.max(3.2,g/Math.max(.05,-x[1]/Math.hypot(x[0],x[2]))+1.2);for(let y of f){let _=t.filter(E=>Math.abs(E.x-y.x)<m&&Math.abs(E.z-y.z)<m);if(_.length===0)continue;let b=new Map;for(let[E,S,A]of ac){let C=[y.x-y.half+2*y.half*E,ie+y.h*S,y.z-y.half+2*y.half*A],v=[C[0]-x[0]*p,C[1]-x[1]*p,C[2]-x[2]*p];for(let M of _){let D=pv(v,x,[M.x-.49,0,M.z-.49],[M.x+.49,g,M.z+.49]);D>=0&&D<p-.01&&b.set(M,(b.get(M)??0)+1)}}for(let[E,S]of b)d.set(E,Math.max(d.get(E)??0,S/ac.length))}for(let y of t){let _=Math.min(1,Math.max(0,((d.get(y)??0)-.03)/.45));y.target=ud(_*_*(3-2*_))}},ease(h,f){let d=!1;for(let g of t)g.op!==g.target&&(g.op=f?g.target:hd(g.op,g.target,h),d=!0,c(g));if(d)for(let g of t)for(let x of g.inner)x.mesh.visible=!!x.nb&&x.nb.op<.999&&g.op>x.nb.op+.02;return d},dispose(){u(),i.dispose()}}}var X=(n,e,t,i)=>(n.position.set(e,t,i),n),mv=(n,e,t,i=14)=>new yn(n,e,t,i),He=(n,e,t,i,r=14)=>new oe(mv(n,e,t,r),i),qe=(n,e,t,i)=>new oe(new on(n,e,t),i),Wi=n=>(n.rotation.x=Math.PI/2,n);function gv(n){n.updateMatrixWorld(!0);let e=new Map;n.traverse(i=>{if(!(i instanceof oe))return;let r=i.geometry.clone().applyMatrix4(i.matrixWorld);r.index&&(r=r.toNonIndexed());for(let o of Object.keys(r.attributes))o!=="position"&&o!=="normal"&&o!=="uv"&&r.deleteAttribute(o);let s=i.material;e.set(s,[...e.get(s)??[],r]),i.geometry.dispose()});let t=new Te;for(let[i,r]of e){let s=new oe(Qo(r),i);r.forEach(o=>o.dispose()),s.castShadow=s.receiveShadow=!0,t.add(s)}return t}function ta(n,e){let t=[];for(let i of e.children)i instanceof oe&&!i.userData.live&&t.push(new oe(i.geometry,n.m.outline));return e.add(...t),e}function Ot(n,e,t=[]){let i=gv(n);return t.length&&i.add(...t),i.userData=e,i}var kn=()=>Object.assign(new Te,{userData:{half:0,h:0}}),lc=n=>(n.wall(n.r-1,n.c)||n.wall(n.r+1,n.c))&&!(n.wall(n.r,n.c-1)&&n.wall(n.r,n.c+1));function vi(n,e,t){let{m:i}=n.kit,r=i.keyColor[e],s=new Te,o=1.1,a=.26;s.add(X(qe(1,.008,a+.08,i.dark),0,ie+.003,0)),s.add(X(qe(.98,.012,a,r),0,ie+.007,0));let l=new Te;l.add(X(qe(1,o,a,i.wood),0,o/2,0)),l.add(X(qe(1,.06,a+.02,i.iron),0,.34,0)),l.add(X(qe(1,.16,a+.02,r),0,.8,0)),l.add(X(qe(1,.1,a+.02,r),0,.06,0)),l.add(X(qe(1,.04,a+.02,r),0,o+.02,0)),l.add(X(qe(.16,.18,a+.04,i.iron),.24,.55,0)),l.add(Wi(X(He(.05,.05,a+.08,r,12),.24,.55,0))),l.traverse(h=>{h instanceof oe&&(h.castShadow=h.receiveShadow=!0)});let c=h=>{l.position.y=-(o+.14)*h,l.visible=h<1};c(t?1:0);let u=Xd(n,[l]);return lc(n)&&(s.rotation.y=Math.PI/2),Ot(s,{half:.4,h:t?.02:o,tall:!t,open:c},u)}var Ss=null;function xv(){if(Ss)return Ss;let n=128,e=document.createElement("canvas");e.width=e.height=n;let t=e.getContext("2d");t.fillStyle="#050302",t.fillRect(0,0,n,n);let i=(o,a,l,c,u,h,f,d,g)=>{let x=t.createLinearGradient(u,h,f,d);x.addColorStop(0,g),x.addColorStop(1,"#0a0604"),t.fillStyle=x,t.fillRect(o,a,l-o,c-a)},r=n*.2;i(0,0,n,r,0,0,0,r,"#6a5236"),i(0,n-r,n,n,0,n,0,n-r,"#2a1e14"),i(0,0,r,n,0,0,r,0,"#4a3826"),i(n-r,0,n,n,n,0,n-r,0,"#4a3826"),t.fillStyle="#1e160f",t.fillRect(r,r,n-2*r,n-2*r);let s=Dt(7);for(let o=0;o<14;o++)t.fillStyle=["#3a2c1e","#2c2116","#4a3a28"][o%3],t.beginPath(),t.ellipse(r+s()*(n-2*r),r+s()*(n-2*r),3+s()*5,2+s()*4,s()*3,0,Math.PI*2),t.fill();return Ss=new xi(e),Ss.colorSpace=yt,Ss}function Hd(n,e){let{m:t}=n.kit,i=new Te,r=.7,s=.06,o=new oe(new jt(1,r),new lt({map:xv()}));o.rotation.x=-Math.PI/2,i.add(X(o,0,ie+.004,0));for(let c of[-1,1])i.add(X(qe(1,.07,.15,t.paleStone),0,ie+.035,c*(r/2+.075))),i.add(X(qe(1,.012,.02,t.dark),0,ie+.072,c*(r/2+.005)));let a=[];for(let c=0;c<Ql;c++){let u=-r/2+r*(c+.5)/Ql;for(let h of[-1,1]){let f=X(He(s,s,.5,t.bronze,12),0,ie+.06,u);f.rotation.z=Math.PI/2,f.castShadow=f.receiveShadow=!0,f.userData.side=h,a.push(f)}}let l=c=>{for(let u of a)u.visible=c>.01,u.scale.y=Math.max(.01,c),u.position.x=u.userData.side*(.5-.25*c)};return l(e?1:0),lc(n)&&(i.rotation.y=Math.PI/2),Ot(i,{half:.5,h:.15,open:l},Xd(n,a))}function Xd(n,e){let t=new Te;return t.add(...e),lc(n)&&(t.rotation.y=Math.PI/2),[t]}function _v(n){let{m:e}=n.kit,t=new Te;for(let a=0;a<3;a++)t.add(X(qe(.25,.08,.9,e.stone),-.375+a*.25,ie-.04-a*.12,0));for(let a of[-1,1])t.add(X(qe(1,.7,.05,e.stone),0,ie-.35,a*.475));t.add(X(qe(.05,.7,.9,e.stone),.475,ie-.35,0));let i=X(new oe(new jt(.25,.9),e.glow),.375,-.32,0);i.rotation.x=-Math.PI/2,t.add(i),t.add(X(qe(.3,.16,1.1,e.top),0,cn-.08,0));for(let a of[-1,1])t.add(X(qe(.16,cn-.16,.12,e.darkWood),0,(cn-.16)/2,a*.5));let r=[[0,-1],[-1,0],[1,0],[0,1]].find(([a,l])=>!n.wall(n.r+a,n.c+l)),[s,o]=r??[0,-1];return t.rotation.y=Math.atan2(s,-o),Ot(t,{half:.4,h:.3,tall:!0})}function Vd(n,e){let{m:t}=n.kit,i=new Te;if(e){i.add(X(qe(.8,.72-.04,.8,t.dark),0,ie+.72/2,0));for(let s of[ie+.04,ie+.72-.04])i.add(X(qe(.92,.08,.92,t.darkWood),0,s,0));for(let s of[-1,1])for(let o of[-1,1])i.add(X(qe(.1,.72,.1,t.darkWood),s*.41,ie+.72/2,o*.41));for(let s=0;s<4;s++){let o=-.27+s*.18;for(let a of[-1,1])i.add(X(qe(.07,.72-.12,.05,t.wood),o,ie+.72/2,a*.43)),i.add(X(qe(.05,.72-.12,.07,t.wood),a*.43,ie+.72/2,o));i.add(X(qe(.07,.04,.8,t.wood),o,ie+.72-.01,0))}return Ot(i,{half:.46,h:.72+.1})}i.add(X(qe(.84,.02,.84,t.dark),0,ie+.005,0));for(let r of[-1,1])i.add(X(qe(.88,.04,.07,t.darkWood),0,ie+.02,r*.42)),i.add(X(qe(.07,.04,.88,t.darkWood),r*.42,ie+.02,0));for(let r=0;r<4;r++)i.add(X(qe(.08,.035,.8,t.wood),-.27+r*.18,ie+.018,0));return Ot(i,{half:.42,h:.06})}function qd(n,e,t=.3){let i=new Te;return i.add(X(He(t,t+.03,.05,n,28),0,ie+.025,0)),i.add(X(He(t-.05,t-.04,.03,e,28),0,ie+.06,0)),i}function yv(n){let{m:e}=n.kit,t=new Te;t.add(X(He(.28,.31,.05,e.iron,24),0,ie+.025,0));let i=X(new oe(new In(.21,20,10,0,Math.PI*2,0,Math.PI/2),e.brownButton),0,ie+.04,0);return i.scale.y=.55,t.add(i),Ot(t,{half:.3,h:.16})}function Wd(n,e){let{m:t}=n.kit,i=qd(t.bronze,e);return i.add(Wi(X(new oe(new vn(.15,.018,8,32),t.cream),0,ie+.077,0))),i.add(X(He(.05,.055,.04,t.bronze,16),0,ie+.08,0)),Ot(i,{half:.3,h:.12})}function vv(n){let{m:e}=n.kit,t=qd(e.bronze,e.dark,.34);for(let i=0;i<12;i++){let r=i/12*Math.PI*2;t.add(X(new oe(new Yt(.028,.12,6),e.iron),Math.cos(r)*.22,ie+.13,Math.sin(r)*.22))}return t.add(X(He(.1,.11,.04,e.bronze,16),0,ie+.09,0)),Ot(t,{half:.34,h:.2})}function bv(n){let{m:e}=n.kit,t=new Te;t.add(X(He(.07,.08,.03,e.gold,18),0,ie+.015,0));let i=Ot(t,{half:.4,h:.05}),r=new oe(new jt(.9,.9),e.wreath);return r.rotation.x=-Math.PI/2,r.position.y=ie+.003,r.receiveShadow=!0,i.add(r),i}function Mv(n){let{m:e}=n.kit,t=new Te;t.add(X(qe(.78,.04,.78,e.paleStone),0,ie+.02,0));for(let i of[-1,1])t.add(X(qe(.9,.09,.07,e.darkWood),0,ie+.045,i*.42)),t.add(X(qe(.07,.09,.9,e.darkWood),i*.42,ie+.045,0));return Ot(t,{half:.45,h:.1})}function Sv(n){let{m:e}=n.kit,t=new Te;t.add(X(He(.36,.38,.06,e.bronze,32),0,ie+.03,0));let i=Ot(t,{half:.36,h:.1}),r=X(He(.3,.3,.02,e.swirl,32),0,ie+.065,0);return r.receiveShadow=!0,i.add(r),i.userData.loop=s=>{r.rotation.y=-s*1.6},i}function wv(n){let{m:e}=n.kit,t=new Te;t.add(X(He(.36,.38,.06,e.gold,32),0,ie+.03,0));let i=X(He(.3,.3,.02,e.hand,32),0,ie+.065,0);return i.rotation.y=Math.PI,t.add(i),Ot(t,{half:.36,h:.1})}function Ev(n){let{m:e}=n.kit,t=new Te,i=[[0,0],[.12,0],[.2,.08],[.22,.2],[.18,.32],[.08,.4],[.07,.46],[.09,.48],[0,.48]].map(([a,l])=>new j(a,l));t.add(X(new oe(new Er(i,24),e.clay),0,ie,0)),t.add(Wi(X(new oe(new vn(.205,.012,6,28),e.dark),0,ie+.22,0)));let r=X(He(.012,.012,.12,e.dark,6),.02,ie+.53,0);r.rotation.z=-.3,t.add(r);let s=X(new oe(new Yt(.035,.1,8),ti(16760928)),.04,ie+.62,0),o=Ot(t,{half:.22,h:.6},[s]);return o.userData.loop=a=>s.scale.set(1,1+.2*Math.sin(a*9),1),o}function ea(n,e){let{m:t}=n.kit,i=new Te;i.add(X(new oe(new zn(.86,.36,.86,2,.03),t.darkWood),0,ie+.18,0)),i.add(X(qe(.64,.02,.64,t.dark),0,ie+.365,0));for(let a of[-1,1])for(let l of[-1,1])i.add(X(He(.03,.03,.02,t.gold,10),a*.37,ie+.365,l*.37));let r=new an;r.moveTo(0,.24),r.lineTo(.17,.04),r.lineTo(.07,.04),r.lineTo(.07,-.22),r.lineTo(-.07,-.22),r.lineTo(-.07,.04),r.lineTo(-.17,.04),r.closePath();let s=new oe(new Bi(r,{depth:.025,bevelEnabled:!1}),t.gold);s.rotation.x=-Math.PI/2,s.position.y=ie+.37;let o=new Te;return o.add(s),o.rotation.y=e,i.add(o),Ot(i,{half:.43,h:.4})}function Tv(n){let e=new Te,t=Dt(n.r*31+n.c),i=[];for(let s=0;s<5;s++){let o=.3+t()*.28,a=X(new oe(new Yt(.08+t()*.05,o,7),ti(s%2?16738848:16756816,.8)),(t()-.5)*.55,ie+o/2,(t()-.5)*.55);i.push(a),e.add(a)}let r=t()*6.28;return e.userData={half:.4,h:.5,loop:s=>i.forEach((o,a)=>o.scale.set(1,1+.12*Math.sin(s*(6+a)+r+a),1))},e}var Yd={floor:kn,wall:kn,water:kn,ice:kn,dirt:kn,gravel:kn,"force-up":kn,"force-down":kn,"force-left":kn,"force-right":kn,exit:_v,fire:Tv,"gate-closed":n=>Hd(n,!1),"gate-open":n=>Hd(n,!0),safe:bv,button:yv,trap:vv,popup:Mv,teleport:Sv,thief:wv,bomb:Ev,"toggle-open":n=>Vd(n,!1),"toggle-closed":n=>Vd(n,!0),"door-red":n=>vi(n,"red",!1),"door-blue":n=>vi(n,"blue",!1),"door-yellow":n=>vi(n,"yellow",!1),"door-green":n=>vi(n,"green",!1),"door-red-sill":n=>vi(n,"red",!0),"door-blue-sill":n=>vi(n,"blue",!0),"door-yellow-sill":n=>vi(n,"yellow",!0),"door-green-sill":n=>vi(n,"green",!0),"button-brown":n=>Wd(n,n.kit.m.brownButton),"button-red":n=>Wd(n,n.kit.m.redButton),"clone-up":n=>ea(n,0),"clone-left":n=>ea(n,Math.PI/2),"clone-down":n=>ea(n,Math.PI),"clone-right":n=>ea(n,-Math.PI/2)};function bi(n,e){n.traverse(t=>{if(!(t instanceof oe))return;t.geometry.dispose();let i=Array.isArray(t.material)?t.material:[t.material];for(let r of i)e.keeps.has(r)||r.dispose()})}var en=(n,e,t=16,i=12)=>new oe(new In(n,t,i),e);function Jd(n,e,t){let i=new an;i.moveTo(n[0][0],n[0][1]);for(let[s,o]of n.slice(1))i.lineTo(s,o);i.closePath();let r=new Bi(i,{depth:e,bevelEnabled:!1,curveSegments:6});return r.translate(0,0,-e/2),new oe(r,t)}function ws(n,e,t,i,r=0,s=[]){let o=t.h*i;e.position.y-=ie;let a=new Te;a.position.set(0,ie,o/2*Math.sin(r)),a.rotation.x=-r,a.scale.setScalar(i),a.add(e);let l=new Te;return l.add(a),ta(n,Ot(l,{...t,half:Math.max(t.half*i,o/2*Math.sin(r)),h:o*Math.cos(r),back:o*Math.sin(r)/2},s))}var cc=.45,Av=.035;function $d(n,e){return n.rotation.x=-Math.PI/2,n.position.y=ie+e,n.userData.live=!0,n}var ia=(n,e=.42)=>$d(new oe(new Po(e,32),n.m.itemShade),.006);function Bn(n,e,t,i,r=0){let s=un().items==="plate",o=[ia(n,s?cc:.42)];return s&&o.push($d(new oe(new _i(cc-Av,cc,48),n.m.itemRing),.008)),ws(n,e,t,s?i*1.12:i,r,o)}function Rv(n){let{m:e}=n,t=new Te;t.add(X(He(.11,.13,.04,e.bronze,18),0,ie+.02,0)),t.add(X(He(.02,.022,.66,e.darkWood,8),0,ie+.35,0)),t.add(X(en(.03,e.gold,10,8),0,ie+.7,0));for(let i of[-1,1]){let r=Jd([[.02,.05],[.12,.08],[.21,.17],[.16,0],[.21,-.17],[.12,-.08],[.02,-.05]].map(([s,o])=>[i*s,o]),.03,e.gold);t.add(X(r,0,ie+.5,0))}return t.add(X(He(.035,.035,.12,e.gold,10),0,ie+.5,0)),Bn(n,t,{half:.22,h:.72},1.2,.85)}function na(n,e){let{m:t}=n,i=new Te;i.add(X(new oe(new vn(.075,.03,10,20),t.keyColor[e]),0,.2,0)),i.add(Wi(X(He(.05,.05,.034,t.keyColor[e],16),0,.2,0))),i.add(X(qe(.035,.24,.03,t.bronze),0,0,0)),i.add(X(qe(.07,.03,.03,t.bronze),.035,-.08,0)),i.add(X(qe(.05,.03,.03,t.bronze),.025,-.03,0)),i.position.y=ie+.2,i.rotation.z=.25;let r=new Te;return r.add(i),Bn(n,r,{half:.12,h:.42},2.05,1.1)}function Cv(n){let{m:e}=n,t=new Te,i=new an;i.moveTo(0,0),i.bezierCurveTo(.08,.02,.1,.2,.07,.32),i.lineTo(-.07,.32),i.bezierCurveTo(-.1,.2,-.08,.02,0,0);let r=new Bi(i,{depth:.025,bevelEnabled:!1});for(let s of[-1,1]){let o=new oe(r,e.teal);o.rotation.x=-Math.PI/2+.35,o.rotation.z=s*.2,o.position.set(s*.1,ie+.03,.14),t.add(o),t.add(X(qe(.1,.07,.1,e.teal),s*.1,ie+.06,.14))}return Bn(n,t,{half:.24,h:.2},1.8)}function uc(n,e,t,i){let r=new Te;for(let s of[-1,1]){let o=new Te,a=i?.(o)??0;o.add(X(qe(.09,.2,.09,e),0,a+.12,0)),o.add(X(qe(.09,.06,.17,e),0,a+.03,.04)),o.add(X(qe(.1,.045,.1,t),0,a+.225,0)),o.position.set(s*.09,ie,0),o.rotation.y=s*.2,r.add(o)}return r}function Pv(n){let{m:e}=n,t=uc(n,e.boot,e.bootTrim,i=>(i.add(X(new oe(new Yt(.025,.07,6),e.gold),0,.11,.05)),0));return Bn(n,t,{half:.2,h:.28},1.9,.7)}function Iv(n){let{m:e}=n,t=uc(n,e.skate,e.cream,i=>{i.add(X(qe(.02,.05,.24,e.steel),0,.025,.04));for(let r of[-.04,.12])i.add(X(qe(.03,.03,.03,e.steel),0,.05,r));return .05});return Bn(n,t,{half:.2,h:.32},1.8,.7)}function Lv(n){let{m:e}=n,t=uc(n,e.suction,e.bootTrim,i=>(i.add(X(He(.1,.07,.035,e.bronze,18),0,.018,.03)),.035));return Bn(n,t,{half:.22,h:.3},1.8,.7)}function Dv(n){let{m:e}=n,t=new Te,i=new Te;i.position.set(0,ie+.32,0),i.rotation.x=-.25,i.add(Wi(He(.13,.13,.02,e.mirror,28))),i.add(new oe(new vn(.13,.02,8,28),e.bronze));let r=X(en(.045,e.gorgon,12,10),0,0,.012);r.scale.z=.5,i.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;i.add(X(en(.014,e.gorgon,6,5),Math.cos(o)*.08,Math.sin(o)*.08,.012))}return t.add(i),t.add(X(He(.018,.025,.2,e.bronze,8),0,ie+.1,0)),t.add(X(He(.08,.09,.025,e.bronze),0,ie+.012,0)),Bn(n,t,{half:.18,h:.48},1.55,.9)}function Uv(n){let{m:e}=n,t=new Te;t.add(X(He(.24,.22,.03,e.bronze,24),0,ie+.015,0)),t.add(X(He(.17,.19,.16,e.cake,24),0,ie+.11,0)),t.add(X(He(.165,.17,.02,e.cream,24),0,ie+.2,0));for(let i=0;i<8;i++){let r=i/8*Math.PI*2;t.add(X(en(.022,e.cream,8,6),Math.cos(r)*.12,ie+.215,Math.sin(r)*.12))}return t.add(X(en(.035,e.cake,10,8),0,ie+.22,0)),Bn(n,t,{half:.24,h:.26},1.4,.35)}function Kd(n,e,t=0,i=!1){let{m:r}=n,s=new Te;s.add(X(qe(.56,.05,.3,r.wood),0,.1,0));for(let l of[-1,1])for(let c of[-1,1])s.add(Wi(X(He(.07,.07,.03,r.darkWood,14),l*.2,.07,c*.165))),s.add(X(He(.028,.025,.14,r.hide,8),l*.16,.18,c*.08));s.add(X(new oe(new zn(.46,.22,.24,2,.05),r.hide),0,.34,0));for(let[l,c,u,h]of[[-.1,0,.3,1],[.1,.05,.3,1],[-.04,.12,1,.3],[.12,-.12,1,.3],[-.14,-.12,1,.3]]){let f=X(en(.075,r.patch,10,8),l,h===1?.44:.35,c);f.scale.set(1,u,h),s.add(f)}s.add(X(new oe(new zn(.14,.15,.15,2,.03),r.hide),.29,.43,0)),s.add(X(qe(.06,.08,.12,r.snout),.37,.4,0));for(let l of[-1,1]){let c=X(new oe(new Yt(.02,.08,6),r.ivory),.28,.53,l*.06);c.rotation.x=l*.5,s.add(c)}let o=X(He(.012,.012,.16,r.patch,6),-.25,.36,0);o.rotation.z=-.4,s.add(o),s.position.y=ie,s.rotation.y=.5;let a=new Te;return a.add(s),(i?Bn:ws)(n,a,{half:.32,h:.56},e,t)}function Nv(n){let{m:e}=n,t=new Te;t.add(X(qe(.26,.008,.14,e.parchment),.02,ie+.006,.08));let i=X(He(.06,.06,.34,e.parchment,14),0,ie+.06,-.02);i.rotation.z=Math.PI/2,t.add(i);for(let s of[-1,1]){let o=X(He(.035,.035,.012,e.darkWood,10),s*.172,ie+.06,-.02);o.rotation.z=Math.PI/2,t.add(o)}let r=X(He(.064,.064,.05,e.cloak,14),-.08,ie+.06,-.02);return r.rotation.z=Math.PI/2,t.add(r),t.rotation.y=.3,Bn(n,t,{half:.2,h:.14},1.9,.5)}function Ov(n){let e=new Te;return e.add(X(new oe(new zn(.84,.8,.84,3,.05),n.m.block),0,ie+.4,0)),Ot(e,{half:.42,h:.9})}function Fv(n){let{m:e}=n,t=new Te,i=ie+.22;t.add(X(en(.22,e.bronze,24,16),0,i,0));let r=X(new oe(new vn(.222,.012,6,32),e.gold),0,i,0);r.rotation.y=Math.PI/2,t.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;t.add(X(en(.022,e.gold,6,5),Math.cos(o)*.222,i,Math.sin(o)*.222)),s%2===0&&t.add(X(en(.02,e.gold,6,5),0,i+Math.cos(o+.3)*.224,Math.sin(o+.3)*.224))}return ws(n,t,{half:.24,h:.46},1.45,0,[ia(n)])}function zv(n){let{m:e}=n,t=new Te,i=ie+.4,r=X(en(.12,e.feather,16,12),0,i,-.02);r.scale.set(.9,1.15,.85),t.add(r),t.add(X(en(.075,e.skin,14,10),0,i+.17,.03));let s=X(en(.082,e.furDark,14,8),0,i+.19,.01);s.scale.set(1,.8,1),t.add(s);for(let a of[-1,1]){t.add(X(en(.012,e.dark,6,5),a*.028,i+.18,.1));let l=Jd([[.06,.08],[.24,.16],[.4,.14],[.38,.06],[.33,.08],[.33,-.01],[.26,.02],[.24,-.08],[.17,-.03],[.12,-.1],[.06,-.04]].map(([c,u])=>[a*c,u]),.025,e.feather);l.position.set(0,i+.04,-.04),l.rotation.x=-.9,t.add(l),t.add(X(He(.014,.012,.16,e.bootTrim,6),a*.04,i-.18,.02))}let o=X(new oe(new Yt(.06,.16,6),e.feather),0,i-.1,-.12);return o.rotation.x=-2.4,t.add(o),ws(n,t,{half:.36,h:.66},1.05,0,[ia(n)])}var Zd=1.35;function kv(n){let e=new Te;e.add(X(en(.13,n.m.bootTrim,12,8),0,ie+.14,0));let t=[],i=X(en(.16,ti(13647888,.5),16,12),0,ie+.17,0);t.push(i);for(let o=0;o<7;o++){let a=o/7*Math.PI*2,l=.24+o%3*.06,c=X(new oe(new Yt(.08,l,7),ti(o%2?13122060:14182424,.7)),Math.cos(a)*.12,ie+l/2+.04,Math.sin(a)*.12);c.rotation.z=-Math.cos(a)*.3,c.rotation.x=Math.sin(a)*.3,t.push(c)}let r=new Te;for(let o of t)o.position.y-=ie;r.add(...t),r.position.y=ie,r.scale.setScalar(Zd),r.userData.live=!0;let s=ws(n,e,{half:.26,h:.5},Zd,0,[r,ia(n)]);return s.userData.loop=o=>t.forEach((a,l)=>a.scale.set(1,1+.15*Math.sin(o*(7+l)+l*1.7),1)),s}var ra={relic:Rv,"key-red":n=>na(n,"red"),"key-blue":n=>na(n,"blue"),"key-yellow":n=>na(n,"yellow"),"key-green":n=>na(n,"green"),flippers:Cv,"fire-boots":Pv,skates:Iv,suction:Lv,mirror:Dv,cake:Uv,cow:n=>Kd(n,1.1,.35,!0),"cow-standing":n=>Kd(n,1.1),page:Nv,block:Ov,ball:Fv,glider:zv,fireball:kv};var ni=(n,e,t=16,i=12)=>new oe(new In(n,t,i),e);function ef(n,e,t,i=1.3,r=[]){e.scale.setScalar(i),e.position.y=ie;let s=new Te;return s.add(e),ta(n,Ot(s,t,r))}function Bv(n,e,t){let i=[];for(let s of e.children){if(!(s instanceof oe)||s.userData.live||s.material===n.m.outline)continue;let o=s.material;o.stencilWrite=!0,o.stencilRef=1,o.stencilZPass=ch;let a=new oe(s.geometry,n.m.heroXray);a.renderOrder=20,a.userData.live=!0,i.push(a)}let r=new oe(new yn(.16,.24,2.2,24,1,!0),n.m.heroBeam);r.position.y=ie+t+.25+1.1,r.renderOrder=21,r.userData.live=!0,e.add(...i,r)}var hc=1.45;function Gv(n){let{m:e}=n,t=new Te;for(let u of[-1,1])t.add(X(He(.045,.04,.28,e.heroSkin),u*.065,.14,0)),t.add(X(qe(.07,.05,.12,e.heroLeather),u*.065,.025,.02));t.add(X(He(.13,.2,.22,e.heroTunic),0,.35,0)),t.add(X(He(.155,.13,.22,e.heroTunic),0,.55,0)),t.add(X(He(.16,.16,.035,e.heroLeather),0,.45,0));let i=X(qe(.3,.44,.03,e.heroCloak),0,.44,-.14);i.rotation.x=.12,t.add(i);for(let u of[-1,1]){let h=X(He(.04,.035,.26,e.heroSkin),u*.19,.5,.02);h.rotation.z=u*.18,t.add(h)}t.add(X(ni(.095,e.heroSkin),0,.75,0)),t.add(X(new oe(new In(.103,18,10,0,Math.PI*2,0,Math.PI/2),e.heroHair),0,.765,-.012));let r=X(He(.15,.15,.03,e.bronze,24),-.26,.5,.04);r.rotation.z=Math.PI/2,t.add(r);let s=X(He(.06,.06,.035,e.heroCloak,16),-.275,.5,.04);s.rotation.z=Math.PI/2,t.add(s);let o=X(qe(.03,.34,.012,e.steel),.23,.5,.1);o.rotation.x=.5,t.add(o),t.add(X(qe(.09,.02,.03,e.bronze),.23,.37,.03));let a=(u,h,f,d)=>{let g=new oe(new _i(u,h,48),f);return g.rotation.x=-Math.PI/2,g.position.y=ie+d,g.userData.live=!0,g},l=[a(.33,.47,e.heroRingEdge,.01),a(.36,.44,e.heroRing,.012)],c=ef(n,t,{half:.26*hc/1.3,h:1.2*hc/1.3},hc,l);return un().beacon&&Bv(n,c,c.userData.h),c}var dc=1.08,Hv=.24;function jd(n,e){let{m:t}=n,i=x=>e?t.statue:x,r=i(t.fur),s=e?t.statueDark:t.furDark,o=new Te;for(let x of[-1,1]){let p=x*-.05;o.add(X(He(.06,.068,.05,i(t.hoof)),x*.13,.025,p+.01));let m=X(He(.05,.06,.26,r),x*.125,.18,p);m.rotation.z=x*.04,o.add(m);let y=X(He(.09,.062,.26,r),x*.11,.42,p*.6);y.rotation.z=-x*.1,o.add(y)}o.add(X(He(.15,.2,.14,i(t.kilt)),0,.54,0));let a=X(new oe(new vn(.155,.02,8,24),i(t.gold)),0,.605,0);a.rotation.x=Math.PI/2,o.add(a);let l=X(new Te,0,.6,0);l.rotation.x=Hv,o.add(l),l.add(X(He(.21,.15,.2,r),0,.09,0));let c=X(ni(.25,r),0,.29,.01);c.scale.set(1.42,.85,.92),l.add(c);let u=X(ni(.17,s),0,.42,-.06);u.scale.set(1.5,.66,1),l.add(u);for(let x of[-1,1]){l.add(X(ni(.12,r),x*.29,.39,0));let p=X(He(.088,.072,.26,r),x*.325,.24,.01);p.rotation.z=x*.1,l.add(p);let m=X(He(.074,.06,.24,r),x*.335,.04,.07);m.rotation.x=-.45,l.add(m),l.add(X(ni(.072,s),x*.33,-.08,.13)),l.add(X(He(.076,.076,.035,i(t.gold)),x*.33,.14,.03))}let h=X(new Te,0,.45,.13);h.rotation.x=.3,l.add(h);let f=ni(.125,s);f.scale.set(1.05,.95,1.15),h.add(f);let d=X(ni(.085,i(t.snout)),0,-.05,.12);d.scale.set(1.1,.8,.95),h.add(d),h.add(X(new oe(new vn(.035,.008,6,16),i(t.gold)),0,-.1,.19));for(let x of[-1,1]){h.add(X(ni(.02,e?t.statueDark:t.eye,8,6),x*.065,.03,.115));let p=X(ni(.04,s),x*.14,.02,-.03);p.scale.set(1.3,.6,.8),h.add(p);let m=new ss([new P(x*.08,.06,0),new P(x*.24,.07,-.03),new P(x*.37,.15,.01),new P(x*.42,.3,.1)]);h.add(new oe(new Io(m,20,.036,8),i(t.ivory)));let y=X(new oe(new Yt(.036,.11,8),i(t.ivory)),x*.425,.36,.125);y.rotation.x=.35,y.rotation.z=-x*.15,h.add(y)}let g=new Te;g.add(He(.02,.02,1,i(t.iron),8));for(let x of[-1,1]){let p=new oe(new yn(.17,.17,.022,24,1,!1,0,Math.PI),i(t.steel));p.rotation.z=Math.PI/2,p.rotation.y=x>0?0:Math.PI,p.position.set(0,.36,0),p.scale.set(1,1,.8),g.add(p)}return g.rotation.set(-.12,Math.PI/2,0),g.position.set(.33,.1,.13),l.add(g),ef(n,o,{half:.42*dc/1.3,h:1.6*dc/1.3},dc)}var fc={theseus:Gv,minotaur:n=>jd(n,!1),"minotaur-stone":n=>jd(n,!0)},Vv={...ra,...fc},Wv=new Set([...Pd,"ball","glider","fireball"]),Xv={down:0,up:Math.PI,right:Math.PI/2,left:-Math.PI/2},qv=1.5,Yv=.05,Qd={y:.37,scale:.7},Kv=n=>Math.atan2(Math.sin(n),Math.cos(n));function tf(n,e){let t=new Te,i=[],r=(d,g,x)=>{let p=gd(d),m=x.userData;return p?e.make(p,g,m.h,m.back??0):null};function s(d){d.foot.set(d.obj.position.x,ie+d.y,d.obj.position.z)}function o(d){let g=Vv[d.model](n);return d.id?.startsWith("machine")&&g.scale.setScalar(Qd.scale),t.add(g),g}function a(d,g){let x=d.id?.startsWith("machine")?Qd.y:0,p=o(d),m=new P;return{model:d.model,id:d.id,obj:p,marker:r(d,m,p),foot:m,r:d.r,c:d.c,yaw:g,goal:g,y:x}}function l(d){t.remove(d.obj),bi(d.obj,n),d.marker&&e.group.remove(d.marker)}function c(d,g){l(d),d.model=g.model,d.obj=o(g),d.marker=r(g,d.foot,d.obj)}function u(d,g,x,p){let m=!1,y=new Set(i),_=new Map,b=new Map(i.filter(C=>C.id).map(C=>[C.id,C]));for(let C of d){let v=C.id?b.get(C.id):void 0;v&&(y.delete(v),_.set(C,v))}let E=[];for(let C of d)if(!_.has(C))for(let v of y){let M=Math.hypot(v.r-C.r,v.c-C.c);v.model===C.model&&M<=qv&&E.push([M,C,v])}E.sort((C,v)=>C[0]-v[0]);for(let[,C,v]of E)_.has(C)||!y.has(v)||(y.delete(v),v.id=C.id,_.set(C,v));for(let C of y)l(C),m=!0;let S=d.find(C=>C.model==="theseus"),A=[];for(let C of d){let v=_.get(C);if(!v){let O=C.dir?Xv[C.dir]:C.id==="minotaur"&&S?Math.atan2(S.c-C.c,S.r-C.r):0;v=a(C,O),m=!0}v.model!==C.model&&(c(v,C),m=!0);let M=C.r-v.r,D=C.c-v.c;Math.abs(M)+Math.abs(D)>1e-6&&(Wv.has(v.model)&&(v.goal=Math.atan2(D,M)),m=!0),v.r=C.r,v.c=C.c,p&&(v.yaw=v.goal),v.obj.position.set(Ct(v.c,g),v.y,Pt(v.r,x)),v.obj.rotation.y=v.yaw,s(v),A.push(v)}return i=A,m}function h(d,g){let x=!1;for(let p of i){let m=Kv(p.goal-p.yaw);if(Math.abs(m)<.001){p.yaw=p.goal,p.obj.rotation.y=p.yaw;continue}p.yaw=g?p.goal:p.yaw+m*(1-Math.exp(-d/Yv)),p.obj.rotation.y=p.yaw,x=!0}return x}function f(){for(let d of i)l(d);i=[]}return{group:t,set:u,ease:h,seen(){let d=x=>{let p=x.obj.userData;return{x:x.obj.position.x,z:x.obj.position.z,half:p.half,h:p.h}},g=i.find(x=>x.model==="theseus");return{hero:g?d(g):null,rest:i.filter(x=>x!==g).map(d)}},hero:()=>i.find(d=>d.model==="theseus")?.obj??null,loop(d){for(let g of i)g.obj.userData.loop?.(d)},looping:()=>i.flatMap(d=>d.marker||d.obj.userData.loop?[d.obj]:[]),clear:f,dispose:f}}var af=.8,rf=ie+af-yi,sf=9,$v=9,of=13823214;function lf(n){let e=new Te,t=new Tr(.05,0),i=new _i(.82,1,40);i.rotateX(-Math.PI/2);let r=new Map,s=0,o=(u,h)=>{u.block.position.y=yi+h-(ie+af)};function a(u){let h=u.splash;if(h){for(let f of[h.ring,...h.drops])e.remove(f),f.material.dispose();u.splash=null}}function l(u,h,f){let d=Dt(u*2246822519+5),g=new oe(i,new lt({color:of,transparent:!0,depthWrite:!1}));g.position.set(h,yi+.004,f),g.scale.setScalar(.35),e.add(g);let x=[],p=[];for(let m=0;m<sf;m++){let y=(m+d()*.6)/sf*Math.PI*2,_=.55+d()*.45;p.push([Math.cos(y)*_,Math.sin(y)*_,1.6+d()*.8]);let b=new oe(t,new lt({color:of,transparent:!0,depthWrite:!1}));b.position.set(h,yi,f),e.add(b),x.push(b)}return{t0:null,ring:g,drops:x,flight:p}}function c(u){let h=r.get(u);h&&(a(h),e.remove(h.block),bi(h.block,n),r.delete(u))}return{group:e,set(u,h,f,d){let g=!1,x=new Set(u);for(let p of[...r.keys()])x.has(p)||(c(p),g=!0);for(let p of u){if(r.has(p))continue;let m=Ct(p%h,h),y=Pt(Math.floor(p/h),f),_=ra.block(n);_.position.set(m,0,y),e.add(_);let b={block:_,x:m,z:y,splash:d?l(p,m,y):null};o(b,d?rf:.065+s),r.set(p,b),g=!0}return g},splashing:()=>[...r].filter(([,u])=>u.splash).map(([u])=>u),frame(u){let h=!1;for(let f of r.values()){let d=f.splash;if(!d)continue;d.t0??=u;let g=(u-d.t0)/1e3;if(g>=Math.max(.4,.25+.35)){a(f),o(f,.065+s);continue}h=!0,o(f,ld(g,rf));let x=Math.min(1,g/.4);d.ring.scale.setScalar(.35+.35*(1-(1-x)**2)),d.ring.material.opacity=.75*(1-x),d.drops.forEach((p,m)=>{let[y,_,b]=d.flight[m],E=yi+b*g-$v/2*g*g;p.visible=x<1&&E>=yi,p.position.set(f.x+y*g,E,f.z+_*g),p.material.opacity=.9*(1-x*x)})}return h},loop(u,h){s=cd(u,h);for(let f of r.values())f.splash||o(f,.065+s)},cells:()=>[...r.keys()].sort((u,h)=>u-h),clear(){for(let u of[...r.keys()])c(u)},dispose(){this.clear(),t.dispose(),i.dispose()}}}var jv=Math.PI/6;function cf(){let n=new Pn,e=new Te,t=ps/2,i=Xo,r=new Er([new j(0,0),new j(t,i*.6),new j(0,i)],6),s=new Map,o=un().items==="white";for(let[f,d]of Object.entries(fd)){let g=o&&f==="item"?16777215:d;s.set(f,new Lo({color:g,emissive:g,emissiveIntensity:.45,specular:16777215,shininess:80,flatShading:!0,transparent:!0,opacity:.9,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1}))}let a=new lt({color:pd,side:Lt,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1});a.onBeforeCompile=f=>{f.vertexShader=f.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${o?"0.04":"0.022"};`)};let l=new ei(16777215,2.2);n.add(new Uo(16777215,.7),l,e);let c=new P,u=new P,h=new P;return{scene:n,group:e,make(f,d,g,x=0){let p=new oe(r,s.get(f));p.userData={kind:f,foot:d,h:g,back:x},p.renderOrder=10;let m=new oe(r,a);return m.renderOrder=9,p.add(m),e.add(p),p},place(f,d,g,x,p){let m=md(p);c.setFromMatrixColumn(f.matrixWorld,0),u.setFromMatrixColumn(f.matrixWorld,1),h.setFromMatrixColumn(f.matrixWorld,2),l.position.copy(h).multiplyScalar(3).addScaledVector(u,2).addScaledVector(c,-1.5);let y=_d(g,x);for(let _ of e.children){let b=_.userData;_.position.copy(b.foot).addScaledVector(u,xd(b.h,d,b.back)+y),_.quaternion.copy(f.quaternion),_.rotateY(jv),_.scale.setScalar(m)}return m},dispose(){e.clear(),r.dispose();for(let f of s.values())f.dispose();a.dispose()}}}var Qv={"door-red":sa,"door-blue":sa,"door-yellow":sa,"door-green":sa,"gate-closed":uf,"gate-open":uf,exit:(n,e)=>ii(new bn(16751168,4,4,1.6),n,.4,e)};function sa(n,e){return ii(new bn(16756848,1.6,2.6,1.8),n,.9,e+.6)}function uf(n,e){return ii(new bn(16760944,1.2,2.5,1.8),n,1,e)}function ii(n,e,t,i){return n.position.set(e,t,i),n}var hf=n=>n.endsWith("-sill")?"sill":n.startsWith("door")?"door":n.startsWith("gate")?"gate":n;function df(n,e,t,i,r){let{m:s}=n,o=new Te,a=[];o.add(new Pr(10131616,2761760,2.4));let l=Math.hypot(i,t)/2+1.5,c=new ei(11581648,1.6);c.position.set(-6,14,8),c.castShadow=!0,c.shadow.mapSize.set(2048,2048),Object.assign(c.shadow.camera,{left:-l,right:l,top:l,bottom:-l,near:1,far:40+l}),c.shadow.camera.updateProjectionMatrix(),c.shadow.bias=-8e-4,o.add(c,c.target);let u=new bn(16758904,5.5,5.5,1.6);u.castShadow=!0,u.shadow.mapSize.set(512,512),u.shadow.bias=-.004,o.add(u);let h=[],f=[],d=Math.min(8,Math.max(3,Math.round(t*i/37))),g=["s","e","w","n"],x=[];for(let E of r)for(let S of g){let[A,C]=Sn[S].d,v=E.r+A,M=E.c+C;v<0||M<0||v>=t||M>=i||e[v*i+M]!=="floor"||x.push({w:E,k:S,r:v,c:M,pri:g.indexOf(S)})}x.sort((E,S)=>E.pri-S.pri||E.r-S.r||E.c-S.c);let p=[];for(let E of x){if(p.length>=d)break;p.some(S=>Math.max(Math.abs(S.r-E.r),Math.abs(S.c-E.c))<4)||p.push(E)}let m=new ns({map:s.halo,blending:Oi,depthWrite:!1,transparent:!0,opacity:.55});a.push(m),p.forEach(({w:E,k:S},A)=>{let[C,,v]=Sn[S].n,M=new Te;M.position.set(E.x+C*.5,0,E.z+v*.5),M.add(ii(new oe(new on(.08,.2,.08),s.iron),C*.04,.82,v*.04)),M.add(ii(new oe(new yn(.05,.03,.12,8),s.iron),C*.1,.92,v*.1));let D=ii(new oe(new Yt(.055,.2,8),ti(16747056)),C*.1,1.07,v*.1),O=ii(new oe(new Yt(.03,.12,8),ti(16769184)),C*.1,1.04,v*.1);a.push(D.material,O.material);let Y=new Mo(m);Y.scale.setScalar(.7),Y.position.set(C*.12,1.05,v*.12),M.add(D,O,Y);for(let z of M.children)z instanceof oe&&z.material===s.iron&&(z.castShadow=!0);o.add(M);let I=ii(new bn(16754788,4,6,1.7),M.position.x+C*.45,1.05,M.position.z+v*.45);o.add(I),f.push({g:M,flames:[D,O],halo:Y,light:I,base:4,ph:A*2.39}),h.push(new P(M.position.x,1,M.position.z))});let y=[],_=[];e.forEach((E,S)=>{if(E!=="fire")return;let A=Math.floor(S/i),C=S%i,v=_.at(-1);v&&v.r===A&&v.c1===C-1?v.c1=C:_.push({r:A,c0:C,c1:C}),h.push(new P(Ct(C,i),ie+.2,Pt(A,t)))});for(let E of _){let S=E.c1-E.c0+1,A=ii(new bn(16742960,3+S*1.2,3+S*.8,1.6),(Ct(E.c0,i)+Ct(E.c1,i))/2,.8,Pt(E.r,t));o.add(A),y.push({light:A,base:A.intensity,ph:E.r})}e.forEach((E,S)=>{(E==="water"||E==="teleport")&&h.push(new P(Ct(S%i,i),ie,Pt(Math.floor(S/i),t)))});let b=new Map;return e.forEach((E,S)=>{let A=Qv[E];if(!A)return;let C=A(Ct(S%i,i),Pt(Math.floor(S/i),t));o.add(C),b.set(S,{light:C,base:C.intensity,kind:hf(E)})}),{group:o,anchors:h,hero(E,S){u.position.set(E,1.5,S+.1)},setMode(E){for(let S of f)S.g.visible=E!=="low",S.light.position.y=E==="low"?.7:1.05},piece(E,S){let A=b.get(E);A&&(A.light.intensity=hf(S)===A.kind?A.base:0)},shadows(E){c.castShadow=E,u.castShadow=E},loop(E){for(let S of f){let A=1+.07*Math.sin(E*7.1+S.ph)+.04*Math.sin(E*12.7+S.ph*2);S.flames.forEach(C=>C.scale.set(1,A,1)),S.light.intensity=S.base*(1+.1*Math.sin(E*6.3+S.ph)+.05*Math.sin(E*11.1))}m.opacity=.5+.06*Math.sin(E*5);for(let S of y)S.light.intensity=S.base*(1+.1*Math.sin(E*5.7+S.ph))},dispose(){o.traverse(E=>{E instanceof oe&&E.geometry.dispose(),(E instanceof ei||E instanceof bn)&&E.shadow.map?.dispose()});for(let E of a)E.dispose()}}}var mc={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new j(1/1024,1/512)}},vertexShader:`

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
	`};var eb="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",tb=`
uniform sampler2D tDiffuse; uniform float exposure; uniform vec2 res; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
void main(){
  vec3 col = pow(aces(texture2D(tDiffuse, vUv).rgb * exposure), vec3(1.0/2.2));
  float l = dot(col, vec3(.2126, .7152, .0722));
  col = col * vec3(1.02, 1.0, 0.96) + vec3(0.018, 0.009, 0.0) * (1.0 - l);
  vec2 q = (vUv - 0.5) * vec2(res.x / res.y, 1.0);
  col *= 1.0 - 0.5 * smoothstep(0.35, 0.95, length(q));
  gl_FragColor = vec4(col, 1.0);
}`;function ff(n){let e=new Fn(-1,1,1,-1,0,1),t=new xn({uniforms:{tDiffuse:{value:null},exposure:{value:1.4},res:{value:new j(1,1)}},vertexShader:eb,fragmentShader:tb,depthTest:!1,depthWrite:!1}),i=new xn({uniforms:{tDiffuse:{value:null},resolution:{value:new j}},vertexShader:mc.vertexShader,fragmentShader:mc.fragmentShader,depthTest:!1,depthWrite:!1}),r=new oe(new jt(2,2),t);r.frustumCulled=!1;let s=new Pn;s.add(r);let o=new $t(1,1,{type:Fi,samples:4,stencilBuffer:!0}),a=new $t(1,1);return{setSize(l,c){o.setSize(l,c),a.setSize(l,c),t.uniforms.res.value.set(l,c),i.uniforms.resolution.value.set(1/l,1/c)},render(l,c,u){n.setRenderTarget(o),n.render(l,c),r.material=t,t.uniforms.tDiffuse.value=o.texture,n.setRenderTarget(u?a:null),n.render(s,e),u&&(r.material=i,i.uniforms.tDiffuse.value=a.texture,n.setRenderTarget(null),n.render(s,e))},dispose(){o.dispose(),a.dispose(),t.dispose(),i.dispose(),r.geometry.dispose()}}}var pf=9382175,nb=12271921,ib=16765503,mf=1836034,la=.03,gc=ie+.035,ca=gc+la+.01,gf=ca+.006,rb=.42,sb=.2,ob=.2,xf=1.32,oa={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function aa(n){let e=rb*n,t=sb*n,i=new an;return i.moveTo(e/2,0),i.lineTo(-e/2,t),i.lineTo(-e/4,0),i.lineTo(-e/2,-t),i.closePath(),new Ar(i).rotateX(-Math.PI/2).translate(ob,0,0)}function _f(){let n=new Te,e=new Ln({color:pf,roughness:.7,emissive:pf,emissiveIntensity:.35}),t=new lt({color:nb}),i=new lt({color:mf}),r=new lt({color:ib,depthTest:!1}),s=new lt({color:mf,depthTest:!1}),o=[],a=null,l="",c=()=>{for(let h of o)h.parent?.remove(h),h.geometry.dispose();o.length=0,a&&n.remove(a.mesh),a=null},u=(h,f)=>{if(h.length===0)return null;let d=h.map(x=>x.index?x.toNonIndexed():x),g=new oe(Qo(d),f);return h.forEach(x=>x.dispose()),d.forEach(x=>x.dispose()),o.push(g),n.add(g),g};return{group:n,set(h,f,d){let g=h&&h.length>1?`${f}x${d}:${h.map(E=>`${E.jump?"^":""}${E.r},${E.c}${E.way??""}`).join(" ")}`:"";if(g===l)return!1;if(l=g,c(),!h||h.length<2)return!0;let x=h.map(E=>[Ct(E.c,f),Pt(E.r,d)]),p=[],m=[],y=[];x.forEach(([E,S],A)=>{p.push(new In(la,8,6).translate(E,gc,S));let C=xs(h,A);if(!C)return;let[v,M]=x[A+1],D=v-E,O=M-S,Y=Math.hypot(D,O),I=new yn(la,la,Y,8,1,!0);I.rotateZ(Math.PI/2),I.rotateY(-Math.atan2(O,D)),I.translate(E+D/2,gc,S+O/2),p.push(I),A!==0&&(y.push(aa(xf).rotateY(-oa[C]).translate(E,ca,S)),m.push(aa(1).rotateY(-oa[C]).translate(E,gf,S)))});let _=u(p,e);_&&(_.receiveShadow=!0),u(y,i),u(m,t);let b=Zo(h);if(b){let E=new Te,S=new oe(aa(xf).rotateY(-oa[b]),s),A=new oe(aa(1).rotateY(-oa[b]).translate(0,gf-ca,0),r);S.renderOrder=10,A.renderOrder=11,o.push(S,A),E.add(S,A),E.position.set(x[0][0],ca,x[0][1]),E.scale.setScalar(_s),n.add(E),a={mesh:E,dir:b}}return!0},pulse(h){return a?(a.mesh.scale.setScalar(_s*Jo(h)),!0):!1},next(){return a?{dir:a.dir,scale:a.mesh.scale.x}:null},dispose(){c(),e.dispose(),t.dispose(),i.dispose(),r.dispose(),s.dispose()}}}var yf=394500,_c=Math.PI/180,yc=12,vf=.12;function lb(n){let e=null;try{e=localStorage.getItem(Vh)}catch{e=null}Xh(e);let t=new es({canvas:n.canvas,antialias:!0,powerPreference:"high-performance"});t.shadowMap.enabled=!0,t.shadowMap.type=Hl,t.shadowMap.autoUpdate=!1;let i=Nd(t),r=new Pn;r.background=new Ze(yf);let s=new Fn(-1,1,1,-1,.1,200),o=new P,a=new P,l=new P,c=ff(t),u=Fd(i),h=Gd(i),f=new Te,d=cf(),g=tf(i,d),x=_f(),p=lf(i);r.add(u.group,h.group,f,g.group,x.group,p.group);let m=!0,y=0,_=0,b=-1e9,E=!1,S=Ld(),A=S.q,C=1,v=1,M="solid",D=un(),O=null,Y=null,I=!0,z=Rh(),W=0,$=hs,J=null,q=[],re=new Set,k=[],Q=null,V=0,te=0,Se=!0,Le="",_e=!0,Fe=!0,ze=!0,ce={yaw:0,pitch:75,tx:0,tz:0,zoom:10},ge={...ce},L=!0,de=!1,Z=()=>n.reducedMotion(),he=()=>A===0?1:Math.min(globalThis.devicePixelRatio||1,2),K=()=>O?.level.rows??1,Re=()=>O?.level.cols??1,pe=()=>C/v,R=(ne,ue)=>re.has(ue)?"water":Cd(ne,ue),w=()=>Oh(pe(),Re(),K(),ge.pitch);function F(){!_&&m&&(_=requestAnimationFrame(ae))}function le(ne){V=ne,Fe=!0,F()}let se=()=>m&&Se&&!document.hidden&&!n.reducedMotion();function ee(){te&&clearTimeout(te),te=0,se()&&(te=setTimeout(()=>{te=0,se()&&(O&&(Pe()||x.next())?le(V+1/yc):V+=1/yc,ee())},1e3/yc))}function Pe(){ye();let ne=ue=>(o.copy(ue).project(s),Math.abs(o.x)<1.05&&Math.abs(o.y)<1.05);return(Q?.anchors??[]).some(ne)||g.looping().some(ue=>ne(ue.position))||k.some(ue=>!!ue?.userData?.loop&&ne(ue.position))}function ye(){let ne=ce.yaw*_c,ue=ce.pitch*_c,Me=ce.zoom/2,Oe=pe(),Ke=Ph(ce.pitch,ce.zoom);s.position.set(ce.tx+Math.sin(ne)*Math.cos(ue)*Ke,ie+Math.sin(ue)*Ke,ce.tz+Math.cos(ne)*Math.cos(ue)*Ke),s.up.set(-Math.sin(ne),0,-Math.cos(ne)),s.lookAt(ce.tx,ie,ce.tz),s.far=Ke+160,s.left=-Me*Oe,s.right=Me*Oe,s.top=Me,s.bottom=-Me,s.updateProjectionMatrix(),s.updateMatrixWorld()}function we(){de?(L&&J&&(ge.tx=Ct(J.c,Re()),ge.tz=Pt(J.r,K())),ge.zoom=Wo(ge.zoom,w())):(ge.tx=ge.tz=0,ge.zoom=Nh(pe(),Re(),K(),ge.pitch,ge.yaw)),Object.assign(ge,Vo(ge,Re(),K(),pe()))}function ke(){let{hero:ne,rest:ue}=g.seen();if(M==="ghosted"&&O){let Me=Re(),Oe=K();k.forEach((Ke,mt)=>{let st=Ke?.userData;!st||st.h<=0||ue.push({x:Ct(mt%Me,Me),z:Pt(Math.floor(mt/Me),Oe),half:st.half,h:st.h})})}return dd(M,ne,ue)}function Je(){Q?.shadows(A>=3),ze=!0,fe()}function ae(ne){if(_=0,!m){E=!1;return}let ue=ne-b;b=ne;let Me=Ud(E,ue);if(Me!==null){let st=Dd(S,Me);st!==A&&(A=st,Je())}let Oe=Me!==null?Math.min(.1,ue/1e3):1/60;we();let Ke=Ih(ce,ge,Oe,Z());if(Ke&&(_e=!0),ye(),at.setView(ce.yaw,ce.pitch),_e&&(h.aim(s,ke()),_e=!1),Ke=h.ease(Oe,Z())||Ke,g.ease(Oe,Z())&&(Ke=!0,ze=!0),p.frame(ne)&&(Ke=!0,ze=!0),it(ne)&&(Ke=!0,ze=!0),Fe){u.loop(V),Q?.loop(V),g.loop(V),p.loop(V,Z()),x.pulse(V);for(let st of k)st?.userData?.loop?.(V);Fe=!1}if(ze&&(t.shadowMap.needsUpdate=!0,ze=!1),c.render(r,s,A>=2),d.group.children.length){let st=d.place(s,ce.pitch,V,Z(),v/ce.zoom);et(st),t.autoClear=!1,t.render(d.scene,s),t.autoClear=!0}let mt=`${ce.yaw} ${ce.tx} ${ce.tz} ${ce.zoom} ${C} ${v}`;mt!==Le&&(Le=mt,Tt?.view(ce,pe())),y++,E=Ke,Ke&&F()}function it(ne){if(!O||!Y)return!1;let ue=$=z.at(O,Y,ne,Z(),I);return O.terrain.forEach((Me,Oe)=>{let Ke=k[Oe]?.userData;Ke?.open&&(Me==="gate"?Ke.open(ue.bars.get(Oe)??(O.relicsLeft===0?1:0)):Ke.open(ue.doors.get(Oe)??(Me==="floor"?1:0)))}),ue.hoof!==W&&(W=ue.hoof,ve(O,Y)),ue.busy}function et(ne){let ue=ce.zoom/2,Me=ue*pe();a.setFromMatrixColumn(s.matrixWorld,0),l.setFromMatrixColumn(s.matrixWorld,1);for(let Oe of d.group.children){if(o.copy(Oe.userData.foot).project(s),Math.abs(o.x)>1||Math.abs(o.y)>1)continue;o.copy(Oe.position).project(s);let[Ke,mt]=vd(o.x*Me,o.y*ue,ps*ne,Xo*ne,Me,ue,yd);Oe.position.addScaledVector(a,Ke).addScaledVector(l,mt)}}function Ye(){let ne=ue=>(o.copy(ue).project(s),[(o.x+1)/2*C,(1-o.y)/2*v]);return d.group.children.map(ue=>{let Me=ue.userData;return{kind:Me.kind,at:ne(ue.position),foot:ne(Me.foot),cell:v/ce.zoom}})}function Ne(ne,ue){return o.set(Ct(ne,Re()),ie,Pt(ue,K())).project(s),[(o.x+1)/2*C,(1-o.y)/2*v]}let Ee=new Fn(-1,1,1,-1,.1,200),Ge=null,rt=new Uint8Array(0);function xt(ne,ue,Me,Oe,Ke){if(!O)return!1;let mt=Re(),st=K(),T=ne.width,N=ne.height,B=(Ie,Xe,ct)=>ct<=Xe?(ct-1)/2:Math.max((Xe-1)/2,Math.min(ct-1-(Xe-1)/2,Ie)),H=Ct(B(Me,Oe,mt),mt),G=Pt(B(ue,Ke,st),st),xe=75*_c,Ce=40;Ee.position.set(H,ie+Math.sin(xe)*Ce,G+Math.cos(xe)*Ce),Ee.up.set(0,0,-1),Ee.lookAt(H,ie,G);let Ae=Oe/2,Ue=Ke*Math.sin(xe)/2;Object.assign(Ee,{left:-Ae,right:Ae,top:Ue,bottom:-Ue}),Ee.updateProjectionMatrix(),Ee.updateMatrixWorld(),(!Ge||Ge.width!==T||Ge.height!==N)&&(Ge?.dispose(),Ge=new $t(T,N),Ge.texture.colorSpace=yt,rt=new Uint8Array(T*N*4)),t.toneMapping=No,t.toneMappingExposure=1.4,t.setRenderTarget(Ge),t.render(r,Ee),t.setRenderTarget(null),t.toneMapping=Rn,t.readRenderTargetPixels(Ge,0,0,T,N,rt);let We=new ImageData(T,N);for(let Ie=0;Ie<N;Ie++)We.data.set(rt.subarray((N-1-Ie)*T*4,(N-Ie)*T*4),Ie*T*4);return ne.getContext("2d").putImageData(We,0,0),!0}function je(ne){let ue=ne.width,Me=ne.height,Oe=new Pn,Ke=fc.theseus(i);Oe.add(Ke,new Pr(16773596,2759954,1.6));let mt=new ei(16769720,2.4);mt.position.set(1.5,3,4),Oe.add(mt);let st=new Cn().setFromObject(Ke),T=st.max.y,N=Math.max(st.max.y-st.min.y,st.max.x-st.min.x)*.8,B=(st.min.x+st.max.x)/2,H=(st.min.z+st.max.z)/2,G=T-N*.46,xe=new Fn(-N/2,N/2,N/2,-N/2,.1,50);xe.position.set(B+3,G+3,H+9),xe.lookAt(B,G,H),xe.updateMatrixWorld();let Ce=new $t(ue,Me);Ce.texture.colorSpace=yt;let Ae=new Uint8Array(ue*Me*4),Ue=t.getClearAlpha();t.setClearColor(0,0),t.toneMapping=No,t.toneMappingExposure=1.4,t.setRenderTarget(Ce),t.clear(),t.render(Oe,xe),t.setRenderTarget(null),t.toneMapping=Rn,t.setClearColor(yf,Ue),t.readRenderTargetPixels(Ce,0,0,ue,Me,Ae),Ce.dispose(),bi(Ke,i);let We=new ImageData(ue,Me);for(let Ie=0;Ie<Me;Ie++)We.data.set(Ae.subarray((Me-1-Ie)*ue*4,(Me-Ie)*ue*4),Ie*ue*4);ne.getContext("2d").putImageData(We,0,0)}function fe(){let ne=n.canvas.clientWidth,ue=n.canvas.clientHeight;if(ne<=0||ue<=0)return;C=ne,v=ue;let Me=he();t.setPixelRatio(Me),t.setSize(ne,ue,!1),c.setSize(Math.round(ne*Me),Math.round(ue*Me)),Tt?.fit(n.overlay.clientWidth||ne,n.overlay.clientHeight||ue),de||(we(),ce.zoom=ge.zoom),_e=!0}function U(ne){let ue=k[ne];ue&&(f.remove(ue),bi(ue,i));let Me=Re(),Oe=K(),Ke=Math.floor(ne/Me),mt=ne%Me,st=(B,H)=>B<0||H<0||B>=Oe||H>=Me||q[B*Me+H]==="wall",T=Yd[q[ne]]({kit:i,r:Ke,c:mt,wall:st}),N=T.userData;if(!T.children.length){k[ne]=null;return}T.position.set(Ct(mt,Me),0,Pt(Ke,Oe)),N.tall&&M==="low"&&(T.scale.y=Nr/cn),f.add(T),k[ne]=T}function ve(ne,ue){J&&(J.r!==ue.player.r||J.c!==ue.player.c)&&(L=!0),J={r:ue.player.r,c:ue.player.c};let Me=g.set(Id(ne,ue,W),Re(),K(),Z()),Oe=g.hero();return Oe&&Q?.hero(Oe.position.x,Oe.position.z),Me}function be(){for(let ne of k)ne&&(f.remove(ne),bi(ne,i));k=[],Q&&(r.remove(Q.group),Q.dispose(),Q=null),g.clear(),p.clear(),x.set(null,0,0)}function Ve(ne){be(),O=ne;let{rows:ue,cols:Me}=ne.level;re=new Set(rc(ne.level.terrain,ne.terrain)),q=ne.terrain.map((Oe,Ke)=>R(ne,Ke)),p.set([...re],Me,ue,!1),u.set(q,ue,Me),h.build(q,ue,Me),k=q.map(()=>null);for(let Oe=0;Oe<q.length;Oe++)U(Oe);Q=df(i,q,ue,Me,h.list()),Q.setMode(M),Q.shadows(A>=3),r.add(Q.group),vs(S),J=null,ve(ne,{player:ne.player,minotaur:ne.minotaur,hazards:ne.hazards.map(Oe=>({kind:Oe.kind,at:Oe.at}))}),L=!0,de=!1,ge.yaw=0,ge.pitch=75,we(),Object.assign(ce,ge),_e=Fe=ze=!0,Tt?.paint(ne,{player:ne.player,minotaur:ne.minotaur,hazards:ne.hazards.map(Oe=>({kind:Oe.kind,at:Oe.at}))},null),F(),te||ee()}function Be(ne,ue){let Me=ne.state;Y=ne.figures,I=ne.done??!0,(!O||Me.level!==O.level)&&Ve(Me);let Oe=O,Ke=ad(Oe,Me);Oe.relicsLeft!==Me.relicsLeft&&Me.terrain.forEach((Ae,Ue)=>{Ae==="gate"&&Ke.push(Ue)});let mt=!1,st=!1,{rows:T,cols:N}=Me.level,B=new Set,H=rc(Me.level.terrain,Me.terrain);re=new Set(H);for(let Ae of Ke){let Ue=R(Me,Ae),We=q[Ae];if(Ue!==We){if(ys[Ue]!==ys[We]&&(mt=!0),Ue==="wall"!=(We==="wall")){st=!0;let Ie=Math.floor(Ae/N),Xe=Ae%N;for(let[ct,kt]of[[-1,0],[1,0],[0,-1],[0,1]])Ie+ct>=0&&Ie+ct<T&&Xe+kt>=0&&Xe+kt<N&&B.add((Ie+ct)*N+Xe+kt)}q[Ae]=Ue,U(Ae),Q?.piece(Ae,Ue)}}for(let Ae of B)Ke.includes(Ae)||U(Ae);mt&&u.set(q,T,N),st&&(h.build(q,T,N),h.setMode(M)),O=Me;let G=ve(Me,ne.figures),xe=x.set(ue,N,T),Ce=p.set(H,N,T,!Z());Ke.length===0&&!G&&!xe&&!Ce&&Me===Oe||((Ke.length||G||Ce)&&(_e=!0,ze=!0),Tt?.paint(Me,ne.figures,ue),F(),te||ee())}function ut(ne){let ue=D.cutaway&&ne==="solid"?"ghosted":ne;M=ue,h.setMode(ue),Q?.setMode(ue);for(let Me of k)Me&&Me.userData.tall&&(Me.scale.y=ue==="low"?Nr/cn:1);_e=ze=!0,F()}function ht(){L=!0,de=!1,ge.yaw=Dh(0,ce.yaw),ge.pitch=75,Z()&&(ce.yaw=ge.yaw,ce.pitch=ge.pitch)}let Mt={turn(ne,ue){ge.yaw+=ne,(!ue||Z())&&(ce.yaw+=ne),_e=!0,F()},pan(ne,ue){L=!1;let Me=ce.zoom/v;for(let Oe of[ce,ge])Object.assign(Oe,Vo(Lh(Oe,ne,ue,Me),Re(),K(),pe()));_e=!0,F()},zoom(ne,ue,Me,Oe){de=!0;let Ke=w();if(Oe)ge.zoom=Wo(ge.zoom*ne,Ke);else{let mt=Math.abs(ue)>vf||Math.abs(Me)>vf;mt&&(L=!1);let st=mt?ue*pe():0,T=mt?Me:0;for(let N of[ce,ge])Object.assign(N,Vo(Fh(N,ne,st,T,Ke),Re(),K(),pe()))}_e=!0,F()},tilt(ne,ue){ge.pitch=Ho(ge.pitch+ne),(!ue||Z())&&(ce.pitch=ge.pitch),_e=!0,F()},reset(){ht(),_e=!0,F()}},Et=document.createElement("div");Et.className="modern-ui",n.overlay.append(Et);let at=od(n.canvas,Et,n,Mt),Tt=n.atlas&&n.image?Rd(Et,n.atlas,n.image,{blocked:()=>n.blocked(),look(ne){n.gesture(),L=!1,ge.tx=ne.x,ge.tz=ne.z,F()}}):null,nn=()=>{vs(S),ee()};document.addEventListener("visibilitychange",nn);let Or=typeof IntersectionObserver=="function"?new IntersectionObserver(ne=>{Se=ne.some(ue=>ue.isIntersecting),ee()}):null;Or?.observe(n.canvas);let Es=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,Mi=()=>{Fe=!0,F(),ee()};return Es?.addEventListener("change",Mi),fe(),{level:Ve,show:Be,walls:ut,yaw:()=>ce.yaw,zoom:()=>ce.zoom,pitch:()=>ce.pitch,setView(ne,ue){Mt.turn(ne-ge.yaw,!1),Mt.tilt(ue-ge.pitch,!1),we(),Object.assign(ce,ge)},following:()=>L,reset:Mt.reset,resize(){fe(),F()},setActive(ne){m=ne,Et.hidden=!ne,ne?F():(_&&cancelAnimationFrame(_),_=0,E=!1),ee()},frames:()=>y,opening:()=>({bars:[...$.bars.values()],doors:[...$.doors.values()],hoof:$.hoof}),quality:()=>A,fps:()=>$o(S.gaps,2e3),floating:()=>p.cells(),routeNext:()=>x.next(),markers:Ye,cellAt:Ne,splashing:()=>p.splashing(),minimap(ne){Tt?.show(ne)},showTips:()=>at.showTips(),snapshot:xt,portrait:je,dispose(){_&&cancelAnimationFrame(_),_=0,m=!1,ee(),document.removeEventListener("visibilitychange",nn),Or?.disconnect(),Es?.removeEventListener("change",Mi),at.dispose(),Tt?.dispose(),Et.remove(),be(),u.dispose(),h.dispose(),g.dispose(),p.dispose(),x.dispose(),d.dispose(),Ge?.dispose(),c.dispose(),i.dispose(),t.dispose()}}}export{lb as createModernBoard};
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=modern.js.map
