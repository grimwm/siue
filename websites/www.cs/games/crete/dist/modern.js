/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
var op=0,zc=1,ap=2;var gh=1,ec=2,ri=3,Ti=0,Lt=1,Gt=2;var Si=0,Lr=1,mn=2,Bc=3,Gc=4,lp=5,Hi=100,cp=101,up=102,Hc=103,Vc=104,hp=200,dp=201,fp=202,pp=203,ul=204,hl=205,mp=206,gp=207,xp=208,_p=209,yp=210,vp=211,bp=212,Mp=213,Sp=214,wp=0,Ep=1,Tp=2,fo=3,Ap=4,Cp=5,tc=6,Rp=7,nc=0,Pp=1,Ip=2,Nn=0,Lp=1,Dp=2,Up=3,Vo=4,Np=5,Op=6;var xh=300,Nr=301,Or=302,dl=303,fl=304,Wo=306,Ai=1e3,Nt=1001,pl=1002,nn=1003,Wc=1004;var Aa=1005;var vn=1006,Fp=1007;var cs=1008;var wi=1009,kp=1010,zp=1011,ic=1012,_h=1013,bi=1014,Mi=1015,Ki=1016,yh=1017,vh=1018,Xi=1020,Bp=1021,Un=1023,Gp=1024,Hp=1025,qi=1026,Fr=1027,Vp=1028,bh=1029,Wp=1030,Mh=1031,Sh=1033,Ca=33776,Ra=33777,Pa=33778,Ia=33779,Xc=35840,qc=35841,Yc=35842,Kc=35843,wh=36196,Zc=37492,$c=37496,Jc=37808,jc=37809,Qc=37810,eu=37811,tu=37812,nu=37813,iu=37814,ru=37815,su=37816,ou=37817,au=37818,lu=37819,cu=37820,uu=37821,La=36492,hu=36494,du=36495,Xp=36283,fu=36284,pu=36285,mu=36286;var po=2300,mo=2301,Da=2302,gu=2400,xu=2401,_u=2402;var Eh=3e3,Yi=3001,qp=3200,Yp=3201,rc=0,Kp=1,bn="",pt="srgb",ci="srgb-linear",sc="display-p3",Xo="display-p3-linear",go="linear",bt="srgb",xo="rec709",_o="p3";var lr=7680,Th=7681;var Ah=517;var yu=519,Zp=512,$p=513,Jp=514,Ch=515,jp=516,Qp=517,em=518,tm=519,ml=35044;var vu="300 es",gl=1035,ai=2e3,yo=2001,Ci=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let i=this._listeners[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},qt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ua=Math.PI/180,xl=180/Math.PI;function li(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(qt[n&255]+qt[n>>8&255]+qt[n>>16&255]+qt[n>>24&255]+"-"+qt[e&255]+qt[e>>8&255]+"-"+qt[e>>16&15|64]+qt[e>>24&255]+"-"+qt[t&63|128]+qt[t>>8&255]+"-"+qt[t>>16&255]+qt[t>>24&255]+qt[i&255]+qt[i>>8&255]+qt[i>>16&255]+qt[i>>24&255]).toLowerCase()}function Vt(n,e,t){return Math.max(e,Math.min(t,n))}function nm(n,e){return(n%e+e)%e}function Na(n,e,t){return(1-t)*n+t*e}function bu(n){return(n&n-1)===0&&n!==0}function _l(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function oi(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function mt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var ie=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Vt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},rt=class n{constructor(e,t,i,r,s,o,a,l,u){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,u)}set(e,t,i,r,s,o,a,l,u){let c=this.elements;return c[0]=e,c[1]=r,c[2]=a,c[3]=t,c[4]=s,c[5]=l,c[6]=i,c[7]=o,c[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],l=i[6],u=i[1],c=i[4],h=i[7],f=i[2],d=i[5],g=i[8],x=r[0],p=r[3],m=r[6],y=r[1],_=r[4],b=r[7],E=r[2],S=r[5],T=r[8];return s[0]=o*x+a*y+l*E,s[3]=o*p+a*_+l*S,s[6]=o*m+a*b+l*T,s[1]=u*x+c*y+h*E,s[4]=u*p+c*_+h*S,s[7]=u*m+c*b+h*T,s[2]=f*x+d*y+g*E,s[5]=f*p+d*_+g*S,s[8]=f*m+d*b+g*T,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],u=e[7],c=e[8];return t*o*c-t*a*u-i*s*c+i*a*l+r*s*u-r*o*l}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],u=e[7],c=e[8],h=c*o-a*u,f=a*l-c*s,d=u*s-o*l,g=t*h+i*f+r*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=h*x,e[1]=(r*u-c*i)*x,e[2]=(a*i-r*o)*x,e[3]=f*x,e[4]=(c*t-r*l)*x,e[5]=(r*s-a*t)*x,e[6]=d*x,e[7]=(i*l-u*t)*x,e[8]=(o*t-i*s)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){let l=Math.cos(s),u=Math.sin(s);return this.set(i*l,i*u,-i*(l*o+u*a)+o+e,-r*u,r*l,-r*(-u*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Oa.makeScale(e,t)),this}rotate(e){return this.premultiply(Oa.makeRotation(-e)),this}translate(e,t){return this.premultiply(Oa.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Oa=new rt;function Rh(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function vo(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function im(){let n=vo("canvas");return n.style.display="block",n}var Mu={};function ss(n){n in Mu||(Mu[n]=!0,console.warn(n))}var Su=new rt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),wu=new rt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Os={[ci]:{transfer:go,primaries:xo,toReference:n=>n,fromReference:n=>n},[pt]:{transfer:bt,primaries:xo,toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[Xo]:{transfer:go,primaries:_o,toReference:n=>n.applyMatrix3(wu),fromReference:n=>n.applyMatrix3(Su)},[sc]:{transfer:bt,primaries:_o,toReference:n=>n.convertSRGBToLinear().applyMatrix3(wu),fromReference:n=>n.applyMatrix3(Su).convertLinearToSRGB()}},rm=new Set([ci,Xo]),ft={enabled:!0,_workingColorSpace:ci,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!rm.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,e,t){if(this.enabled===!1||e===t||!e||!t)return n;let i=Os[e].toReference,r=Os[t].fromReference;return r(i(n))},fromWorkingColorSpace:function(n,e){return this.convert(n,this._workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this._workingColorSpace)},getPrimaries:function(n){return Os[n].primaries},getTransfer:function(n){return n===bn?go:Os[n].transfer}};function Dr(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Fa(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var cr,bo=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{cr===void 0&&(cr=vo("canvas")),cr.width=e.width,cr.height=e.height;let i=cr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=cr}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=vo("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=Dr(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Dr(t[i]/255)*255):t[i]=Dr(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},sm=0,Mo=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:sm++}),this.uuid=li(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(ka(r[o].image)):s.push(ka(r[o]))}else s=ka(r);i.url=s}return t||(e.images[this.uuid]=i),i}};function ka(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?bo.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var om=0,Mn=class n extends Ci{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Nt,r=Nt,s=vn,o=cs,a=Un,l=wi,u=n.DEFAULT_ANISOTROPY,c=bn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:om++}),this.uuid=li(),this.name="",this.source=new Mo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=u,this.format=a,this.internalFormat=null,this.type=l,this.offset=new ie(0,0),this.repeat=new ie(1,1),this.center=new ie(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new rt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof c=="string"?this.colorSpace=c:(ss("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=c===Yi?pt:bn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==xh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ai:e.x=e.x-Math.floor(e.x);break;case Nt:e.x=e.x<0?0:1;break;case pl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ai:e.y=e.y-Math.floor(e.y);break;case Nt:e.y=e.y<0?0:1;break;case pl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return ss("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===pt?Yi:Eh}set encoding(e){ss("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===Yi?pt:bn}};Mn.DEFAULT_IMAGE=null;Mn.DEFAULT_MAPPING=xh;Mn.DEFAULT_ANISOTROPY=1;var wt=class n{constructor(e=0,t=0,i=0,r=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s,l=e.elements,u=l[0],c=l[4],h=l[8],f=l[1],d=l[5],g=l[9],x=l[2],p=l[6],m=l[10];if(Math.abs(c-f)<.01&&Math.abs(h-x)<.01&&Math.abs(g-p)<.01){if(Math.abs(c+f)<.1&&Math.abs(h+x)<.1&&Math.abs(g+p)<.1&&Math.abs(u+d+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let _=(u+1)/2,b=(d+1)/2,E=(m+1)/2,S=(c+f)/4,T=(h+x)/4,R=(g+p)/4;return _>b&&_>E?_<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(_),r=S/i,s=T/i):b>E?b<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(b),i=S/r,s=R/r):E<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(E),i=T/s,r=R/s),this.set(i,r,s,t),this}let y=Math.sqrt((p-g)*(p-g)+(h-x)*(h-x)+(f-c)*(f-c));return Math.abs(y)<.001&&(y=1),this.x=(p-g)/y,this.y=(h-x)/y,this.z=(f-c)/y,this.w=Math.acos((u+d+m-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},yl=class extends Ci{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new wt(0,0,e,t),this.scissorTest=!1,this.viewport=new wt(0,0,e,t);let r={width:e,height:t,depth:1};i.encoding!==void 0&&(ss("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),i.colorSpace=i.encoding===Yi?pt:bn),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:vn,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},i),this.texture=new Mn(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=i.generateMipmaps,this.texture.internalFormat=i.internalFormat,this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}setSize(e,t,i=1){(this.width!==e||this.height!==t||this.depth!==i)&&(this.width=e,this.height=t,this.depth=i,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=i,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new Mo(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},rn=class extends yl{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},So=class extends Mn{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=nn,this.minFilter=nn,this.wrapR=Nt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var vl=class extends Mn{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=nn,this.minFilter=nn,this.wrapR=Nt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ri=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let l=i[r+0],u=i[r+1],c=i[r+2],h=i[r+3],f=s[o+0],d=s[o+1],g=s[o+2],x=s[o+3];if(a===0){e[t+0]=l,e[t+1]=u,e[t+2]=c,e[t+3]=h;return}if(a===1){e[t+0]=f,e[t+1]=d,e[t+2]=g,e[t+3]=x;return}if(h!==x||l!==f||u!==d||c!==g){let p=1-a,m=l*f+u*d+c*g+h*x,y=m>=0?1:-1,_=1-m*m;if(_>Number.EPSILON){let E=Math.sqrt(_),S=Math.atan2(E,m*y);p=Math.sin(p*S)/E,a=Math.sin(a*S)/E}let b=a*y;if(l=l*p+f*b,u=u*p+d*b,c=c*p+g*b,h=h*p+x*b,p===1-a){let E=1/Math.sqrt(l*l+u*u+c*c+h*h);l*=E,u*=E,c*=E,h*=E}}e[t]=l,e[t+1]=u,e[t+2]=c,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,r,s,o){let a=i[r],l=i[r+1],u=i[r+2],c=i[r+3],h=s[o],f=s[o+1],d=s[o+2],g=s[o+3];return e[t]=a*g+c*h+l*d-u*f,e[t+1]=l*g+c*f+u*h-a*d,e[t+2]=u*g+c*d+a*f-l*h,e[t+3]=c*g-a*h-l*f-u*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,u=a(i/2),c=a(r/2),h=a(s/2),f=l(i/2),d=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=f*c*h+u*d*g,this._y=u*d*h-f*c*g,this._z=u*c*g+f*d*h,this._w=u*c*h-f*d*g;break;case"YXZ":this._x=f*c*h+u*d*g,this._y=u*d*h-f*c*g,this._z=u*c*g-f*d*h,this._w=u*c*h+f*d*g;break;case"ZXY":this._x=f*c*h-u*d*g,this._y=u*d*h+f*c*g,this._z=u*c*g+f*d*h,this._w=u*c*h-f*d*g;break;case"ZYX":this._x=f*c*h-u*d*g,this._y=u*d*h+f*c*g,this._z=u*c*g-f*d*h,this._w=u*c*h+f*d*g;break;case"YZX":this._x=f*c*h+u*d*g,this._y=u*d*h+f*c*g,this._z=u*c*g-f*d*h,this._w=u*c*h-f*d*g;break;case"XZY":this._x=f*c*h-u*d*g,this._y=u*d*h-f*c*g,this._z=u*c*g+f*d*h,this._w=u*c*h+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],u=t[2],c=t[6],h=t[10],f=i+a+h;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(c-l)*d,this._y=(s-u)*d,this._z=(o-r)*d}else if(i>a&&i>h){let d=2*Math.sqrt(1+i-a-h);this._w=(c-l)/d,this._x=.25*d,this._y=(r+o)/d,this._z=(s+u)/d}else if(a>h){let d=2*Math.sqrt(1+a-i-h);this._w=(s-u)/d,this._x=(r+o)/d,this._y=.25*d,this._z=(l+c)/d}else{let d=2*Math.sqrt(1+h-i-a);this._w=(o-r)/d,this._x=(s+u)/d,this._y=(l+c)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Vt(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,u=t._z,c=t._w;return this._x=i*c+o*a+r*u-s*l,this._y=r*c+o*l+s*a-i*u,this._z=s*c+o*u+i*l-r*a,this._w=o*c-i*a-r*l-s*u,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let d=1-t;return this._w=d*o+t*this._w,this._x=d*i+t*this._x,this._y=d*r+t*this._y,this._z=d*s+t*this._z,this.normalize(),this}let u=Math.sqrt(l),c=Math.atan2(u,a),h=Math.sin((1-t)*c)/u,f=Math.sin(t*c)/u;return this._w=o*h+this._w*f,this._x=i*h+this._x*f,this._y=r*h+this._y*f,this._z=s*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=Math.random(),t=Math.sqrt(1-e),i=Math.sqrt(e),r=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(r),i*Math.sin(s),i*Math.cos(s),t*Math.sin(r))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Eu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Eu.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,u=2*(o*r-a*i),c=2*(a*t-s*r),h=2*(s*i-o*t);return this.x=t+l*u+o*h-a*c,this.y=i+l*c+a*u-s*h,this.z=r+l*h+s*c-o*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return za.copy(this).projectOnVector(e),this.sub(za)}reflect(e){return this.sub(za.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Vt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,i=Math.sqrt(1-e**2);return this.x=i*Math.cos(t),this.y=i*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},za=new P,Eu=new Ri,On=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(In.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(In.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=In.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,In):In.fromBufferAttribute(s,o),In.applyMatrix4(e.matrixWorld),this.expandByPoint(In);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Fs.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Fs.copy(i.boundingBox)),Fs.applyMatrix4(e.matrixWorld),this.union(Fs)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,In),In.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Zr),ks.subVectors(this.max,Zr),ur.subVectors(e.a,Zr),hr.subVectors(e.b,Zr),dr.subVectors(e.c,Zr),gi.subVectors(hr,ur),xi.subVectors(dr,hr),Fi.subVectors(ur,dr);let t=[0,-gi.z,gi.y,0,-xi.z,xi.y,0,-Fi.z,Fi.y,gi.z,0,-gi.x,xi.z,0,-xi.x,Fi.z,0,-Fi.x,-gi.y,gi.x,0,-xi.y,xi.x,0,-Fi.y,Fi.x,0];return!Ba(t,ur,hr,dr,ks)||(t=[1,0,0,0,1,0,0,0,1],!Ba(t,ur,hr,dr,ks))?!1:(zs.crossVectors(gi,xi),t=[zs.x,zs.y,zs.z],Ba(t,ur,hr,dr,ks))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,In).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(In).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Qn=[new P,new P,new P,new P,new P,new P,new P,new P],In=new P,Fs=new On,ur=new P,hr=new P,dr=new P,gi=new P,xi=new P,Fi=new P,Zr=new P,ks=new P,zs=new P,ki=new P;function Ba(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){ki.fromArray(n,s);let a=r.x*Math.abs(ki.x)+r.y*Math.abs(ki.y)+r.z*Math.abs(ki.z),l=e.dot(ki),u=t.dot(ki),c=i.dot(ki);if(Math.max(-Math.max(l,u,c),Math.min(l,u,c))>a)return!1}return!0}var am=new On,$r=new P,Ga=new P,Zi=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):am.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;$r.subVectors(e,this.center);let t=$r.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector($r,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ga.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint($r.copy(e.center).add(Ga)),this.expandByPoint($r.copy(e.center).sub(Ga))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},ei=new P,Ha=new P,Bs=new P,_i=new P,Va=new P,Gs=new P,Wa=new P,bl=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ei)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ei.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ei.copy(this.origin).addScaledVector(this.direction,t),ei.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){Ha.copy(e).add(t).multiplyScalar(.5),Bs.copy(t).sub(e).normalize(),_i.copy(this.origin).sub(Ha);let s=e.distanceTo(t)*.5,o=-this.direction.dot(Bs),a=_i.dot(this.direction),l=-_i.dot(Bs),u=_i.lengthSq(),c=Math.abs(1-o*o),h,f,d,g;if(c>0)if(h=o*l-a,f=o*a-l,g=s*c,h>=0)if(f>=-g)if(f<=g){let x=1/c;h*=x,f*=x,d=h*(h+o*f+2*a)+f*(o*h+f+2*l)+u}else f=s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+u;else f=-s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+u;else f<=-g?(h=Math.max(0,-(-o*s+a)),f=h>0?-s:Math.min(Math.max(-s,-l),s),d=-h*h+f*(f+2*l)+u):f<=g?(h=0,f=Math.min(Math.max(-s,-l),s),d=f*(f+2*l)+u):(h=Math.max(0,-(o*s+a)),f=h>0?s:Math.min(Math.max(-s,-l),s),d=-h*h+f*(f+2*l)+u);else f=o>0?-s:s,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+u;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Ha).addScaledVector(Bs,f),d}intersectSphere(e,t){ei.subVectors(e.center,this.origin);let i=ei.dot(this.direction),r=ei.dot(ei)-i*i,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,l,u=1/this.direction.x,c=1/this.direction.y,h=1/this.direction.z,f=this.origin;return u>=0?(i=(e.min.x-f.x)*u,r=(e.max.x-f.x)*u):(i=(e.max.x-f.x)*u,r=(e.min.x-f.x)*u),c>=0?(s=(e.min.y-f.y)*c,o=(e.max.y-f.y)*c):(s=(e.max.y-f.y)*c,o=(e.min.y-f.y)*c),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(a=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,ei)!==null}intersectTriangle(e,t,i,r,s){Va.subVectors(t,e),Gs.subVectors(i,e),Wa.crossVectors(Va,Gs);let o=this.direction.dot(Wa),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;_i.subVectors(this.origin,e);let l=a*this.direction.dot(Gs.crossVectors(_i,Gs));if(l<0)return null;let u=a*this.direction.dot(Va.cross(_i));if(u<0||l+u>o)return null;let c=-a*_i.dot(Wa);return c<0?null:this.at(c/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},vt=class n{constructor(e,t,i,r,s,o,a,l,u,c,h,f,d,g,x,p){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,u,c,h,f,d,g,x,p)}set(e,t,i,r,s,o,a,l,u,c,h,f,d,g,x,p){let m=this.elements;return m[0]=e,m[4]=t,m[8]=i,m[12]=r,m[1]=s,m[5]=o,m[9]=a,m[13]=l,m[2]=u,m[6]=c,m[10]=h,m[14]=f,m[3]=d,m[7]=g,m[11]=x,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,r=1/fr.setFromMatrixColumn(e,0).length(),s=1/fr.setFromMatrixColumn(e,1).length(),o=1/fr.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),u=Math.sin(r),c=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let f=o*c,d=o*h,g=a*c,x=a*h;t[0]=l*c,t[4]=-l*h,t[8]=u,t[1]=d+g*u,t[5]=f-x*u,t[9]=-a*l,t[2]=x-f*u,t[6]=g+d*u,t[10]=o*l}else if(e.order==="YXZ"){let f=l*c,d=l*h,g=u*c,x=u*h;t[0]=f+x*a,t[4]=g*a-d,t[8]=o*u,t[1]=o*h,t[5]=o*c,t[9]=-a,t[2]=d*a-g,t[6]=x+f*a,t[10]=o*l}else if(e.order==="ZXY"){let f=l*c,d=l*h,g=u*c,x=u*h;t[0]=f-x*a,t[4]=-o*h,t[8]=g+d*a,t[1]=d+g*a,t[5]=o*c,t[9]=x-f*a,t[2]=-o*u,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let f=o*c,d=o*h,g=a*c,x=a*h;t[0]=l*c,t[4]=g*u-d,t[8]=f*u+x,t[1]=l*h,t[5]=x*u+f,t[9]=d*u-g,t[2]=-u,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let f=o*l,d=o*u,g=a*l,x=a*u;t[0]=l*c,t[4]=x-f*h,t[8]=g*h+d,t[1]=h,t[5]=o*c,t[9]=-a*c,t[2]=-u*c,t[6]=d*h+g,t[10]=f-x*h}else if(e.order==="XZY"){let f=o*l,d=o*u,g=a*l,x=a*u;t[0]=l*c,t[4]=-h,t[8]=u*c,t[1]=f*h+x,t[5]=o*c,t[9]=d*h-g,t[2]=g*h-d,t[6]=a*c,t[10]=x*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(lm,e,cm)}lookAt(e,t,i){let r=this.elements;return fn.subVectors(e,t),fn.lengthSq()===0&&(fn.z=1),fn.normalize(),yi.crossVectors(i,fn),yi.lengthSq()===0&&(Math.abs(i.z)===1?fn.x+=1e-4:fn.z+=1e-4,fn.normalize(),yi.crossVectors(i,fn)),yi.normalize(),Hs.crossVectors(fn,yi),r[0]=yi.x,r[4]=Hs.x,r[8]=fn.x,r[1]=yi.y,r[5]=Hs.y,r[9]=fn.y,r[2]=yi.z,r[6]=Hs.z,r[10]=fn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],l=i[8],u=i[12],c=i[1],h=i[5],f=i[9],d=i[13],g=i[2],x=i[6],p=i[10],m=i[14],y=i[3],_=i[7],b=i[11],E=i[15],S=r[0],T=r[4],R=r[8],v=r[12],M=r[1],L=r[5],z=r[9],V=r[13],I=r[2],O=r[6],X=r[10],N=r[14],H=r[3],G=r[7],K=r[11],ee=r[15];return s[0]=o*S+a*M+l*I+u*H,s[4]=o*T+a*L+l*O+u*G,s[8]=o*R+a*z+l*X+u*K,s[12]=o*v+a*V+l*N+u*ee,s[1]=c*S+h*M+f*I+d*H,s[5]=c*T+h*L+f*O+d*G,s[9]=c*R+h*z+f*X+d*K,s[13]=c*v+h*V+f*N+d*ee,s[2]=g*S+x*M+p*I+m*H,s[6]=g*T+x*L+p*O+m*G,s[10]=g*R+x*z+p*X+m*K,s[14]=g*v+x*V+p*N+m*ee,s[3]=y*S+_*M+b*I+E*H,s[7]=y*T+_*L+b*O+E*G,s[11]=y*R+_*z+b*X+E*K,s[15]=y*v+_*V+b*N+E*ee,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],u=e[13],c=e[2],h=e[6],f=e[10],d=e[14],g=e[3],x=e[7],p=e[11],m=e[15];return g*(+s*l*h-r*u*h-s*a*f+i*u*f+r*a*d-i*l*d)+x*(+t*l*d-t*u*f+s*o*f-r*o*d+r*u*c-s*l*c)+p*(+t*u*h-t*a*d-s*o*h+i*o*d+s*a*c-i*u*c)+m*(-r*a*c-t*l*h+t*a*f+r*o*h-i*o*f+i*l*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],u=e[7],c=e[8],h=e[9],f=e[10],d=e[11],g=e[12],x=e[13],p=e[14],m=e[15],y=h*p*u-x*f*u+x*l*d-a*p*d-h*l*m+a*f*m,_=g*f*u-c*p*u-g*l*d+o*p*d+c*l*m-o*f*m,b=c*x*u-g*h*u+g*a*d-o*x*d-c*a*m+o*h*m,E=g*h*l-c*x*l-g*a*f+o*x*f+c*a*p-o*h*p,S=t*y+i*_+r*b+s*E;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let T=1/S;return e[0]=y*T,e[1]=(x*f*s-h*p*s-x*r*d+i*p*d+h*r*m-i*f*m)*T,e[2]=(a*p*s-x*l*s+x*r*u-i*p*u-a*r*m+i*l*m)*T,e[3]=(h*l*s-a*f*s-h*r*u+i*f*u+a*r*d-i*l*d)*T,e[4]=_*T,e[5]=(c*p*s-g*f*s+g*r*d-t*p*d-c*r*m+t*f*m)*T,e[6]=(g*l*s-o*p*s-g*r*u+t*p*u+o*r*m-t*l*m)*T,e[7]=(o*f*s-c*l*s+c*r*u-t*f*u-o*r*d+t*l*d)*T,e[8]=b*T,e[9]=(g*h*s-c*x*s-g*i*d+t*x*d+c*i*m-t*h*m)*T,e[10]=(o*x*s-g*a*s+g*i*u-t*x*u-o*i*m+t*a*m)*T,e[11]=(c*a*s-o*h*s-c*i*u+t*h*u+o*i*d-t*a*d)*T,e[12]=E*T,e[13]=(c*x*r-g*h*r+g*i*f-t*x*f-c*i*p+t*h*p)*T,e[14]=(g*a*r-o*x*r-g*i*l+t*x*l+o*i*p-t*a*p)*T,e[15]=(o*h*r-c*a*r+c*i*l-t*h*l-o*i*f+t*a*f)*T,this}scale(e){let t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,l=e.z,u=s*o,c=s*a;return this.set(u*o+i,u*a-r*l,u*l+r*a,0,u*a+r*l,c*a+i,c*l-r*o,0,u*l-r*a,c*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,u=s+s,c=o+o,h=a+a,f=s*u,d=s*c,g=s*h,x=o*c,p=o*h,m=a*h,y=l*u,_=l*c,b=l*h,E=i.x,S=i.y,T=i.z;return r[0]=(1-(x+m))*E,r[1]=(d+b)*E,r[2]=(g-_)*E,r[3]=0,r[4]=(d-b)*S,r[5]=(1-(f+m))*S,r[6]=(p+y)*S,r[7]=0,r[8]=(g+_)*T,r[9]=(p-y)*T,r[10]=(1-(f+x))*T,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){let r=this.elements,s=fr.set(r[0],r[1],r[2]).length(),o=fr.set(r[4],r[5],r[6]).length(),a=fr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Ln.copy(this);let u=1/s,c=1/o,h=1/a;return Ln.elements[0]*=u,Ln.elements[1]*=u,Ln.elements[2]*=u,Ln.elements[4]*=c,Ln.elements[5]*=c,Ln.elements[6]*=c,Ln.elements[8]*=h,Ln.elements[9]*=h,Ln.elements[10]*=h,t.setFromRotationMatrix(Ln),i.x=s,i.y=o,i.z=a,this}makePerspective(e,t,i,r,s,o,a=ai){let l=this.elements,u=2*s/(t-e),c=2*s/(i-r),h=(t+e)/(t-e),f=(i+r)/(i-r),d,g;if(a===ai)d=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===yo)d=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=c,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=ai){let l=this.elements,u=1/(t-e),c=1/(i-r),h=1/(o-s),f=(t+e)*u,d=(i+r)*c,g,x;if(a===ai)g=(o+s)*h,x=-2*h;else if(a===yo)g=s*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*u,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*c,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=x,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},fr=new P,Ln=new vt,lm=new P(0,0,0),cm=new P(1,1,1),yi=new P,Hs=new P,fn=new P,Tu=new vt,Au=new Ri,wo=class n{constructor(e=0,t=0,i=0,r=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],u=r[5],c=r[9],h=r[2],f=r[6],d=r[10];switch(t){case"XYZ":this._y=Math.asin(Vt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-c,d),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(f,u),this._z=0);break;case"YXZ":this._x=Math.asin(-Vt(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(Vt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-o,u)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Vt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,u));break;case"YZX":this._z=Math.asin(Vt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-c,u),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-Vt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,u),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-c,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Tu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Tu,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Au.setFromEuler(this),this.setFromQuaternion(Au,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};wo.DEFAULT_ORDER="XYZ";var Eo=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},um=0,Cu=new P,pr=new Ri,ti=new vt,Vs=new P,Jr=new P,hm=new P,dm=new Ri,Ru=new P(1,0,0),Pu=new P(0,1,0),Iu=new P(0,0,1),fm={type:"added"},pm={type:"removed"},Zt=class n extends Ci{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:um++}),this.uuid=li(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new P,t=new wo,i=new Ri,r=new P(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new vt},normalMatrix:{value:new rt}}),this.matrix=new vt,this.matrixWorld=new vt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Eo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return pr.setFromAxisAngle(e,t),this.quaternion.multiply(pr),this}rotateOnWorldAxis(e,t){return pr.setFromAxisAngle(e,t),this.quaternion.premultiply(pr),this}rotateX(e){return this.rotateOnAxis(Ru,e)}rotateY(e){return this.rotateOnAxis(Pu,e)}rotateZ(e){return this.rotateOnAxis(Iu,e)}translateOnAxis(e,t){return Cu.copy(e).applyQuaternion(this.quaternion),this.position.add(Cu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ru,e)}translateY(e){return this.translateOnAxis(Pu,e)}translateZ(e){return this.translateOnAxis(Iu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ti.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Vs.copy(e):Vs.set(e,t,i);let r=this.parent;this.updateWorldMatrix(!0,!1),Jr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ti.lookAt(Jr,Vs,this.up):ti.lookAt(Vs,Jr,this.up),this.quaternion.setFromRotationMatrix(ti),r&&(ti.extractRotation(r.matrixWorld),pr.setFromRotationMatrix(ti),this.quaternion.premultiply(pr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(fm)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(pm)),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ti.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ti.multiply(e.parent.matrixWorld)),e.applyMatrix4(ti),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Jr,e,hm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Jr,dm,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,r=t.length;i<r;i++){let s=t[i];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.matrixWorldAutoUpdate===!0&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++){let a=r[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let u=0,c=l.length;u<c;u++){let h=l[u];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,u=this.material.length;l<u;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),u=o(e.textures),c=o(e.images),h=o(e.shapes),f=o(e.skeletons),d=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),u.length>0&&(i.textures=u),c.length>0&&(i.images=c),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),d.length>0&&(i.animations=d),g.length>0&&(i.nodes=g)}return i.object=r,i;function o(a){let l=[];for(let u in a){let c=a[u];delete c.metadata,l.push(c)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}};Zt.DEFAULT_UP=new P(0,1,0);Zt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Zt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Dn=new P,ni=new P,Xa=new P,ii=new P,mr=new P,gr=new P,Lu=new P,qa=new P,Ya=new P,Ka=new P,Ws=!1,Wi=class n{constructor(e=new P,t=new P,i=new P){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Dn.subVectors(e,t),r.cross(Dn);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){Dn.subVectors(r,t),ni.subVectors(i,t),Xa.subVectors(e,t);let o=Dn.dot(Dn),a=Dn.dot(ni),l=Dn.dot(Xa),u=ni.dot(ni),c=ni.dot(Xa),h=o*u-a*a;if(h===0)return s.set(0,0,0),null;let f=1/h,d=(u*l-a*c)*f,g=(o*c-a*l)*f;return s.set(1-d-g,g,d)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,ii)===null?!1:ii.x>=0&&ii.y>=0&&ii.x+ii.y<=1}static getUV(e,t,i,r,s,o,a,l){return Ws===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Ws=!0),this.getInterpolation(e,t,i,r,s,o,a,l)}static getInterpolation(e,t,i,r,s,o,a,l){return this.getBarycoord(e,t,i,r,ii)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,ii.x),l.addScaledVector(o,ii.y),l.addScaledVector(a,ii.z),l)}static isFrontFacing(e,t,i,r){return Dn.subVectors(i,t),ni.subVectors(e,t),Dn.cross(ni).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Dn.subVectors(this.c,this.b),ni.subVectors(this.a,this.b),Dn.cross(ni).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,i,r,s){return Ws===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Ws=!0),n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}getInterpolation(e,t,i,r,s){return n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,r=this.b,s=this.c,o,a;mr.subVectors(r,i),gr.subVectors(s,i),qa.subVectors(e,i);let l=mr.dot(qa),u=gr.dot(qa);if(l<=0&&u<=0)return t.copy(i);Ya.subVectors(e,r);let c=mr.dot(Ya),h=gr.dot(Ya);if(c>=0&&h<=c)return t.copy(r);let f=l*h-c*u;if(f<=0&&l>=0&&c<=0)return o=l/(l-c),t.copy(i).addScaledVector(mr,o);Ka.subVectors(e,s);let d=mr.dot(Ka),g=gr.dot(Ka);if(g>=0&&d<=g)return t.copy(s);let x=d*u-l*g;if(x<=0&&u>=0&&g<=0)return a=u/(u-g),t.copy(i).addScaledVector(gr,a);let p=c*g-d*h;if(p<=0&&h-c>=0&&d-g>=0)return Lu.subVectors(s,r),a=(h-c)/(h-c+(d-g)),t.copy(r).addScaledVector(Lu,a);let m=1/(p+x+f);return o=x*m,a=f*m,t.copy(i).addScaledVector(mr,o).addScaledVector(gr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Ph={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},vi={h:0,s:0,l:0},Xs={h:0,s:0,l:0};function Za(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var qe=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=pt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ft.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=ft.workingColorSpace){return this.r=e,this.g=t,this.b=i,ft.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=ft.workingColorSpace){if(e=nm(e,1),t=Vt(t,0,1),i=Vt(i,0,1),t===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=Za(o,s,e+1/3),this.g=Za(o,s,e),this.b=Za(o,s,e-1/3)}return ft.toWorkingColorSpace(this,r),this}setStyle(e,t=pt){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=pt){let i=Ph[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Dr(e.r),this.g=Dr(e.g),this.b=Dr(e.b),this}copyLinearToSRGB(e){return this.r=Fa(e.r),this.g=Fa(e.g),this.b=Fa(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=pt){return ft.fromWorkingColorSpace(Yt.copy(this),e),Math.round(Vt(Yt.r*255,0,255))*65536+Math.round(Vt(Yt.g*255,0,255))*256+Math.round(Vt(Yt.b*255,0,255))}getHexString(e=pt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ft.workingColorSpace){ft.fromWorkingColorSpace(Yt.copy(this),t);let i=Yt.r,r=Yt.g,s=Yt.b,o=Math.max(i,r,s),a=Math.min(i,r,s),l,u,c=(a+o)/2;if(a===o)l=0,u=0;else{let h=o-a;switch(u=c<=.5?h/(o+a):h/(2-o-a),o){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=u,e.l=c,e}getRGB(e,t=ft.workingColorSpace){return ft.fromWorkingColorSpace(Yt.copy(this),t),e.r=Yt.r,e.g=Yt.g,e.b=Yt.b,e}getStyle(e=pt){ft.fromWorkingColorSpace(Yt.copy(this),e);let t=Yt.r,i=Yt.g,r=Yt.b;return e!==pt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(vi),this.setHSL(vi.h+e,vi.s+t,vi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(vi),e.getHSL(Xs);let i=Na(vi.h,Xs.h,t),r=Na(vi.s,Xs.s,t),s=Na(vi.l,Xs.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Yt=new qe;qe.NAMES=Ph;var mm=0,ui=class extends Ci{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:mm++}),this.uuid=li(),this.name="",this.type="Material",this.blending=Lr,this.side=Ti,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ul,this.blendDst=hl,this.blendEquation=Hi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new qe(0,0,0),this.blendAlpha=0,this.depthFunc=fo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=yu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=lr,this.stencilZFail=lr,this.stencilZPass=lr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Lr&&(i.blending=this.blending),this.side!==Ti&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==ul&&(i.blendSrc=this.blendSrc),this.blendDst!==hl&&(i.blendDst=this.blendDst),this.blendEquation!==Hi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==fo&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==yu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==lr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==lr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==lr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},st=class extends ui{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new qe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=nc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var It=new P,qs=new ie,Kt=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=ml,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Mi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)qs.fromBufferAttribute(this,t),qs.applyMatrix3(e),this.setXY(t,qs.x,qs.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyMatrix3(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyMatrix4(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyNormalMatrix(e),this.setXYZ(t,It.x,It.y,It.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.transformDirection(e),this.setXYZ(t,It.x,It.y,It.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=oi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=mt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=oi(t,this.array)),t}setX(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=oi(t,this.array)),t}setY(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=oi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=oi(t,this.array)),t}setW(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array),r=mt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array),r=mt(r,this.array),s=mt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ml&&(e.usage=this.usage),e}};var To=class extends Kt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var Ao=class extends Kt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var $e=class extends Kt{constructor(e,t,i){super(new Float32Array(e),t,i)}};var gm=0,yn=new vt,$a=new Zt,xr=new P,pn=new On,jr=new On,Bt=new P,Rt=class n extends Ci{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:gm++}),this.uuid=li(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Rh(e)?Ao:To)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new rt().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return yn.makeRotationFromQuaternion(e),this.applyMatrix4(yn),this}rotateX(e){return yn.makeRotationX(e),this.applyMatrix4(yn),this}rotateY(e){return yn.makeRotationY(e),this.applyMatrix4(yn),this}rotateZ(e){return yn.makeRotationZ(e),this.applyMatrix4(yn),this}translate(e,t,i){return yn.makeTranslation(e,t,i),this.applyMatrix4(yn),this}scale(e,t,i){return yn.makeScale(e,t,i),this.applyMatrix4(yn),this}lookAt(e){return $a.lookAt(e),$a.updateMatrix(),this.applyMatrix4($a.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(xr).negate(),this.translate(xr.x,xr.y,xr.z),this}setFromPoints(e){let t=[];for(let i=0,r=e.length;i<r;i++){let s=e[i];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new $e(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new On);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){let s=t[i];pn.setFromBufferAttribute(s),this.morphTargetsRelative?(Bt.addVectors(this.boundingBox.min,pn.min),this.boundingBox.expandByPoint(Bt),Bt.addVectors(this.boundingBox.max,pn.max),this.boundingBox.expandByPoint(Bt)):(this.boundingBox.expandByPoint(pn.min),this.boundingBox.expandByPoint(pn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Zi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new P,1/0);return}if(e){let i=this.boundingSphere.center;if(pn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];jr.setFromBufferAttribute(a),this.morphTargetsRelative?(Bt.addVectors(pn.min,jr.min),pn.expandByPoint(Bt),Bt.addVectors(pn.max,jr.max),pn.expandByPoint(Bt)):(pn.expandByPoint(jr.min),pn.expandByPoint(jr.max))}pn.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)Bt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Bt));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let u=0,c=a.count;u<c;u++)Bt.fromBufferAttribute(a,u),l&&(xr.fromBufferAttribute(e,u),Bt.add(xr)),r=Math.max(r,i.distanceToSquared(Bt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.array,r=t.position.array,s=t.normal.array,o=t.uv.array,a=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Kt(new Float32Array(4*a),4));let l=this.getAttribute("tangent").array,u=[],c=[];for(let M=0;M<a;M++)u[M]=new P,c[M]=new P;let h=new P,f=new P,d=new P,g=new ie,x=new ie,p=new ie,m=new P,y=new P;function _(M,L,z){h.fromArray(r,M*3),f.fromArray(r,L*3),d.fromArray(r,z*3),g.fromArray(o,M*2),x.fromArray(o,L*2),p.fromArray(o,z*2),f.sub(h),d.sub(h),x.sub(g),p.sub(g);let V=1/(x.x*p.y-p.x*x.y);isFinite(V)&&(m.copy(f).multiplyScalar(p.y).addScaledVector(d,-x.y).multiplyScalar(V),y.copy(d).multiplyScalar(x.x).addScaledVector(f,-p.x).multiplyScalar(V),u[M].add(m),u[L].add(m),u[z].add(m),c[M].add(y),c[L].add(y),c[z].add(y))}let b=this.groups;b.length===0&&(b=[{start:0,count:i.length}]);for(let M=0,L=b.length;M<L;++M){let z=b[M],V=z.start,I=z.count;for(let O=V,X=V+I;O<X;O+=3)_(i[O+0],i[O+1],i[O+2])}let E=new P,S=new P,T=new P,R=new P;function v(M){T.fromArray(s,M*3),R.copy(T);let L=u[M];E.copy(L),E.sub(T.multiplyScalar(T.dot(L))).normalize(),S.crossVectors(R,L);let V=S.dot(c[M])<0?-1:1;l[M*4]=E.x,l[M*4+1]=E.y,l[M*4+2]=E.z,l[M*4+3]=V}for(let M=0,L=b.length;M<L;++M){let z=b[M],V=z.start,I=z.count;for(let O=V,X=V+I;O<X;O+=3)v(i[O+0]),v(i[O+1]),v(i[O+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Kt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,d=i.count;f<d;f++)i.setXYZ(f,0,0,0);let r=new P,s=new P,o=new P,a=new P,l=new P,u=new P,c=new P,h=new P;if(e)for(let f=0,d=e.count;f<d;f+=3){let g=e.getX(f+0),x=e.getX(f+1),p=e.getX(f+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,x),o.fromBufferAttribute(t,p),c.subVectors(o,s),h.subVectors(r,s),c.cross(h),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,x),u.fromBufferAttribute(i,p),a.add(c),l.add(c),u.add(c),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(p,u.x,u.y,u.z)}else for(let f=0,d=t.count;f<d;f+=3)r.fromBufferAttribute(t,f+0),s.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),c.subVectors(o,s),h.subVectors(r,s),c.cross(h),i.setXYZ(f+0,c.x,c.y,c.z),i.setXYZ(f+1,c.x,c.y,c.z),i.setXYZ(f+2,c.x,c.y,c.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Bt.fromBufferAttribute(e,t),Bt.normalize(),e.setXYZ(t,Bt.x,Bt.y,Bt.z)}toNonIndexed(){function e(a,l){let u=a.array,c=a.itemSize,h=a.normalized,f=new u.constructor(l.length*c),d=0,g=0;for(let x=0,p=l.length;x<p;x++){a.isInterleavedBufferAttribute?d=l[x]*a.data.stride+a.offset:d=l[x]*c;for(let m=0;m<c;m++)f[g++]=u[d++]}return new Kt(f,c,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,r=this.attributes;for(let a in r){let l=r[a],u=e(l,i);t.setAttribute(a,u)}let s=this.morphAttributes;for(let a in s){let l=[],u=s[a];for(let c=0,h=u.length;c<h;c++){let f=u[c],d=e(f,i);l.push(d)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let u=o[a];t.addGroup(u.start,u.count,u.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let u in l)l[u]!==void 0&&(e[u]=l[u]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let u=i[l];e.data.attributes[l]=u.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let u=this.morphAttributes[l],c=[];for(let h=0,f=u.length;h<f;h++){let d=u[h];c.push(d.toJSON(e.data))}c.length>0&&(r[l]=c,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone(t));let r=e.attributes;for(let u in r){let c=r[u];this.setAttribute(u,c.clone(t))}let s=e.morphAttributes;for(let u in s){let c=[],h=s[u];for(let f=0,d=h.length;f<d;f++)c.push(h[f].clone(t));this.morphAttributes[u]=c}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let u=0,c=o.length;u<c;u++){let h=o[u];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Du=new vt,zi=new bl,Ys=new Zi,Uu=new P,_r=new P,yr=new P,vr=new P,Ja=new P,Ks=new P,Zs=new ie,$s=new ie,Js=new ie,Nu=new P,Ou=new P,Fu=new P,js=new P,Qs=new P,se=class extends Zt{constructor(e=new Rt,t=new st){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){Ks.set(0,0,0);for(let l=0,u=s.length;l<u;l++){let c=a[l],h=s[l];c!==0&&(Ja.fromBufferAttribute(h,e),o?Ks.addScaledVector(Ja,c):Ks.addScaledVector(Ja.sub(t),c))}t.add(Ks)}return t}raycast(e,t){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ys.copy(i.boundingSphere),Ys.applyMatrix4(s),zi.copy(e.ray).recast(e.near),!(Ys.containsPoint(zi.origin)===!1&&(zi.intersectSphere(Ys,Uu)===null||zi.origin.distanceToSquared(Uu)>(e.far-e.near)**2))&&(Du.copy(s).invert(),zi.copy(e.ray).applyMatrix4(Du),!(i.boundingBox!==null&&zi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,zi)))}_computeIntersections(e,t,i){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,u=s.attributes.uv,c=s.attributes.uv1,h=s.attributes.normal,f=s.groups,d=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let p=f[g],m=o[p.materialIndex],y=Math.max(p.start,d.start),_=Math.min(a.count,Math.min(p.start+p.count,d.start+d.count));for(let b=y,E=_;b<E;b+=3){let S=a.getX(b),T=a.getX(b+1),R=a.getX(b+2);r=eo(this,m,e,i,u,c,h,S,T,R),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let g=Math.max(0,d.start),x=Math.min(a.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){let y=a.getX(p),_=a.getX(p+1),b=a.getX(p+2);r=eo(this,o,e,i,u,c,h,y,_,b),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let p=f[g],m=o[p.materialIndex],y=Math.max(p.start,d.start),_=Math.min(l.count,Math.min(p.start+p.count,d.start+d.count));for(let b=y,E=_;b<E;b+=3){let S=b,T=b+1,R=b+2;r=eo(this,m,e,i,u,c,h,S,T,R),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let g=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){let y=p,_=p+1,b=p+2;r=eo(this,o,e,i,u,c,h,y,_,b),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}}};function xm(n,e,t,i,r,s,o,a){let l;if(e.side===Lt?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===Ti,a),l===null)return null;Qs.copy(a),Qs.applyMatrix4(n.matrixWorld);let u=t.ray.origin.distanceTo(Qs);return u<t.near||u>t.far?null:{distance:u,point:Qs.clone(),object:n}}function eo(n,e,t,i,r,s,o,a,l,u){n.getVertexPosition(a,_r),n.getVertexPosition(l,yr),n.getVertexPosition(u,vr);let c=xm(n,e,t,i,_r,yr,vr,js);if(c){r&&(Zs.fromBufferAttribute(r,a),$s.fromBufferAttribute(r,l),Js.fromBufferAttribute(r,u),c.uv=Wi.getInterpolation(js,_r,yr,vr,Zs,$s,Js,new ie)),s&&(Zs.fromBufferAttribute(s,a),$s.fromBufferAttribute(s,l),Js.fromBufferAttribute(s,u),c.uv1=Wi.getInterpolation(js,_r,yr,vr,Zs,$s,Js,new ie),c.uv2=c.uv1),o&&(Nu.fromBufferAttribute(o,a),Ou.fromBufferAttribute(o,l),Fu.fromBufferAttribute(o,u),c.normal=Wi.getInterpolation(js,_r,yr,vr,Nu,Ou,Fu,new P),c.normal.dot(i.direction)>0&&c.normal.multiplyScalar(-1));let h={a,b:l,c:u,normal:new P,materialIndex:0};Wi.getNormal(_r,yr,vr,h.normal),c.face=h}return c}var sn=class n extends Rt{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],u=[],c=[],h=[],f=0,d=0;g("z","y","x",-1,-1,i,t,e,o,s,0),g("z","y","x",1,-1,i,t,-e,o,s,1),g("x","z","y",1,1,e,i,t,r,o,2),g("x","z","y",1,-1,e,i,-t,r,o,3),g("x","y","z",1,-1,e,t,i,r,s,4),g("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new $e(u,3)),this.setAttribute("normal",new $e(c,3)),this.setAttribute("uv",new $e(h,2));function g(x,p,m,y,_,b,E,S,T,R,v){let M=b/T,L=E/R,z=b/2,V=E/2,I=S/2,O=T+1,X=R+1,N=0,H=0,G=new P;for(let K=0;K<X;K++){let ee=K*L-V;for(let me=0;me<O;me++){let q=me*M-z;G[x]=q*y,G[p]=ee*_,G[m]=I,u.push(G.x,G.y,G.z),G[x]=0,G[p]=0,G[m]=S>0?1:-1,c.push(G.x,G.y,G.z),h.push(me/T),h.push(1-K/R),N+=1}}for(let K=0;K<R;K++)for(let ee=0;ee<T;ee++){let me=f+ee+O*K,q=f+ee+O*(K+1),oe=f+(ee+1)+O*(K+1),fe=f+(ee+1)+O*K;l.push(me,q,fe),l.push(q,oe,fe),H+=6}a.addGroup(d,H,v),d+=H,f+=N}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function kr(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function tn(n){let e={};for(let t=0;t<n.length;t++){let i=kr(n[t]);for(let r in i)e[r]=i[r]}return e}function _m(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Ih(n){return n.getRenderTarget()===null?n.outputColorSpace:ft.workingColorSpace}var ym={clone:kr,merge:tn},vm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,bm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,$t=class extends ui{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=vm,this.fragmentShader=bm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=kr(e.uniforms),this.uniformsGroups=_m(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},Co=class extends Zt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new vt,this.projectionMatrix=new vt,this.projectionMatrixInverse=new vt,this.coordinateSystem=ai}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},dn=class extends Co{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=xl*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ua*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return xl*2*Math.atan(Math.tan(Ua*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ua*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,u=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*i/u,r*=o.width/l,i*=o.height/u}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},br=-90,Mr=1,Ml=class extends Zt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new dn(br,Mr,e,t);r.layers=this.layers,this.add(r);let s=new dn(br,Mr,e,t);s.layers=this.layers,this.add(s);let o=new dn(br,Mr,e,t);o.layers=this.layers,this.add(o);let a=new dn(br,Mr,e,t);a.layers=this.layers,this.add(a);let l=new dn(br,Mr,e,t);l.layers=this.layers,this.add(l);let u=new dn(br,Mr,e,t);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,l]=t;for(let u of t)this.remove(u);if(e===ai)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===yo)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let u of t)this.add(u),u.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,u,c]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,l),e.setRenderTarget(i,4,r),e.render(t,u),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,r),e.render(t,c),e.setRenderTarget(h,f,d),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Ro=class extends Mn{constructor(e,t,i,r,s,o,a,l,u,c){e=e!==void 0?e:[],t=t!==void 0?t:Nr,super(e,t,i,r,s,o,a,l,u,c),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Sl=class extends rn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];t.encoding!==void 0&&(ss("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===Yi?pt:bn),this.texture=new Ro(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:vn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new sn(5,5,5),s=new $t({name:"CubemapFromEquirect",uniforms:kr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Lt,blending:Si});s.uniforms.tEquirect.value=t;let o=new se(r,s),a=t.minFilter;return t.minFilter===cs&&(t.minFilter=vn),new Ml(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,r){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}},ja=new P,Mm=new P,Sm=new rt,si=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=ja.subVectors(i,t).cross(Mm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(ja),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||Sm.getNormalMatrix(e),r=this.coplanarPoint(ja).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Bi=new Zi,to=new P,us=class{constructor(e=new si,t=new si,i=new si,r=new si,s=new si,o=new si){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=ai){let i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],u=r[4],c=r[5],h=r[6],f=r[7],d=r[8],g=r[9],x=r[10],p=r[11],m=r[12],y=r[13],_=r[14],b=r[15];if(i[0].setComponents(l-s,f-u,p-d,b-m).normalize(),i[1].setComponents(l+s,f+u,p+d,b+m).normalize(),i[2].setComponents(l+o,f+c,p+g,b+y).normalize(),i[3].setComponents(l-o,f-c,p-g,b-y).normalize(),i[4].setComponents(l-a,f-h,p-x,b-_).normalize(),t===ai)i[5].setComponents(l+a,f+h,p+x,b+_).normalize();else if(t===yo)i[5].setComponents(a,h,x,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Bi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Bi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Bi)}intersectsSprite(e){return Bi.center.set(0,0,0),Bi.radius=.7071067811865476,Bi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Bi)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(to.x=r.normal.x>0?e.max.x:e.min.x,to.y=r.normal.y>0?e.max.y:e.min.y,to.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(to)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Lh(){let n=null,e=!1,t=null,i=null;function r(s,o){t(s,o),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function wm(n,e){let t=e.isWebGL2,i=new WeakMap;function r(u,c){let h=u.array,f=u.usage,d=h.byteLength,g=n.createBuffer();n.bindBuffer(c,g),n.bufferData(c,h,f),u.onUploadCallback();let x;if(h instanceof Float32Array)x=n.FLOAT;else if(h instanceof Uint16Array)if(u.isFloat16BufferAttribute)if(t)x=n.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else x=n.UNSIGNED_SHORT;else if(h instanceof Int16Array)x=n.SHORT;else if(h instanceof Uint32Array)x=n.UNSIGNED_INT;else if(h instanceof Int32Array)x=n.INT;else if(h instanceof Int8Array)x=n.BYTE;else if(h instanceof Uint8Array)x=n.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)x=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:g,type:x,bytesPerElement:h.BYTES_PER_ELEMENT,version:u.version,size:d}}function s(u,c,h){let f=c.array,d=c._updateRange,g=c.updateRanges;if(n.bindBuffer(h,u),d.count===-1&&g.length===0&&n.bufferSubData(h,0,f),g.length!==0){for(let x=0,p=g.length;x<p;x++){let m=g[x];t?n.bufferSubData(h,m.start*f.BYTES_PER_ELEMENT,f,m.start,m.count):n.bufferSubData(h,m.start*f.BYTES_PER_ELEMENT,f.subarray(m.start,m.start+m.count))}c.clearUpdateRanges()}d.count!==-1&&(t?n.bufferSubData(h,d.offset*f.BYTES_PER_ELEMENT,f,d.offset,d.count):n.bufferSubData(h,d.offset*f.BYTES_PER_ELEMENT,f.subarray(d.offset,d.offset+d.count)),d.count=-1),c.onUploadCallback()}function o(u){return u.isInterleavedBufferAttribute&&(u=u.data),i.get(u)}function a(u){u.isInterleavedBufferAttribute&&(u=u.data);let c=i.get(u);c&&(n.deleteBuffer(c.buffer),i.delete(u))}function l(u,c){if(u.isGLBufferAttribute){let f=i.get(u);(!f||f.version<u.version)&&i.set(u,{buffer:u.buffer,type:u.type,bytesPerElement:u.elementSize,version:u.version});return}u.isInterleavedBufferAttribute&&(u=u.data);let h=i.get(u);if(h===void 0)i.set(u,r(u,c));else if(h.version<u.version){if(h.size!==u.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(h.buffer,u,c),h.version=u.version}}return{get:o,remove:a,update:l}}var Ht=class n extends Rt{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(i),l=Math.floor(r),u=a+1,c=l+1,h=e/a,f=t/l,d=[],g=[],x=[],p=[];for(let m=0;m<c;m++){let y=m*f-o;for(let _=0;_<u;_++){let b=_*h-s;g.push(b,-y,0),x.push(0,0,1),p.push(_/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<a;y++){let _=y+u*m,b=y+u*(m+1),E=y+1+u*(m+1),S=y+1+u*m;d.push(_,b,S),d.push(b,E,S)}this.setIndex(d),this.setAttribute("position",new $e(g,3)),this.setAttribute("normal",new $e(x,3)),this.setAttribute("uv",new $e(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},Em=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Tm=`#ifdef USE_ALPHAHASH
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
#endif`,Am=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Cm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Rm=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Pm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Im=`#ifdef USE_AOMAP
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
#endif`,Lm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Dm=`#ifdef USE_BATCHING
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
#endif`,Um=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Nm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Om=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Fm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,km=`#ifdef USE_IRIDESCENCE
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
#endif`,zm=`#ifdef USE_BUMPMAP
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
#endif`,Bm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Gm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Hm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Vm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Wm=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Xm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,qm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,Ym=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Km=`#define PI 3.141592653589793
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
} // validated`,Zm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,$m=`vec3 transformedNormal = objectNormal;
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
#endif`,Jm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,jm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Qm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,e0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,t0="gl_FragColor = linearToOutputTexel( gl_FragColor );",n0=`
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
}`,i0=`#ifdef USE_ENVMAP
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
#endif`,r0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,s0=`#ifdef USE_ENVMAP
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
#endif`,o0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,a0=`#ifdef USE_ENVMAP
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
#endif`,l0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,c0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,u0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,h0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,d0=`#ifdef USE_GRADIENTMAP
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
}`,f0=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,p0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,m0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,g0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,x0=`uniform bool receiveShadow;
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
#endif`,_0=`#ifdef USE_ENVMAP
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
#endif`,y0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,v0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,b0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,M0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,S0=`PhysicalMaterial material;
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
#endif`,w0=`struct PhysicalMaterial {
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
}`,E0=`
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
#endif`,T0=`#if defined( RE_IndirectDiffuse )
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
#endif`,A0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,C0=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,R0=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,P0=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,I0=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,L0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,D0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,U0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,N0=`#if defined( USE_POINTS_UV )
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
#endif`,O0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,F0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,k0=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,z0=`#ifdef USE_MORPHNORMALS
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
#endif`,B0=`#ifdef USE_MORPHTARGETS
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
#endif`,G0=`#ifdef USE_MORPHTARGETS
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
#endif`,H0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,V0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,W0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,X0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,q0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Y0=`#ifdef USE_NORMALMAP
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
#endif`,K0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Z0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,$0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,J0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,j0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Q0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,eg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,tg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ng=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ig=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,rg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,sg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,og=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ag=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,lg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,cg=`float getShadowMask() {
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
}`,ug=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,hg=`#ifdef USE_SKINNING
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
#endif`,dg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,fg=`#ifdef USE_SKINNING
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
#endif`,pg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,mg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,gg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,xg=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,_g=`#ifdef USE_TRANSMISSION
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
#endif`,yg=`#ifdef USE_TRANSMISSION
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
#endif`,vg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,bg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Mg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Sg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,wg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Eg=`uniform sampler2D t2D;
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
}`,Tg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ag=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Cg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Rg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Pg=`#include <common>
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
}`,Ig=`#if DEPTH_PACKING == 3200
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
}`,Lg=`#define DISTANCE
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
}`,Dg=`#define DISTANCE
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
}`,Ug=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ng=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Og=`uniform float scale;
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
}`,Fg=`uniform vec3 diffuse;
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
}`,kg=`#include <common>
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
}`,zg=`uniform vec3 diffuse;
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
}`,Bg=`#define LAMBERT
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
}`,Gg=`#define LAMBERT
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
}`,Hg=`#define MATCAP
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
}`,Vg=`#define MATCAP
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
}`,Wg=`#define NORMAL
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
}`,Xg=`#define NORMAL
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
}`,qg=`#define PHONG
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
}`,Yg=`#define PHONG
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
}`,Kg=`#define STANDARD
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
}`,Zg=`#define STANDARD
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
}`,$g=`#define TOON
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
}`,Jg=`#define TOON
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
}`,jg=`uniform float size;
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
}`,Qg=`uniform vec3 diffuse;
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
}`,ex=`#include <common>
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
}`,tx=`uniform vec3 color;
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
}`,nx=`uniform float rotation;
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
}`,ix=`uniform vec3 diffuse;
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
}`,nt={alphahash_fragment:Em,alphahash_pars_fragment:Tm,alphamap_fragment:Am,alphamap_pars_fragment:Cm,alphatest_fragment:Rm,alphatest_pars_fragment:Pm,aomap_fragment:Im,aomap_pars_fragment:Lm,batching_pars_vertex:Dm,batching_vertex:Um,begin_vertex:Nm,beginnormal_vertex:Om,bsdfs:Fm,iridescence_fragment:km,bumpmap_pars_fragment:zm,clipping_planes_fragment:Bm,clipping_planes_pars_fragment:Gm,clipping_planes_pars_vertex:Hm,clipping_planes_vertex:Vm,color_fragment:Wm,color_pars_fragment:Xm,color_pars_vertex:qm,color_vertex:Ym,common:Km,cube_uv_reflection_fragment:Zm,defaultnormal_vertex:$m,displacementmap_pars_vertex:Jm,displacementmap_vertex:jm,emissivemap_fragment:Qm,emissivemap_pars_fragment:e0,colorspace_fragment:t0,colorspace_pars_fragment:n0,envmap_fragment:i0,envmap_common_pars_fragment:r0,envmap_pars_fragment:s0,envmap_pars_vertex:o0,envmap_physical_pars_fragment:_0,envmap_vertex:a0,fog_vertex:l0,fog_pars_vertex:c0,fog_fragment:u0,fog_pars_fragment:h0,gradientmap_pars_fragment:d0,lightmap_fragment:f0,lightmap_pars_fragment:p0,lights_lambert_fragment:m0,lights_lambert_pars_fragment:g0,lights_pars_begin:x0,lights_toon_fragment:y0,lights_toon_pars_fragment:v0,lights_phong_fragment:b0,lights_phong_pars_fragment:M0,lights_physical_fragment:S0,lights_physical_pars_fragment:w0,lights_fragment_begin:E0,lights_fragment_maps:T0,lights_fragment_end:A0,logdepthbuf_fragment:C0,logdepthbuf_pars_fragment:R0,logdepthbuf_pars_vertex:P0,logdepthbuf_vertex:I0,map_fragment:L0,map_pars_fragment:D0,map_particle_fragment:U0,map_particle_pars_fragment:N0,metalnessmap_fragment:O0,metalnessmap_pars_fragment:F0,morphcolor_vertex:k0,morphnormal_vertex:z0,morphtarget_pars_vertex:B0,morphtarget_vertex:G0,normal_fragment_begin:H0,normal_fragment_maps:V0,normal_pars_fragment:W0,normal_pars_vertex:X0,normal_vertex:q0,normalmap_pars_fragment:Y0,clearcoat_normal_fragment_begin:K0,clearcoat_normal_fragment_maps:Z0,clearcoat_pars_fragment:$0,iridescence_pars_fragment:J0,opaque_fragment:j0,packing:Q0,premultiplied_alpha_fragment:eg,project_vertex:tg,dithering_fragment:ng,dithering_pars_fragment:ig,roughnessmap_fragment:rg,roughnessmap_pars_fragment:sg,shadowmap_pars_fragment:og,shadowmap_pars_vertex:ag,shadowmap_vertex:lg,shadowmask_pars_fragment:cg,skinbase_vertex:ug,skinning_pars_vertex:hg,skinning_vertex:dg,skinnormal_vertex:fg,specularmap_fragment:pg,specularmap_pars_fragment:mg,tonemapping_fragment:gg,tonemapping_pars_fragment:xg,transmission_fragment:_g,transmission_pars_fragment:yg,uv_pars_fragment:vg,uv_pars_vertex:bg,uv_vertex:Mg,worldpos_vertex:Sg,background_vert:wg,background_frag:Eg,backgroundCube_vert:Tg,backgroundCube_frag:Ag,cube_vert:Cg,cube_frag:Rg,depth_vert:Pg,depth_frag:Ig,distanceRGBA_vert:Lg,distanceRGBA_frag:Dg,equirect_vert:Ug,equirect_frag:Ng,linedashed_vert:Og,linedashed_frag:Fg,meshbasic_vert:kg,meshbasic_frag:zg,meshlambert_vert:Bg,meshlambert_frag:Gg,meshmatcap_vert:Hg,meshmatcap_frag:Vg,meshnormal_vert:Wg,meshnormal_frag:Xg,meshphong_vert:qg,meshphong_frag:Yg,meshphysical_vert:Kg,meshphysical_frag:Zg,meshtoon_vert:$g,meshtoon_frag:Jg,points_vert:jg,points_frag:Qg,shadow_vert:ex,shadow_frag:tx,sprite_vert:nx,sprite_frag:ix},ye={common:{diffuse:{value:new qe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new rt},alphaMap:{value:null},alphaMapTransform:{value:new rt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new rt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new rt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new rt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new rt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new rt},normalScale:{value:new ie(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new rt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new rt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new rt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new rt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new qe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new qe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new rt},alphaTest:{value:0},uvTransform:{value:new rt}},sprite:{diffuse:{value:new qe(16777215)},opacity:{value:1},center:{value:new ie(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new rt},alphaMap:{value:null},alphaMapTransform:{value:new rt},alphaTest:{value:0}}},Gn={basic:{uniforms:tn([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.fog]),vertexShader:nt.meshbasic_vert,fragmentShader:nt.meshbasic_frag},lambert:{uniforms:tn([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,ye.lights,{emissive:{value:new qe(0)}}]),vertexShader:nt.meshlambert_vert,fragmentShader:nt.meshlambert_frag},phong:{uniforms:tn([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,ye.lights,{emissive:{value:new qe(0)},specular:{value:new qe(1118481)},shininess:{value:30}}]),vertexShader:nt.meshphong_vert,fragmentShader:nt.meshphong_frag},standard:{uniforms:tn([ye.common,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.roughnessmap,ye.metalnessmap,ye.fog,ye.lights,{emissive:{value:new qe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:nt.meshphysical_vert,fragmentShader:nt.meshphysical_frag},toon:{uniforms:tn([ye.common,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.gradientmap,ye.fog,ye.lights,{emissive:{value:new qe(0)}}]),vertexShader:nt.meshtoon_vert,fragmentShader:nt.meshtoon_frag},matcap:{uniforms:tn([ye.common,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,{matcap:{value:null}}]),vertexShader:nt.meshmatcap_vert,fragmentShader:nt.meshmatcap_frag},points:{uniforms:tn([ye.points,ye.fog]),vertexShader:nt.points_vert,fragmentShader:nt.points_frag},dashed:{uniforms:tn([ye.common,ye.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:nt.linedashed_vert,fragmentShader:nt.linedashed_frag},depth:{uniforms:tn([ye.common,ye.displacementmap]),vertexShader:nt.depth_vert,fragmentShader:nt.depth_frag},normal:{uniforms:tn([ye.common,ye.bumpmap,ye.normalmap,ye.displacementmap,{opacity:{value:1}}]),vertexShader:nt.meshnormal_vert,fragmentShader:nt.meshnormal_frag},sprite:{uniforms:tn([ye.sprite,ye.fog]),vertexShader:nt.sprite_vert,fragmentShader:nt.sprite_frag},background:{uniforms:{uvTransform:{value:new rt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:nt.background_vert,fragmentShader:nt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:nt.backgroundCube_vert,fragmentShader:nt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:nt.cube_vert,fragmentShader:nt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:nt.equirect_vert,fragmentShader:nt.equirect_frag},distanceRGBA:{uniforms:tn([ye.common,ye.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:nt.distanceRGBA_vert,fragmentShader:nt.distanceRGBA_frag},shadow:{uniforms:tn([ye.lights,ye.fog,{color:{value:new qe(0)},opacity:{value:1}}]),vertexShader:nt.shadow_vert,fragmentShader:nt.shadow_frag}};Gn.physical={uniforms:tn([Gn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new rt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new rt},clearcoatNormalScale:{value:new ie(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new rt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new rt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new rt},sheen:{value:0},sheenColor:{value:new qe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new rt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new rt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new rt},transmissionSamplerSize:{value:new ie},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new rt},attenuationDistance:{value:0},attenuationColor:{value:new qe(0)},specularColor:{value:new qe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new rt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new rt},anisotropyVector:{value:new ie},anisotropyMap:{value:null},anisotropyMapTransform:{value:new rt}}]),vertexShader:nt.meshphysical_vert,fragmentShader:nt.meshphysical_frag};var no={r:0,b:0,g:0};function rx(n,e,t,i,r,s,o){let a=new qe(0),l=s===!0?0:1,u,c,h=null,f=0,d=null;function g(p,m){let y=!1,_=m.isScene===!0?m.background:null;_&&_.isTexture&&(_=(m.backgroundBlurriness>0?t:e).get(_)),_===null?x(a,l):_&&_.isColor&&(x(_,1),y=!0);let b=n.xr.getEnvironmentBlendMode();b==="additive"?i.buffers.color.setClear(0,0,0,1,o):b==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||y)&&n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil),_&&(_.isCubeTexture||_.mapping===Wo)?(c===void 0&&(c=new se(new sn(1,1,1),new $t({name:"BackgroundCubeMaterial",uniforms:kr(Gn.backgroundCube.uniforms),vertexShader:Gn.backgroundCube.vertexShader,fragmentShader:Gn.backgroundCube.fragmentShader,side:Lt,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,S,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(c)),c.material.uniforms.envMap.value=_,c.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,c.material.uniforms.backgroundBlurriness.value=m.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,c.material.toneMapped=ft.getTransfer(_.colorSpace)!==bt,(h!==_||f!==_.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,h=_,f=_.version,d=n.toneMapping),c.layers.enableAll(),p.unshift(c,c.geometry,c.material,0,0,null)):_&&_.isTexture&&(u===void 0&&(u=new se(new Ht(2,2),new $t({name:"BackgroundMaterial",uniforms:kr(Gn.background.uniforms),vertexShader:Gn.background.vertexShader,fragmentShader:Gn.background.fragmentShader,side:Ti,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(u)),u.material.uniforms.t2D.value=_,u.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,u.material.toneMapped=ft.getTransfer(_.colorSpace)!==bt,_.matrixAutoUpdate===!0&&_.updateMatrix(),u.material.uniforms.uvTransform.value.copy(_.matrix),(h!==_||f!==_.version||d!==n.toneMapping)&&(u.material.needsUpdate=!0,h=_,f=_.version,d=n.toneMapping),u.layers.enableAll(),p.unshift(u,u.geometry,u.material,0,0,null))}function x(p,m){p.getRGB(no,Ih(n)),i.buffers.color.setClear(no.r,no.g,no.b,m,o)}return{getClearColor:function(){return a},setClearColor:function(p,m=1){a.set(p),l=m,x(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(p){l=p,x(a,l)},render:g}}function sx(n,e,t,i){let r=n.getParameter(n.MAX_VERTEX_ATTRIBS),s=i.isWebGL2?null:e.get("OES_vertex_array_object"),o=i.isWebGL2||s!==null,a={},l=p(null),u=l,c=!1;function h(I,O,X,N,H){let G=!1;if(o){let K=x(N,X,O);u!==K&&(u=K,d(u.object)),G=m(I,N,X,H),G&&y(I,N,X,H)}else{let K=O.wireframe===!0;(u.geometry!==N.id||u.program!==X.id||u.wireframe!==K)&&(u.geometry=N.id,u.program=X.id,u.wireframe=K,G=!0)}H!==null&&t.update(H,n.ELEMENT_ARRAY_BUFFER),(G||c)&&(c=!1,R(I,O,X,N),H!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(H).buffer))}function f(){return i.isWebGL2?n.createVertexArray():s.createVertexArrayOES()}function d(I){return i.isWebGL2?n.bindVertexArray(I):s.bindVertexArrayOES(I)}function g(I){return i.isWebGL2?n.deleteVertexArray(I):s.deleteVertexArrayOES(I)}function x(I,O,X){let N=X.wireframe===!0,H=a[I.id];H===void 0&&(H={},a[I.id]=H);let G=H[O.id];G===void 0&&(G={},H[O.id]=G);let K=G[N];return K===void 0&&(K=p(f()),G[N]=K),K}function p(I){let O=[],X=[],N=[];for(let H=0;H<r;H++)O[H]=0,X[H]=0,N[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:X,attributeDivisors:N,object:I,attributes:{},index:null}}function m(I,O,X,N){let H=u.attributes,G=O.attributes,K=0,ee=X.getAttributes();for(let me in ee)if(ee[me].location>=0){let oe=H[me],fe=G[me];if(fe===void 0&&(me==="instanceMatrix"&&I.instanceMatrix&&(fe=I.instanceMatrix),me==="instanceColor"&&I.instanceColor&&(fe=I.instanceColor)),oe===void 0||oe.attribute!==fe||fe&&oe.data!==fe.data)return!0;K++}return u.attributesNum!==K||u.index!==N}function y(I,O,X,N){let H={},G=O.attributes,K=0,ee=X.getAttributes();for(let me in ee)if(ee[me].location>=0){let oe=G[me];oe===void 0&&(me==="instanceMatrix"&&I.instanceMatrix&&(oe=I.instanceMatrix),me==="instanceColor"&&I.instanceColor&&(oe=I.instanceColor));let fe={};fe.attribute=oe,oe&&oe.data&&(fe.data=oe.data),H[me]=fe,K++}u.attributes=H,u.attributesNum=K,u.index=N}function _(){let I=u.newAttributes;for(let O=0,X=I.length;O<X;O++)I[O]=0}function b(I){E(I,0)}function E(I,O){let X=u.newAttributes,N=u.enabledAttributes,H=u.attributeDivisors;X[I]=1,N[I]===0&&(n.enableVertexAttribArray(I),N[I]=1),H[I]!==O&&((i.isWebGL2?n:e.get("ANGLE_instanced_arrays"))[i.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](I,O),H[I]=O)}function S(){let I=u.newAttributes,O=u.enabledAttributes;for(let X=0,N=O.length;X<N;X++)O[X]!==I[X]&&(n.disableVertexAttribArray(X),O[X]=0)}function T(I,O,X,N,H,G,K){K===!0?n.vertexAttribIPointer(I,O,X,H,G):n.vertexAttribPointer(I,O,X,N,H,G)}function R(I,O,X,N){if(i.isWebGL2===!1&&(I.isInstancedMesh||N.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;_();let H=N.attributes,G=X.getAttributes(),K=O.defaultAttributeValues;for(let ee in G){let me=G[ee];if(me.location>=0){let q=H[ee];if(q===void 0&&(ee==="instanceMatrix"&&I.instanceMatrix&&(q=I.instanceMatrix),ee==="instanceColor"&&I.instanceColor&&(q=I.instanceColor)),q!==void 0){let oe=q.normalized,fe=q.itemSize,ve=t.get(q);if(ve===void 0)continue;let Te=ve.buffer,Oe=ve.type,Ie=ve.bytesPerElement,Ce=i.isWebGL2===!0&&(Oe===n.INT||Oe===n.UNSIGNED_INT||q.gpuType===_h);if(q.isInterleavedBufferAttribute){let Ge=q.data,D=Ge.stride,pe=q.offset;if(Ge.isInstancedInterleavedBuffer){for(let j=0;j<me.locationSize;j++)E(me.location+j,Ge.meshPerAttribute);I.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=Ge.meshPerAttribute*Ge.count)}else for(let j=0;j<me.locationSize;j++)b(me.location+j);n.bindBuffer(n.ARRAY_BUFFER,Te);for(let j=0;j<me.locationSize;j++)T(me.location+j,fe/me.locationSize,Oe,oe,D*Ie,(pe+fe/me.locationSize*j)*Ie,Ce)}else{if(q.isInstancedBufferAttribute){for(let Ge=0;Ge<me.locationSize;Ge++)E(me.location+Ge,q.meshPerAttribute);I.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let Ge=0;Ge<me.locationSize;Ge++)b(me.location+Ge);n.bindBuffer(n.ARRAY_BUFFER,Te);for(let Ge=0;Ge<me.locationSize;Ge++)T(me.location+Ge,fe/me.locationSize,Oe,oe,fe*Ie,fe/me.locationSize*Ge*Ie,Ce)}}else if(K!==void 0){let oe=K[ee];if(oe!==void 0)switch(oe.length){case 2:n.vertexAttrib2fv(me.location,oe);break;case 3:n.vertexAttrib3fv(me.location,oe);break;case 4:n.vertexAttrib4fv(me.location,oe);break;default:n.vertexAttrib1fv(me.location,oe)}}}}S()}function v(){z();for(let I in a){let O=a[I];for(let X in O){let N=O[X];for(let H in N)g(N[H].object),delete N[H];delete O[X]}delete a[I]}}function M(I){if(a[I.id]===void 0)return;let O=a[I.id];for(let X in O){let N=O[X];for(let H in N)g(N[H].object),delete N[H];delete O[X]}delete a[I.id]}function L(I){for(let O in a){let X=a[O];if(X[I.id]===void 0)continue;let N=X[I.id];for(let H in N)g(N[H].object),delete N[H];delete X[I.id]}}function z(){V(),c=!0,u!==l&&(u=l,d(u.object))}function V(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:z,resetDefaultState:V,dispose:v,releaseStatesOfGeometry:M,releaseStatesOfProgram:L,initAttributes:_,enableAttribute:b,disableUnusedAttributes:S}}function ox(n,e,t,i){let r=i.isWebGL2,s;function o(c){s=c}function a(c,h){n.drawArrays(s,c,h),t.update(h,s,1)}function l(c,h,f){if(f===0)return;let d,g;if(r)d=n,g="drawArraysInstanced";else if(d=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",d===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[g](s,c,h,f),t.update(h,s,f)}function u(c,h,f){if(f===0)return;let d=e.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<f;g++)this.render(c[g],h[g]);else{d.multiDrawArraysWEBGL(s,c,0,h,0,f);let g=0;for(let x=0;x<f;x++)g+=h[x];t.update(g,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=u}function ax(n,e,t){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let T=e.get("EXT_texture_filter_anisotropic");i=n.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function s(T){if(T==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let o=typeof WebGL2RenderingContext<"u"&&n.constructor.name==="WebGL2RenderingContext",a=t.precision!==void 0?t.precision:"highp",l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);let u=o||e.has("WEBGL_draw_buffers"),c=t.logarithmicDepthBuffer===!0,h=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),f=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),d=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),x=n.getParameter(n.MAX_VERTEX_ATTRIBS),p=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),m=n.getParameter(n.MAX_VARYING_VECTORS),y=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),_=f>0,b=o||e.has("OES_texture_float"),E=_&&b,S=o?n.getParameter(n.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:u,getMaxAnisotropy:r,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:c,maxTextures:h,maxVertexTextures:f,maxTextureSize:d,maxCubemapSize:g,maxAttributes:x,maxVertexUniforms:p,maxVaryings:m,maxFragmentUniforms:y,vertexTextures:_,floatFragmentTextures:b,floatVertexTextures:E,maxSamples:S}}function lx(n){let e=this,t=null,i=0,r=!1,s=!1,o=new si,a=new rt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let d=h.length!==0||f||i!==0||r;return r=f,i=h.length,d},this.beginShadows=function(){s=!0,c(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,f){t=c(h,f,0)},this.setState=function(h,f,d){let g=h.clippingPlanes,x=h.clipIntersection,p=h.clipShadows,m=n.get(h);if(!r||g===null||g.length===0||s&&!p)s?c(null):u();else{let y=s?0:i,_=y*4,b=m.clippingState||null;l.value=b,b=c(g,f,_,d);for(let E=0;E!==_;++E)b[E]=t[E];m.clippingState=b,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=y}};function u(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function c(h,f,d,g){let x=h!==null?h.length:0,p=null;if(x!==0){if(p=l.value,g!==!0||p===null){let m=d+x*4,y=f.matrixWorldInverse;a.getNormalMatrix(y),(p===null||p.length<m)&&(p=new Float32Array(m));for(let _=0,b=d;_!==x;++_,b+=4)o.copy(h[_]).applyMatrix4(y,a),o.normal.toArray(p,b),p[b+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,p}}function cx(n){let e=new WeakMap;function t(o,a){return a===dl?o.mapping=Nr:a===fl&&(o.mapping=Or),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===dl||a===fl)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let u=new Sl(l.height/2);return u.fromEquirectangularTexture(n,o),e.set(o,u),o.addEventListener("dispose",r),t(u.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}var Hn=class extends Co{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-e,o=i+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let u=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=u*this.view.offsetX,o=s+u*this.view.width,a-=c*this.view.offsetY,l=a-c*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Rr=4,ku=[.125,.215,.35,.446,.526,.582],Vi=20,Qa=new Hn,zu=new qe,el=null,tl=0,nl=0,Gi=(1+Math.sqrt(5))/2,Sr=1/Gi,Bu=[new P(1,1,1),new P(-1,1,1),new P(1,1,-1),new P(-1,1,-1),new P(0,Gi,Sr),new P(0,Gi,-Sr),new P(Sr,0,Gi),new P(-Sr,0,Gi),new P(Gi,Sr,0),new P(-Gi,Sr,0)],zr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100){el=this._renderer.getRenderTarget(),tl=this._renderer.getActiveCubeFace(),nl=this._renderer.getActiveMipmapLevel(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Vu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Hu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(el,tl,nl),e.scissorTest=!1,io(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Nr||e.mapping===Or?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),el=this._renderer.getRenderTarget(),tl=this._renderer.getActiveCubeFace(),nl=this._renderer.getActiveMipmapLevel();let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:vn,minFilter:vn,generateMipmaps:!1,type:Ki,format:Un,colorSpace:ci,depthBuffer:!1},r=Gu(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Gu(e,t,i);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=ux(s)),this._blurMaterial=hx(s,e,t)}return r}_compileMaterial(e){let t=new se(this._lodPlanes[0],e);this._renderer.compile(t,Qa)}_sceneToCubeUV(e,t,i,r){let a=new dn(90,1,t,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],c=this._renderer,h=c.autoClear,f=c.toneMapping;c.getClearColor(zu),c.toneMapping=Nn,c.autoClear=!1;let d=new st({name:"PMREM.Background",side:Lt,depthWrite:!1,depthTest:!1}),g=new se(new sn,d),x=!1,p=e.background;p?p.isColor&&(d.color.copy(p),e.background=null,x=!0):(d.color.copy(zu),x=!0);for(let m=0;m<6;m++){let y=m%3;y===0?(a.up.set(0,l[m],0),a.lookAt(u[m],0,0)):y===1?(a.up.set(0,0,l[m]),a.lookAt(0,u[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,u[m]));let _=this._cubeSize;io(r,y*_,m>2?_:0,_,_),c.setRenderTarget(r),x&&c.render(g,a),c.render(e,a)}g.geometry.dispose(),g.material.dispose(),c.toneMapping=f,c.autoClear=h,e.background=p}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===Nr||e.mapping===Or;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Vu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Hu());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new se(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;io(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Qa)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){let s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Bu[(r-1)%Bu.length];this._blur(e,r-1,r,s,o)}t.autoClear=i}_blur(e,t,i,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,o,a){let l=this._renderer,u=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let c=3,h=new se(this._lodPlanes[r],u),f=u.uniforms,d=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*Vi-1),x=s/g,p=isFinite(s)?1+Math.floor(c*x):Vi;p>Vi&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Vi}`);let m=[],y=0;for(let T=0;T<Vi;++T){let R=T/x,v=Math.exp(-R*R/2);m.push(v),T===0?y+=v:T<p&&(y+=2*v)}for(let T=0;T<m.length;T++)m[T]=m[T]/y;f.envMap.value=e.texture,f.samples.value=p,f.weights.value=m,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:_}=this;f.dTheta.value=g,f.mipInt.value=_-i;let b=this._sizeLods[r],E=3*b*(r>_-Rr?r-_+Rr:0),S=4*(this._cubeSize-b);io(t,E,S,3*b,2*b),l.setRenderTarget(t),l.render(h,Qa)}};function ux(n){let e=[],t=[],i=[],r=n,s=n-Rr+1+ku.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);t.push(a);let l=1/a;o>n-Rr?l=ku[o-n+Rr-1]:o===0&&(l=0),i.push(l);let u=1/(a-2),c=-u,h=1+u,f=[c,c,h,c,h,h,c,c,h,h,c,h],d=6,g=6,x=3,p=2,m=1,y=new Float32Array(x*g*d),_=new Float32Array(p*g*d),b=new Float32Array(m*g*d);for(let S=0;S<d;S++){let T=S%3*2/3-1,R=S>2?0:-1,v=[T,R,0,T+2/3,R,0,T+2/3,R+1,0,T,R,0,T+2/3,R+1,0,T,R+1,0];y.set(v,x*g*S),_.set(f,p*g*S);let M=[S,S,S,S,S,S];b.set(M,m*g*S)}let E=new Rt;E.setAttribute("position",new Kt(y,x)),E.setAttribute("uv",new Kt(_,p)),E.setAttribute("faceIndex",new Kt(b,m)),e.push(E),r>Rr&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Gu(n,e,t){let i=new rn(n,e,t);return i.texture.mapping=Wo,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function io(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function hx(n,e,t){let i=new Float32Array(Vi),r=new P(0,1,0);return new $t({name:"SphericalGaussianBlur",defines:{n:Vi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:oc(),fragmentShader:`

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
		`,blending:Si,depthTest:!1,depthWrite:!1})}function Hu(){return new $t({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:oc(),fragmentShader:`

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
		`,blending:Si,depthTest:!1,depthWrite:!1})}function Vu(){return new $t({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:oc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Si,depthTest:!1,depthWrite:!1})}function oc(){return`

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
	`}function dx(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let l=a.mapping,u=l===dl||l===fl,c=l===Nr||l===Or;if(u||c)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return t===null&&(t=new zr(n)),h=u?t.fromEquirectangular(a,h):t.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{let h=a.image;if(u&&h&&h.height>0||c&&h&&r(h)){t===null&&(t=new zr(n));let f=u?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,f),a.addEventListener("dispose",s),f.texture}else return null}}}return a}function r(a){let l=0,u=6;for(let c=0;c<u;c++)a[c]!==void 0&&l++;return l===u}function s(a){let l=a.target;l.removeEventListener("dispose",s);let u=e.get(l);u!==void 0&&(e.delete(l),u.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function fx(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(i){i.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(i){let r=t(i);return r===null&&console.warn("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function px(n,e,t,i){let r={},s=new WeakMap;function o(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);for(let g in f.morphAttributes){let x=f.morphAttributes[g];for(let p=0,m=x.length;p<m;p++)e.remove(x[p])}f.removeEventListener("dispose",o),delete r[f.id];let d=s.get(f);d&&(e.remove(d),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(h,f){return r[f.id]===!0||(f.addEventListener("dispose",o),r[f.id]=!0,t.memory.geometries++),f}function l(h){let f=h.attributes;for(let g in f)e.update(f[g],n.ARRAY_BUFFER);let d=h.morphAttributes;for(let g in d){let x=d[g];for(let p=0,m=x.length;p<m;p++)e.update(x[p],n.ARRAY_BUFFER)}}function u(h){let f=[],d=h.index,g=h.attributes.position,x=0;if(d!==null){let y=d.array;x=d.version;for(let _=0,b=y.length;_<b;_+=3){let E=y[_+0],S=y[_+1],T=y[_+2];f.push(E,S,S,T,T,E)}}else if(g!==void 0){let y=g.array;x=g.version;for(let _=0,b=y.length/3-1;_<b;_+=3){let E=_+0,S=_+1,T=_+2;f.push(E,S,S,T,T,E)}}else return;let p=new(Rh(f)?Ao:To)(f,1);p.version=x;let m=s.get(h);m&&e.remove(m),s.set(h,p)}function c(h){let f=s.get(h);if(f){let d=h.index;d!==null&&f.version<d.version&&u(h)}else u(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:c}}function mx(n,e,t,i){let r=i.isWebGL2,s;function o(d){s=d}let a,l;function u(d){a=d.type,l=d.bytesPerElement}function c(d,g){n.drawElements(s,g,a,d*l),t.update(g,s,1)}function h(d,g,x){if(x===0)return;let p,m;if(r)p=n,m="drawElementsInstanced";else if(p=e.get("ANGLE_instanced_arrays"),m="drawElementsInstancedANGLE",p===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[m](s,g,a,d*l,x),t.update(g,s,x)}function f(d,g,x){if(x===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<x;m++)this.render(d[m]/l,g[m]);else{p.multiDrawElementsWEBGL(s,g,0,a,d,0,x);let m=0;for(let y=0;y<x;y++)m+=g[y];t.update(m,s,1)}}this.setMode=o,this.setIndex=u,this.render=c,this.renderInstances=h,this.renderMultiDraw=f}function gx(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function xx(n,e){return n[0]-e[0]}function _x(n,e){return Math.abs(e[1])-Math.abs(n[1])}function yx(n,e,t){let i={},r=new Float32Array(8),s=new WeakMap,o=new wt,a=[];for(let u=0;u<8;u++)a[u]=[u,0];function l(u,c,h){let f=u.morphTargetInfluences;if(e.isWebGL2===!0){let d=c.morphAttributes.position||c.morphAttributes.normal||c.morphAttributes.color,g=d!==void 0?d.length:0,x=s.get(c);if(x===void 0||x.count!==g){let I=function(){z.dispose(),s.delete(c),c.removeEventListener("dispose",I)};x!==void 0&&x.texture.dispose();let y=c.morphAttributes.position!==void 0,_=c.morphAttributes.normal!==void 0,b=c.morphAttributes.color!==void 0,E=c.morphAttributes.position||[],S=c.morphAttributes.normal||[],T=c.morphAttributes.color||[],R=0;y===!0&&(R=1),_===!0&&(R=2),b===!0&&(R=3);let v=c.attributes.position.count*R,M=1;v>e.maxTextureSize&&(M=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let L=new Float32Array(v*M*4*g),z=new So(L,v,M,g);z.type=Mi,z.needsUpdate=!0;let V=R*4;for(let O=0;O<g;O++){let X=E[O],N=S[O],H=T[O],G=v*M*4*O;for(let K=0;K<X.count;K++){let ee=K*V;y===!0&&(o.fromBufferAttribute(X,K),L[G+ee+0]=o.x,L[G+ee+1]=o.y,L[G+ee+2]=o.z,L[G+ee+3]=0),_===!0&&(o.fromBufferAttribute(N,K),L[G+ee+4]=o.x,L[G+ee+5]=o.y,L[G+ee+6]=o.z,L[G+ee+7]=0),b===!0&&(o.fromBufferAttribute(H,K),L[G+ee+8]=o.x,L[G+ee+9]=o.y,L[G+ee+10]=o.z,L[G+ee+11]=H.itemSize===4?o.w:1)}}x={count:g,texture:z,size:new ie(v,M)},s.set(c,x),c.addEventListener("dispose",I)}let p=0;for(let y=0;y<f.length;y++)p+=f[y];let m=c.morphTargetsRelative?1:1-p;h.getUniforms().setValue(n,"morphTargetBaseInfluence",m),h.getUniforms().setValue(n,"morphTargetInfluences",f),h.getUniforms().setValue(n,"morphTargetsTexture",x.texture,t),h.getUniforms().setValue(n,"morphTargetsTextureSize",x.size)}else{let d=f===void 0?0:f.length,g=i[c.id];if(g===void 0||g.length!==d){g=[];for(let _=0;_<d;_++)g[_]=[_,0];i[c.id]=g}for(let _=0;_<d;_++){let b=g[_];b[0]=_,b[1]=f[_]}g.sort(_x);for(let _=0;_<8;_++)_<d&&g[_][1]?(a[_][0]=g[_][0],a[_][1]=g[_][1]):(a[_][0]=Number.MAX_SAFE_INTEGER,a[_][1]=0);a.sort(xx);let x=c.morphAttributes.position,p=c.morphAttributes.normal,m=0;for(let _=0;_<8;_++){let b=a[_],E=b[0],S=b[1];E!==Number.MAX_SAFE_INTEGER&&S?(x&&c.getAttribute("morphTarget"+_)!==x[E]&&c.setAttribute("morphTarget"+_,x[E]),p&&c.getAttribute("morphNormal"+_)!==p[E]&&c.setAttribute("morphNormal"+_,p[E]),r[_]=S,m+=S):(x&&c.hasAttribute("morphTarget"+_)===!0&&c.deleteAttribute("morphTarget"+_),p&&c.hasAttribute("morphNormal"+_)===!0&&c.deleteAttribute("morphNormal"+_),r[_]=0)}let y=c.morphTargetsRelative?1:1-m;h.getUniforms().setValue(n,"morphTargetBaseInfluence",y),h.getUniforms().setValue(n,"morphTargetInfluences",r)}}return{update:l}}function vx(n,e,t,i){let r=new WeakMap;function s(l){let u=i.render.frame,c=l.geometry,h=e.get(l,c);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==u&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return h}function o(){r=new WeakMap}function a(l){let u=l.target;u.removeEventListener("dispose",a),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:s,dispose:o}}var Po=class extends Mn{constructor(e,t,i,r,s,o,a,l,u,c){if(c=c!==void 0?c:qi,c!==qi&&c!==Fr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&c===qi&&(i=bi),i===void 0&&c===Fr&&(i=Xi),super(null,r,s,o,a,l,c,i,u),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:nn,this.minFilter=l!==void 0?l:nn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Dh=new Mn,Uh=new Po(1,1);Uh.compareFunction=Ch;var Nh=new So,Oh=new vl,Fh=new Ro,Wu=[],Xu=[],qu=new Float32Array(16),Yu=new Float32Array(9),Ku=new Float32Array(4);function Xr(n,e,t){let i=n[0];if(i<=0||i>0)return n;let r=e*t,s=Wu[r];if(s===void 0&&(s=new Float32Array(r),Wu[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function Ot(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Ft(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function qo(n,e){let t=Xu[e];t===void 0&&(t=new Int32Array(e),Xu[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function bx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Mx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ot(t,e))return;n.uniform2fv(this.addr,e),Ft(t,e)}}function Sx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ot(t,e))return;n.uniform3fv(this.addr,e),Ft(t,e)}}function wx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ot(t,e))return;n.uniform4fv(this.addr,e),Ft(t,e)}}function Ex(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ot(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Ft(t,e)}else{if(Ot(t,i))return;Ku.set(i),n.uniformMatrix2fv(this.addr,!1,Ku),Ft(t,i)}}function Tx(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ot(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Ft(t,e)}else{if(Ot(t,i))return;Yu.set(i),n.uniformMatrix3fv(this.addr,!1,Yu),Ft(t,i)}}function Ax(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ot(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Ft(t,e)}else{if(Ot(t,i))return;qu.set(i),n.uniformMatrix4fv(this.addr,!1,qu),Ft(t,i)}}function Cx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Rx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ot(t,e))return;n.uniform2iv(this.addr,e),Ft(t,e)}}function Px(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ot(t,e))return;n.uniform3iv(this.addr,e),Ft(t,e)}}function Ix(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ot(t,e))return;n.uniform4iv(this.addr,e),Ft(t,e)}}function Lx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Dx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ot(t,e))return;n.uniform2uiv(this.addr,e),Ft(t,e)}}function Ux(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ot(t,e))return;n.uniform3uiv(this.addr,e),Ft(t,e)}}function Nx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ot(t,e))return;n.uniform4uiv(this.addr,e),Ft(t,e)}}function Ox(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s=this.type===n.SAMPLER_2D_SHADOW?Uh:Dh;t.setTexture2D(e||s,r)}function Fx(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||Oh,r)}function kx(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||Fh,r)}function zx(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||Nh,r)}function Bx(n){switch(n){case 5126:return bx;case 35664:return Mx;case 35665:return Sx;case 35666:return wx;case 35674:return Ex;case 35675:return Tx;case 35676:return Ax;case 5124:case 35670:return Cx;case 35667:case 35671:return Rx;case 35668:case 35672:return Px;case 35669:case 35673:return Ix;case 5125:return Lx;case 36294:return Dx;case 36295:return Ux;case 36296:return Nx;case 35678:case 36198:case 36298:case 36306:case 35682:return Ox;case 35679:case 36299:case 36307:return Fx;case 35680:case 36300:case 36308:case 36293:return kx;case 36289:case 36303:case 36311:case 36292:return zx}}function Gx(n,e){n.uniform1fv(this.addr,e)}function Hx(n,e){let t=Xr(e,this.size,2);n.uniform2fv(this.addr,t)}function Vx(n,e){let t=Xr(e,this.size,3);n.uniform3fv(this.addr,t)}function Wx(n,e){let t=Xr(e,this.size,4);n.uniform4fv(this.addr,t)}function Xx(n,e){let t=Xr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function qx(n,e){let t=Xr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Yx(n,e){let t=Xr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Kx(n,e){n.uniform1iv(this.addr,e)}function Zx(n,e){n.uniform2iv(this.addr,e)}function $x(n,e){n.uniform3iv(this.addr,e)}function Jx(n,e){n.uniform4iv(this.addr,e)}function jx(n,e){n.uniform1uiv(this.addr,e)}function Qx(n,e){n.uniform2uiv(this.addr,e)}function e_(n,e){n.uniform3uiv(this.addr,e)}function t_(n,e){n.uniform4uiv(this.addr,e)}function n_(n,e,t){let i=this.cache,r=e.length,s=qo(t,r);Ot(i,s)||(n.uniform1iv(this.addr,s),Ft(i,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||Dh,s[o])}function i_(n,e,t){let i=this.cache,r=e.length,s=qo(t,r);Ot(i,s)||(n.uniform1iv(this.addr,s),Ft(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||Oh,s[o])}function r_(n,e,t){let i=this.cache,r=e.length,s=qo(t,r);Ot(i,s)||(n.uniform1iv(this.addr,s),Ft(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||Fh,s[o])}function s_(n,e,t){let i=this.cache,r=e.length,s=qo(t,r);Ot(i,s)||(n.uniform1iv(this.addr,s),Ft(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||Nh,s[o])}function o_(n){switch(n){case 5126:return Gx;case 35664:return Hx;case 35665:return Vx;case 35666:return Wx;case 35674:return Xx;case 35675:return qx;case 35676:return Yx;case 5124:case 35670:return Kx;case 35667:case 35671:return Zx;case 35668:case 35672:return $x;case 35669:case 35673:return Jx;case 5125:return jx;case 36294:return Qx;case 36295:return e_;case 36296:return t_;case 35678:case 36198:case 36298:case 36306:case 35682:return n_;case 35679:case 36299:case 36307:return i_;case 35680:case 36300:case 36308:case 36293:return r_;case 36289:case 36303:case 36311:case 36292:return s_}}var wl=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Bx(t.type)}},El=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=o_(t.type)}},Tl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],i)}}},il=/(\w+)(\])?(\[|\.)?/g;function Zu(n,e){n.seq.push(e),n.map[e.id]=e}function a_(n,e,t){let i=n.name,r=i.length;for(il.lastIndex=0;;){let s=il.exec(i),o=il.lastIndex,a=s[1],l=s[2]==="]",u=s[3];if(l&&(a=a|0),u===void 0||u==="["&&o+2===r){Zu(t,u===void 0?new wl(a,n,e):new El(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new Tl(a),Zu(t,h)),t=h}}}var Ur=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);a_(s,o,this)}}setValue(e,t,i,r){let s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&i.push(o)}return i}};function $u(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var l_=37297,c_=0;function u_(n,e){let t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}function h_(n){let e=ft.getPrimaries(ft.workingColorSpace),t=ft.getPrimaries(n),i;switch(e===t?i="":e===_o&&t===xo?i="LinearDisplayP3ToLinearSRGB":e===xo&&t===_o&&(i="LinearSRGBToLinearDisplayP3"),n){case ci:case Xo:return[i,"LinearTransferOETF"];case pt:case sc:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function Ju(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+u_(n.getShaderSource(e),o)}else return r}function d_(n,e){let t=h_(e);return`vec4 ${n}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function f_(n,e){let t;switch(e){case Lp:t="Linear";break;case Dp:t="Reinhard";break;case Up:t="OptimizedCineon";break;case Vo:t="ACESFilmic";break;case Op:t="AgX";break;case Np:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function p_(n){return[n.extensionDerivatives||n.envMapCubeUVHeight||n.bumpMap||n.normalMapTangentSpace||n.clearcoatNormalMap||n.flatShading||n.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(n.extensionFragDepth||n.logarithmicDepthBuffer)&&n.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",n.extensionDrawBuffers&&n.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(n.extensionShaderTextureLOD||n.envMap||n.transmission)&&n.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Pr).join(`
`)}function m_(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(Pr).join(`
`)}function g_(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function x_(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=n.getActiveAttrib(e,r),o=s.name,a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Pr(n){return n!==""}function ju(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Qu(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var __=/^[ \t]*#include +<([\w\d./]+)>/gm;function Al(n){return n.replace(__,v_)}var y_=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function v_(n,e){let t=nt[e];if(t===void 0){let i=y_.get(e);if(i!==void 0)t=nt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Al(t)}var b_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function eh(n){return n.replace(b_,M_)}function M_(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function th(n){let e="precision "+n.precision+` float;
precision `+n.precision+" int;";return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function S_(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===gh?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===ec?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===ri&&(e="SHADOWMAP_TYPE_VSM"),e}function w_(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Nr:case Or:e="ENVMAP_TYPE_CUBE";break;case Wo:e="ENVMAP_TYPE_CUBE_UV";break}return e}function E_(n){let e="ENVMAP_MODE_REFLECTION";return n.envMap&&n.envMapMode===Or&&(e="ENVMAP_MODE_REFRACTION"),e}function T_(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case nc:e="ENVMAP_BLENDING_MULTIPLY";break;case Pp:e="ENVMAP_BLENDING_MIX";break;case Ip:e="ENVMAP_BLENDING_ADD";break}return e}function A_(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function C_(n,e,t,i){let r=n.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=S_(t),u=w_(t),c=E_(t),h=T_(t),f=A_(t),d=t.isWebGL2?"":p_(t),g=m_(t),x=g_(s),p=r.createProgram(),m,y,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Pr).join(`
`),m.length>0&&(m+=`
`),y=[d,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Pr).join(`
`),y.length>0&&(y+=`
`)):(m=[th(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Pr).join(`
`),y=[d,th(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Nn?"#define TONE_MAPPING":"",t.toneMapping!==Nn?nt.tonemapping_pars_fragment:"",t.toneMapping!==Nn?f_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",nt.colorspace_pars_fragment,d_("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Pr).join(`
`)),o=Al(o),o=ju(o,t),o=Qu(o,t),a=Al(a),a=ju(a,t),a=Qu(a,t),o=eh(o),a=eh(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,y=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===vu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===vu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);let b=_+m+o,E=_+y+a,S=$u(r,r.VERTEX_SHADER,b),T=$u(r,r.FRAGMENT_SHADER,E);r.attachShader(p,S),r.attachShader(p,T),t.index0AttributeName!==void 0?r.bindAttribLocation(p,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(p,0,"position"),r.linkProgram(p);function R(z){if(n.debug.checkShaderErrors){let V=r.getProgramInfoLog(p).trim(),I=r.getShaderInfoLog(S).trim(),O=r.getShaderInfoLog(T).trim(),X=!0,N=!0;if(r.getProgramParameter(p,r.LINK_STATUS)===!1)if(X=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,p,S,T);else{let H=Ju(r,S,"vertex"),G=Ju(r,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(p,r.VALIDATE_STATUS)+`

Program Info Log: `+V+`
`+H+`
`+G)}else V!==""?console.warn("THREE.WebGLProgram: Program Info Log:",V):(I===""||O==="")&&(N=!1);N&&(z.diagnostics={runnable:X,programLog:V,vertexShader:{log:I,prefix:m},fragmentShader:{log:O,prefix:y}})}r.deleteShader(S),r.deleteShader(T),v=new Ur(r,p),M=x_(r,p)}let v;this.getUniforms=function(){return v===void 0&&R(this),v};let M;this.getAttributes=function(){return M===void 0&&R(this),M};let L=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return L===!1&&(L=r.getProgramParameter(p,l_)),L},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(p),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=c_++,this.cacheKey=e,this.usedTimes=1,this.program=p,this.vertexShader=S,this.fragmentShader=T,this}var R_=0,Cl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Rl(e),t.set(e,i)),i}},Rl=class{constructor(e){this.id=R_++,this.code=e,this.usedTimes=0}};function P_(n,e,t,i,r,s,o){let a=new Eo,l=new Cl,u=[],c=r.isWebGL2,h=r.logarithmicDepthBuffer,f=r.vertexTextures,d=r.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(v){return v===0?"uv":`uv${v}`}function p(v,M,L,z,V){let I=z.fog,O=V.geometry,X=v.isMeshStandardMaterial?z.environment:null,N=(v.isMeshStandardMaterial?t:e).get(v.envMap||X),H=N&&N.mapping===Wo?N.image.height:null,G=g[v.type];v.precision!==null&&(d=r.getMaxPrecision(v.precision),d!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",d,"instead."));let K=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,ee=K!==void 0?K.length:0,me=0;O.morphAttributes.position!==void 0&&(me=1),O.morphAttributes.normal!==void 0&&(me=2),O.morphAttributes.color!==void 0&&(me=3);let q,oe,fe,ve;if(G){let Ut=Gn[G];q=Ut.vertexShader,oe=Ut.fragmentShader}else q=v.vertexShader,oe=v.fragmentShader,l.update(v),fe=l.getVertexShaderID(v),ve=l.getFragmentShaderID(v);let Te=n.getRenderTarget(),Oe=V.isInstancedMesh===!0,Ie=V.isBatchedMesh===!0,Ce=!!v.map,Ge=!!v.matcap,D=!!N,pe=!!v.aoMap,j=!!v.lightMap,ue=!!v.bumpMap,Q=!!v.normalMap,de=!!v.displacementMap,ae=!!v.emissiveMap,A=!!v.metalnessMap,w=!!v.roughnessMap,k=v.anisotropy>0,ce=v.clearcoat>0,re=v.iridescence>0,ne=v.sheen>0,Ae=v.transmission>0,be=k&&!!v.anisotropyMap,Re=ce&&!!v.clearcoatMap,Pe=ce&&!!v.clearcoatNormalMap,Ze=ce&&!!v.clearcoatRoughnessMap,le=re&&!!v.iridescenceMap,et=re&&!!v.iridescenceThicknessMap,it=ne&&!!v.sheenColorMap,Ye=ne&&!!v.sheenRoughnessMap,Fe=!!v.specularMap,Le=!!v.specularColorMap,je=!!v.specularIntensityMap,ot=Ae&&!!v.transmissionMap,Mt=Ae&&!!v.thicknessMap,tt=!!v.gradientMap,ge=!!v.alphaMap,U=v.alphaTest>0,Me=!!v.alphaHash,xe=!!v.extensions,ke=!!O.attributes.uv1,Be=!!O.attributes.uv2,ht=!!O.attributes.uv3,dt=Nn;return v.toneMapped&&(Te===null||Te.isXRRenderTarget===!0)&&(dt=n.toneMapping),{isWebGL2:c,shaderID:G,shaderType:v.type,shaderName:v.name,vertexShader:q,fragmentShader:oe,defines:v.defines,customVertexShaderID:fe,customFragmentShaderID:ve,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:d,batching:Ie,instancing:Oe,instancingColor:Oe&&V.instanceColor!==null,supportsVertexTextures:f,outputColorSpace:Te===null?n.outputColorSpace:Te.isXRRenderTarget===!0?Te.texture.colorSpace:ci,map:Ce,matcap:Ge,envMap:D,envMapMode:D&&N.mapping,envMapCubeUVHeight:H,aoMap:pe,lightMap:j,bumpMap:ue,normalMap:Q,displacementMap:f&&de,emissiveMap:ae,normalMapObjectSpace:Q&&v.normalMapType===Kp,normalMapTangentSpace:Q&&v.normalMapType===rc,metalnessMap:A,roughnessMap:w,anisotropy:k,anisotropyMap:be,clearcoat:ce,clearcoatMap:Re,clearcoatNormalMap:Pe,clearcoatRoughnessMap:Ze,iridescence:re,iridescenceMap:le,iridescenceThicknessMap:et,sheen:ne,sheenColorMap:it,sheenRoughnessMap:Ye,specularMap:Fe,specularColorMap:Le,specularIntensityMap:je,transmission:Ae,transmissionMap:ot,thicknessMap:Mt,gradientMap:tt,opaque:v.transparent===!1&&v.blending===Lr,alphaMap:ge,alphaTest:U,alphaHash:Me,combine:v.combine,mapUv:Ce&&x(v.map.channel),aoMapUv:pe&&x(v.aoMap.channel),lightMapUv:j&&x(v.lightMap.channel),bumpMapUv:ue&&x(v.bumpMap.channel),normalMapUv:Q&&x(v.normalMap.channel),displacementMapUv:de&&x(v.displacementMap.channel),emissiveMapUv:ae&&x(v.emissiveMap.channel),metalnessMapUv:A&&x(v.metalnessMap.channel),roughnessMapUv:w&&x(v.roughnessMap.channel),anisotropyMapUv:be&&x(v.anisotropyMap.channel),clearcoatMapUv:Re&&x(v.clearcoatMap.channel),clearcoatNormalMapUv:Pe&&x(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ze&&x(v.clearcoatRoughnessMap.channel),iridescenceMapUv:le&&x(v.iridescenceMap.channel),iridescenceThicknessMapUv:et&&x(v.iridescenceThicknessMap.channel),sheenColorMapUv:it&&x(v.sheenColorMap.channel),sheenRoughnessMapUv:Ye&&x(v.sheenRoughnessMap.channel),specularMapUv:Fe&&x(v.specularMap.channel),specularColorMapUv:Le&&x(v.specularColorMap.channel),specularIntensityMapUv:je&&x(v.specularIntensityMap.channel),transmissionMapUv:ot&&x(v.transmissionMap.channel),thicknessMapUv:Mt&&x(v.thicknessMap.channel),alphaMapUv:ge&&x(v.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(Q||k),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,vertexUv1s:ke,vertexUv2s:Be,vertexUv3s:ht,pointsUvs:V.isPoints===!0&&!!O.attributes.uv&&(Ce||ge),fog:!!I,useFog:v.fog===!0,fogExp2:I&&I.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:V.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:ee,morphTextureStride:me,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&L.length>0,shadowMapType:n.shadowMap.type,toneMapping:dt,useLegacyLights:n._useLegacyLights,decodeVideoTexture:Ce&&v.map.isVideoTexture===!0&&ft.getTransfer(v.map.colorSpace)===bt,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Gt,flipSided:v.side===Lt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionDerivatives:xe&&v.extensions.derivatives===!0,extensionFragDepth:xe&&v.extensions.fragDepth===!0,extensionDrawBuffers:xe&&v.extensions.drawBuffers===!0,extensionShaderTextureLOD:xe&&v.extensions.shaderTextureLOD===!0,extensionClipCullDistance:xe&&v.extensions.clipCullDistance&&i.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:c||i.has("EXT_frag_depth"),rendererExtensionDrawBuffers:c||i.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:c||i.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()}}function m(v){let M=[];if(v.shaderID?M.push(v.shaderID):(M.push(v.customVertexShaderID),M.push(v.customFragmentShaderID)),v.defines!==void 0)for(let L in v.defines)M.push(L),M.push(v.defines[L]);return v.isRawShaderMaterial===!1&&(y(M,v),_(M,v),M.push(n.outputColorSpace)),M.push(v.customProgramCacheKey),M.join()}function y(v,M){v.push(M.precision),v.push(M.outputColorSpace),v.push(M.envMapMode),v.push(M.envMapCubeUVHeight),v.push(M.mapUv),v.push(M.alphaMapUv),v.push(M.lightMapUv),v.push(M.aoMapUv),v.push(M.bumpMapUv),v.push(M.normalMapUv),v.push(M.displacementMapUv),v.push(M.emissiveMapUv),v.push(M.metalnessMapUv),v.push(M.roughnessMapUv),v.push(M.anisotropyMapUv),v.push(M.clearcoatMapUv),v.push(M.clearcoatNormalMapUv),v.push(M.clearcoatRoughnessMapUv),v.push(M.iridescenceMapUv),v.push(M.iridescenceThicknessMapUv),v.push(M.sheenColorMapUv),v.push(M.sheenRoughnessMapUv),v.push(M.specularMapUv),v.push(M.specularColorMapUv),v.push(M.specularIntensityMapUv),v.push(M.transmissionMapUv),v.push(M.thicknessMapUv),v.push(M.combine),v.push(M.fogExp2),v.push(M.sizeAttenuation),v.push(M.morphTargetsCount),v.push(M.morphAttributeCount),v.push(M.numDirLights),v.push(M.numPointLights),v.push(M.numSpotLights),v.push(M.numSpotLightMaps),v.push(M.numHemiLights),v.push(M.numRectAreaLights),v.push(M.numDirLightShadows),v.push(M.numPointLightShadows),v.push(M.numSpotLightShadows),v.push(M.numSpotLightShadowsWithMaps),v.push(M.numLightProbes),v.push(M.shadowMapType),v.push(M.toneMapping),v.push(M.numClippingPlanes),v.push(M.numClipIntersection),v.push(M.depthPacking)}function _(v,M){a.disableAll(),M.isWebGL2&&a.enable(0),M.supportsVertexTextures&&a.enable(1),M.instancing&&a.enable(2),M.instancingColor&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),v.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.skinning&&a.enable(4),M.morphTargets&&a.enable(5),M.morphNormals&&a.enable(6),M.morphColors&&a.enable(7),M.premultipliedAlpha&&a.enable(8),M.shadowMapEnabled&&a.enable(9),M.useLegacyLights&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),v.push(a.mask)}function b(v){let M=g[v.type],L;if(M){let z=Gn[M];L=ym.clone(z.uniforms)}else L=v.uniforms;return L}function E(v,M){let L;for(let z=0,V=u.length;z<V;z++){let I=u[z];if(I.cacheKey===M){L=I,++L.usedTimes;break}}return L===void 0&&(L=new C_(n,M,v,s),u.push(L)),L}function S(v){if(--v.usedTimes===0){let M=u.indexOf(v);u[M]=u[u.length-1],u.pop(),v.destroy()}}function T(v){l.remove(v)}function R(){l.dispose()}return{getParameters:p,getProgramCacheKey:m,getUniforms:b,acquireProgram:E,releaseProgram:S,releaseShaderCache:T,programs:u,dispose:R}}function I_(){let n=new WeakMap;function e(s){let o=n.get(s);return o===void 0&&(o={},n.set(s,o)),o}function t(s){n.delete(s)}function i(s,o,a){n.get(s)[o]=a}function r(){n=new WeakMap}return{get:e,remove:t,update:i,dispose:r}}function L_(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function nh(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function ih(){let n=[],e=0,t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(h,f,d,g,x,p){let m=n[e];return m===void 0?(m={id:h.id,object:h,geometry:f,material:d,groupOrder:g,renderOrder:h.renderOrder,z:x,group:p},n[e]=m):(m.id=h.id,m.object=h,m.geometry=f,m.material=d,m.groupOrder=g,m.renderOrder=h.renderOrder,m.z=x,m.group=p),e++,m}function a(h,f,d,g,x,p){let m=o(h,f,d,g,x,p);d.transmission>0?i.push(m):d.transparent===!0?r.push(m):t.push(m)}function l(h,f,d,g,x,p){let m=o(h,f,d,g,x,p);d.transmission>0?i.unshift(m):d.transparent===!0?r.unshift(m):t.unshift(m)}function u(h,f){t.length>1&&t.sort(h||L_),i.length>1&&i.sort(f||nh),r.length>1&&r.sort(f||nh)}function c(){for(let h=e,f=n.length;h<f;h++){let d=n[h];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:c,sort:u}}function D_(){let n=new WeakMap;function e(i,r){let s=n.get(i),o;return s===void 0?(o=new ih,n.set(i,[o])):r>=s.length?(o=new ih,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function U_(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new qe};break;case"SpotLight":t={position:new P,direction:new P,color:new qe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new qe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new qe,groundColor:new qe};break;case"RectAreaLight":t={color:new qe,position:new P,halfWidth:new P,halfHeight:new P};break}return n[e.id]=t,t}}}function N_(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var O_=0;function F_(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function k_(n,e){let t=new U_,i=N_(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)r.probe.push(new P);let s=new P,o=new vt,a=new vt;function l(c,h){let f=0,d=0,g=0;for(let z=0;z<9;z++)r.probe[z].set(0,0,0);let x=0,p=0,m=0,y=0,_=0,b=0,E=0,S=0,T=0,R=0,v=0;c.sort(F_);let M=h===!0?Math.PI:1;for(let z=0,V=c.length;z<V;z++){let I=c[z],O=I.color,X=I.intensity,N=I.distance,H=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)f+=O.r*X*M,d+=O.g*X*M,g+=O.b*X*M;else if(I.isLightProbe){for(let G=0;G<9;G++)r.probe[G].addScaledVector(I.sh.coefficients[G],X);v++}else if(I.isDirectionalLight){let G=t.get(I);if(G.color.copy(I.color).multiplyScalar(I.intensity*M),I.castShadow){let K=I.shadow,ee=i.get(I);ee.shadowBias=K.bias,ee.shadowNormalBias=K.normalBias,ee.shadowRadius=K.radius,ee.shadowMapSize=K.mapSize,r.directionalShadow[x]=ee,r.directionalShadowMap[x]=H,r.directionalShadowMatrix[x]=I.shadow.matrix,b++}r.directional[x]=G,x++}else if(I.isSpotLight){let G=t.get(I);G.position.setFromMatrixPosition(I.matrixWorld),G.color.copy(O).multiplyScalar(X*M),G.distance=N,G.coneCos=Math.cos(I.angle),G.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),G.decay=I.decay,r.spot[m]=G;let K=I.shadow;if(I.map&&(r.spotLightMap[T]=I.map,T++,K.updateMatrices(I),I.castShadow&&R++),r.spotLightMatrix[m]=K.matrix,I.castShadow){let ee=i.get(I);ee.shadowBias=K.bias,ee.shadowNormalBias=K.normalBias,ee.shadowRadius=K.radius,ee.shadowMapSize=K.mapSize,r.spotShadow[m]=ee,r.spotShadowMap[m]=H,S++}m++}else if(I.isRectAreaLight){let G=t.get(I);G.color.copy(O).multiplyScalar(X),G.halfWidth.set(I.width*.5,0,0),G.halfHeight.set(0,I.height*.5,0),r.rectArea[y]=G,y++}else if(I.isPointLight){let G=t.get(I);if(G.color.copy(I.color).multiplyScalar(I.intensity*M),G.distance=I.distance,G.decay=I.decay,I.castShadow){let K=I.shadow,ee=i.get(I);ee.shadowBias=K.bias,ee.shadowNormalBias=K.normalBias,ee.shadowRadius=K.radius,ee.shadowMapSize=K.mapSize,ee.shadowCameraNear=K.camera.near,ee.shadowCameraFar=K.camera.far,r.pointShadow[p]=ee,r.pointShadowMap[p]=H,r.pointShadowMatrix[p]=I.shadow.matrix,E++}r.point[p]=G,p++}else if(I.isHemisphereLight){let G=t.get(I);G.skyColor.copy(I.color).multiplyScalar(X*M),G.groundColor.copy(I.groundColor).multiplyScalar(X*M),r.hemi[_]=G,_++}}y>0&&(e.isWebGL2?n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=ye.LTC_FLOAT_1,r.rectAreaLTC2=ye.LTC_FLOAT_2):(r.rectAreaLTC1=ye.LTC_HALF_1,r.rectAreaLTC2=ye.LTC_HALF_2):n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=ye.LTC_FLOAT_1,r.rectAreaLTC2=ye.LTC_FLOAT_2):n.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=ye.LTC_HALF_1,r.rectAreaLTC2=ye.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=f,r.ambient[1]=d,r.ambient[2]=g;let L=r.hash;(L.directionalLength!==x||L.pointLength!==p||L.spotLength!==m||L.rectAreaLength!==y||L.hemiLength!==_||L.numDirectionalShadows!==b||L.numPointShadows!==E||L.numSpotShadows!==S||L.numSpotMaps!==T||L.numLightProbes!==v)&&(r.directional.length=x,r.spot.length=m,r.rectArea.length=y,r.point.length=p,r.hemi.length=_,r.directionalShadow.length=b,r.directionalShadowMap.length=b,r.pointShadow.length=E,r.pointShadowMap.length=E,r.spotShadow.length=S,r.spotShadowMap.length=S,r.directionalShadowMatrix.length=b,r.pointShadowMatrix.length=E,r.spotLightMatrix.length=S+T-R,r.spotLightMap.length=T,r.numSpotLightShadowsWithMaps=R,r.numLightProbes=v,L.directionalLength=x,L.pointLength=p,L.spotLength=m,L.rectAreaLength=y,L.hemiLength=_,L.numDirectionalShadows=b,L.numPointShadows=E,L.numSpotShadows=S,L.numSpotMaps=T,L.numLightProbes=v,r.version=O_++)}function u(c,h){let f=0,d=0,g=0,x=0,p=0,m=h.matrixWorldInverse;for(let y=0,_=c.length;y<_;y++){let b=c[y];if(b.isDirectionalLight){let E=r.directional[f];E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(m),f++}else if(b.isSpotLight){let E=r.spot[g];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(m),E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(m),g++}else if(b.isRectAreaLight){let E=r.rectArea[x];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(m),a.identity(),o.copy(b.matrixWorld),o.premultiply(m),a.extractRotation(o),E.halfWidth.set(b.width*.5,0,0),E.halfHeight.set(0,b.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),x++}else if(b.isPointLight){let E=r.point[d];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(m),d++}else if(b.isHemisphereLight){let E=r.hemi[p];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(m),p++}}}return{setup:l,setupView:u,state:r}}function rh(n,e){let t=new k_(n,e),i=[],r=[];function s(){i.length=0,r.length=0}function o(h){i.push(h)}function a(h){r.push(h)}function l(h){t.setup(i,h)}function u(h){t.setupView(i,h)}return{init:s,state:{lightsArray:i,shadowsArray:r,lights:t},setupLights:l,setupLightsView:u,pushLight:o,pushShadow:a}}function z_(n,e){let t=new WeakMap;function i(s,o=0){let a=t.get(s),l;return a===void 0?(l=new rh(n,e),t.set(s,[l])):o>=a.length?(l=new rh(n,e),a.push(l)):l=a[o],l}function r(){t=new WeakMap}return{get:i,dispose:r}}var Pl=class extends ui{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=qp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Il=class extends ui{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},B_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,G_=`uniform sampler2D shadow_pass;
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
}`;function H_(n,e,t){let i=new us,r=new ie,s=new ie,o=new wt,a=new Pl({depthPacking:Yp}),l=new Il,u={},c=t.maxTextureSize,h={[Ti]:Lt,[Lt]:Ti,[Gt]:Gt},f=new $t({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ie},radius:{value:4}},vertexShader:B_,fragmentShader:G_}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let g=new Rt;g.setAttribute("position",new Kt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new se(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=gh;let m=this.type;this.render=function(S,T,R){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||S.length===0)return;let v=n.getRenderTarget(),M=n.getActiveCubeFace(),L=n.getActiveMipmapLevel(),z=n.state;z.setBlending(Si),z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);let V=m!==ri&&this.type===ri,I=m===ri&&this.type!==ri;for(let O=0,X=S.length;O<X;O++){let N=S[O],H=N.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",N,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;r.copy(H.mapSize);let G=H.getFrameExtents();if(r.multiply(G),s.copy(H.mapSize),(r.x>c||r.y>c)&&(r.x>c&&(s.x=Math.floor(c/G.x),r.x=s.x*G.x,H.mapSize.x=s.x),r.y>c&&(s.y=Math.floor(c/G.y),r.y=s.y*G.y,H.mapSize.y=s.y)),H.map===null||V===!0||I===!0){let ee=this.type!==ri?{minFilter:nn,magFilter:nn}:{};H.map!==null&&H.map.dispose(),H.map=new rn(r.x,r.y,ee),H.map.texture.name=N.name+".shadowMap",H.camera.updateProjectionMatrix()}n.setRenderTarget(H.map),n.clear();let K=H.getViewportCount();for(let ee=0;ee<K;ee++){let me=H.getViewport(ee);o.set(s.x*me.x,s.y*me.y,s.x*me.z,s.y*me.w),z.viewport(o),H.updateMatrices(N,ee),i=H.getFrustum(),b(T,R,H.camera,N,this.type)}H.isPointLightShadow!==!0&&this.type===ri&&y(H,R),H.needsUpdate=!1}m=this.type,p.needsUpdate=!1,n.setRenderTarget(v,M,L)};function y(S,T){let R=e.update(x);f.defines.VSM_SAMPLES!==S.blurSamples&&(f.defines.VSM_SAMPLES=S.blurSamples,d.defines.VSM_SAMPLES=S.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new rn(r.x,r.y)),f.uniforms.shadow_pass.value=S.map.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,n.setRenderTarget(S.mapPass),n.clear(),n.renderBufferDirect(T,null,R,f,x,null),d.uniforms.shadow_pass.value=S.mapPass.texture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,n.setRenderTarget(S.map),n.clear(),n.renderBufferDirect(T,null,R,d,x,null)}function _(S,T,R,v){let M=null,L=R.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(L!==void 0)M=L;else if(M=R.isPointLight===!0?l:a,n.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0){let z=M.uuid,V=T.uuid,I=u[z];I===void 0&&(I={},u[z]=I);let O=I[V];O===void 0&&(O=M.clone(),I[V]=O,T.addEventListener("dispose",E)),M=O}if(M.visible=T.visible,M.wireframe=T.wireframe,v===ri?M.side=T.shadowSide!==null?T.shadowSide:T.side:M.side=T.shadowSide!==null?T.shadowSide:h[T.side],M.alphaMap=T.alphaMap,M.alphaTest=T.alphaTest,M.map=T.map,M.clipShadows=T.clipShadows,M.clippingPlanes=T.clippingPlanes,M.clipIntersection=T.clipIntersection,M.displacementMap=T.displacementMap,M.displacementScale=T.displacementScale,M.displacementBias=T.displacementBias,M.wireframeLinewidth=T.wireframeLinewidth,M.linewidth=T.linewidth,R.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let z=n.properties.get(M);z.light=R}return M}function b(S,T,R,v,M){if(S.visible===!1)return;if(S.layers.test(T.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&M===ri)&&(!S.frustumCulled||i.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,S.matrixWorld);let V=e.update(S),I=S.material;if(Array.isArray(I)){let O=V.groups;for(let X=0,N=O.length;X<N;X++){let H=O[X],G=I[H.materialIndex];if(G&&G.visible){let K=_(S,G,v,M);S.onBeforeShadow(n,S,T,R,V,K,H),n.renderBufferDirect(R,null,V,K,S,H),S.onAfterShadow(n,S,T,R,V,K,H)}}}else if(I.visible){let O=_(S,I,v,M);S.onBeforeShadow(n,S,T,R,V,O,null),n.renderBufferDirect(R,null,V,O,S,null),S.onAfterShadow(n,S,T,R,V,O,null)}}let z=S.children;for(let V=0,I=z.length;V<I;V++)b(z[V],T,R,v,M)}function E(S){S.target.removeEventListener("dispose",E);for(let R in u){let v=u[R],M=S.target.uuid;M in v&&(v[M].dispose(),delete v[M])}}}function V_(n,e,t){let i=t.isWebGL2;function r(){let U=!1,Me=new wt,xe=null,ke=new wt(0,0,0,0);return{setMask:function(Be){xe!==Be&&!U&&(n.colorMask(Be,Be,Be,Be),xe=Be)},setLocked:function(Be){U=Be},setClear:function(Be,ht,dt,At,Ut){Ut===!0&&(Be*=At,ht*=At,dt*=At),Me.set(Be,ht,dt,At),ke.equals(Me)===!1&&(n.clearColor(Be,ht,dt,At),ke.copy(Me))},reset:function(){U=!1,xe=null,ke.set(-1,0,0,0)}}}function s(){let U=!1,Me=null,xe=null,ke=null;return{setTest:function(Be){Be?Ie(n.DEPTH_TEST):Ce(n.DEPTH_TEST)},setMask:function(Be){Me!==Be&&!U&&(n.depthMask(Be),Me=Be)},setFunc:function(Be){if(xe!==Be){switch(Be){case wp:n.depthFunc(n.NEVER);break;case Ep:n.depthFunc(n.ALWAYS);break;case Tp:n.depthFunc(n.LESS);break;case fo:n.depthFunc(n.LEQUAL);break;case Ap:n.depthFunc(n.EQUAL);break;case Cp:n.depthFunc(n.GEQUAL);break;case tc:n.depthFunc(n.GREATER);break;case Rp:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}xe=Be}},setLocked:function(Be){U=Be},setClear:function(Be){ke!==Be&&(n.clearDepth(Be),ke=Be)},reset:function(){U=!1,Me=null,xe=null,ke=null}}}function o(){let U=!1,Me=null,xe=null,ke=null,Be=null,ht=null,dt=null,At=null,Ut=null;return{setTest:function(lt){U||(lt?Ie(n.STENCIL_TEST):Ce(n.STENCIL_TEST))},setMask:function(lt){Me!==lt&&!U&&(n.stencilMask(lt),Me=lt)},setFunc:function(lt,zt,un){(xe!==lt||ke!==zt||Be!==un)&&(n.stencilFunc(lt,zt,un),xe=lt,ke=zt,Be=un)},setOp:function(lt,zt,un){(ht!==lt||dt!==zt||At!==un)&&(n.stencilOp(lt,zt,un),ht=lt,dt=zt,At=un)},setLocked:function(lt){U=lt},setClear:function(lt){Ut!==lt&&(n.clearStencil(lt),Ut=lt)},reset:function(){U=!1,Me=null,xe=null,ke=null,Be=null,ht=null,dt=null,At=null,Ut=null}}}let a=new r,l=new s,u=new o,c=new WeakMap,h=new WeakMap,f={},d={},g=new WeakMap,x=[],p=null,m=!1,y=null,_=null,b=null,E=null,S=null,T=null,R=null,v=new qe(0,0,0),M=0,L=!1,z=null,V=null,I=null,O=null,X=null,N=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),H=!1,G=0,K=n.getParameter(n.VERSION);K.indexOf("WebGL")!==-1?(G=parseFloat(/^WebGL (\d)/.exec(K)[1]),H=G>=1):K.indexOf("OpenGL ES")!==-1&&(G=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),H=G>=2);let ee=null,me={},q=n.getParameter(n.SCISSOR_BOX),oe=n.getParameter(n.VIEWPORT),fe=new wt().fromArray(q),ve=new wt().fromArray(oe);function Te(U,Me,xe,ke){let Be=new Uint8Array(4),ht=n.createTexture();n.bindTexture(U,ht),n.texParameteri(U,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(U,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let dt=0;dt<xe;dt++)i&&(U===n.TEXTURE_3D||U===n.TEXTURE_2D_ARRAY)?n.texImage3D(Me,0,n.RGBA,1,1,ke,0,n.RGBA,n.UNSIGNED_BYTE,Be):n.texImage2D(Me+dt,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Be);return ht}let Oe={};Oe[n.TEXTURE_2D]=Te(n.TEXTURE_2D,n.TEXTURE_2D,1),Oe[n.TEXTURE_CUBE_MAP]=Te(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),i&&(Oe[n.TEXTURE_2D_ARRAY]=Te(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Oe[n.TEXTURE_3D]=Te(n.TEXTURE_3D,n.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),u.setClear(0),Ie(n.DEPTH_TEST),l.setFunc(fo),ae(!1),A(zc),Ie(n.CULL_FACE),Q(Si);function Ie(U){f[U]!==!0&&(n.enable(U),f[U]=!0)}function Ce(U){f[U]!==!1&&(n.disable(U),f[U]=!1)}function Ge(U,Me){return d[U]!==Me?(n.bindFramebuffer(U,Me),d[U]=Me,i&&(U===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=Me),U===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=Me)),!0):!1}function D(U,Me){let xe=x,ke=!1;if(U)if(xe=g.get(Me),xe===void 0&&(xe=[],g.set(Me,xe)),U.isWebGLMultipleRenderTargets){let Be=U.texture;if(xe.length!==Be.length||xe[0]!==n.COLOR_ATTACHMENT0){for(let ht=0,dt=Be.length;ht<dt;ht++)xe[ht]=n.COLOR_ATTACHMENT0+ht;xe.length=Be.length,ke=!0}}else xe[0]!==n.COLOR_ATTACHMENT0&&(xe[0]=n.COLOR_ATTACHMENT0,ke=!0);else xe[0]!==n.BACK&&(xe[0]=n.BACK,ke=!0);ke&&(t.isWebGL2?n.drawBuffers(xe):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(xe))}function pe(U){return p!==U?(n.useProgram(U),p=U,!0):!1}let j={[Hi]:n.FUNC_ADD,[cp]:n.FUNC_SUBTRACT,[up]:n.FUNC_REVERSE_SUBTRACT};if(i)j[Hc]=n.MIN,j[Vc]=n.MAX;else{let U=e.get("EXT_blend_minmax");U!==null&&(j[Hc]=U.MIN_EXT,j[Vc]=U.MAX_EXT)}let ue={[hp]:n.ZERO,[dp]:n.ONE,[fp]:n.SRC_COLOR,[ul]:n.SRC_ALPHA,[yp]:n.SRC_ALPHA_SATURATE,[xp]:n.DST_COLOR,[mp]:n.DST_ALPHA,[pp]:n.ONE_MINUS_SRC_COLOR,[hl]:n.ONE_MINUS_SRC_ALPHA,[_p]:n.ONE_MINUS_DST_COLOR,[gp]:n.ONE_MINUS_DST_ALPHA,[vp]:n.CONSTANT_COLOR,[bp]:n.ONE_MINUS_CONSTANT_COLOR,[Mp]:n.CONSTANT_ALPHA,[Sp]:n.ONE_MINUS_CONSTANT_ALPHA};function Q(U,Me,xe,ke,Be,ht,dt,At,Ut,lt){if(U===Si){m===!0&&(Ce(n.BLEND),m=!1);return}if(m===!1&&(Ie(n.BLEND),m=!0),U!==lp){if(U!==y||lt!==L){if((_!==Hi||S!==Hi)&&(n.blendEquation(n.FUNC_ADD),_=Hi,S=Hi),lt)switch(U){case Lr:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case mn:n.blendFunc(n.ONE,n.ONE);break;case Bc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Gc:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case Lr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case mn:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Bc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Gc:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}b=null,E=null,T=null,R=null,v.set(0,0,0),M=0,y=U,L=lt}return}Be=Be||Me,ht=ht||xe,dt=dt||ke,(Me!==_||Be!==S)&&(n.blendEquationSeparate(j[Me],j[Be]),_=Me,S=Be),(xe!==b||ke!==E||ht!==T||dt!==R)&&(n.blendFuncSeparate(ue[xe],ue[ke],ue[ht],ue[dt]),b=xe,E=ke,T=ht,R=dt),(At.equals(v)===!1||Ut!==M)&&(n.blendColor(At.r,At.g,At.b,Ut),v.copy(At),M=Ut),y=U,L=!1}function de(U,Me){U.side===Gt?Ce(n.CULL_FACE):Ie(n.CULL_FACE);let xe=U.side===Lt;Me&&(xe=!xe),ae(xe),U.blending===Lr&&U.transparent===!1?Q(Si):Q(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),l.setFunc(U.depthFunc),l.setTest(U.depthTest),l.setMask(U.depthWrite),a.setMask(U.colorWrite);let ke=U.stencilWrite;u.setTest(ke),ke&&(u.setMask(U.stencilWriteMask),u.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),u.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),k(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?Ie(n.SAMPLE_ALPHA_TO_COVERAGE):Ce(n.SAMPLE_ALPHA_TO_COVERAGE)}function ae(U){z!==U&&(U?n.frontFace(n.CW):n.frontFace(n.CCW),z=U)}function A(U){U!==op?(Ie(n.CULL_FACE),U!==V&&(U===zc?n.cullFace(n.BACK):U===ap?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Ce(n.CULL_FACE),V=U}function w(U){U!==I&&(H&&n.lineWidth(U),I=U)}function k(U,Me,xe){U?(Ie(n.POLYGON_OFFSET_FILL),(O!==Me||X!==xe)&&(n.polygonOffset(Me,xe),O=Me,X=xe)):Ce(n.POLYGON_OFFSET_FILL)}function ce(U){U?Ie(n.SCISSOR_TEST):Ce(n.SCISSOR_TEST)}function re(U){U===void 0&&(U=n.TEXTURE0+N-1),ee!==U&&(n.activeTexture(U),ee=U)}function ne(U,Me,xe){xe===void 0&&(ee===null?xe=n.TEXTURE0+N-1:xe=ee);let ke=me[xe];ke===void 0&&(ke={type:void 0,texture:void 0},me[xe]=ke),(ke.type!==U||ke.texture!==Me)&&(ee!==xe&&(n.activeTexture(xe),ee=xe),n.bindTexture(U,Me||Oe[U]),ke.type=U,ke.texture=Me)}function Ae(){let U=me[ee];U!==void 0&&U.type!==void 0&&(n.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function be(){try{n.compressedTexImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Re(){try{n.compressedTexImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Pe(){try{n.texSubImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ze(){try{n.texSubImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function le(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function et(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function it(){try{n.texStorage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ye(){try{n.texStorage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Fe(){try{n.texImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Le(){try{n.texImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function je(U){fe.equals(U)===!1&&(n.scissor(U.x,U.y,U.z,U.w),fe.copy(U))}function ot(U){ve.equals(U)===!1&&(n.viewport(U.x,U.y,U.z,U.w),ve.copy(U))}function Mt(U,Me){let xe=h.get(Me);xe===void 0&&(xe=new WeakMap,h.set(Me,xe));let ke=xe.get(U);ke===void 0&&(ke=n.getUniformBlockIndex(Me,U.name),xe.set(U,ke))}function tt(U,Me){let ke=h.get(Me).get(U);c.get(Me)!==ke&&(n.uniformBlockBinding(Me,ke,U.__bindingPointIndex),c.set(Me,ke))}function ge(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),i===!0&&(n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null)),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),f={},ee=null,me={},d={},g=new WeakMap,x=[],p=null,m=!1,y=null,_=null,b=null,E=null,S=null,T=null,R=null,v=new qe(0,0,0),M=0,L=!1,z=null,V=null,I=null,O=null,X=null,fe.set(0,0,n.canvas.width,n.canvas.height),ve.set(0,0,n.canvas.width,n.canvas.height),a.reset(),l.reset(),u.reset()}return{buffers:{color:a,depth:l,stencil:u},enable:Ie,disable:Ce,bindFramebuffer:Ge,drawBuffers:D,useProgram:pe,setBlending:Q,setMaterial:de,setFlipSided:ae,setCullFace:A,setLineWidth:w,setPolygonOffset:k,setScissorTest:ce,activeTexture:re,bindTexture:ne,unbindTexture:Ae,compressedTexImage2D:be,compressedTexImage3D:Re,texImage2D:Fe,texImage3D:Le,updateUBOMapping:Mt,uniformBlockBinding:tt,texStorage2D:it,texStorage3D:Ye,texSubImage2D:Pe,texSubImage3D:Ze,compressedTexSubImage2D:le,compressedTexSubImage3D:et,scissor:je,viewport:ot,reset:ge}}function W_(n,e,t,i,r,s,o){let a=r.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,u=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new WeakMap,h,f=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,w){return d?new OffscreenCanvas(A,w):vo("canvas")}function x(A,w,k,ce){let re=1;if((A.width>ce||A.height>ce)&&(re=ce/Math.max(A.width,A.height)),re<1||w===!0)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap){let ne=w?_l:Math.floor,Ae=ne(re*A.width),be=ne(re*A.height);h===void 0&&(h=g(Ae,be));let Re=k?g(Ae,be):h;return Re.width=Ae,Re.height=be,Re.getContext("2d").drawImage(A,0,0,Ae,be),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+A.width+"x"+A.height+") to ("+Ae+"x"+be+")."),Re}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+A.width+"x"+A.height+")."),A;return A}function p(A){return bu(A.width)&&bu(A.height)}function m(A){return a?!1:A.wrapS!==Nt||A.wrapT!==Nt||A.minFilter!==nn&&A.minFilter!==vn}function y(A,w){return A.generateMipmaps&&w&&A.minFilter!==nn&&A.minFilter!==vn}function _(A){n.generateMipmap(A)}function b(A,w,k,ce,re=!1){if(a===!1)return w;if(A!==null){if(n[A]!==void 0)return n[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let ne=w;if(w===n.RED&&(k===n.FLOAT&&(ne=n.R32F),k===n.HALF_FLOAT&&(ne=n.R16F),k===n.UNSIGNED_BYTE&&(ne=n.R8)),w===n.RED_INTEGER&&(k===n.UNSIGNED_BYTE&&(ne=n.R8UI),k===n.UNSIGNED_SHORT&&(ne=n.R16UI),k===n.UNSIGNED_INT&&(ne=n.R32UI),k===n.BYTE&&(ne=n.R8I),k===n.SHORT&&(ne=n.R16I),k===n.INT&&(ne=n.R32I)),w===n.RG&&(k===n.FLOAT&&(ne=n.RG32F),k===n.HALF_FLOAT&&(ne=n.RG16F),k===n.UNSIGNED_BYTE&&(ne=n.RG8)),w===n.RGBA){let Ae=re?go:ft.getTransfer(ce);k===n.FLOAT&&(ne=n.RGBA32F),k===n.HALF_FLOAT&&(ne=n.RGBA16F),k===n.UNSIGNED_BYTE&&(ne=Ae===bt?n.SRGB8_ALPHA8:n.RGBA8),k===n.UNSIGNED_SHORT_4_4_4_4&&(ne=n.RGBA4),k===n.UNSIGNED_SHORT_5_5_5_1&&(ne=n.RGB5_A1)}return(ne===n.R16F||ne===n.R32F||ne===n.RG16F||ne===n.RG32F||ne===n.RGBA16F||ne===n.RGBA32F)&&e.get("EXT_color_buffer_float"),ne}function E(A,w,k){return y(A,k)===!0||A.isFramebufferTexture&&A.minFilter!==nn&&A.minFilter!==vn?Math.log2(Math.max(w.width,w.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?w.mipmaps.length:1}function S(A){return A===nn||A===Wc||A===Aa?n.NEAREST:n.LINEAR}function T(A){let w=A.target;w.removeEventListener("dispose",T),v(w),w.isVideoTexture&&c.delete(w)}function R(A){let w=A.target;w.removeEventListener("dispose",R),L(w)}function v(A){let w=i.get(A);if(w.__webglInit===void 0)return;let k=A.source,ce=f.get(k);if(ce){let re=ce[w.__cacheKey];re.usedTimes--,re.usedTimes===0&&M(A),Object.keys(ce).length===0&&f.delete(k)}i.remove(A)}function M(A){let w=i.get(A);n.deleteTexture(w.__webglTexture);let k=A.source,ce=f.get(k);delete ce[w.__cacheKey],o.memory.textures--}function L(A){let w=A.texture,k=i.get(A),ce=i.get(w);if(ce.__webglTexture!==void 0&&(n.deleteTexture(ce.__webglTexture),o.memory.textures--),A.depthTexture&&A.depthTexture.dispose(),A.isWebGLCubeRenderTarget)for(let re=0;re<6;re++){if(Array.isArray(k.__webglFramebuffer[re]))for(let ne=0;ne<k.__webglFramebuffer[re].length;ne++)n.deleteFramebuffer(k.__webglFramebuffer[re][ne]);else n.deleteFramebuffer(k.__webglFramebuffer[re]);k.__webglDepthbuffer&&n.deleteRenderbuffer(k.__webglDepthbuffer[re])}else{if(Array.isArray(k.__webglFramebuffer))for(let re=0;re<k.__webglFramebuffer.length;re++)n.deleteFramebuffer(k.__webglFramebuffer[re]);else n.deleteFramebuffer(k.__webglFramebuffer);if(k.__webglDepthbuffer&&n.deleteRenderbuffer(k.__webglDepthbuffer),k.__webglMultisampledFramebuffer&&n.deleteFramebuffer(k.__webglMultisampledFramebuffer),k.__webglColorRenderbuffer)for(let re=0;re<k.__webglColorRenderbuffer.length;re++)k.__webglColorRenderbuffer[re]&&n.deleteRenderbuffer(k.__webglColorRenderbuffer[re]);k.__webglDepthRenderbuffer&&n.deleteRenderbuffer(k.__webglDepthRenderbuffer)}if(A.isWebGLMultipleRenderTargets)for(let re=0,ne=w.length;re<ne;re++){let Ae=i.get(w[re]);Ae.__webglTexture&&(n.deleteTexture(Ae.__webglTexture),o.memory.textures--),i.remove(w[re])}i.remove(w),i.remove(A)}let z=0;function V(){z=0}function I(){let A=z;return A>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+r.maxTextures),z+=1,A}function O(A){let w=[];return w.push(A.wrapS),w.push(A.wrapT),w.push(A.wrapR||0),w.push(A.magFilter),w.push(A.minFilter),w.push(A.anisotropy),w.push(A.internalFormat),w.push(A.format),w.push(A.type),w.push(A.generateMipmaps),w.push(A.premultiplyAlpha),w.push(A.flipY),w.push(A.unpackAlignment),w.push(A.colorSpace),w.join()}function X(A,w){let k=i.get(A);if(A.isVideoTexture&&de(A),A.isRenderTargetTexture===!1&&A.version>0&&k.__version!==A.version){let ce=A.image;if(ce===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ce.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{fe(k,A,w);return}}t.bindTexture(n.TEXTURE_2D,k.__webglTexture,n.TEXTURE0+w)}function N(A,w){let k=i.get(A);if(A.version>0&&k.__version!==A.version){fe(k,A,w);return}t.bindTexture(n.TEXTURE_2D_ARRAY,k.__webglTexture,n.TEXTURE0+w)}function H(A,w){let k=i.get(A);if(A.version>0&&k.__version!==A.version){fe(k,A,w);return}t.bindTexture(n.TEXTURE_3D,k.__webglTexture,n.TEXTURE0+w)}function G(A,w){let k=i.get(A);if(A.version>0&&k.__version!==A.version){ve(k,A,w);return}t.bindTexture(n.TEXTURE_CUBE_MAP,k.__webglTexture,n.TEXTURE0+w)}let K={[Ai]:n.REPEAT,[Nt]:n.CLAMP_TO_EDGE,[pl]:n.MIRRORED_REPEAT},ee={[nn]:n.NEAREST,[Wc]:n.NEAREST_MIPMAP_NEAREST,[Aa]:n.NEAREST_MIPMAP_LINEAR,[vn]:n.LINEAR,[Fp]:n.LINEAR_MIPMAP_NEAREST,[cs]:n.LINEAR_MIPMAP_LINEAR},me={[Zp]:n.NEVER,[tm]:n.ALWAYS,[$p]:n.LESS,[Ch]:n.LEQUAL,[Jp]:n.EQUAL,[em]:n.GEQUAL,[jp]:n.GREATER,[Qp]:n.NOTEQUAL};function q(A,w,k){if(k?(n.texParameteri(A,n.TEXTURE_WRAP_S,K[w.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,K[w.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,K[w.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,ee[w.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,ee[w.minFilter])):(n.texParameteri(A,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(A,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,n.CLAMP_TO_EDGE),(w.wrapS!==Nt||w.wrapT!==Nt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),n.texParameteri(A,n.TEXTURE_MAG_FILTER,S(w.magFilter)),n.texParameteri(A,n.TEXTURE_MIN_FILTER,S(w.minFilter)),w.minFilter!==nn&&w.minFilter!==vn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),w.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,me[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){let ce=e.get("EXT_texture_filter_anisotropic");if(w.magFilter===nn||w.minFilter!==Aa&&w.minFilter!==cs||w.type===Mi&&e.has("OES_texture_float_linear")===!1||a===!1&&w.type===Ki&&e.has("OES_texture_half_float_linear")===!1)return;(w.anisotropy>1||i.get(w).__currentAnisotropy)&&(n.texParameterf(A,ce.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),i.get(w).__currentAnisotropy=w.anisotropy)}}function oe(A,w){let k=!1;A.__webglInit===void 0&&(A.__webglInit=!0,w.addEventListener("dispose",T));let ce=w.source,re=f.get(ce);re===void 0&&(re={},f.set(ce,re));let ne=O(w);if(ne!==A.__cacheKey){re[ne]===void 0&&(re[ne]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,k=!0),re[ne].usedTimes++;let Ae=re[A.__cacheKey];Ae!==void 0&&(re[A.__cacheKey].usedTimes--,Ae.usedTimes===0&&M(w)),A.__cacheKey=ne,A.__webglTexture=re[ne].texture}return k}function fe(A,w,k){let ce=n.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(ce=n.TEXTURE_2D_ARRAY),w.isData3DTexture&&(ce=n.TEXTURE_3D);let re=oe(A,w),ne=w.source;t.bindTexture(ce,A.__webglTexture,n.TEXTURE0+k);let Ae=i.get(ne);if(ne.version!==Ae.__version||re===!0){t.activeTexture(n.TEXTURE0+k);let be=ft.getPrimaries(ft.workingColorSpace),Re=w.colorSpace===bn?null:ft.getPrimaries(w.colorSpace),Pe=w.colorSpace===bn||be===Re?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pe);let Ze=m(w)&&p(w.image)===!1,le=x(w.image,Ze,!1,r.maxTextureSize);le=ae(w,le);let et=p(le)||a,it=s.convert(w.format,w.colorSpace),Ye=s.convert(w.type),Fe=b(w.internalFormat,it,Ye,w.colorSpace,w.isVideoTexture);q(ce,w,et);let Le,je=w.mipmaps,ot=a&&w.isVideoTexture!==!0&&Fe!==wh,Mt=Ae.__version===void 0||re===!0,tt=E(w,le,et);if(w.isDepthTexture)Fe=n.DEPTH_COMPONENT,a?w.type===Mi?Fe=n.DEPTH_COMPONENT32F:w.type===bi?Fe=n.DEPTH_COMPONENT24:w.type===Xi?Fe=n.DEPTH24_STENCIL8:Fe=n.DEPTH_COMPONENT16:w.type===Mi&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),w.format===qi&&Fe===n.DEPTH_COMPONENT&&w.type!==ic&&w.type!==bi&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),w.type=bi,Ye=s.convert(w.type)),w.format===Fr&&Fe===n.DEPTH_COMPONENT&&(Fe=n.DEPTH_STENCIL,w.type!==Xi&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),w.type=Xi,Ye=s.convert(w.type))),Mt&&(ot?t.texStorage2D(n.TEXTURE_2D,1,Fe,le.width,le.height):t.texImage2D(n.TEXTURE_2D,0,Fe,le.width,le.height,0,it,Ye,null));else if(w.isDataTexture)if(je.length>0&&et){ot&&Mt&&t.texStorage2D(n.TEXTURE_2D,tt,Fe,je[0].width,je[0].height);for(let ge=0,U=je.length;ge<U;ge++)Le=je[ge],ot?t.texSubImage2D(n.TEXTURE_2D,ge,0,0,Le.width,Le.height,it,Ye,Le.data):t.texImage2D(n.TEXTURE_2D,ge,Fe,Le.width,Le.height,0,it,Ye,Le.data);w.generateMipmaps=!1}else ot?(Mt&&t.texStorage2D(n.TEXTURE_2D,tt,Fe,le.width,le.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,le.width,le.height,it,Ye,le.data)):t.texImage2D(n.TEXTURE_2D,0,Fe,le.width,le.height,0,it,Ye,le.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){ot&&Mt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,tt,Fe,je[0].width,je[0].height,le.depth);for(let ge=0,U=je.length;ge<U;ge++)Le=je[ge],w.format!==Un?it!==null?ot?t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ge,0,0,0,Le.width,Le.height,le.depth,it,Le.data,0,0):t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ge,Fe,Le.width,Le.height,le.depth,0,Le.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ot?t.texSubImage3D(n.TEXTURE_2D_ARRAY,ge,0,0,0,Le.width,Le.height,le.depth,it,Ye,Le.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ge,Fe,Le.width,Le.height,le.depth,0,it,Ye,Le.data)}else{ot&&Mt&&t.texStorage2D(n.TEXTURE_2D,tt,Fe,je[0].width,je[0].height);for(let ge=0,U=je.length;ge<U;ge++)Le=je[ge],w.format!==Un?it!==null?ot?t.compressedTexSubImage2D(n.TEXTURE_2D,ge,0,0,Le.width,Le.height,it,Le.data):t.compressedTexImage2D(n.TEXTURE_2D,ge,Fe,Le.width,Le.height,0,Le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ot?t.texSubImage2D(n.TEXTURE_2D,ge,0,0,Le.width,Le.height,it,Ye,Le.data):t.texImage2D(n.TEXTURE_2D,ge,Fe,Le.width,Le.height,0,it,Ye,Le.data)}else if(w.isDataArrayTexture)ot?(Mt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,tt,Fe,le.width,le.height,le.depth),t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,le.width,le.height,le.depth,it,Ye,le.data)):t.texImage3D(n.TEXTURE_2D_ARRAY,0,Fe,le.width,le.height,le.depth,0,it,Ye,le.data);else if(w.isData3DTexture)ot?(Mt&&t.texStorage3D(n.TEXTURE_3D,tt,Fe,le.width,le.height,le.depth),t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,le.width,le.height,le.depth,it,Ye,le.data)):t.texImage3D(n.TEXTURE_3D,0,Fe,le.width,le.height,le.depth,0,it,Ye,le.data);else if(w.isFramebufferTexture){if(Mt)if(ot)t.texStorage2D(n.TEXTURE_2D,tt,Fe,le.width,le.height);else{let ge=le.width,U=le.height;for(let Me=0;Me<tt;Me++)t.texImage2D(n.TEXTURE_2D,Me,Fe,ge,U,0,it,Ye,null),ge>>=1,U>>=1}}else if(je.length>0&&et){ot&&Mt&&t.texStorage2D(n.TEXTURE_2D,tt,Fe,je[0].width,je[0].height);for(let ge=0,U=je.length;ge<U;ge++)Le=je[ge],ot?t.texSubImage2D(n.TEXTURE_2D,ge,0,0,it,Ye,Le):t.texImage2D(n.TEXTURE_2D,ge,Fe,it,Ye,Le);w.generateMipmaps=!1}else ot?(Mt&&t.texStorage2D(n.TEXTURE_2D,tt,Fe,le.width,le.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,it,Ye,le)):t.texImage2D(n.TEXTURE_2D,0,Fe,it,Ye,le);y(w,et)&&_(ce),Ae.__version=ne.version,w.onUpdate&&w.onUpdate(w)}A.__version=w.version}function ve(A,w,k){if(w.image.length!==6)return;let ce=oe(A,w),re=w.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+k);let ne=i.get(re);if(re.version!==ne.__version||ce===!0){t.activeTexture(n.TEXTURE0+k);let Ae=ft.getPrimaries(ft.workingColorSpace),be=w.colorSpace===bn?null:ft.getPrimaries(w.colorSpace),Re=w.colorSpace===bn||Ae===be?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Re);let Pe=w.isCompressedTexture||w.image[0].isCompressedTexture,Ze=w.image[0]&&w.image[0].isDataTexture,le=[];for(let ge=0;ge<6;ge++)!Pe&&!Ze?le[ge]=x(w.image[ge],!1,!0,r.maxCubemapSize):le[ge]=Ze?w.image[ge].image:w.image[ge],le[ge]=ae(w,le[ge]);let et=le[0],it=p(et)||a,Ye=s.convert(w.format,w.colorSpace),Fe=s.convert(w.type),Le=b(w.internalFormat,Ye,Fe,w.colorSpace),je=a&&w.isVideoTexture!==!0,ot=ne.__version===void 0||ce===!0,Mt=E(w,et,it);q(n.TEXTURE_CUBE_MAP,w,it);let tt;if(Pe){je&&ot&&t.texStorage2D(n.TEXTURE_CUBE_MAP,Mt,Le,et.width,et.height);for(let ge=0;ge<6;ge++){tt=le[ge].mipmaps;for(let U=0;U<tt.length;U++){let Me=tt[U];w.format!==Un?Ye!==null?je?t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,U,0,0,Me.width,Me.height,Ye,Me.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,U,Le,Me.width,Me.height,0,Me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):je?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,U,0,0,Me.width,Me.height,Ye,Fe,Me.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,U,Le,Me.width,Me.height,0,Ye,Fe,Me.data)}}}else{tt=w.mipmaps,je&&ot&&(tt.length>0&&Mt++,t.texStorage2D(n.TEXTURE_CUBE_MAP,Mt,Le,le[0].width,le[0].height));for(let ge=0;ge<6;ge++)if(Ze){je?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,le[ge].width,le[ge].height,Ye,Fe,le[ge].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,Le,le[ge].width,le[ge].height,0,Ye,Fe,le[ge].data);for(let U=0;U<tt.length;U++){let xe=tt[U].image[ge].image;je?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,U+1,0,0,xe.width,xe.height,Ye,Fe,xe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,U+1,Le,xe.width,xe.height,0,Ye,Fe,xe.data)}}else{je?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,Ye,Fe,le[ge]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,Le,Ye,Fe,le[ge]);for(let U=0;U<tt.length;U++){let Me=tt[U];je?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,U+1,0,0,Ye,Fe,Me.image[ge]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,U+1,Le,Ye,Fe,Me.image[ge])}}}y(w,it)&&_(n.TEXTURE_CUBE_MAP),ne.__version=re.version,w.onUpdate&&w.onUpdate(w)}A.__version=w.version}function Te(A,w,k,ce,re,ne){let Ae=s.convert(k.format,k.colorSpace),be=s.convert(k.type),Re=b(k.internalFormat,Ae,be,k.colorSpace);if(!i.get(w).__hasExternalTextures){let Ze=Math.max(1,w.width>>ne),le=Math.max(1,w.height>>ne);re===n.TEXTURE_3D||re===n.TEXTURE_2D_ARRAY?t.texImage3D(re,ne,Re,Ze,le,w.depth,0,Ae,be,null):t.texImage2D(re,ne,Re,Ze,le,0,Ae,be,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),Q(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ce,re,i.get(k).__webglTexture,0,ue(w)):(re===n.TEXTURE_2D||re>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&re<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,ce,re,i.get(k).__webglTexture,ne),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Oe(A,w,k){if(n.bindRenderbuffer(n.RENDERBUFFER,A),w.depthBuffer&&!w.stencilBuffer){let ce=a===!0?n.DEPTH_COMPONENT24:n.DEPTH_COMPONENT16;if(k||Q(w)){let re=w.depthTexture;re&&re.isDepthTexture&&(re.type===Mi?ce=n.DEPTH_COMPONENT32F:re.type===bi&&(ce=n.DEPTH_COMPONENT24));let ne=ue(w);Q(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ne,ce,w.width,w.height):n.renderbufferStorageMultisample(n.RENDERBUFFER,ne,ce,w.width,w.height)}else n.renderbufferStorage(n.RENDERBUFFER,ce,w.width,w.height);n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.RENDERBUFFER,A)}else if(w.depthBuffer&&w.stencilBuffer){let ce=ue(w);k&&Q(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,ce,n.DEPTH24_STENCIL8,w.width,w.height):Q(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ce,n.DEPTH24_STENCIL8,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,n.DEPTH_STENCIL,w.width,w.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.RENDERBUFFER,A)}else{let ce=w.isWebGLMultipleRenderTargets===!0?w.texture:[w.texture];for(let re=0;re<ce.length;re++){let ne=ce[re],Ae=s.convert(ne.format,ne.colorSpace),be=s.convert(ne.type),Re=b(ne.internalFormat,Ae,be,ne.colorSpace),Pe=ue(w);k&&Q(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Pe,Re,w.width,w.height):Q(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Pe,Re,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,Re,w.width,w.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Ie(A,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(w.depthTexture).__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),X(w.depthTexture,0);let ce=i.get(w.depthTexture).__webglTexture,re=ue(w);if(w.depthTexture.format===qi)Q(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ce,0,re):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ce,0);else if(w.depthTexture.format===Fr)Q(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ce,0,re):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ce,0);else throw new Error("Unknown depthTexture format")}function Ce(A){let w=i.get(A),k=A.isWebGLCubeRenderTarget===!0;if(A.depthTexture&&!w.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");Ie(w.__webglFramebuffer,A)}else if(k){w.__webglDepthbuffer=[];for(let ce=0;ce<6;ce++)t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer[ce]),w.__webglDepthbuffer[ce]=n.createRenderbuffer(),Oe(w.__webglDepthbuffer[ce],A,!1)}else t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer=n.createRenderbuffer(),Oe(w.__webglDepthbuffer,A,!1);t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ge(A,w,k){let ce=i.get(A);w!==void 0&&Te(ce.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),k!==void 0&&Ce(A)}function D(A){let w=A.texture,k=i.get(A),ce=i.get(w);A.addEventListener("dispose",R),A.isWebGLMultipleRenderTargets!==!0&&(ce.__webglTexture===void 0&&(ce.__webglTexture=n.createTexture()),ce.__version=w.version,o.memory.textures++);let re=A.isWebGLCubeRenderTarget===!0,ne=A.isWebGLMultipleRenderTargets===!0,Ae=p(A)||a;if(re){k.__webglFramebuffer=[];for(let be=0;be<6;be++)if(a&&w.mipmaps&&w.mipmaps.length>0){k.__webglFramebuffer[be]=[];for(let Re=0;Re<w.mipmaps.length;Re++)k.__webglFramebuffer[be][Re]=n.createFramebuffer()}else k.__webglFramebuffer[be]=n.createFramebuffer()}else{if(a&&w.mipmaps&&w.mipmaps.length>0){k.__webglFramebuffer=[];for(let be=0;be<w.mipmaps.length;be++)k.__webglFramebuffer[be]=n.createFramebuffer()}else k.__webglFramebuffer=n.createFramebuffer();if(ne)if(r.drawBuffers){let be=A.texture;for(let Re=0,Pe=be.length;Re<Pe;Re++){let Ze=i.get(be[Re]);Ze.__webglTexture===void 0&&(Ze.__webglTexture=n.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&A.samples>0&&Q(A)===!1){let be=ne?w:[w];k.__webglMultisampledFramebuffer=n.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let Re=0;Re<be.length;Re++){let Pe=be[Re];k.__webglColorRenderbuffer[Re]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,k.__webglColorRenderbuffer[Re]);let Ze=s.convert(Pe.format,Pe.colorSpace),le=s.convert(Pe.type),et=b(Pe.internalFormat,Ze,le,Pe.colorSpace,A.isXRRenderTarget===!0),it=ue(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,it,et,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Re,n.RENDERBUFFER,k.__webglColorRenderbuffer[Re])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(k.__webglDepthRenderbuffer=n.createRenderbuffer(),Oe(k.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(re){t.bindTexture(n.TEXTURE_CUBE_MAP,ce.__webglTexture),q(n.TEXTURE_CUBE_MAP,w,Ae);for(let be=0;be<6;be++)if(a&&w.mipmaps&&w.mipmaps.length>0)for(let Re=0;Re<w.mipmaps.length;Re++)Te(k.__webglFramebuffer[be][Re],A,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+be,Re);else Te(k.__webglFramebuffer[be],A,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+be,0);y(w,Ae)&&_(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ne){let be=A.texture;for(let Re=0,Pe=be.length;Re<Pe;Re++){let Ze=be[Re],le=i.get(Ze);t.bindTexture(n.TEXTURE_2D,le.__webglTexture),q(n.TEXTURE_2D,Ze,Ae),Te(k.__webglFramebuffer,A,Ze,n.COLOR_ATTACHMENT0+Re,n.TEXTURE_2D,0),y(Ze,Ae)&&_(n.TEXTURE_2D)}t.unbindTexture()}else{let be=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(a?be=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(be,ce.__webglTexture),q(be,w,Ae),a&&w.mipmaps&&w.mipmaps.length>0)for(let Re=0;Re<w.mipmaps.length;Re++)Te(k.__webglFramebuffer[Re],A,w,n.COLOR_ATTACHMENT0,be,Re);else Te(k.__webglFramebuffer,A,w,n.COLOR_ATTACHMENT0,be,0);y(w,Ae)&&_(be),t.unbindTexture()}A.depthBuffer&&Ce(A)}function pe(A){let w=p(A)||a,k=A.isWebGLMultipleRenderTargets===!0?A.texture:[A.texture];for(let ce=0,re=k.length;ce<re;ce++){let ne=k[ce];if(y(ne,w)){let Ae=A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,be=i.get(ne).__webglTexture;t.bindTexture(Ae,be),_(Ae),t.unbindTexture()}}}function j(A){if(a&&A.samples>0&&Q(A)===!1){let w=A.isWebGLMultipleRenderTargets?A.texture:[A.texture],k=A.width,ce=A.height,re=n.COLOR_BUFFER_BIT,ne=[],Ae=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,be=i.get(A),Re=A.isWebGLMultipleRenderTargets===!0;if(Re)for(let Pe=0;Pe<w.length;Pe++)t.bindFramebuffer(n.FRAMEBUFFER,be.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Pe,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,be.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Pe,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let Pe=0;Pe<w.length;Pe++){ne.push(n.COLOR_ATTACHMENT0+Pe),A.depthBuffer&&ne.push(Ae);let Ze=be.__ignoreDepthValues!==void 0?be.__ignoreDepthValues:!1;if(Ze===!1&&(A.depthBuffer&&(re|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&(re|=n.STENCIL_BUFFER_BIT)),Re&&n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,be.__webglColorRenderbuffer[Pe]),Ze===!0&&(n.invalidateFramebuffer(n.READ_FRAMEBUFFER,[Ae]),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[Ae])),Re){let le=i.get(w[Pe]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,le,0)}n.blitFramebuffer(0,0,k,ce,0,0,k,ce,re,n.NEAREST),u&&n.invalidateFramebuffer(n.READ_FRAMEBUFFER,ne)}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Re)for(let Pe=0;Pe<w.length;Pe++){t.bindFramebuffer(n.FRAMEBUFFER,be.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Pe,n.RENDERBUFFER,be.__webglColorRenderbuffer[Pe]);let Ze=i.get(w[Pe]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,be.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Pe,n.TEXTURE_2D,Ze,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}}function ue(A){return Math.min(r.maxSamples,A.samples)}function Q(A){let w=i.get(A);return a&&A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function de(A){let w=o.render.frame;c.get(A)!==w&&(c.set(A,w),A.update())}function ae(A,w){let k=A.colorSpace,ce=A.format,re=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||A.format===gl||k!==ci&&k!==bn&&(ft.getTransfer(k)===bt?a===!1?e.has("EXT_sRGB")===!0&&ce===Un?(A.format=gl,A.minFilter=vn,A.generateMipmaps=!1):w=bo.sRGBToLinear(w):(ce!==Un||re!==wi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),w}this.allocateTextureUnit=I,this.resetTextureUnits=V,this.setTexture2D=X,this.setTexture2DArray=N,this.setTexture3D=H,this.setTextureCube=G,this.rebindTextures=Ge,this.setupRenderTarget=D,this.updateRenderTargetMipmap=pe,this.updateMultisampleRenderTarget=j,this.setupDepthRenderbuffer=Ce,this.setupFrameBufferTexture=Te,this.useMultisampledRTT=Q}function X_(n,e,t){let i=t.isWebGL2;function r(s,o=bn){let a,l=ft.getTransfer(o);if(s===wi)return n.UNSIGNED_BYTE;if(s===yh)return n.UNSIGNED_SHORT_4_4_4_4;if(s===vh)return n.UNSIGNED_SHORT_5_5_5_1;if(s===kp)return n.BYTE;if(s===zp)return n.SHORT;if(s===ic)return n.UNSIGNED_SHORT;if(s===_h)return n.INT;if(s===bi)return n.UNSIGNED_INT;if(s===Mi)return n.FLOAT;if(s===Ki)return i?n.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===Bp)return n.ALPHA;if(s===Un)return n.RGBA;if(s===Gp)return n.LUMINANCE;if(s===Hp)return n.LUMINANCE_ALPHA;if(s===qi)return n.DEPTH_COMPONENT;if(s===Fr)return n.DEPTH_STENCIL;if(s===gl)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===Vp)return n.RED;if(s===bh)return n.RED_INTEGER;if(s===Wp)return n.RG;if(s===Mh)return n.RG_INTEGER;if(s===Sh)return n.RGBA_INTEGER;if(s===Ca||s===Ra||s===Pa||s===Ia)if(l===bt)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===Ca)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Ra)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===Pa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Ia)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===Ca)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Ra)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===Pa)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Ia)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===Xc||s===qc||s===Yc||s===Kc)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===Xc)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===qc)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Yc)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Kc)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===wh)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===Zc||s===$c)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===Zc)return l===bt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===$c)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===Jc||s===jc||s===Qc||s===eu||s===tu||s===nu||s===iu||s===ru||s===su||s===ou||s===au||s===lu||s===cu||s===uu)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===Jc)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===jc)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Qc)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===eu)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===tu)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===nu)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===iu)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===ru)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===su)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===ou)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===au)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===lu)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===cu)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===uu)return l===bt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===La||s===hu||s===du)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===La)return l===bt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===hu)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===du)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Xp||s===fu||s===pu||s===mu)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===La)return a.COMPRESSED_RED_RGTC1_EXT;if(s===fu)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===pu)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===mu)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===Xi?i?n.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):n[s]!==void 0?n[s]:null}return{convert:r}}var Ll=class extends dn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Se=class extends Zt{constructor(){super(),this.isGroup=!0,this.type="Group"}},q_={type:"move"},os=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Se,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Se,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Se,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,u=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(u&&e.hand){o=!0;for(let x of e.hand.values()){let p=t.getJointPose(x,i),m=this._getHandJoint(u,x);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let c=u.joints["index-finger-tip"],h=u.joints["thumb-tip"],f=c.position.distanceTo(h.position),d=.02,g=.005;u.inputState.pinching&&f>d+g?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&f<=d-g&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(q_)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),u!==null&&(u.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Se;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},Dl=class extends Ci{constructor(e,t){super();let i=this,r=null,s=1,o=null,a="local-floor",l=1,u=null,c=null,h=null,f=null,d=null,g=null,x=t.getContextAttributes(),p=null,m=null,y=[],_=[],b=new ie,E=null,S=new dn;S.layers.enable(1),S.viewport=new wt;let T=new dn;T.layers.enable(2),T.viewport=new wt;let R=[S,T],v=new Ll;v.layers.enable(1),v.layers.enable(2);let M=null,L=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let oe=y[q];return oe===void 0&&(oe=new os,y[q]=oe),oe.getTargetRaySpace()},this.getControllerGrip=function(q){let oe=y[q];return oe===void 0&&(oe=new os,y[q]=oe),oe.getGripSpace()},this.getHand=function(q){let oe=y[q];return oe===void 0&&(oe=new os,y[q]=oe),oe.getHandSpace()};function z(q){let oe=_.indexOf(q.inputSource);if(oe===-1)return;let fe=y[oe];fe!==void 0&&(fe.update(q.inputSource,q.frame,u||o),fe.dispatchEvent({type:q.type,data:q.inputSource}))}function V(){r.removeEventListener("select",z),r.removeEventListener("selectstart",z),r.removeEventListener("selectend",z),r.removeEventListener("squeeze",z),r.removeEventListener("squeezestart",z),r.removeEventListener("squeezeend",z),r.removeEventListener("end",V),r.removeEventListener("inputsourceschange",I);for(let q=0;q<y.length;q++){let oe=_[q];oe!==null&&(_[q]=null,y[q].disconnect(oe))}M=null,L=null,e.setRenderTarget(p),d=null,f=null,h=null,r=null,m=null,me.stop(),i.isPresenting=!1,e.setPixelRatio(E),e.setSize(b.width,b.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||o},this.setReferenceSpace=function(q){u=q},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(q){if(r=q,r!==null){if(p=e.getRenderTarget(),r.addEventListener("select",z),r.addEventListener("selectstart",z),r.addEventListener("selectend",z),r.addEventListener("squeeze",z),r.addEventListener("squeezestart",z),r.addEventListener("squeezeend",z),r.addEventListener("end",V),r.addEventListener("inputsourceschange",I),x.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(b),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){let oe={antialias:r.renderState.layers===void 0?x.antialias:!0,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(r,t,oe),r.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),m=new rn(d.framebufferWidth,d.framebufferHeight,{format:Un,type:wi,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let oe=null,fe=null,ve=null;x.depth&&(ve=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,oe=x.stencil?Fr:qi,fe=x.stencil?Xi:bi);let Te={colorFormat:t.RGBA8,depthFormat:ve,scaleFactor:s};h=new XRWebGLBinding(r,t),f=h.createProjectionLayer(Te),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),m=new rn(f.textureWidth,f.textureHeight,{format:Un,type:wi,depthTexture:new Po(f.textureWidth,f.textureHeight,fe,void 0,void 0,void 0,void 0,void 0,void 0,oe),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0});let Oe=e.properties.get(m);Oe.__ignoreDepthValues=f.ignoreDepthValues}m.isXRRenderTarget=!0,this.setFoveation(l),u=null,o=await r.requestReferenceSpace(a),me.setContext(r),me.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function I(q){for(let oe=0;oe<q.removed.length;oe++){let fe=q.removed[oe],ve=_.indexOf(fe);ve>=0&&(_[ve]=null,y[ve].disconnect(fe))}for(let oe=0;oe<q.added.length;oe++){let fe=q.added[oe],ve=_.indexOf(fe);if(ve===-1){for(let Oe=0;Oe<y.length;Oe++)if(Oe>=_.length){_.push(fe),ve=Oe;break}else if(_[Oe]===null){_[Oe]=fe,ve=Oe;break}if(ve===-1)break}let Te=y[ve];Te&&Te.connect(fe)}}let O=new P,X=new P;function N(q,oe,fe){O.setFromMatrixPosition(oe.matrixWorld),X.setFromMatrixPosition(fe.matrixWorld);let ve=O.distanceTo(X),Te=oe.projectionMatrix.elements,Oe=fe.projectionMatrix.elements,Ie=Te[14]/(Te[10]-1),Ce=Te[14]/(Te[10]+1),Ge=(Te[9]+1)/Te[5],D=(Te[9]-1)/Te[5],pe=(Te[8]-1)/Te[0],j=(Oe[8]+1)/Oe[0],ue=Ie*pe,Q=Ie*j,de=ve/(-pe+j),ae=de*-pe;oe.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(ae),q.translateZ(de),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert();let A=Ie+de,w=Ce+de,k=ue-ae,ce=Q+(ve-ae),re=Ge*Ce/w*A,ne=D*Ce/w*A;q.projectionMatrix.makePerspective(k,ce,re,ne,A,w),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}function H(q,oe){oe===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(oe.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(r===null)return;v.near=T.near=S.near=q.near,v.far=T.far=S.far=q.far,(M!==v.near||L!==v.far)&&(r.updateRenderState({depthNear:v.near,depthFar:v.far}),M=v.near,L=v.far);let oe=q.parent,fe=v.cameras;H(v,oe);for(let ve=0;ve<fe.length;ve++)H(fe[ve],oe);fe.length===2?N(v,S,T):v.projectionMatrix.copy(S.projectionMatrix),G(q,v,oe)};function G(q,oe,fe){fe===null?q.matrix.copy(oe.matrixWorld):(q.matrix.copy(fe.matrixWorld),q.matrix.invert(),q.matrix.multiply(oe.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(oe.projectionMatrix),q.projectionMatrixInverse.copy(oe.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=xl*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(q){l=q,f!==null&&(f.fixedFoveation=q),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=q)};let K=null;function ee(q,oe){if(c=oe.getViewerPose(u||o),g=oe,c!==null){let fe=c.views;d!==null&&(e.setRenderTargetFramebuffer(m,d.framebuffer),e.setRenderTarget(m));let ve=!1;fe.length!==v.cameras.length&&(v.cameras.length=0,ve=!0);for(let Te=0;Te<fe.length;Te++){let Oe=fe[Te],Ie=null;if(d!==null)Ie=d.getViewport(Oe);else{let Ge=h.getViewSubImage(f,Oe);Ie=Ge.viewport,Te===0&&(e.setRenderTargetTextures(m,Ge.colorTexture,f.ignoreDepthValues?void 0:Ge.depthStencilTexture),e.setRenderTarget(m))}let Ce=R[Te];Ce===void 0&&(Ce=new dn,Ce.layers.enable(Te),Ce.viewport=new wt,R[Te]=Ce),Ce.matrix.fromArray(Oe.transform.matrix),Ce.matrix.decompose(Ce.position,Ce.quaternion,Ce.scale),Ce.projectionMatrix.fromArray(Oe.projectionMatrix),Ce.projectionMatrixInverse.copy(Ce.projectionMatrix).invert(),Ce.viewport.set(Ie.x,Ie.y,Ie.width,Ie.height),Te===0&&(v.matrix.copy(Ce.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),ve===!0&&v.cameras.push(Ce)}}for(let fe=0;fe<y.length;fe++){let ve=_[fe],Te=y[fe];ve!==null&&Te!==void 0&&Te.update(ve,oe,u||o)}K&&K(q,oe),oe.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:oe}),g=null}let me=new Lh;me.setAnimationLoop(ee),this.setAnimationLoop=function(q){K=q},this.dispose=function(){}}};function Y_(n,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function i(p,m){m.color.getRGB(p.fogColor.value,Ih(n)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function r(p,m,y,_,b){m.isMeshBasicMaterial||m.isMeshLambertMaterial?s(p,m):m.isMeshToonMaterial?(s(p,m),h(p,m)):m.isMeshPhongMaterial?(s(p,m),c(p,m)):m.isMeshStandardMaterial?(s(p,m),f(p,m),m.isMeshPhysicalMaterial&&d(p,m,b)):m.isMeshMatcapMaterial?(s(p,m),g(p,m)):m.isMeshDepthMaterial?s(p,m):m.isMeshDistanceMaterial?(s(p,m),x(p,m)):m.isMeshNormalMaterial?s(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,y,_):m.isSpriteMaterial?u(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Lt&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Lt&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let y=e.get(m).envMap;if(y&&(p.envMap.value=y,p.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap){p.lightMap.value=m.lightMap;let _=n._useLegacyLights===!0?Math.PI:1;p.lightMapIntensity.value=m.lightMapIntensity*_,t(m.lightMap,p.lightMapTransform)}m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,y,_){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*y,p.scale.value=_*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function h(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function f(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),e.get(m).envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function d(p,m,y){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Lt&&p.clearcoatNormalScale.value.negate())),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=y.texture,p.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function x(p,m){let y=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(y.matrixWorld),p.nearDistance.value=y.shadow.camera.near,p.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function K_(n,e,t,i){let r={},s={},o=[],a=t.isWebGL2?n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(y,_){let b=_.program;i.uniformBlockBinding(y,b)}function u(y,_){let b=r[y.id];b===void 0&&(g(y),b=c(y),r[y.id]=b,y.addEventListener("dispose",p));let E=_.program;i.updateUBOMapping(y,E);let S=e.render.frame;s[y.id]!==S&&(f(y),s[y.id]=S)}function c(y){let _=h();y.__bindingPointIndex=_;let b=n.createBuffer(),E=y.__size,S=y.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,E,S),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,_,b),b}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(y){let _=r[y.id],b=y.uniforms,E=y.__cache;n.bindBuffer(n.UNIFORM_BUFFER,_);for(let S=0,T=b.length;S<T;S++){let R=Array.isArray(b[S])?b[S]:[b[S]];for(let v=0,M=R.length;v<M;v++){let L=R[v];if(d(L,S,v,E)===!0){let z=L.__offset,V=Array.isArray(L.value)?L.value:[L.value],I=0;for(let O=0;O<V.length;O++){let X=V[O],N=x(X);typeof X=="number"||typeof X=="boolean"?(L.__data[0]=X,n.bufferSubData(n.UNIFORM_BUFFER,z+I,L.__data)):X.isMatrix3?(L.__data[0]=X.elements[0],L.__data[1]=X.elements[1],L.__data[2]=X.elements[2],L.__data[3]=0,L.__data[4]=X.elements[3],L.__data[5]=X.elements[4],L.__data[6]=X.elements[5],L.__data[7]=0,L.__data[8]=X.elements[6],L.__data[9]=X.elements[7],L.__data[10]=X.elements[8],L.__data[11]=0):(X.toArray(L.__data,I),I+=N.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,z,L.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(y,_,b,E){let S=y.value,T=_+"_"+b;if(E[T]===void 0)return typeof S=="number"||typeof S=="boolean"?E[T]=S:E[T]=S.clone(),!0;{let R=E[T];if(typeof S=="number"||typeof S=="boolean"){if(R!==S)return E[T]=S,!0}else if(R.equals(S)===!1)return R.copy(S),!0}return!1}function g(y){let _=y.uniforms,b=0,E=16;for(let T=0,R=_.length;T<R;T++){let v=Array.isArray(_[T])?_[T]:[_[T]];for(let M=0,L=v.length;M<L;M++){let z=v[M],V=Array.isArray(z.value)?z.value:[z.value];for(let I=0,O=V.length;I<O;I++){let X=V[I],N=x(X),H=b%E;H!==0&&E-H<N.boundary&&(b+=E-H),z.__data=new Float32Array(N.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=b,b+=N.storage}}}let S=b%E;return S>0&&(b+=E-S),y.__size=b,y.__cache={},this}function x(y){let _={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(_.boundary=4,_.storage=4):y.isVector2?(_.boundary=8,_.storage=8):y.isVector3||y.isColor?(_.boundary=16,_.storage=12):y.isVector4?(_.boundary=16,_.storage=16):y.isMatrix3?(_.boundary=48,_.storage=48):y.isMatrix4?(_.boundary=64,_.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),_}function p(y){let _=y.target;_.removeEventListener("dispose",p);let b=o.indexOf(_.__bindingPointIndex);o.splice(b,1),n.deleteBuffer(r[_.id]),delete r[_.id],delete s[_.id]}function m(){for(let y in r)n.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:u,dispose:m}}var hs=class{constructor(e={}){let{canvas:t=im(),context:i=null,depth:r=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:u=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let f;i!==null?f=i.getContextAttributes().alpha:f=o;let d=new Uint32Array(4),g=new Int32Array(4),x=null,p=null,m=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=pt,this._useLegacyLights=!1,this.toneMapping=Nn,this.toneMappingExposure=1;let _=this,b=!1,E=0,S=0,T=null,R=-1,v=null,M=new wt,L=new wt,z=null,V=new qe(0),I=0,O=t.width,X=t.height,N=1,H=null,G=null,K=new wt(0,0,O,X),ee=new wt(0,0,O,X),me=!1,q=new us,oe=!1,fe=!1,ve=null,Te=new vt,Oe=new ie,Ie=new P,Ce={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Ge(){return T===null?N:1}let D=i;function pe(C,B){for(let Y=0;Y<C.length;Y++){let Z=C[Y],W=t.getContext(Z,B);if(W!==null)return W}return null}try{let C={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:c,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r160"),t.addEventListener("webglcontextlost",ge,!1),t.addEventListener("webglcontextrestored",U,!1),t.addEventListener("webglcontextcreationerror",Me,!1),D===null){let B=["webgl2","webgl","experimental-webgl"];if(_.isWebGL1Renderer===!0&&B.shift(),D=pe(B,C),D===null)throw pe(B)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&D instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),D.getShaderPrecisionFormat===void 0&&(D.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let j,ue,Q,de,ae,A,w,k,ce,re,ne,Ae,be,Re,Pe,Ze,le,et,it,Ye,Fe,Le,je,ot;function Mt(){j=new fx(D),ue=new ax(D,j,e),j.init(ue),Le=new X_(D,j,ue),Q=new V_(D,j,ue),de=new gx(D),ae=new I_,A=new W_(D,j,Q,ae,ue,Le,de),w=new cx(_),k=new dx(_),ce=new wm(D,ue),je=new sx(D,j,ce,ue),re=new px(D,ce,de,je),ne=new vx(D,re,ce,de),it=new yx(D,ue,A),Ze=new lx(ae),Ae=new P_(_,w,k,j,ue,je,Ze),be=new Y_(_,ae),Re=new D_,Pe=new z_(j,ue),et=new rx(_,w,k,Q,ne,f,l),le=new H_(_,ne,ue),ot=new K_(D,de,ue,Q),Ye=new ox(D,j,de,ue),Fe=new mx(D,j,de,ue),de.programs=Ae.programs,_.capabilities=ue,_.extensions=j,_.properties=ae,_.renderLists=Re,_.shadowMap=le,_.state=Q,_.info=de}Mt();let tt=new Dl(_,D);this.xr=tt,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let C=j.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){let C=j.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return N},this.setPixelRatio=function(C){C!==void 0&&(N=C,this.setSize(O,X,!1))},this.getSize=function(C){return C.set(O,X)},this.setSize=function(C,B,Y=!0){if(tt.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}O=C,X=B,t.width=Math.floor(C*N),t.height=Math.floor(B*N),Y===!0&&(t.style.width=C+"px",t.style.height=B+"px"),this.setViewport(0,0,C,B)},this.getDrawingBufferSize=function(C){return C.set(O*N,X*N).floor()},this.setDrawingBufferSize=function(C,B,Y){O=C,X=B,N=Y,t.width=Math.floor(C*Y),t.height=Math.floor(B*Y),this.setViewport(0,0,C,B)},this.getCurrentViewport=function(C){return C.copy(M)},this.getViewport=function(C){return C.copy(K)},this.setViewport=function(C,B,Y,Z){C.isVector4?K.set(C.x,C.y,C.z,C.w):K.set(C,B,Y,Z),Q.viewport(M.copy(K).multiplyScalar(N).floor())},this.getScissor=function(C){return C.copy(ee)},this.setScissor=function(C,B,Y,Z){C.isVector4?ee.set(C.x,C.y,C.z,C.w):ee.set(C,B,Y,Z),Q.scissor(L.copy(ee).multiplyScalar(N).floor())},this.getScissorTest=function(){return me},this.setScissorTest=function(C){Q.setScissorTest(me=C)},this.setOpaqueSort=function(C){H=C},this.setTransparentSort=function(C){G=C},this.getClearColor=function(C){return C.copy(et.getClearColor())},this.setClearColor=function(){et.setClearColor.apply(et,arguments)},this.getClearAlpha=function(){return et.getClearAlpha()},this.setClearAlpha=function(){et.setClearAlpha.apply(et,arguments)},this.clear=function(C=!0,B=!0,Y=!0){let Z=0;if(C){let W=!1;if(T!==null){let Ee=T.texture.format;W=Ee===Sh||Ee===Mh||Ee===bh}if(W){let Ee=T.texture.type,De=Ee===wi||Ee===bi||Ee===ic||Ee===Xi||Ee===yh||Ee===vh,He=et.getClearColor(),We=et.getClearAlpha(),Qe=He.r,Ke=He.g,F=He.b;De?(d[0]=Qe,d[1]=Ke,d[2]=F,d[3]=We,D.clearBufferuiv(D.COLOR,0,d)):(g[0]=Qe,g[1]=Ke,g[2]=F,g[3]=We,D.clearBufferiv(D.COLOR,0,g))}else Z|=D.COLOR_BUFFER_BIT}B&&(Z|=D.DEPTH_BUFFER_BIT),Y&&(Z|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(Z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ge,!1),t.removeEventListener("webglcontextrestored",U,!1),t.removeEventListener("webglcontextcreationerror",Me,!1),Re.dispose(),Pe.dispose(),ae.dispose(),w.dispose(),k.dispose(),ne.dispose(),je.dispose(),ot.dispose(),Ae.dispose(),tt.dispose(),tt.removeEventListener("sessionstart",Ut),tt.removeEventListener("sessionend",lt),ve&&(ve.dispose(),ve=null),zt.stop()};function ge(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),b=!0}function U(){console.log("THREE.WebGLRenderer: Context Restored."),b=!1;let C=de.autoReset,B=le.enabled,Y=le.autoUpdate,Z=le.needsUpdate,W=le.type;Mt(),de.autoReset=C,le.enabled=B,le.autoUpdate=Y,le.needsUpdate=Z,le.type=W}function Me(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function xe(C){let B=C.target;B.removeEventListener("dispose",xe),ke(B)}function ke(C){Be(C),ae.remove(C)}function Be(C){let B=ae.get(C).programs;B!==void 0&&(B.forEach(function(Y){Ae.releaseProgram(Y)}),C.isShaderMaterial&&Ae.releaseShaderCache(C))}this.renderBufferDirect=function(C,B,Y,Z,W,Ee){B===null&&(B=Ce);let De=W.isMesh&&W.matrixWorld.determinant()<0,He=or(C,B,Y,Z,W);Q.setMaterial(Z,De);let We=Y.index,Qe=1;if(Z.wireframe===!0){if(We=re.getWireframeAttribute(Y),We===void 0)return;Qe=2}let Ke=Y.drawRange,F=Y.attributes.position,J=Ke.start*Qe,he=(Ke.start+Ke.count)*Qe;Ee!==null&&(J=Math.max(J,Ee.start*Qe),he=Math.min(he,(Ee.start+Ee.count)*Qe)),We!==null?(J=Math.max(J,0),he=Math.min(he,We.count)):F!=null&&(J=Math.max(J,0),he=Math.min(he,F.count));let _e=he-J;if(_e<0||_e===1/0)return;je.setup(W,Z,He,Y,We);let ze,Ue=Ye;if(We!==null&&(ze=ce.get(We),Ue=Fe,Ue.setIndex(ze)),W.isMesh)Z.wireframe===!0?(Q.setLineWidth(Z.wireframeLinewidth*Ge()),Ue.setMode(D.LINES)):Ue.setMode(D.TRIANGLES);else if(W.isLine){let we=Z.linewidth;we===void 0&&(we=1),Q.setLineWidth(we*Ge()),W.isLineSegments?Ue.setMode(D.LINES):W.isLineLoop?Ue.setMode(D.LINE_LOOP):Ue.setMode(D.LINE_STRIP)}else W.isPoints?Ue.setMode(D.POINTS):W.isSprite&&Ue.setMode(D.TRIANGLES);if(W.isBatchedMesh)Ue.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else if(W.isInstancedMesh)Ue.renderInstances(J,_e,W.count);else if(Y.isInstancedBufferGeometry){let we=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,gt=Math.min(Y.instanceCount,we);Ue.renderInstances(J,_e,gt)}else Ue.render(J,_e)};function ht(C,B,Y){C.transparent===!0&&C.side===Gt&&C.forceSinglePass===!1?(C.side=Lt,C.needsUpdate=!0,rr(C,B,Y),C.side=Ti,C.needsUpdate=!0,rr(C,B,Y),C.side=Gt):rr(C,B,Y)}this.compile=function(C,B,Y=null){Y===null&&(Y=C),p=Pe.get(Y),p.init(),y.push(p),Y.traverseVisible(function(W){W.isLight&&W.layers.test(B.layers)&&(p.pushLight(W),W.castShadow&&p.pushShadow(W))}),C!==Y&&C.traverseVisible(function(W){W.isLight&&W.layers.test(B.layers)&&(p.pushLight(W),W.castShadow&&p.pushShadow(W))}),p.setupLights(_._useLegacyLights);let Z=new Set;return C.traverse(function(W){let Ee=W.material;if(Ee)if(Array.isArray(Ee))for(let De=0;De<Ee.length;De++){let He=Ee[De];ht(He,Y,W),Z.add(He)}else ht(Ee,Y,W),Z.add(Ee)}),y.pop(),p=null,Z},this.compileAsync=function(C,B,Y=null){let Z=this.compile(C,B,Y);return new Promise(W=>{function Ee(){if(Z.forEach(function(De){ae.get(De).currentProgram.isReady()&&Z.delete(De)}),Z.size===0){W(C);return}setTimeout(Ee,10)}j.get("KHR_parallel_shader_compile")!==null?Ee():setTimeout(Ee,10)})};let dt=null;function At(C){dt&&dt(C)}function Ut(){zt.stop()}function lt(){zt.start()}let zt=new Lh;zt.setAnimationLoop(At),typeof self<"u"&&zt.setContext(self),this.setAnimationLoop=function(C){dt=C,tt.setAnimationLoop(C),C===null?zt.stop():zt.start()},tt.addEventListener("sessionstart",Ut),tt.addEventListener("sessionend",lt),this.render=function(C,B){if(B!==void 0&&B.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(b===!0)return;C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),tt.enabled===!0&&tt.isPresenting===!0&&(tt.cameraAutoUpdate===!0&&tt.updateCamera(B),B=tt.getCamera()),C.isScene===!0&&C.onBeforeRender(_,C,B,T),p=Pe.get(C,y.length),p.init(),y.push(p),Te.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),q.setFromProjectionMatrix(Te),fe=this.localClippingEnabled,oe=Ze.init(this.clippingPlanes,fe),x=Re.get(C,m.length),x.init(),m.push(x),un(C,B,0,_.sortObjects),x.finish(),_.sortObjects===!0&&x.sort(H,G),this.info.render.frame++,oe===!0&&Ze.beginShadows();let Y=p.state.shadowsArray;if(le.render(Y,C,B),oe===!0&&Ze.endShadows(),this.info.autoReset===!0&&this.info.reset(),et.render(x,C),p.setupLights(_._useLegacyLights),B.isArrayCamera){let Z=B.cameras;for(let W=0,Ee=Z.length;W<Ee;W++){let De=Z[W];Yr(x,C,De,De.viewport)}}else Yr(x,C,B);T!==null&&(A.updateMultisampleRenderTarget(T),A.updateRenderTargetMipmap(T)),C.isScene===!0&&C.onAfterRender(_,C,B),je.resetDefaultState(),R=-1,v=null,y.pop(),y.length>0?p=y[y.length-1]:p=null,m.pop(),m.length>0?x=m[m.length-1]:x=null};function un(C,B,Y,Z){if(C.visible===!1)return;if(C.layers.test(B.layers)){if(C.isGroup)Y=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(B);else if(C.isLight)p.pushLight(C),C.castShadow&&p.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||q.intersectsSprite(C)){Z&&Ie.setFromMatrixPosition(C.matrixWorld).applyMatrix4(Te);let De=ne.update(C),He=C.material;He.visible&&x.push(C,De,He,Y,Ie.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||q.intersectsObject(C))){let De=ne.update(C),He=C.material;if(Z&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),Ie.copy(C.boundingSphere.center)):(De.boundingSphere===null&&De.computeBoundingSphere(),Ie.copy(De.boundingSphere.center)),Ie.applyMatrix4(C.matrixWorld).applyMatrix4(Te)),Array.isArray(He)){let We=De.groups;for(let Qe=0,Ke=We.length;Qe<Ke;Qe++){let F=We[Qe],J=He[F.materialIndex];J&&J.visible&&x.push(C,De,J,Y,Ie.z,F)}}else He.visible&&x.push(C,De,He,Y,Ie.z,null)}}let Ee=C.children;for(let De=0,He=Ee.length;De<He;De++)un(Ee[De],B,Y,Z)}function Yr(C,B,Y,Z){let W=C.opaque,Ee=C.transmissive,De=C.transparent;p.setupLightsView(Y),oe===!0&&Ze.setGlobalState(_.clippingPlanes,Y),Ee.length>0&&Kr(W,Ee,B,Y),Z&&Q.viewport(M.copy(Z)),W.length>0&&mi(W,B,Y),Ee.length>0&&mi(Ee,B,Y),De.length>0&&mi(De,B,Y),Q.buffers.depth.setTest(!0),Q.buffers.depth.setMask(!0),Q.buffers.color.setMask(!0),Q.setPolygonOffset(!1)}function Kr(C,B,Y,Z){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;let Ee=ue.isWebGL2;ve===null&&(ve=new rn(1,1,{generateMipmaps:!0,type:j.has("EXT_color_buffer_half_float")?Ki:wi,minFilter:cs,samples:Ee?4:0})),_.getDrawingBufferSize(Oe),Ee?ve.setSize(Oe.x,Oe.y):ve.setSize(_l(Oe.x),_l(Oe.y));let De=_.getRenderTarget();_.setRenderTarget(ve),_.getClearColor(V),I=_.getClearAlpha(),I<1&&_.setClearColor(16777215,.5),_.clear();let He=_.toneMapping;_.toneMapping=Nn,mi(C,Y,Z),A.updateMultisampleRenderTarget(ve),A.updateRenderTargetMipmap(ve);let We=!1;for(let Qe=0,Ke=B.length;Qe<Ke;Qe++){let F=B[Qe],J=F.object,he=F.geometry,_e=F.material,ze=F.group;if(_e.side===Gt&&J.layers.test(Z.layers)){let Ue=_e.side;_e.side=Lt,_e.needsUpdate=!0,$n(J,Y,Z,he,_e,ze),_e.side=Ue,_e.needsUpdate=!0,We=!0}}We===!0&&(A.updateMultisampleRenderTarget(ve),A.updateRenderTargetMipmap(ve)),_.setRenderTarget(De),_.setClearColor(V,I),_.toneMapping=He}function mi(C,B,Y){let Z=B.isScene===!0?B.overrideMaterial:null;for(let W=0,Ee=C.length;W<Ee;W++){let De=C[W],He=De.object,We=De.geometry,Qe=Z===null?De.material:Z,Ke=De.group;He.layers.test(Y.layers)&&$n(He,B,Y,We,Qe,Ke)}}function $n(C,B,Y,Z,W,Ee){C.onBeforeRender(_,B,Y,Z,W,Ee),C.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),W.onBeforeRender(_,B,Y,Z,C,Ee),W.transparent===!0&&W.side===Gt&&W.forceSinglePass===!1?(W.side=Lt,W.needsUpdate=!0,_.renderBufferDirect(Y,B,Z,W,C,Ee),W.side=Ti,W.needsUpdate=!0,_.renderBufferDirect(Y,B,Z,W,C,Ee),W.side=Gt):_.renderBufferDirect(Y,B,Z,W,C,Ee),C.onAfterRender(_,B,Y,Z,W,Ee)}function rr(C,B,Y){B.isScene!==!0&&(B=Ce);let Z=ae.get(C),W=p.state.lights,Ee=p.state.shadowsArray,De=W.state.version,He=Ae.getParameters(C,W.state,Ee,B,Y),We=Ae.getProgramCacheKey(He),Qe=Z.programs;Z.environment=C.isMeshStandardMaterial?B.environment:null,Z.fog=B.fog,Z.envMap=(C.isMeshStandardMaterial?k:w).get(C.envMap||Z.environment),Qe===void 0&&(C.addEventListener("dispose",xe),Qe=new Map,Z.programs=Qe);let Ke=Qe.get(We);if(Ke!==void 0){if(Z.currentProgram===Ke&&Z.lightsStateVersion===De)return Jn(C,He),Ke}else He.uniforms=Ae.getUniforms(C),C.onBuild(Y,He,_),C.onBeforeCompile(He,_),Ke=Ae.acquireProgram(He,We),Qe.set(We,Ke),Z.uniforms=He.uniforms;let F=Z.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(F.clippingPlanes=Ze.uniform),Jn(C,He),Z.needsLights=wa(C),Z.lightsStateVersion=De,Z.needsLights&&(F.ambientLightColor.value=W.state.ambient,F.lightProbe.value=W.state.probe,F.directionalLights.value=W.state.directional,F.directionalLightShadows.value=W.state.directionalShadow,F.spotLights.value=W.state.spot,F.spotLightShadows.value=W.state.spotShadow,F.rectAreaLights.value=W.state.rectArea,F.ltc_1.value=W.state.rectAreaLTC1,F.ltc_2.value=W.state.rectAreaLTC2,F.pointLights.value=W.state.point,F.pointLightShadows.value=W.state.pointShadow,F.hemisphereLights.value=W.state.hemi,F.directionalShadowMap.value=W.state.directionalShadowMap,F.directionalShadowMatrix.value=W.state.directionalShadowMatrix,F.spotShadowMap.value=W.state.spotShadowMap,F.spotLightMatrix.value=W.state.spotLightMatrix,F.spotLightMap.value=W.state.spotLightMap,F.pointShadowMap.value=W.state.pointShadowMap,F.pointShadowMatrix.value=W.state.pointShadowMatrix),Z.currentProgram=Ke,Z.uniformsList=null,Ke}function sr(C){if(C.uniformsList===null){let B=C.currentProgram.getUniforms();C.uniformsList=Ur.seqWithValue(B.seq,C.uniforms)}return C.uniformsList}function Jn(C,B){let Y=ae.get(C);Y.outputColorSpace=B.outputColorSpace,Y.batching=B.batching,Y.instancing=B.instancing,Y.instancingColor=B.instancingColor,Y.skinning=B.skinning,Y.morphTargets=B.morphTargets,Y.morphNormals=B.morphNormals,Y.morphColors=B.morphColors,Y.morphTargetsCount=B.morphTargetsCount,Y.numClippingPlanes=B.numClippingPlanes,Y.numIntersection=B.numClipIntersection,Y.vertexAlphas=B.vertexAlphas,Y.vertexTangents=B.vertexTangents,Y.toneMapping=B.toneMapping}function or(C,B,Y,Z,W){B.isScene!==!0&&(B=Ce),A.resetTextureUnits();let Ee=B.fog,De=Z.isMeshStandardMaterial?B.environment:null,He=T===null?_.outputColorSpace:T.isXRRenderTarget===!0?T.texture.colorSpace:ci,We=(Z.isMeshStandardMaterial?k:w).get(Z.envMap||De),Qe=Z.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,Ke=!!Y.attributes.tangent&&(!!Z.normalMap||Z.anisotropy>0),F=!!Y.morphAttributes.position,J=!!Y.morphAttributes.normal,he=!!Y.morphAttributes.color,_e=Nn;Z.toneMapped&&(T===null||T.isXRRenderTarget===!0)&&(_e=_.toneMapping);let ze=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Ue=ze!==void 0?ze.length:0,we=ae.get(Z),gt=p.state.lights;if(oe===!0&&(fe===!0||C!==v)){let yt=C===v&&Z.id===R;Ze.setState(Z,C,yt)}let Xe=!1;Z.version===we.__version?(we.needsLights&&we.lightsStateVersion!==gt.state.version||we.outputColorSpace!==He||W.isBatchedMesh&&we.batching===!1||!W.isBatchedMesh&&we.batching===!0||W.isInstancedMesh&&we.instancing===!1||!W.isInstancedMesh&&we.instancing===!0||W.isSkinnedMesh&&we.skinning===!1||!W.isSkinnedMesh&&we.skinning===!0||W.isInstancedMesh&&we.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&we.instancingColor===!1&&W.instanceColor!==null||we.envMap!==We||Z.fog===!0&&we.fog!==Ee||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==Ze.numPlanes||we.numIntersection!==Ze.numIntersection)||we.vertexAlphas!==Qe||we.vertexTangents!==Ke||we.morphTargets!==F||we.morphNormals!==J||we.morphColors!==he||we.toneMapping!==_e||ue.isWebGL2===!0&&we.morphTargetsCount!==Ue)&&(Xe=!0):(Xe=!0,we.__version=Z.version);let xt=we.currentProgram;Xe===!0&&(xt=rr(Z,B,W));let jt=!1,hn=!1,Qt=!1,_t=xt.getUniforms(),Xt=we.uniforms;if(Q.useProgram(xt.program)&&(jt=!0,hn=!0,Qt=!0),Z.id!==R&&(R=Z.id,hn=!0),jt||v!==C){_t.setValue(D,"projectionMatrix",C.projectionMatrix),_t.setValue(D,"viewMatrix",C.matrixWorldInverse);let yt=_t.map.cameraPosition;yt!==void 0&&yt.setValue(D,Ie.setFromMatrixPosition(C.matrixWorld)),ue.logarithmicDepthBuffer&&_t.setValue(D,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(Z.isMeshPhongMaterial||Z.isMeshToonMaterial||Z.isMeshLambertMaterial||Z.isMeshBasicMaterial||Z.isMeshStandardMaterial||Z.isShaderMaterial)&&_t.setValue(D,"isOrthographic",C.isOrthographicCamera===!0),v!==C&&(v=C,hn=!0,Qt=!0)}if(W.isSkinnedMesh){_t.setOptional(D,W,"bindMatrix"),_t.setOptional(D,W,"bindMatrixInverse");let yt=W.skeleton;yt&&(ue.floatVertexTextures?(yt.boneTexture===null&&yt.computeBoneTexture(),_t.setValue(D,"boneTexture",yt.boneTexture,A)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}W.isBatchedMesh&&(_t.setOptional(D,W,"batchingTexture"),_t.setValue(D,"batchingTexture",W._matricesTexture,A));let Ct=Y.morphAttributes;if((Ct.position!==void 0||Ct.normal!==void 0||Ct.color!==void 0&&ue.isWebGL2===!0)&&it.update(W,Y,xt),(hn||we.receiveShadow!==W.receiveShadow)&&(we.receiveShadow=W.receiveShadow,_t.setValue(D,"receiveShadow",W.receiveShadow)),Z.isMeshGouraudMaterial&&Z.envMap!==null&&(Xt.envMap.value=We,Xt.flipEnvMap.value=We.isCubeTexture&&We.isRenderTargetTexture===!1?-1:1),hn&&(_t.setValue(D,"toneMappingExposure",_.toneMappingExposure),we.needsLights&&ar(Xt,Qt),Ee&&Z.fog===!0&&be.refreshFogUniforms(Xt,Ee),be.refreshMaterialUniforms(Xt,Z,N,X,ve),Ur.upload(D,sr(we),Xt,A)),Z.isShaderMaterial&&Z.uniformsNeedUpdate===!0&&(Ur.upload(D,sr(we),Xt,A),Z.uniformsNeedUpdate=!1),Z.isSpriteMaterial&&_t.setValue(D,"center",W.center),_t.setValue(D,"modelViewMatrix",W.modelViewMatrix),_t.setValue(D,"normalMatrix",W.normalMatrix),_t.setValue(D,"modelMatrix",W.matrixWorld),Z.isShaderMaterial||Z.isRawShaderMaterial){let yt=Z.uniformsGroups;for(let Pt=0,jn=yt.length;Pt<jn;Pt++)if(ue.isWebGL2){let Bn=yt[Pt];ot.update(Bn,xt),ot.bind(Bn,xt)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return xt}function ar(C,B){C.ambientLightColor.needsUpdate=B,C.lightProbe.needsUpdate=B,C.directionalLights.needsUpdate=B,C.directionalLightShadows.needsUpdate=B,C.pointLights.needsUpdate=B,C.pointLightShadows.needsUpdate=B,C.spotLights.needsUpdate=B,C.spotLightShadows.needsUpdate=B,C.rectAreaLights.needsUpdate=B,C.hemisphereLights.needsUpdate=B}function wa(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return T},this.setRenderTargetTextures=function(C,B,Y){ae.get(C.texture).__webglTexture=B,ae.get(C.depthTexture).__webglTexture=Y;let Z=ae.get(C);Z.__hasExternalTextures=!0,Z.__hasExternalTextures&&(Z.__autoAllocateDepthBuffer=Y===void 0,Z.__autoAllocateDepthBuffer||j.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),Z.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(C,B){let Y=ae.get(C);Y.__webglFramebuffer=B,Y.__useDefaultFramebuffer=B===void 0},this.setRenderTarget=function(C,B=0,Y=0){T=C,E=B,S=Y;let Z=!0,W=null,Ee=!1,De=!1;if(C){let We=ae.get(C);We.__useDefaultFramebuffer!==void 0?(Q.bindFramebuffer(D.FRAMEBUFFER,null),Z=!1):We.__webglFramebuffer===void 0?A.setupRenderTarget(C):We.__hasExternalTextures&&A.rebindTextures(C,ae.get(C.texture).__webglTexture,ae.get(C.depthTexture).__webglTexture);let Qe=C.texture;(Qe.isData3DTexture||Qe.isDataArrayTexture||Qe.isCompressedArrayTexture)&&(De=!0);let Ke=ae.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(Ke[B])?W=Ke[B][Y]:W=Ke[B],Ee=!0):ue.isWebGL2&&C.samples>0&&A.useMultisampledRTT(C)===!1?W=ae.get(C).__webglMultisampledFramebuffer:Array.isArray(Ke)?W=Ke[Y]:W=Ke,M.copy(C.viewport),L.copy(C.scissor),z=C.scissorTest}else M.copy(K).multiplyScalar(N).floor(),L.copy(ee).multiplyScalar(N).floor(),z=me;if(Q.bindFramebuffer(D.FRAMEBUFFER,W)&&ue.drawBuffers&&Z&&Q.drawBuffers(C,W),Q.viewport(M),Q.scissor(L),Q.setScissorTest(z),Ee){let We=ae.get(C.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+B,We.__webglTexture,Y)}else if(De){let We=ae.get(C.texture),Qe=B||0;D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,We.__webglTexture,Y||0,Qe)}R=-1},this.readRenderTargetPixels=function(C,B,Y,Z,W,Ee,De){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let He=ae.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&De!==void 0&&(He=He[De]),He){Q.bindFramebuffer(D.FRAMEBUFFER,He);try{let We=C.texture,Qe=We.format,Ke=We.type;if(Qe!==Un&&Le.convert(Qe)!==D.getParameter(D.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let F=Ke===Ki&&(j.has("EXT_color_buffer_half_float")||ue.isWebGL2&&j.has("EXT_color_buffer_float"));if(Ke!==wi&&Le.convert(Ke)!==D.getParameter(D.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ke===Mi&&(ue.isWebGL2||j.has("OES_texture_float")||j.has("WEBGL_color_buffer_float")))&&!F){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=C.width-Z&&Y>=0&&Y<=C.height-W&&D.readPixels(B,Y,Z,W,Le.convert(Qe),Le.convert(Ke),Ee)}finally{let We=T!==null?ae.get(T).__webglFramebuffer:null;Q.bindFramebuffer(D.FRAMEBUFFER,We)}}},this.copyFramebufferToTexture=function(C,B,Y=0){let Z=Math.pow(2,-Y),W=Math.floor(B.image.width*Z),Ee=Math.floor(B.image.height*Z);A.setTexture2D(B,0),D.copyTexSubImage2D(D.TEXTURE_2D,Y,0,0,C.x,C.y,W,Ee),Q.unbindTexture()},this.copyTextureToTexture=function(C,B,Y,Z=0){let W=B.image.width,Ee=B.image.height,De=Le.convert(Y.format),He=Le.convert(Y.type);A.setTexture2D(Y,0),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,Y.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Y.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,Y.unpackAlignment),B.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,Z,C.x,C.y,W,Ee,De,He,B.image.data):B.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,Z,C.x,C.y,B.mipmaps[0].width,B.mipmaps[0].height,De,B.mipmaps[0].data):D.texSubImage2D(D.TEXTURE_2D,Z,C.x,C.y,De,He,B.image),Z===0&&Y.generateMipmaps&&D.generateMipmap(D.TEXTURE_2D),Q.unbindTexture()},this.copyTextureToTexture3D=function(C,B,Y,Z,W=0){if(_.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let Ee=C.max.x-C.min.x+1,De=C.max.y-C.min.y+1,He=C.max.z-C.min.z+1,We=Le.convert(Z.format),Qe=Le.convert(Z.type),Ke;if(Z.isData3DTexture)A.setTexture3D(Z,0),Ke=D.TEXTURE_3D;else if(Z.isDataArrayTexture||Z.isCompressedArrayTexture)A.setTexture2DArray(Z,0),Ke=D.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,Z.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Z.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,Z.unpackAlignment);let F=D.getParameter(D.UNPACK_ROW_LENGTH),J=D.getParameter(D.UNPACK_IMAGE_HEIGHT),he=D.getParameter(D.UNPACK_SKIP_PIXELS),_e=D.getParameter(D.UNPACK_SKIP_ROWS),ze=D.getParameter(D.UNPACK_SKIP_IMAGES),Ue=Y.isCompressedTexture?Y.mipmaps[W]:Y.image;D.pixelStorei(D.UNPACK_ROW_LENGTH,Ue.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Ue.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,C.min.x),D.pixelStorei(D.UNPACK_SKIP_ROWS,C.min.y),D.pixelStorei(D.UNPACK_SKIP_IMAGES,C.min.z),Y.isDataTexture||Y.isData3DTexture?D.texSubImage3D(Ke,W,B.x,B.y,B.z,Ee,De,He,We,Qe,Ue.data):Y.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),D.compressedTexSubImage3D(Ke,W,B.x,B.y,B.z,Ee,De,He,We,Ue.data)):D.texSubImage3D(Ke,W,B.x,B.y,B.z,Ee,De,He,We,Qe,Ue),D.pixelStorei(D.UNPACK_ROW_LENGTH,F),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,J),D.pixelStorei(D.UNPACK_SKIP_PIXELS,he),D.pixelStorei(D.UNPACK_SKIP_ROWS,_e),D.pixelStorei(D.UNPACK_SKIP_IMAGES,ze),W===0&&Z.generateMipmaps&&D.generateMipmap(Ke),Q.unbindTexture()},this.initTexture=function(C){C.isCubeTexture?A.setTextureCube(C,0):C.isData3DTexture?A.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?A.setTexture2DArray(C,0):A.setTexture2D(C,0),Q.unbindTexture()},this.resetState=function(){E=0,S=0,T=null,Q.reset(),je.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ai}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===sc?"display-p3":"srgb",t.unpackColorSpace=ft.workingColorSpace===Xo?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===pt?Yi:Eh}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===Yi?pt:ci}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}},Ul=class extends hs{};Ul.prototype.isWebGL1Renderer=!0;var gn=class extends Zt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}},Io=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=ml,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=li()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=li()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=li()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},en=new P,ds=class n{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)en.fromBufferAttribute(this,t),en.applyMatrix4(e),this.setXYZ(t,en.x,en.y,en.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)en.fromBufferAttribute(this,t),en.applyNormalMatrix(e),this.setXYZ(t,en.x,en.y,en.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)en.fromBufferAttribute(this,t),en.transformDirection(e),this.setXYZ(t,en.x,en.y,en.z);return this}setX(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=oi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=oi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=oi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=oi(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array),r=mt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array),r=mt(r,this.array),s=mt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Kt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new n(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Vn=class extends ui{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new qe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},wr,Qr=new P,Er=new P,Tr=new P,Ar=new ie,es=new ie,kh=new vt,ro=new P,ts=new P,so=new P,sh=new ie,rl=new ie,oh=new ie,Wn=class extends Zt{constructor(e=new Vn){if(super(),this.isSprite=!0,this.type="Sprite",wr===void 0){wr=new Rt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Io(t,5);wr.setIndex([0,1,2,0,2,3]),wr.setAttribute("position",new ds(i,3,0,!1)),wr.setAttribute("uv",new ds(i,2,3,!1))}this.geometry=wr,this.material=e,this.center=new ie(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Er.setFromMatrixScale(this.matrixWorld),kh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Tr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Er.multiplyScalar(-Tr.z);let i=this.material.rotation,r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));let o=this.center;oo(ro.set(-.5,-.5,0),Tr,o,Er,r,s),oo(ts.set(.5,-.5,0),Tr,o,Er,r,s),oo(so.set(.5,.5,0),Tr,o,Er,r,s),sh.set(0,0),rl.set(1,0),oh.set(1,1);let a=e.ray.intersectTriangle(ro,ts,so,!1,Qr);if(a===null&&(oo(ts.set(-.5,.5,0),Tr,o,Er,r,s),rl.set(0,1),a=e.ray.intersectTriangle(ro,so,ts,!1,Qr),a===null))return;let l=e.ray.origin.distanceTo(Qr);l<e.near||l>e.far||t.push({distance:l,point:Qr.clone(),uv:Wi.getInterpolation(Qr,ro,ts,so,sh,rl,oh,new ie),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function oo(n,e,t,i,r,s){Ar.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(es.x=s*Ar.x-r*Ar.y,es.y=r*Ar.x+s*Ar.y):es.copy(Ar),n.copy(e),n.x+=es.x,n.y+=es.y,n.applyMatrix4(kh)}var fs=class extends Kt{constructor(e,t,i,r=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Cr=new vt,ah=new vt,ao=[],lh=new On,Z_=new vt,ns=new se,is=new Zi,Lo=class extends se{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new fs(new Float32Array(i*16),16),this.instanceColor=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,Z_)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new On),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Cr),lh.copy(e.boundingBox).applyMatrix4(Cr),this.boundingBox.union(lh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Zi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Cr),is.copy(e.boundingSphere).applyMatrix4(Cr),this.boundingSphere.union(is)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){let i=this.matrixWorld,r=this.count;if(ns.geometry=this.geometry,ns.material=this.material,ns.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),is.copy(this.boundingSphere),is.applyMatrix4(i),e.ray.intersectsSphere(is)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,Cr),ah.multiplyMatrices(i,Cr),ns.matrixWorld=ah,ns.raycast(e,ao);for(let o=0,a=ao.length;o<a;o++){let l=ao[o];l.instanceId=s,l.object=this,t.push(l)}ao.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new fs(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}};var Sn=class extends Mn{constructor(e,t,i,r,s,o,a,l,u){super(e,t,i,r,s,o,a,l,u),this.isCanvasTexture=!0,this.needsUpdate=!0}},wn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),t.push(s),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let i=this.getLengths(),r=0,s=i.length,o;t?o=t:o=e*i[s-1];let a=0,l=s-1,u;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),u=i[r]-o,u<0)a=r+1;else if(u>0)l=r-1;else{l=r;break}if(r=l,i[r]===o)return r/(s-1);let c=i[r],f=i[r+1]-c,d=(o-c)/f;return(r+d)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new ie:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){let i=new P,r=[],s=[],o=[],a=new P,l=new vt;for(let d=0;d<=e;d++){let g=d/e;r[d]=this.getTangentAt(g,new P)}s[0]=new P,o[0]=new P;let u=Number.MAX_VALUE,c=Math.abs(r[0].x),h=Math.abs(r[0].y),f=Math.abs(r[0].z);c<=u&&(u=c,i.set(1,0,0)),h<=u&&(u=h,i.set(0,1,0)),f<=u&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let d=1;d<=e;d++){if(s[d]=s[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(r[d-1],r[d]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(Vt(r[d-1].dot(r[d]),-1,1));s[d].applyMatrix4(l.makeRotationAxis(a,g))}o[d].crossVectors(r[d],s[d])}if(t===!0){let d=Math.acos(Vt(s[0].dot(s[e]),-1,1));d/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(d=-d);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],d*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ps=class extends wn{constructor(e=0,t=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){let i=t||new ie,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),u=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let c=Math.cos(this.aRotation),h=Math.sin(this.aRotation),f=l-this.aX,d=u-this.aY;l=f*c-d*h+this.aX,u=f*h+d*c+this.aY}return i.set(l,u)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Nl=class extends ps{constructor(e,t,i,r,s,o){super(e,t,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function ac(){let n=0,e=0,t=0,i=0;function r(s,o,a,l){n=s,e=a,t=-3*s+3*o-2*a-l,i=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,u){r(o,a,u*(a-s),u*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,u,c,h){let f=(o-s)/u-(a-s)/(u+c)+(a-o)/c,d=(a-o)/c-(l-o)/(c+h)+(l-a)/h;f*=c,d*=c,r(o,a,f,d)},calc:function(s){let o=s*s,a=o*s;return n+e*s+t*o+i*a}}}var lo=new P,sl=new ac,ol=new ac,al=new ac,ms=class extends wn{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new P){let i=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let u,c;this.closed||a>0?u=r[(a-1)%s]:(lo.subVectors(r[0],r[1]).add(r[0]),u=lo);let h=r[a%s],f=r[(a+1)%s];if(this.closed||a+2<s?c=r[(a+2)%s]:(lo.subVectors(r[s-1],r[s-2]).add(r[s-1]),c=lo),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(u.distanceToSquared(h),d),x=Math.pow(h.distanceToSquared(f),d),p=Math.pow(f.distanceToSquared(c),d);x<1e-4&&(x=1),g<1e-4&&(g=x),p<1e-4&&(p=x),sl.initNonuniformCatmullRom(u.x,h.x,f.x,c.x,g,x,p),ol.initNonuniformCatmullRom(u.y,h.y,f.y,c.y,g,x,p),al.initNonuniformCatmullRom(u.z,h.z,f.z,c.z,g,x,p)}else this.curveType==="catmullrom"&&(sl.initCatmullRom(u.x,h.x,f.x,c.x,this.tension),ol.initCatmullRom(u.y,h.y,f.y,c.y,this.tension),al.initCatmullRom(u.z,h.z,f.z,c.z,this.tension));return i.set(sl.calc(l),ol.calc(l),al.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new P().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function ch(n,e,t,i,r){let s=(i-e)*.5,o=(r-t)*.5,a=n*n,l=n*a;return(2*t-2*i+s+o)*l+(-3*t+3*i-2*s-o)*a+s*n+t}function $_(n,e){let t=1-n;return t*t*e}function J_(n,e){return 2*(1-n)*n*e}function j_(n,e){return n*n*e}function as(n,e,t,i){return $_(n,e)+J_(n,t)+j_(n,i)}function Q_(n,e){let t=1-n;return t*t*t*e}function ey(n,e){let t=1-n;return 3*t*t*n*e}function ty(n,e){return 3*(1-n)*n*n*e}function ny(n,e){return n*n*n*e}function ls(n,e,t,i,r){return Q_(n,e)+ey(n,t)+ty(n,i)+ny(n,r)}var Do=class extends wn{constructor(e=new ie,t=new ie,i=new ie,r=new ie){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new ie){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(ls(e,r.x,s.x,o.x,a.x),ls(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ol=class extends wn{constructor(e=new P,t=new P,i=new P,r=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new P){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(ls(e,r.x,s.x,o.x,a.x),ls(e,r.y,s.y,o.y,a.y),ls(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Uo=class extends wn{constructor(e=new ie,t=new ie){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ie){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ie){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Fl=class extends wn{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},No=class extends wn{constructor(e=new ie,t=new ie,i=new ie){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new ie){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(as(e,r.x,s.x,o.x),as(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Oo=class extends wn{constructor(e=new P,t=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new P){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(as(e,r.x,s.x,o.x),as(e,r.y,s.y,o.y),as(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Fo=class extends wn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ie){let i=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],u=r[o],c=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return i.set(ch(a,l.x,u.x,c.x,h.x),ch(a,l.y,u.y,c.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new ie().fromArray(r))}return this}},ko=Object.freeze({__proto__:null,ArcCurve:Nl,CatmullRomCurve3:ms,CubicBezierCurve:Do,CubicBezierCurve3:Ol,EllipseCurve:ps,LineCurve:Uo,LineCurve3:Fl,QuadraticBezierCurve:No,QuadraticBezierCurve3:Oo,SplineCurve:Fo}),kl=class extends wn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ko[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=i){let o=r[s]-i,a=this.curves[s],l=a.getLength(),u=l===0?0:1-o/l;return a.getPointAt(u,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let u=0;u<l.length;u++){let c=l[u];i&&i.equals(c)||(t.push(c),i=c)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(new ko[r.type]().fromJSON(r))}return this}},Pi=class extends kl{constructor(e){super(),this.type="Path",this.currentPoint=new ie,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new Uo(this.currentPoint.clone(),new ie(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){let s=new No(this.currentPoint.clone(),new ie(e,t),new ie(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,s,o){let a=new Do(this.currentPoint.clone(),new ie(e,t),new ie(i,r),new ie(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new Fo(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,r,s,o),this}absarc(e,t,i,r,s,o){return this.absellipse(e,t,i,i,r,s,o),this}ellipse(e,t,i,r,s,o,a,l){let u=this.currentPoint.x,c=this.currentPoint.y;return this.absellipse(e+u,t+c,i,r,s,o,a,l),this}absellipse(e,t,i,r,s,o,a,l){let u=new ps(e,t,i,r,s,o,a,l);if(this.curves.length>0){let h=u.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(u);let c=u.getPoint(1);return this.currentPoint.copy(c),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Br=class n extends Rt{constructor(e=[new ie(0,-.5),new ie(.5,0),new ie(0,.5)],t=12,i=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:r},t=Math.floor(t),r=Vt(r,0,Math.PI*2);let s=[],o=[],a=[],l=[],u=[],c=1/t,h=new P,f=new ie,d=new P,g=new P,x=new P,p=0,m=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,d.x=m*1,d.y=-p,d.z=m*0,x.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case e.length-1:l.push(x.x,x.y,x.z);break;default:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,d.x=m*1,d.y=-p,d.z=m*0,g.copy(d),d.x+=x.x,d.y+=x.y,d.z+=x.z,d.normalize(),l.push(d.x,d.y,d.z),x.copy(g)}for(let y=0;y<=t;y++){let _=i+y*c*r,b=Math.sin(_),E=Math.cos(_);for(let S=0;S<=e.length-1;S++){h.x=e[S].x*b,h.y=e[S].y,h.z=e[S].x*E,o.push(h.x,h.y,h.z),f.x=y/t,f.y=S/(e.length-1),a.push(f.x,f.y);let T=l[3*S+0]*b,R=l[3*S+1],v=l[3*S+0]*E;u.push(T,R,v)}}for(let y=0;y<t;y++)for(let _=0;_<e.length-1;_++){let b=_+y*e.length,E=b,S=b+e.length,T=b+e.length+1,R=b+1;s.push(E,S,R),s.push(T,R,S)}this.setIndex(s),this.setAttribute("position",new $e(o,3)),this.setAttribute("uv",new $e(a,2)),this.setAttribute("normal",new $e(u,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.points,e.segments,e.phiStart,e.phiLength)}};var $i=class n extends Rt{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],u=new P,c=new ie;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,f=3;h<=t;h++,f+=3){let d=i+h/t*r;u.x=e*Math.cos(d),u.y=e*Math.sin(d),o.push(u.x,u.y,u.z),a.push(0,0,1),c.x=(o[f]/e+1)/2,c.y=(o[f+1]/e+1)/2,l.push(c.x,c.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new $e(o,3)),this.setAttribute("normal",new $e(a,3)),this.setAttribute("uv",new $e(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}},En=class n extends Rt{constructor(e=1,t=1,i=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let u=this;r=Math.floor(r),s=Math.floor(s);let c=[],h=[],f=[],d=[],g=0,x=[],p=i/2,m=0;y(),o===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(c),this.setAttribute("position",new $e(h,3)),this.setAttribute("normal",new $e(f,3)),this.setAttribute("uv",new $e(d,2));function y(){let b=new P,E=new P,S=0,T=(t-e)/i;for(let R=0;R<=s;R++){let v=[],M=R/s,L=M*(t-e)+e;for(let z=0;z<=r;z++){let V=z/r,I=V*l+a,O=Math.sin(I),X=Math.cos(I);E.x=L*O,E.y=-M*i+p,E.z=L*X,h.push(E.x,E.y,E.z),b.set(O,T,X).normalize(),f.push(b.x,b.y,b.z),d.push(V,1-M),v.push(g++)}x.push(v)}for(let R=0;R<r;R++)for(let v=0;v<s;v++){let M=x[v][R],L=x[v+1][R],z=x[v+1][R+1],V=x[v][R+1];c.push(M,L,V),c.push(L,z,V),S+=6}u.addGroup(m,S,0),m+=S}function _(b){let E=g,S=new ie,T=new P,R=0,v=b===!0?e:t,M=b===!0?1:-1;for(let z=1;z<=r;z++)h.push(0,p*M,0),f.push(0,M,0),d.push(.5,.5),g++;let L=g;for(let z=0;z<=r;z++){let I=z/r*l+a,O=Math.cos(I),X=Math.sin(I);T.x=v*X,T.y=p*M,T.z=v*O,h.push(T.x,T.y,T.z),f.push(0,M,0),S.x=O*.5+.5,S.y=X*.5*M+.5,d.push(S.x,S.y),g++}for(let z=0;z<r;z++){let V=E+z,I=L+z;b===!0?c.push(I,I+1,V):c.push(I+1,I,V),R+=3}u.addGroup(m,R,b===!0?1:2),m+=R}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Jt=class n extends En{constructor(e=1,t=1,i=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,i,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},zl=class n extends Rt{constructor(e=[],t=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:r};let s=[],o=[];a(r),u(i),c(),this.setAttribute("position",new $e(s,3)),this.setAttribute("normal",new $e(s.slice(),3)),this.setAttribute("uv",new $e(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let _=new P,b=new P,E=new P;for(let S=0;S<t.length;S+=3)d(t[S+0],_),d(t[S+1],b),d(t[S+2],E),l(_,b,E,y)}function l(y,_,b,E){let S=E+1,T=[];for(let R=0;R<=S;R++){T[R]=[];let v=y.clone().lerp(b,R/S),M=_.clone().lerp(b,R/S),L=S-R;for(let z=0;z<=L;z++)z===0&&R===S?T[R][z]=v:T[R][z]=v.clone().lerp(M,z/L)}for(let R=0;R<S;R++)for(let v=0;v<2*(S-R)-1;v++){let M=Math.floor(v/2);v%2===0?(f(T[R][M+1]),f(T[R+1][M]),f(T[R][M])):(f(T[R][M+1]),f(T[R+1][M+1]),f(T[R+1][M]))}}function u(y){let _=new P;for(let b=0;b<s.length;b+=3)_.x=s[b+0],_.y=s[b+1],_.z=s[b+2],_.normalize().multiplyScalar(y),s[b+0]=_.x,s[b+1]=_.y,s[b+2]=_.z}function c(){let y=new P;for(let _=0;_<s.length;_+=3){y.x=s[_+0],y.y=s[_+1],y.z=s[_+2];let b=p(y)/2/Math.PI+.5,E=m(y)/Math.PI+.5;o.push(b,1-E)}g(),h()}function h(){for(let y=0;y<o.length;y+=6){let _=o[y+0],b=o[y+2],E=o[y+4],S=Math.max(_,b,E),T=Math.min(_,b,E);S>.9&&T<.1&&(_<.2&&(o[y+0]+=1),b<.2&&(o[y+2]+=1),E<.2&&(o[y+4]+=1))}}function f(y){s.push(y.x,y.y,y.z)}function d(y,_){let b=y*3;_.x=e[b+0],_.y=e[b+1],_.z=e[b+2]}function g(){let y=new P,_=new P,b=new P,E=new P,S=new ie,T=new ie,R=new ie;for(let v=0,M=0;v<s.length;v+=9,M+=6){y.set(s[v+0],s[v+1],s[v+2]),_.set(s[v+3],s[v+4],s[v+5]),b.set(s[v+6],s[v+7],s[v+8]),S.set(o[M+0],o[M+1]),T.set(o[M+2],o[M+3]),R.set(o[M+4],o[M+5]),E.copy(y).add(_).add(b).divideScalar(3);let L=p(E);x(S,M+0,y,L),x(T,M+2,_,L),x(R,M+4,b,L)}}function x(y,_,b,E){E<0&&y.x===1&&(o[_]=y.x-1),b.x===0&&b.z===0&&(o[_]=E/2/Math.PI+.5)}function p(y){return Math.atan2(y.z,-y.x)}function m(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.details)}};var Wt=class extends Pi{constructor(e){super(e),this.uuid=li(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(new Pi().fromJSON(r))}return this}},iy={triangulate:function(n,e,t=2){let i=e&&e.length,r=i?e[0]*t:n.length,s=zh(n,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,u,c,h,f,d;if(i&&(s=ly(n,e,s,t)),n.length>80*t){a=u=n[0],l=c=n[1];for(let g=t;g<r;g+=t)h=n[g],f=n[g+1],h<a&&(a=h),f<l&&(l=f),h>u&&(u=h),f>c&&(c=f);d=Math.max(u-a,c-l),d=d!==0?32767/d:0}return gs(s,o,t,a,l,d,0),o}};function zh(n,e,t,i,r){let s,o;if(r===yy(n,e,t,i)>0)for(s=e;s<t;s+=i)o=uh(s,n[s],n[s+1],o);else for(s=t-i;s>=e;s-=i)o=uh(s,n[s],n[s+1],o);return o&&Yo(o,o.next)&&(_s(o),o=o.next),o}function Ji(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(Yo(t,t.next)||Tt(t.prev,t,t.next)===0)){if(_s(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function gs(n,e,t,i,r,s,o){if(!n)return;!o&&s&&fy(n,i,r,s);let a=n,l,u;for(;n.prev!==n.next;){if(l=n.prev,u=n.next,s?sy(n,i,r,s):ry(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(u.i/t|0),_s(n),n=u.next,a=u.next;continue}if(n=u,n===a){o?o===1?(n=oy(Ji(n),e,t),gs(n,e,t,i,r,s,2)):o===2&&ay(n,e,t,i,r,s):gs(Ji(n),e,t,i,r,s,1);break}}}function ry(n){let e=n.prev,t=n,i=n.next;if(Tt(e,t,i)>=0)return!1;let r=e.x,s=t.x,o=i.x,a=e.y,l=t.y,u=i.y,c=r<s?r<o?r:o:s<o?s:o,h=a<l?a<u?a:u:l<u?l:u,f=r>s?r>o?r:o:s>o?s:o,d=a>l?a>u?a:u:l>u?l:u,g=i.next;for(;g!==e;){if(g.x>=c&&g.x<=f&&g.y>=h&&g.y<=d&&Ir(r,a,s,l,o,u,g.x,g.y)&&Tt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function sy(n,e,t,i){let r=n.prev,s=n,o=n.next;if(Tt(r,s,o)>=0)return!1;let a=r.x,l=s.x,u=o.x,c=r.y,h=s.y,f=o.y,d=a<l?a<u?a:u:l<u?l:u,g=c<h?c<f?c:f:h<f?h:f,x=a>l?a>u?a:u:l>u?l:u,p=c>h?c>f?c:f:h>f?h:f,m=Bl(d,g,e,t,i),y=Bl(x,p,e,t,i),_=n.prevZ,b=n.nextZ;for(;_&&_.z>=m&&b&&b.z<=y;){if(_.x>=d&&_.x<=x&&_.y>=g&&_.y<=p&&_!==r&&_!==o&&Ir(a,c,l,h,u,f,_.x,_.y)&&Tt(_.prev,_,_.next)>=0||(_=_.prevZ,b.x>=d&&b.x<=x&&b.y>=g&&b.y<=p&&b!==r&&b!==o&&Ir(a,c,l,h,u,f,b.x,b.y)&&Tt(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;_&&_.z>=m;){if(_.x>=d&&_.x<=x&&_.y>=g&&_.y<=p&&_!==r&&_!==o&&Ir(a,c,l,h,u,f,_.x,_.y)&&Tt(_.prev,_,_.next)>=0)return!1;_=_.prevZ}for(;b&&b.z<=y;){if(b.x>=d&&b.x<=x&&b.y>=g&&b.y<=p&&b!==r&&b!==o&&Ir(a,c,l,h,u,f,b.x,b.y)&&Tt(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function oy(n,e,t){let i=n;do{let r=i.prev,s=i.next.next;!Yo(r,s)&&Bh(r,i,i.next,s)&&xs(r,s)&&xs(s,r)&&(e.push(r.i/t|0),e.push(i.i/t|0),e.push(s.i/t|0),_s(i),_s(i.next),i=n=s),i=i.next}while(i!==n);return Ji(i)}function ay(n,e,t,i,r,s){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&gy(o,a)){let l=Gh(o,a);o=Ji(o,o.next),l=Ji(l,l.next),gs(o,e,t,i,r,s,0),gs(l,e,t,i,r,s,0);return}a=a.next}o=o.next}while(o!==n)}function ly(n,e,t,i){let r=[],s,o,a,l,u;for(s=0,o=e.length;s<o;s++)a=e[s]*i,l=s<o-1?e[s+1]*i:n.length,u=zh(n,a,l,i,!1),u===u.next&&(u.steiner=!0),r.push(my(u));for(r.sort(cy),s=0;s<r.length;s++)t=uy(r[s],t);return t}function cy(n,e){return n.x-e.x}function uy(n,e){let t=hy(n,e);if(!t)return e;let i=Gh(t,n);return Ji(i,i.next),Ji(t,t.next)}function hy(n,e){let t=e,i=-1/0,r,s=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let f=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=s&&f>i&&(i=f,r=t.x<t.next.x?t:t.next,f===s))return r}t=t.next}while(t!==e);if(!r)return null;let a=r,l=r.x,u=r.y,c=1/0,h;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&Ir(o<u?s:i,o,l,u,o<u?i:s,o,t.x,t.y)&&(h=Math.abs(o-t.y)/(s-t.x),xs(t,n)&&(h<c||h===c&&(t.x>r.x||t.x===r.x&&dy(r,t)))&&(r=t,c=h)),t=t.next;while(t!==a);return r}function dy(n,e){return Tt(n.prev,n,e.prev)<0&&Tt(e.next,n,n.next)<0}function fy(n,e,t,i){let r=n;do r.z===0&&(r.z=Bl(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,py(r)}function py(n){let e,t,i,r,s,o,a,l,u=1;do{for(t=n,n=null,s=null,o=0;t;){for(o++,i=t,a=0,e=0;e<u&&(a++,i=i.nextZ,!!i);e++);for(l=u;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(r=t,t=t.nextZ,a--):(r=i,i=i.nextZ,l--),s?s.nextZ=r:n=r,r.prevZ=s,s=r;t=i}s.nextZ=null,u*=2}while(o>1);return n}function Bl(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function my(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function Ir(n,e,t,i,r,s,o,a){return(r-o)*(e-a)>=(n-o)*(s-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(i-a)}function gy(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!xy(n,e)&&(xs(n,e)&&xs(e,n)&&_y(n,e)&&(Tt(n.prev,n,e.prev)||Tt(n,e.prev,e))||Yo(n,e)&&Tt(n.prev,n,n.next)>0&&Tt(e.prev,e,e.next)>0)}function Tt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function Yo(n,e){return n.x===e.x&&n.y===e.y}function Bh(n,e,t,i){let r=uo(Tt(n,e,t)),s=uo(Tt(n,e,i)),o=uo(Tt(t,i,n)),a=uo(Tt(t,i,e));return!!(r!==s&&o!==a||r===0&&co(n,t,e)||s===0&&co(n,i,e)||o===0&&co(t,n,i)||a===0&&co(t,e,i))}function co(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function uo(n){return n>0?1:n<0?-1:0}function xy(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Bh(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function xs(n,e){return Tt(n.prev,n,n.next)<0?Tt(n,e,n.next)>=0&&Tt(n,n.prev,e)>=0:Tt(n,e,n.prev)<0||Tt(n,n.next,e)<0}function _y(n,e){let t=n,i=!1,r=(n.x+e.x)/2,s=(n.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function Gh(n,e){let t=new Gl(n.i,n.x,n.y),i=new Gl(e.i,e.x,e.y),r=n.next,s=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function uh(n,e,t,i){let r=new Gl(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function _s(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Gl(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function yy(n,e,t,i){let r=0;for(let s=e,o=t-i;s<t;s+=i)r+=(n[o]-n[s])*(n[s+1]+n[o+1]),o=s;return r}var Ei=class n{static area(e){let t=e.length,i=0;for(let r=t-1,s=0;s<t;r=s++)i+=e[r].x*e[s].y-e[s].x*e[r].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],r=[],s=[];hh(e),dh(i,e);let o=e.length;t.forEach(hh);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,dh(i,t[l]);let a=iy.triangulate(i,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function hh(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function dh(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var ji=class n extends Rt{constructor(e=new Wt([new ie(.5,.5),new ie(-.5,.5),new ie(-.5,-.5),new ie(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){let u=e[a];o(u)}this.setAttribute("position",new $e(r,3)),this.setAttribute("uv",new $e(s,2)),this.computeVertexNormals();function o(a){let l=[],u=t.curveSegments!==void 0?t.curveSegments:12,c=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:d-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,p=t.bevelSegments!==void 0?t.bevelSegments:3,m=t.extrudePath,y=t.UVGenerator!==void 0?t.UVGenerator:vy,_,b=!1,E,S,T,R;m&&(_=m.getSpacedPoints(c),b=!0,f=!1,E=m.computeFrenetFrames(c,!1),S=new P,T=new P,R=new P),f||(p=0,d=0,g=0,x=0);let v=a.extractPoints(u),M=v.shape,L=v.holes;if(!Ei.isClockWise(M)){M=M.reverse();for(let D=0,pe=L.length;D<pe;D++){let j=L[D];Ei.isClockWise(j)&&(L[D]=j.reverse())}}let V=Ei.triangulateShape(M,L),I=M;for(let D=0,pe=L.length;D<pe;D++){let j=L[D];M=M.concat(j)}function O(D,pe,j){return pe||console.error("THREE.ExtrudeGeometry: vec does not exist"),D.clone().addScaledVector(pe,j)}let X=M.length,N=V.length;function H(D,pe,j){let ue,Q,de,ae=D.x-pe.x,A=D.y-pe.y,w=j.x-D.x,k=j.y-D.y,ce=ae*ae+A*A,re=ae*k-A*w;if(Math.abs(re)>Number.EPSILON){let ne=Math.sqrt(ce),Ae=Math.sqrt(w*w+k*k),be=pe.x-A/ne,Re=pe.y+ae/ne,Pe=j.x-k/Ae,Ze=j.y+w/Ae,le=((Pe-be)*k-(Ze-Re)*w)/(ae*k-A*w);ue=be+ae*le-D.x,Q=Re+A*le-D.y;let et=ue*ue+Q*Q;if(et<=2)return new ie(ue,Q);de=Math.sqrt(et/2)}else{let ne=!1;ae>Number.EPSILON?w>Number.EPSILON&&(ne=!0):ae<-Number.EPSILON?w<-Number.EPSILON&&(ne=!0):Math.sign(A)===Math.sign(k)&&(ne=!0),ne?(ue=-A,Q=ae,de=Math.sqrt(ce)):(ue=ae,Q=A,de=Math.sqrt(ce/2))}return new ie(ue/de,Q/de)}let G=[];for(let D=0,pe=I.length,j=pe-1,ue=D+1;D<pe;D++,j++,ue++)j===pe&&(j=0),ue===pe&&(ue=0),G[D]=H(I[D],I[j],I[ue]);let K=[],ee,me=G.concat();for(let D=0,pe=L.length;D<pe;D++){let j=L[D];ee=[];for(let ue=0,Q=j.length,de=Q-1,ae=ue+1;ue<Q;ue++,de++,ae++)de===Q&&(de=0),ae===Q&&(ae=0),ee[ue]=H(j[ue],j[de],j[ae]);K.push(ee),me=me.concat(ee)}for(let D=0;D<p;D++){let pe=D/p,j=d*Math.cos(pe*Math.PI/2),ue=g*Math.sin(pe*Math.PI/2)+x;for(let Q=0,de=I.length;Q<de;Q++){let ae=O(I[Q],G[Q],ue);Te(ae.x,ae.y,-j)}for(let Q=0,de=L.length;Q<de;Q++){let ae=L[Q];ee=K[Q];for(let A=0,w=ae.length;A<w;A++){let k=O(ae[A],ee[A],ue);Te(k.x,k.y,-j)}}}let q=g+x;for(let D=0;D<X;D++){let pe=f?O(M[D],me[D],q):M[D];b?(T.copy(E.normals[0]).multiplyScalar(pe.x),S.copy(E.binormals[0]).multiplyScalar(pe.y),R.copy(_[0]).add(T).add(S),Te(R.x,R.y,R.z)):Te(pe.x,pe.y,0)}for(let D=1;D<=c;D++)for(let pe=0;pe<X;pe++){let j=f?O(M[pe],me[pe],q):M[pe];b?(T.copy(E.normals[D]).multiplyScalar(j.x),S.copy(E.binormals[D]).multiplyScalar(j.y),R.copy(_[D]).add(T).add(S),Te(R.x,R.y,R.z)):Te(j.x,j.y,h/c*D)}for(let D=p-1;D>=0;D--){let pe=D/p,j=d*Math.cos(pe*Math.PI/2),ue=g*Math.sin(pe*Math.PI/2)+x;for(let Q=0,de=I.length;Q<de;Q++){let ae=O(I[Q],G[Q],ue);Te(ae.x,ae.y,h+j)}for(let Q=0,de=L.length;Q<de;Q++){let ae=L[Q];ee=K[Q];for(let A=0,w=ae.length;A<w;A++){let k=O(ae[A],ee[A],ue);b?Te(k.x,k.y+_[c-1].y,_[c-1].x+j):Te(k.x,k.y,h+j)}}}oe(),fe();function oe(){let D=r.length/3;if(f){let pe=0,j=X*pe;for(let ue=0;ue<N;ue++){let Q=V[ue];Oe(Q[2]+j,Q[1]+j,Q[0]+j)}pe=c+p*2,j=X*pe;for(let ue=0;ue<N;ue++){let Q=V[ue];Oe(Q[0]+j,Q[1]+j,Q[2]+j)}}else{for(let pe=0;pe<N;pe++){let j=V[pe];Oe(j[2],j[1],j[0])}for(let pe=0;pe<N;pe++){let j=V[pe];Oe(j[0]+X*c,j[1]+X*c,j[2]+X*c)}}i.addGroup(D,r.length/3-D,0)}function fe(){let D=r.length/3,pe=0;ve(I,pe),pe+=I.length;for(let j=0,ue=L.length;j<ue;j++){let Q=L[j];ve(Q,pe),pe+=Q.length}i.addGroup(D,r.length/3-D,1)}function ve(D,pe){let j=D.length;for(;--j>=0;){let ue=j,Q=j-1;Q<0&&(Q=D.length-1);for(let de=0,ae=c+p*2;de<ae;de++){let A=X*de,w=X*(de+1),k=pe+ue+A,ce=pe+Q+A,re=pe+Q+w,ne=pe+ue+w;Ie(k,ce,re,ne)}}}function Te(D,pe,j){l.push(D),l.push(pe),l.push(j)}function Oe(D,pe,j){Ce(D),Ce(pe),Ce(j);let ue=r.length/3,Q=y.generateTopUV(i,r,ue-3,ue-2,ue-1);Ge(Q[0]),Ge(Q[1]),Ge(Q[2])}function Ie(D,pe,j,ue){Ce(D),Ce(pe),Ce(ue),Ce(pe),Ce(j),Ce(ue);let Q=r.length/3,de=y.generateSideWallUV(i,r,Q-6,Q-3,Q-2,Q-1);Ge(de[0]),Ge(de[1]),Ge(de[3]),Ge(de[1]),Ge(de[2]),Ge(de[3])}function Ce(D){r.push(l[D*3+0]),r.push(l[D*3+1]),r.push(l[D*3+2])}function Ge(D){s.push(D.x),s.push(D.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return by(t,i,e)}static fromJSON(e,t){let i=[];for(let s=0,o=e.shapes.length;s<o;s++){let a=t[e.shapes[s]];i.push(a)}let r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new ko[r.type]().fromJSON(r)),new n(i,e.options)}},vy={generateTopUV:function(n,e,t,i,r){let s=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],u=e[r*3],c=e[r*3+1];return[new ie(s,o),new ie(a,l),new ie(u,c)]},generateSideWallUV:function(n,e,t,i,r,s){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],u=e[i*3],c=e[i*3+1],h=e[i*3+2],f=e[r*3],d=e[r*3+1],g=e[r*3+2],x=e[s*3],p=e[s*3+1],m=e[s*3+2];return Math.abs(a-c)<Math.abs(o-u)?[new ie(o,1-l),new ie(u,1-h),new ie(f,1-g),new ie(x,1-m)]:[new ie(a,1-l),new ie(c,1-h),new ie(d,1-g),new ie(p,1-m)]}};function by(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,r=n.length;i<r;i++){let s=n[i];t.shapes.push(s.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Gr=class n extends zl{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,r=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var Ii=class n extends Rt{constructor(e=.5,t=1,i=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:o},i=Math.max(3,i),r=Math.max(1,r);let a=[],l=[],u=[],c=[],h=e,f=(t-e)/r,d=new P,g=new ie;for(let x=0;x<=r;x++){for(let p=0;p<=i;p++){let m=s+p/i*o;d.x=h*Math.cos(m),d.y=h*Math.sin(m),l.push(d.x,d.y,d.z),u.push(0,0,1),g.x=(d.x/t+1)/2,g.y=(d.y/t+1)/2,c.push(g.x,g.y)}h+=f}for(let x=0;x<r;x++){let p=x*(i+1);for(let m=0;m<i;m++){let y=m+p,_=y,b=y+i+1,E=y+i+2,S=y+1;a.push(_,b,S),a.push(b,E,S)}}this.setIndex(a),this.setAttribute("position",new $e(l,3)),this.setAttribute("normal",new $e(u,3)),this.setAttribute("uv",new $e(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Xn=class n extends Rt{constructor(e=new Wt([new ie(0,.5),new ie(-.5,-.5),new ie(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)u(e);else for(let c=0;c<e.length;c++)u(e[c]),this.addGroup(a,l,c),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new $e(r,3)),this.setAttribute("normal",new $e(s,3)),this.setAttribute("uv",new $e(o,2));function u(c){let h=r.length/3,f=c.extractPoints(t),d=f.shape,g=f.holes;Ei.isClockWise(d)===!1&&(d=d.reverse());for(let p=0,m=g.length;p<m;p++){let y=g[p];Ei.isClockWise(y)===!0&&(g[p]=y.reverse())}let x=Ei.triangulateShape(d,g);for(let p=0,m=g.length;p<m;p++){let y=g[p];d=d.concat(y)}for(let p=0,m=d.length;p<m;p++){let y=d[p];r.push(y.x,y.y,0),s.push(0,0,1),o.push(y.x,y.y)}for(let p=0,m=x.length;p<m;p++){let y=x[p],_=y[0]+h,b=y[1]+h,E=y[2]+h;i.push(_,b,E),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return My(t,e)}static fromJSON(e,t){let i=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];i.push(o)}return new n(i,e.curveSegments)}};function My(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let r=n[t];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e}var Fn=class n extends Rt{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),u=0,c=[],h=new P,f=new P,d=[],g=[],x=[],p=[];for(let m=0;m<=i;m++){let y=[],_=m/i,b=0;m===0&&o===0?b=.5/t:m===i&&l===Math.PI&&(b=-.5/t);for(let E=0;E<=t;E++){let S=E/t;h.x=-e*Math.cos(r+S*s)*Math.sin(o+_*a),h.y=e*Math.cos(o+_*a),h.z=e*Math.sin(r+S*s)*Math.sin(o+_*a),g.push(h.x,h.y,h.z),f.copy(h).normalize(),x.push(f.x,f.y,f.z),p.push(S+b,1-_),y.push(u++)}c.push(y)}for(let m=0;m<i;m++)for(let y=0;y<t;y++){let _=c[m][y+1],b=c[m][y],E=c[m+1][y],S=c[m+1][y+1];(m!==0||o>0)&&d.push(_,b,S),(m!==i-1||l<Math.PI)&&d.push(b,E,S)}this.setIndex(d),this.setAttribute("position",new $e(g,3)),this.setAttribute("normal",new $e(x,3)),this.setAttribute("uv",new $e(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var on=class n extends Rt{constructor(e=1,t=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);let o=[],a=[],l=[],u=[],c=new P,h=new P,f=new P;for(let d=0;d<=i;d++)for(let g=0;g<=r;g++){let x=g/r*s,p=d/i*Math.PI*2;h.x=(e+t*Math.cos(p))*Math.cos(x),h.y=(e+t*Math.cos(p))*Math.sin(x),h.z=t*Math.sin(p),a.push(h.x,h.y,h.z),c.x=e*Math.cos(x),c.y=e*Math.sin(x),f.subVectors(h,c).normalize(),l.push(f.x,f.y,f.z),u.push(g/r),u.push(d/i)}for(let d=1;d<=i;d++)for(let g=1;g<=r;g++){let x=(r+1)*d+g-1,p=(r+1)*(d-1)+g-1,m=(r+1)*(d-1)+g,y=(r+1)*d+g;o.push(x,p,y),o.push(p,m,y)}this.setIndex(o),this.setAttribute("position",new $e(a,3)),this.setAttribute("normal",new $e(l,3)),this.setAttribute("uv",new $e(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var zo=class n extends Rt{constructor(e=new Oo(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,i=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:r,closed:s};let o=e.computeFrenetFrames(t,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new P,l=new P,u=new ie,c=new P,h=[],f=[],d=[],g=[];x(),this.setIndex(g),this.setAttribute("position",new $e(h,3)),this.setAttribute("normal",new $e(f,3)),this.setAttribute("uv",new $e(d,2));function x(){for(let _=0;_<t;_++)p(_);p(s===!1?t:0),y(),m()}function p(_){c=e.getPointAt(_/t,c);let b=o.normals[_],E=o.binormals[_];for(let S=0;S<=r;S++){let T=S/r*Math.PI*2,R=Math.sin(T),v=-Math.cos(T);l.x=v*b.x+R*E.x,l.y=v*b.y+R*E.y,l.z=v*b.z+R*E.z,l.normalize(),f.push(l.x,l.y,l.z),a.x=c.x+i*l.x,a.y=c.y+i*l.y,a.z=c.z+i*l.z,h.push(a.x,a.y,a.z)}}function m(){for(let _=1;_<=t;_++)for(let b=1;b<=r;b++){let E=(r+1)*(_-1)+(b-1),S=(r+1)*_+(b-1),T=(r+1)*_+b,R=(r+1)*(_-1)+b;g.push(E,S,R),g.push(S,T,R)}}function y(){for(let _=0;_<=t;_++)for(let b=0;b<=r;b++)u.x=_/t,u.y=b/r,d.push(u.x,u.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new n(new ko[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var an=class extends ui{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new qe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new qe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=rc,this.normalScale=new ie(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Bo=class extends ui{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new qe(16777215),this.specular=new qe(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new qe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=rc,this.normalScale=new ie(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=nc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function ho(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function Sy(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var Hr=class{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,r=t[i],s=t[i-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=t[--i-1],e>=s)break e}o=i,i=0;break t}break n}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Hl=class extends Hr{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:gu,endingEnd:gu}}intervalChanged_(e,t,i){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case xu:s=e,a=2*t-i;break;case _u:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case xu:o=e,l=2*i-t;break;case _u:o=1,l=i+r[1]-r[0];break;default:o=e-1,l=t}let u=(i-t)*.5,c=this.valueSize;this._weightPrev=u/(t-a),this._weightNext=u/(l-i),this._offsetPrev=s*c,this._offsetNext=o*c}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,c=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,d=this._weightNext,g=(i-t)/(r-t),x=g*g,p=x*g,m=-f*p+2*f*x-f*g,y=(1+f)*p+(-1.5-2*f)*x+(-.5+f)*g+1,_=(-1-d)*p+(1.5+d)*x+.5*g,b=d*p-d*x;for(let E=0;E!==a;++E)s[E]=m*o[c+E]+y*o[u+E]+_*o[l+E]+b*o[h+E];return s}},Vl=class extends Hr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,c=(i-t)/(r-t),h=1-c;for(let f=0;f!==a;++f)s[f]=o[u+f]*h+o[l+f]*c;return s}},Wl=class extends Hr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},kn=class{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ho(t,this.TimeBufferType),this.values=ho(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:ho(e.times,Array),values:ho(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Wl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Vl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Hl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case po:t=this.InterpolantFactoryMethodDiscrete;break;case mo:t=this.InterpolantFactoryMethodLinear;break;case Da:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return po;case this.InterpolantFactoryMethodLinear:return mo;case this.InterpolantFactoryMethodSmooth:return Da}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e}return this}trim(e,t){let i=this.times,r=i.length,s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&Sy(r))for(let a=0,l=r.length;a!==l;++a){let u=r[a];if(isNaN(u)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,u),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===Da,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,u=e[a],c=e[a+1];if(u!==c&&(a!==1||u!==e[0]))if(r)l=!0;else{let h=a*i,f=h-i,d=h+i;for(let g=0;g!==i;++g){let x=t[h+g];if(x!==t[f+g]||x!==t[d+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*i,f=o*i;for(let d=0;d!==i;++d)t[f+d]=t[h+d]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,l=o*i,u=0;u!==i;++u)t[l+u]=t[a+u];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};kn.prototype.TimeBufferType=Float32Array;kn.prototype.ValueBufferType=Float32Array;kn.prototype.DefaultInterpolation=mo;var Qi=class extends kn{};Qi.prototype.ValueTypeName="bool";Qi.prototype.ValueBufferType=Array;Qi.prototype.DefaultInterpolation=po;Qi.prototype.InterpolantFactoryMethodLinear=void 0;Qi.prototype.InterpolantFactoryMethodSmooth=void 0;var Xl=class extends kn{};Xl.prototype.ValueTypeName="color";var ql=class extends kn{};ql.prototype.ValueTypeName="number";var Yl=class extends Hr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(r-t),u=e*a;for(let c=u+a;u!==c;u+=4)Ri.slerpFlat(s,0,o,u-a,o,u,l);return s}},ys=class extends kn{InterpolantFactoryMethodLinear(e){return new Yl(this.times,this.values,this.getValueSize(),e)}};ys.prototype.ValueTypeName="quaternion";ys.prototype.DefaultInterpolation=mo;ys.prototype.InterpolantFactoryMethodSmooth=void 0;var er=class extends kn{};er.prototype.ValueTypeName="string";er.prototype.ValueBufferType=Array;er.prototype.DefaultInterpolation=po;er.prototype.InterpolantFactoryMethodLinear=void 0;er.prototype.InterpolantFactoryMethodSmooth=void 0;var Kl=class extends kn{};Kl.prototype.ValueTypeName="vector";var Zl=class{constructor(e,t,i){let r=this,s=!1,o=0,a=0,l,u=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(c){a++,s===!1&&r.onStart!==void 0&&r.onStart(c,o,a),s=!0},this.itemEnd=function(c){o++,r.onProgress!==void 0&&r.onProgress(c,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(c){r.onError!==void 0&&r.onError(c)},this.resolveURL=function(c){return l?l(c):c},this.setURLModifier=function(c){return l=c,this},this.addHandler=function(c,h){return u.push(c,h),this},this.removeHandler=function(c){let h=u.indexOf(c);return h!==-1&&u.splice(h,2),this},this.getHandler=function(c){for(let h=0,f=u.length;h<f;h+=2){let d=u[h],g=u[h+1];if(d.global&&(d.lastIndex=0),d.test(c))return g}return null}}},wy=new Zl,$l=class{constructor(e){this.manager=e!==void 0?e:wy,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};$l.DEFAULT_MATERIAL_NAME="__DEFAULT";var Vr=class extends Zt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new qe(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}},Wr=class extends Vr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Zt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new qe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},ll=new vt,fh=new P,ph=new P,Go=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ie(512,512),this.map=null,this.mapPass=null,this.matrix=new vt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new us,this._frameExtents=new ie(1,1),this._viewportCount=1,this._viewports=[new wt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;fh.setFromMatrixPosition(e.matrixWorld),t.position.copy(fh),ph.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ph),t.updateMatrixWorld(),ll.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ll),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(ll)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var mh=new vt,rs=new P,cl=new P,Jl=class extends Go{constructor(){super(new dn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ie(4,2),this._viewportCount=6,this._viewports=[new wt(2,1,1,1),new wt(0,1,1,1),new wt(3,1,1,1),new wt(1,1,1,1),new wt(3,0,1,1),new wt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){let i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),rs.setFromMatrixPosition(e.matrixWorld),i.position.copy(rs),cl.copy(i.position),cl.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(cl),i.updateMatrixWorld(),r.makeTranslation(-rs.x,-rs.y,-rs.z),mh.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(mh)}},Tn=class extends Vr{constructor(e,t,i=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new Jl}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},jl=class extends Go{constructor(){super(new Hn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},hi=class extends Vr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Zt.DEFAULT_UP),this.updateMatrix(),this.target=new Zt,this.shadow=new jl}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Ho=class extends Vr{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var lc="\\[\\]\\.:\\/",Ey=new RegExp("["+lc+"]","g"),cc="[^"+lc+"]",Ty="[^"+lc.replace("\\.","")+"]",Ay=/((?:WC+[\/:])*)/.source.replace("WC",cc),Cy=/(WCOD+)?/.source.replace("WCOD",Ty),Ry=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",cc),Py=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",cc),Iy=new RegExp("^"+Ay+Cy+Ry+Py+"$"),Ly=["material","materials","bones","map"],Ql=class{constructor(e,t,i){let r=i||St.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},St=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Ey,"")}static parseTrackName(e){let t=Iy.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);Ly.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let u=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let c=0;c<e.length;c++)if(e[c].name===u){u=c;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(u!==void 0){if(e[u]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[u]}}let o=e[r];if(o===void 0){let u=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+u+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};St.Composite=Ql;St.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};St.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};St.prototype.GetterByBindingType=[St.prototype._getValue_direct,St.prototype._getValue_array,St.prototype._getValue_arrayElement,St.prototype._getValue_toArray];St.prototype.SetterByBindingTypeAndVersioning=[[St.prototype._setValue_direct,St.prototype._setValue_direct_setNeedsUpdate,St.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[St.prototype._setValue_array,St.prototype._setValue_array_setNeedsUpdate,St.prototype._setValue_array_setMatrixWorldNeedsUpdate],[St.prototype._setValue_arrayElement,St.prototype._setValue_arrayElement_setNeedsUpdate,St.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[St.prototype._setValue_fromArray,St.prototype._setValue_fromArray_setNeedsUpdate,St.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var sM=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");var tr=["up","down","left","right"];var uc={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},at=(n,e,t,i={},r,s=e)=>({char:n,minotaur:e,block:t,hazard:s,...i,sprites:r??[]}),xn={floor:at(".",!0,!0,{},["floor"]),wall:at("#",!1,!1,{},["wall"]),exit:at("E",!1,!1,{},["exit"]),gate:at("|",!1,!1,{},["gate-closed","gate-open"]),water:at("~",!1,!0,{needs:"flippers"},["water"]),fire:at("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:at("=",!0,!0,{slides:"skates"},["ice"]),"force-up":at("^",!0,!0,{carries:"up"},["force-up"]),"force-down":at("v",!0,!0,{carries:"down"},["force-down"]),"force-left":at("<",!0,!0,{carries:"left"},["force-left"]),"force-right":at(">",!0,!0,{carries:"right"},["force-right"]),dirt:at("%",!0,!0,{},["dirt"]),safe:at("S",!1,!1,{},["safe"]),button:at("_",!0,!0,{},["button"]),"toggle-open":at("t",!0,!1,{},["toggle-open"]),"toggle-closed":at("T",!1,!1,{},["toggle-closed"]),"door-red":at("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":at("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":at("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":at("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:at("&",!0,!0,{},["trap"]),"button-brown":at("-",!0,!0,{},["button-brown"]),"button-red":at("+",!0,!0,{},["button-red"]),popup:at(";",!1,!1,{},["popup"]),gravel:at(":",!1,!1,{},["gravel"]),"fake-wall":at("W",!1,!1,{},["wall"]),"invisible-wall":at("I",!1,!1,{},["floor"]),teleport:at("@",!1,!1,{},["teleport"]),thief:at("$",!0,!0,{},["thief"]),bomb:at("!",!1,!0,{},["bomb"],!0),clone:at("C",!1,!1,{},tr.map(n=>`clone-${n}`))},zn={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var An={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:uc.mirror.name},cake:{char:"x",sprite:"cake",name:uc.cake.name},cow:{char:"c",sprite:"cow",name:uc.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},Dy=["theseus","minotaur","minotaur-stone","cow-standing"],Uy=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],Ny=["exit-off","exit-wake"],aM=[...new Set([...Object.values(xn).flatMap(n=>n.sprites),...Uy,...Ny,...Object.values(An).map(n=>n.sprite),...Dy,...Object.values(zn).map(n=>n.sprite)])];function Hh(n,e){let t=e.minotaur,i=n.minotaur;if(!t||!i||t.r!==i.r||t.c!==i.c)return[];let r=n.objects[i.r*n.level.cols+i.c];return r&&r!=="block"?[{kind:r,c:i.c,r:i.r,by:"minotaur"}]:[]}var hc=[[.55,-.62],[-.55,-.62],[.95,.15],[-.95,.15],[.55,.9],[-.55,.9]],Li=2,Oy=220;function Vh(n){return Math.round(Math.min(54,Math.max(34,n*.8)))}function Fy(n,e,t,i,r){let s=Vh(t),o=s/2,a=n+t*.12,l=e+t*.08;for(let f=0;f<hc.length;f++){let[d,g]=hc[f],x=a+d*s,p=l+g*s;if(x-o>=Li&&x+o<=i-Li&&p-o>=Li&&p+o<=r-Li)return{cx:x,cy:p,place:f}}let[u,c]=hc[0],h=(f,d,g)=>d>g?(d+g)/2:Math.min(g,Math.max(d,f));return{cx:h(a+u*s,o+Li,i-o-Li),cy:h(l+c*s,o+Li,r-o-Li),place:0}}function ky(n,e,t){return n.x>=0&&n.x<=e&&n.head>=-n.cell&&n.head<=t}function Wh(n){return{look:"modern",frame(e){let t=n.icons[e];return t?{x:t.x,y:t.y,w:n.cell,h:n.cell,sw:n.width,sh:n.height,mx:.5,my:.44,fill:.92}:null}}}function Xh(n,e){let t=document.createElement("div");t.className="item-bubbles",t.dataset.look=e.look,t.setAttribute("aria-hidden","true"),n(t);let i=new Map;function r(o){let a=document.createElement("div");a.className="item-bubble",a.dataset.kind=o.kind,a.dataset.by=o.by;let l=[document.createElement("span"),document.createElement("span")];for(let h of l)h.className="item-bubble-puff";let u=document.createElement("span");u.className="item-bubble-cloud";let c=document.createElement("span");return c.className="item-bubble-pic",u.append(c),a.append(...l,u),t.append(a),a.offsetWidth,a.classList.add("shown"),{el:a,cloud:u,pic:c,puffs:l,bubble:o,place:0,x:0,y:0,d:0,key:""}}function s(o,a,l,u){let c=Vh(a.cell),{cx:h,cy:f,place:d}=Fy(a.x,a.head,a.cell,l,u),g=`${h.toFixed(1)} ${f.toFixed(1)} ${c} ${a.x.toFixed(1)} ${a.head.toFixed(1)}`;if(g===o.key)return;Object.assign(o,{key:g,place:d,x:h,y:f,d:c}),o.cloud.style.cssText=`left:${h-c/2}px;top:${f-c/2}px;width:${c}px;height:${c*.86}px`;let x=a.x+a.cell*.08,p=a.head+a.cell*.12;[[.3,.13],[.55,.2]].forEach(([y,_],b)=>{let E=Math.max(4,c*_),S=x+(h-x)*y,T=p+(f-p)*y;o.puffs[b].style.cssText=`left:${S-E/2}px;top:${T-E/2}px;width:${E}px;height:${E}px`});let m=e.frame(o.bubble.kind);if(m){let y=c*m.fill/m.w,_=c-3,b=c*.86-3;o.pic.style.cssText=`background-size:${m.sw*y}px ${m.sh*y}px;background-position:${_/2-(m.x+m.mx*m.w)*y}px ${b/2-(m.y+m.my*m.h)*y}px`}}return{place(o,a,l){let u=new Set;for(let c of o){if(!ky(c,a,l))continue;let h=`${c.bubble.by} ${c.bubble.c},${c.bubble.r} ${c.bubble.kind}`;u.add(h);let f=i.get(h);f||i.set(h,f=r(c.bubble)),s(f,c,a,l)}for(let[c,h]of i)u.has(c)||(i.delete(c),h.el.classList.remove("shown"),setTimeout(()=>h.el.remove(),Oy))},shown(){return[...i.values()].map(o=>({kind:o.bubble.kind,c:o.bubble.c,r:o.bubble.r,by:o.bubble.by,place:o.place,x:o.x,y:o.y,size:o.d}))}}}var Ko=n=>Math.min(1,Math.max(0,n)),qh=n=>{let e=Ko(n);return e*e*(3-2*e)},Yh=n=>n<=0||n>=1?0:Math.sin(Math.PI*n),Zo=n=>qh((n-770)/630),Kh=n=>Yh((n-590)/420);function Zh(n,e){let t=n/700-e,i=Ko(t*8),r=i*(1-Ko(t*2));return i*(.45+.55*r)*(1-.65*qh((n-980)/420))}var $h=Array.from({length:12},(n,e)=>{let t=i=>{let r=Math.sin(e*12.9898+i*78.233)*43758.5453;return r-Math.floor(r)};return{x:-.05-t(2)*.25,z:(t(1)-.5)*.6,t0:1e3+e/11*500,rise:.8+t(4)*.6}});function Jh(n,e){let t=(n-e.t0)/600;return{o:Yh(t),up:Ko(t)}}var dc=4,By=900,Gy=800,Hy=500,Vy=.22,jh=[[.3,420],[.36,160],[.3,200],[.36,160],[.3,380],[-.12,520],[0,400]],Wy=jh.reduce((n,[,e])=>n+e,0),Xy=[[-1,0],[1,0],[0,-1],[0,1]],vs=(n,e,t)=>e<0||t<0||e>=n.level.rows||t>=n.level.cols||n.terrain[e*n.level.cols+t]==="wall";function fc(n,e,t){return(vs(n,e-1,t)||vs(n,e+1,t))&&!(vs(n,e,t-1)&&vs(n,e,t+1))?"h":"v"}function $o(n,e){return n.terrain[e]!=="floor"?null:xn[n.level.terrain[e]].door??null}function Qh(n,e,t){for(let i of Xy){let r=e+i[0],s=t+i[1];if(!vs(n,r,s)&&n.terrain[r*n.level.cols+s]==="gate")return i}return null}function Jo(n,e,t=0){let i=Math.round(e.r),r=Math.round(e.c),s=Qh(n,i,r);if(!s)return e;let o=Math.max(0,1-2*Math.max(Math.abs(e.r-i),Math.abs(e.c-r))),a=-Vy*o+t;return{r:e.r+s[0]*a,c:e.c+s[1]*a}}var bs={bars:new Map,portal:null,wake:null,doors:new Map,hoof:0,busy:!1},qy=n=>n.relicsLeft===0?1:0,Ms=(n,e)=>e.portal??qy(n),ed=n=>n*n*(3-2*n);function Yy(n){let e=0,t=0;for(let[i,r]of jh){if(n<e+r)return t+(i-t)*ed((n-e)/r);e+=r,t=i}return 0}function td(){let n=null,e=!1,t=0,i=new Map,r={move:null},s={move:null},o=null,a=new Map,l=!1,u=null,c=(f,d)=>{let g=Math.min(1,Math.max(0,(d-f.t0)/f.ms));return f.from+(f.to-f.from)*ed(g)},h=(f,d,g,x)=>{let p=f?c(f,g):1-d;return{from:p,to:d,t0:g,ms:x*Math.abs(d-p)}};return{at(f,d,g,x,p){let{cols:m}=f.level,y=[];f.level.terrain.forEach((V,I)=>{xn[V].door&&y.push(I)});let _=V=>{let I=Math.floor(V/m),O=V%m;return Math.abs(d.player.r-I)+Math.abs(d.player.c-O)<.999},b=new Map(y.map(V=>[V,f.terrain[V]==="floor"||_(V)])),E=f.relicsLeft===0;if(f.level!==n)n=f.level,r.move=null,s.move=null,o=null,a.clear(),l=!1,u=null;else if(!x){f.moves===0&&t>1?(r.move=null,s.move=null,o=null):E!==e&&(r.move=h(r.move,E?1:0,g,By),s.move=h(s.move,E?1:0,g,Gy),o=E?g:null);for(let[V,I]of b)i.get(V)!==I&&a.set(V,h(a.get(V),I?1:0,g,Hy))}e=E,i=b,t=f.moves,x&&(r.move=null,s.move=null,o=null,a.clear());let S=!1,T=new Map;if(r.move)if(g-r.move.t0>=r.move.ms)r.move=null;else{let V=c(r.move,g);f.terrain.forEach((I,O)=>{I==="gate"&&T.set(O,V)}),S=!0}let R=null;s.move&&(g-s.move.t0>=s.move.ms?s.move=null:(R=c(s.move,g),S=!0));let v=null;o!==null&&(g-o>=2100?o=null:(v=Math.max(0,g-o),S=!0));let M=new Map;for(let[V,I]of a)g-I.t0>=I.ms?a.delete(V):(M.set(V,c(I,g)),S=!0);f.moves===0&&(l=!1),u&&u.s!==f&&(u=null);let L=f.minotaur;!l&&!x&&p&&E&&f.outcome==="playing"&&L&&f.stone===0&&Qh(f,L.r,L.c)&&(l=!0,u={s:f,t0:g});let z=0;return u&&(g-u.t0>=Wy?u=null:(z=Yy(g-u.t0),S=!0)),S?{bars:T,portal:R,wake:v,doors:M,hoof:z,busy:S}:bs}}}function Ss(n){return Math.max(10,Math.min(90,n))}function id(n,e){let t=n*Math.PI/180;return Math.max(40,e/2*Math.cos(t)/Math.max(.05,Math.sin(t))+4)}var ws=n=>Math.sin(n*Math.PI/180);function rd(n,e,t,i){let r=i?1:1-Math.exp(-Math.max(0,t)*11),s=!1;for(let o of["yaw","pitch","tx","tz","zoom"]){let a=e[o]-n[o];a!==0&&(n[o]=Math.abs(a)>(o==="yaw"||o==="pitch"?.02:.002)&&!i?n[o]+a*r:e[o],n[o]!==e[o]&&(s=!0))}return n.pitch=Ss(n.pitch),s}var nd=(n,e)=>Math.max(-Math.max(0,e),Math.min(Math.max(0,e),n));function jo(n,e,t,i){let r=n.yaw*Math.PI/180,s=Math.cos(r),o=Math.sin(r),a=n.tx*s-n.tz*o,l=-n.tx*o-n.tz*s,u=(e*Math.abs(s)+t*Math.abs(o))/2,c=(e*Math.abs(o)+t*Math.abs(s))/2,h=nd(a,u+1-n.zoom*i/2),f=nd(l,c+1-n.zoom/2/ws(n.pitch));return{...n,tx:h*s-f*o,tz:-h*o-f*s}}function sd(n,e,t,i){let r=n.yaw*Math.PI/180,s=Math.cos(r),o=-Math.sin(r),a=-Math.sin(r),l=-Math.cos(r),u=e*i,c=t*i/ws(n.pitch);return{...n,tx:n.tx-s*u+a*c,tz:n.tz-o*u+l*c}}function od(n,e){return n+360*Math.round((e-n)/360)}var pc=5,qn=1.25,ad=n=>2*qn*Math.cos(n*Math.PI/180);function ld(n,e,t,i,r){let s=r*Math.PI/180,o=Math.abs(Math.cos(s)),a=Math.abs(Math.sin(s)),l=e,u=t,c=l*o+u*a,h=(l*a+u*o)*ws(i);return Math.max(pc,h+ad(i),c/n)}function cd(n,e,t,i){let r=Math.hypot(e+2,t+2);return{min:pc,max:Math.max(pc,r*ws(i)+ad(i),r/n)}}var Qo=(n,e)=>Math.max(e.min,Math.min(e.max,n));function Di(n,e,t){let i=n.yaw*Math.PI/180,r=t/ws(n.pitch);return{x:n.tx+Math.cos(i)*e-Math.sin(i)*r,z:n.tz-Math.sin(i)*e-Math.cos(i)*r}}function ud(n,e,t,i,r,s){let o=Di(n,t*n.zoom*e,i*n.zoom),a=Math.round(o.x+(r-1)/2),l=Math.round(o.z+(s-1)/2);return!Number.isFinite(a)||!Number.isFinite(l)||a<0||l<0||a>=r||l>=s?null:{r:l+0,c:a+0}}function hd(n,e,t,i,r){let s=Qo(n.zoom*e,r),o=n.zoom-s,a=Di(n,t*o,i*o);return{...n,zoom:s,tx:a.x,tz:a.z}}function dd(n,e){let t=n.zoom/2,i=t*e;return{corners:[Di(n,-i,t),Di(n,i,t),Di(n,i,-t),Di(n,-i,-t)],tick:[Di(n,0,0),Di(n,0,t*.4)]}}function fd(n,e,t,i){let r=n<520?8:11,s=Math.min(Math.floor(n*.5/t),Math.floor(e*.4/i));return Math.max(2,Math.min(r,s))}function pd(n,e,t,i,r){return[(n.x+e/2)*i,r+(n.z+t/2)*i]}function md(n,e,t,i,r,s){return{x:n/r-t/2,z:(e-s)/r-i/2}}var gd={items:"plate",beacon:!1,cutaway:!1,caps:!1},xd="crete-variant";function Ky(n){let e={...gd};if(!n)return e;let t;try{t=JSON.parse(n)}catch{return e}if(!t||typeof t!="object")return e;let i=t;(i.items==="cyan"||i.items==="white"||i.items==="plate")&&(e.items=i.items);for(let r of["beacon","cutaway","caps"])typeof i[r]=="boolean"&&(e[r]=i[r]);return e}var _d=gd;function _n(){return _d}function yd(n){_d=Ky(n)}var $y=12,Jy=.6,jy=.4,Qy=.4;function bd(){let n=null,e={down(t,i,r){return n?[]:(n={id:t,x0:i,y0:r,x:i,y:r,dragging:!1},[])},move(t,i,r){if(!n||n.id!==t)return[];if(!n.dragging){if(Math.hypot(i-n.x0,r-n.y0)<$y)return[];n.dragging=!0}let s=i-n.x,o=r-n.y;n.x=i,n.y=r;let a=[];return s!==0&&a.push({kind:"turn",deg:-s*Jy}),o!==0&&a.push({kind:"tilt",deg:o*jy}),a},up(t,i,r){if(!n||n.id!==t)return[];let s=e.move(t,i,r),o=n.dragging;return n=null,o?s:[{kind:"reset"}]},cancel(t){return n?.id===t&&(n=null),[]}};return e}function Md(n){let e=Ss(n.pitch);return{needle:n.yaw,squash:Math.max(Qy,Math.sin(e*Math.PI/180)),tilt:(90-e)/80}}var mc=n=>Math.max(-30,Math.min(30,n));function Sd(n){let e=new Map,t=null,i=null,r=!1,s=()=>{let[o,a]=[...e.values()];return!o||!a?{ang:0,d:0,mx:0,my:0}:{ang:Math.atan2(a.y-o.y,a.x-o.x),d:Math.hypot(a.x-o.x,a.y-o.y),mx:(o.x+a.x)/2,my:(o.y+a.y)/2}};return{down(o){let a=n();for(let[l,u]of e)(l===o.id||a-u.seen>1e3)&&e.delete(l);return e.size===0&&(r=!1),e.set(o.id,{x:o.x,y:o.y,x0:o.x,y0:o.y,t0:a,seen:a,button:o.type==="mouse"?o.button:0}),t=e.size===2?s():null,e.size>1&&(r=!0),[]},move(o){let a=e.get(o.id);if(!a)return[];let l=o.x-a.x,u=o.y-a.y;a.x=o.x,a.y=o.y,a.seen=n();let c=[];if(e.size===1){if(r)return c;a.button===1||a.button===2?(l!==0||u!==0)&&c.push({kind:"pan",dx:l,dy:u}):(l!==0&&c.push({kind:"turn",deg:mc(-l*.35)}),u!==0&&c.push({kind:"tilt",deg:mc(u*.3)}))}else if(e.size===2&&t){let h=s(),f=h.ang-t.ang;f>Math.PI&&(f-=2*Math.PI),f<-Math.PI&&(f+=2*Math.PI),f!==0&&c.push({kind:"turn",deg:mc(f*180/Math.PI)});let d=h.mx-t.mx,g=h.my-t.my;(d!==0||g!==0)&&c.push({kind:"pan",dx:d,dy:g});let x=Math.max(10,t.d)/Math.max(10,h.d);x!==1&&c.push({kind:"zoom",factor:x,x:h.mx,y:h.my}),t=h}return c},up(o){let a=e.get(o.id);if(!a)return[];e.delete(o.id),t=e.size===2?s():null;let l=r;if(e.size===0&&(r=!1),o.type==="mouse"||e.size!==0||l)return[];let u=n();return u-a.t0>=280||Math.hypot(o.x-a.x0,o.y-a.y0)>=12?[]:i&&u-i.t<320&&Math.hypot(o.x-i.x,o.y-i.y)<40?(i=null,[{kind:"reset"}]):(i={t:u,x:o.x,y:o.y},[])},cancel(o){return e.delete(o),t=e.size===2?s():null,e.size===0&&(r=!1),[]},wheel(o,a,l){return o===0?[]:[{kind:"zoom",factor:Math.exp(o*.0015),x:a,y:l}]}}}function wd(){let n=null,e=new Set,t=i=>i.type==="mouse"?{...i,button:i.button===2?0:1}:i;return{down(i){if(i.type==="mouse"&&i.button!==0)return e.add(i.id),[{kind:"cam",op:"down",p:t(i)}];if(i.type==="mouse")return n?[]:(n={...i},[{kind:"paint",x:i.x,y:i.y,first:!0}]);if(e.size>0)return e.add(i.id),[{kind:"cam",op:"down",p:i}];if(n&&n.type!=="mouse"&&n.id!==i.id){let r=n;return n=null,e.add(r.id),e.add(i.id),[{kind:"drop"},{kind:"cam",op:"down",p:r},{kind:"cam",op:"down",p:i}]}return n?[]:(n={...i},[{kind:"paint",x:i.x,y:i.y,first:!0}])},move(i){return n&&n.id===i.id?(n.x=i.x,n.y=i.y,[{kind:"paint",x:i.x,y:i.y,first:!1}]):e.has(i.id)?[{kind:"cam",op:"move",p:t(i)}]:i.type==="mouse"?[{kind:"hover",x:i.x,y:i.y}]:[]},up(i){return n&&n.id===i.id?(n=null,[{kind:"end"}]):e.delete(i.id)?[{kind:"cam",op:"up",p:t(i)}]:[]},cancel(i){return n&&n.id===i?(n=null,[{kind:"end"}]):e.delete(i)?[{kind:"cam",op:"cancel",p:{id:i,x:0,y:0,type:"touch",button:0}}]:[]}}}var gc="crete-view-hint";function xc(n){try{let e=n?JSON.parse(n):{};return{shows:Number.isInteger(e.shows)&&e.shows>0?e.shows:0,moved:e.moved===!0}}catch{return{shows:0,moved:!1}}}function Ed(n){return n?"Drag to turn and tilt · Two fingers pan, twist and pinch · Tap the compass to reset":"Drag to turn and tilt · Right-drag to pan · Tap the compass to reset"}function Td(n,e){let t={...n},i=t.moved||t.shows>=2?"done":"waiting",r=e,s=0,o=()=>{let a=i;return i="done",a==="shown"?"hide":null};return{record:()=>({...t}),tick(a,l){return i==="waiting"?l?(r=a,null):a-r<1500?null:(i="shown",s=a,t.shows++,"show"):i==="shown"&&(l||a-s>=8e3)?o():null},moved(){return t.moved=!0,o()},dismiss(){return i==="shown"?o():null},show(a){return s=a,i==="shown"?null:(i="shown","show")},over:()=>i==="done"}}var Ad=15,Cd=10,Rd=1.2,ev=16,tv='<span class="tilt-ring" aria-hidden="true"></span><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dial" cx="12" cy="12" r="11"/><path class="n" d="M12 3l3.5 9h-7z"/><path class="s" d="M12 21l-3.5-9h7z"/></svg>',nv=600,Pd=250;function iv(n,e,t,i){let r=document.createElement("button");return r.type="button",r.id=n,r.className=i,r.setAttribute("aria-label",e),r.title=e,r.innerHTML=t,r}function Id(n,e,t,i,r){let s=!1,o=()=>{let N=v.moved();s||(s=!0,I()),O(N)},a={turn:(N,H)=>{o(),i.turn(N,H)},pan:(N,H)=>{o(),i.pan(N,H)},zoom:(N,H,G,K)=>{o(),i.zoom(N,H,G,K)},tilt:(N,H)=>{o(),i.tilt(N,H)},reset:()=>{o(),i.reset()}},l="",u=Sd(()=>performance.now()),c=N=>({id:N.pointerId,x:N.clientX,y:N.clientY,type:N.pointerType==="touch"||N.pointerType==="pen"?N.pointerType:"mouse",button:N.button}),h=N=>{if(!(!N.length||t.blocked())){t.gesture();for(let H of N)if(H.kind==="turn")a.turn(H.deg,!1);else if(H.kind==="tilt")a.tilt(H.deg,!1);else if(H.kind==="pan")a.pan(H.dx,H.dy);else if(H.kind==="zoom"){let G=n.getBoundingClientRect();a.zoom(H.factor,(H.x-G.left)/(G.width||1)-.5,.5-(H.y-G.top)/(G.height||1),!1)}else a.reset()}},f=r?wd():null,d=N=>{for(let H of N)H.kind==="paint"?r.stroke(H.x,H.y,H.first):H.kind==="end"?r.end():H.kind==="drop"?r.drop():H.kind==="hover"?r.hover({x:H.x,y:H.y}):H.op==="cancel"?h(u.cancel(H.p.id)):h(u[H.op](H.p))},g=N=>{if(l=N.pointerType,!t.blocked()){try{n.setPointerCapture(N.pointerId)}catch{}f?(N.preventDefault(),d(f.down(c(N)))):h(u.down(c(N)))}},x=N=>f?d(f.move(c(N))):h(u.move(c(N))),p=N=>f?d(f.up(c(N))):h(u.up(c(N))),m=N=>f?d(f.cancel(N.pointerId)):h(u.cancel(N.pointerId)),y=N=>{N.pointerType==="mouse"?r?.hover(null):n.hasPointerCapture?.(N.pointerId)||m(N)},_=()=>{r||t.blocked()||(t.gesture(),a.reset())},b=N=>N.preventDefault(),E=N=>{if(t.blocked())return;N.preventDefault();let H=N.deltaMode===1?ev:N.deltaMode===2?n.clientHeight:1;h(u.wheel(N.deltaY*H,N.clientX,N.clientY))};n.style.touchAction="none",n.addEventListener("pointerdown",g),n.addEventListener("pointermove",x),n.addEventListener("pointerup",p),n.addEventListener("pointercancel",m),n.addEventListener("lostpointercapture",m),n.addEventListener("pointerleave",y),n.addEventListener("dblclick",_),n.addEventListener("contextmenu",b),n.addEventListener("wheel",E,{passive:!1});let S=rv("cam-compass",t,{...a,zoomStep:N=>a.zoom(N>0?1/Rd:Rd,0,0,!0)},N=>{l=N}),T=S.button;e.append(T);let R=xc(null);try{R=xc(localStorage.getItem(gc))}catch{}let v=Td(R,performance.now()),M=document.createElement("p");M.className="view-hint",M.id="view-hint",M.hidden=!0,M.setAttribute("role","status"),e.append(M);let L=0,z=0,V=()=>O(v.tick(performance.now(),X()));function I(){try{localStorage.setItem(gc,JSON.stringify(v.record()))}catch{}}function O(N){if(N){if(I(),N==="show"){let H=l?l!=="mouse":matchMedia("(pointer: coarse)").matches;M.textContent=Ed(H),clearTimeout(z),M.hidden=!1,requestAnimationFrame(()=>M.classList.add("on")),T.classList.remove("wiggle"),T.offsetWidth,T.classList.add("wiggle");return}clearInterval(L),M.classList.remove("on"),T.classList.remove("wiggle"),z=window.setTimeout(()=>{M.hidden=!0},300)}}let X=()=>t.covered()||document.hidden||e.closest("[hidden]")!==null;return!r&&!v.over()&&!matchMedia("(pointer: coarse)").matches&&(L=window.setInterval(V,Pd)),M.addEventListener("click",()=>O(v.dismiss())),{setView:S.setView,showTips(){let N=v.show(performance.now());N&&(clearInterval(L),L=window.setInterval(V,Pd)),O(N)},dispose(){clearInterval(L),clearTimeout(z),M.remove(),n.removeEventListener("pointerdown",g),n.removeEventListener("pointermove",x),n.removeEventListener("pointerup",p),n.removeEventListener("pointercancel",m),n.removeEventListener("lostpointercapture",m),n.removeEventListener("pointerleave",y),n.removeEventListener("dblclick",_),n.removeEventListener("contextmenu",b),n.removeEventListener("wheel",E),T.remove()}}}function rv(n,e,t,i=()=>{}){let r=iv(n,"Compass: drag or use the arrow keys to turn and tilt the view, plus and minus to zoom, tap to reset it",tv,"compass");r.title="Compass";let s=r.querySelector("svg"),o=bd(),a=-1e9,l=c=>{if(c.length){e.gesture();for(let h of c)h.kind==="turn"?t.turn(h.deg,!0):h.kind==="tilt"?t.tilt(h.deg,!0):h.kind==="reset"&&t.reset()}};r.style.touchAction="none";for(let c of["pointerdown","pointermove","pointerup","pointercancel"])r.addEventListener(c,h=>h.stopPropagation());r.addEventListener("pointerdown",c=>{if(i(c.pointerType),!(e.blocked()||c.pointerType==="mouse"&&c.button!==0)){c.preventDefault();try{r.setPointerCapture(c.pointerId)}catch{}l(o.down(c.pointerId,c.clientX,c.clientY))}}),r.addEventListener("pointermove",c=>{e.blocked()||l(o.move(c.pointerId,c.clientX,c.clientY))}),r.addEventListener("pointerup",c=>{let h=o.up(c.pointerId,c.clientX,c.clientY);h.length&&(a=performance.now()),e.blocked()||l(h)}),r.addEventListener("pointercancel",c=>l(o.cancel(c.pointerId)));let u={ArrowLeft:()=>t.turn(-Ad,!0),ArrowRight:()=>t.turn(Ad,!0),ArrowUp:()=>t.tilt(-Cd,!0),ArrowDown:()=>t.tilt(Cd,!0),"+":()=>t.zoomStep(1),"=":()=>t.zoomStep(1),"-":()=>t.zoomStep(-1),_:()=>t.zoomStep(-1)};return r.addEventListener("keydown",c=>{if(c.ctrlKey||c.metaKey||c.altKey)return;let h=u[c.key];h&&(c.preventDefault(),c.stopPropagation(),!e.blocked()&&(e.gesture(),h()))}),r.addEventListener("click",()=>{performance.now()-a<nv||e.blocked()||(e.gesture(),t.reset())}),{button:r,setView(c,h){let f=Md({yaw:c,pitch:h});s&&(s.style.transform=`scale(1, ${f.squash.toFixed(3)}) rotate(${f.needle.toFixed(1)}deg)`),r.style.setProperty("--tilt",f.tilt.toFixed(3)),r.dataset.heading=String(Math.round(c)),r.dataset.pitch=String(Math.round(h))}}}var Es=new P;function Cn(n,e,t,i,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;Es.copy(e),Es[i]=0,Es.normalize();let u=.5*o/(o+a),c=1-Es.angleTo(n)/l;return Math.sign(Es[t])===1?c*u:a/(o+a)+u+u*(1-c)}var Yn=class extends sn{constructor(e=1,t=1,i=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,t/2,i/2,s),super(1,1,1,r,r,r),r===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new P,l=new P,u=new P(e,t,i).divideScalar(2).subScalar(s),c=this.attributes.position.array,h=this.attributes.normal.array,f=this.attributes.uv.array,d=c.length/6,g=new P,x=.5/r;for(let p=0,m=0;p<c.length;p+=3,m+=2)switch(a.fromArray(c,p),l.copy(a),l.x-=Math.sign(l.x)*x,l.y-=Math.sign(l.y)*x,l.z-=Math.sign(l.z)*x,l.normalize(),c[p+0]=u.x*Math.sign(a.x)+l.x*s,c[p+1]=u.y*Math.sign(a.y)+l.y*s,c[p+2]=u.z*Math.sign(a.z)+l.z*s,h[p+0]=l.x,h[p+1]=l.y,h[p+2]=l.z,Math.floor(p/d)){case 0:g.set(1,0,0),f[m+0]=Cn(g,l,"z","y",s,i),f[m+1]=1-Cn(g,l,"y","z",s,t);break;case 1:g.set(-1,0,0),f[m+0]=1-Cn(g,l,"z","y",s,i),f[m+1]=1-Cn(g,l,"y","z",s,t);break;case 2:g.set(0,1,0),f[m+0]=1-Cn(g,l,"x","z",s,e),f[m+1]=Cn(g,l,"z","x",s,i);break;case 3:g.set(0,-1,0),f[m+0]=1-Cn(g,l,"x","z",s,e),f[m+1]=1-Cn(g,l,"z","x",s,i);break;case 4:g.set(0,0,1),f[m+0]=1-Cn(g,l,"x","y",s,e),f[m+1]=1-Cn(g,l,"y","x",s,t);break;case 5:g.set(0,0,-1),f[m+0]=Cn(g,l,"x","y",s,e),f[m+1]=1-Cn(g,l,"y","x",s,t);break}}};var Ts={floor:"flag",wall:"none",exit:"flag","gate-closed":"flag","gate-open":"flag",water:"water",fire:"ember",ice:"ice","force-up":"force","force-down":"force","force-left":"force","force-right":"force",dirt:"dirt",safe:"flag",button:"flag","toggle-open":"flag","toggle-closed":"flag","door-red":"flag","door-blue":"flag","door-yellow":"flag","door-green":"flag","door-red-sill":"flag","door-blue-sill":"flag","door-yellow-sill":"flag","door-green-sill":"flag",trap:"flag","button-brown":"flag","button-red":"flag",popup:"flag",gravel:"gravel",teleport:"flag",thief:"flag",bomb:"flag","clone-up":"flag","clone-down":"flag","clone-left":"flag","clone-right":"flag"};function Ld(n,e){let t=n.terrain[e],i=xn[t].sprites;if(t==="clone"){let s=Math.floor(e/n.level.cols),o=e%n.level.cols,a=n.level.machines.find(l=>l.at.r===s&&l.at.c===o);return i[tr.indexOf(a?.dir??"up")]}let r=$o(n,e);return r?`door-${r}-sill`:t==="gate"&&n.relicsLeft===0?i[1]:i[0]}function Dd(n,e,t){let i=[[-1,0],[0,-1],[0,1],[1,0]].find(([r,s])=>n(e+r,t+s));return i?[0-i[0],0-i[1]]:[1,0]}var Ud=["theseus","minotaur","minotaur-stone"];function Nd(n,e,t=0){let i=[],r=n.level.cols;n.objects.forEach((s,o)=>{if(!s)return;let a=Math.floor(o/r),l=o%r;s==="block"&&e.blocks?.some(u=>u.origin.r===a&&u.origin.c===l)||i.push({model:An[s].sprite,r:a,c:l,id:`o${o}`})});for(let s of n.level.machines){let o=s.template==="block"?An.block.sprite:zn[s.template].sprite;i.push({model:o,r:s.at.r,c:s.at.c,id:`machine${s.at.r*r+s.at.c}`,dir:s.dir})}for(let s of e.blocks??[])i.push({model:"block",r:s.at.r,c:s.at.c,id:null});for(let s of e.hazards){let o=n.hazards.find(a=>a.kind===s.kind&&a.at.r===s.at.r&&a.at.c===s.at.c);i.push({model:zn[s.kind].sprite,r:s.at.r,c:s.at.c,id:null,dir:o?.dir})}if(n.cow&&i.push({model:"cow-standing",r:n.cow.r,c:n.cow.c,id:"cow"}),e.minotaur){let s=Jo(n,e.minotaur,t);i.push({model:n.stone>0?"minotaur-stone":"minotaur",r:s.r,c:s.c,id:"minotaur"})}return i.push({model:"theseus",r:e.player.r,c:e.player.c,id:"theseus"}),i}var ea=class extends gn{constructor(e=null){super();let t=new sn;t.deleteAttribute("uv");let i=new an({side:Lt}),r=new an,s=5;e!==null&&e._useLegacyLights===!1&&(s=900);let o=new Tn(16777215,s,28,2);o.position.set(.418,16.199,.3),this.add(o);let a=new se(t,i);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let l=new se(t,r);l.position.set(-10.906,2.009,1.846),l.rotation.set(0,-.195,0),l.scale.set(2.328,7.905,4.651),this.add(l);let u=new se(t,r);u.position.set(-5.607,-.754,-.758),u.rotation.set(0,.994,0),u.scale.set(1.97,1.534,3.955),this.add(u);let c=new se(t,r);c.position.set(6.167,.857,7.803),c.rotation.set(0,.561,0),c.scale.set(3.927,6.285,3.687),this.add(c);let h=new se(t,r);h.position.set(-2.017,.018,6.124),h.rotation.set(0,.333,0),h.scale.set(2.002,4.566,2.064),this.add(h);let f=new se(t,r);f.position.set(2.291,-.756,-2.621),f.rotation.set(0,-.286,0),f.scale.set(1.546,1.552,1.496),this.add(f);let d=new se(t,r);d.position.set(-2.193,-.369,-5.547),d.rotation.set(0,.516,0),d.scale.set(3.875,3.487,2.986),this.add(d);let g=new se(t,qr(50));g.position.set(-16.116,14.37,8.208),g.scale.set(.1,2.428,2.739),this.add(g);let x=new se(t,qr(50));x.position.set(-16.109,18.021,-8.207),x.scale.set(.1,2.425,2.751),this.add(x);let p=new se(t,qr(17));p.position.set(14.904,12.198,-1.832),p.scale.set(.15,4.265,6.331),this.add(p);let m=new se(t,qr(43));m.position.set(-.462,8.89,14.52),m.scale.set(4.38,5.441,.088),this.add(m);let y=new se(t,qr(20));y.position.set(3.235,11.486,-12.541),y.scale.set(2.5,2,.1),this.add(y);let _=new se(t,qr(100));_.position.set(0,20,0),_.scale.set(1,.1,1),this.add(_)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function qr(n){let e=new st;return e.color.setScalar(n),e}function Dt(n){return()=>(n=n*1664525+1013904223>>>0,n/4294967296)}function ln(n,e,t=!0){let i=document.createElement("canvas");i.width=i.height=n,e(i.getContext("2d"),n);let r=new Sn(i);return t&&(r.colorSpace=pt),r.wrapS=r.wrapT=Ai,r.anisotropy=8,r}function Et(n,e,t,i,r,s,o,a,l=!0){for(let u=0;u<i;u++){let c=t()*e,h=t()*e,f=o+t()*(a-o);n.fillStyle=`rgba(${r},${(s*(.3+.7*t())).toFixed(3)})`;let d=l?[-e,0,e]:[0];for(let g of d)for(let x of d)l&&(Math.abs(c+g-e/2)>e/2+f||Math.abs(h+x-e/2)>e/2+f)||(n.beginPath(),n.arc(c+g,h+x,f,0,7),n.fill())}}function As(n,e,t){let i=n.createRadialGradient(e/2,e/2,e*.3,e/2,e/2,e*.72);i.addColorStop(0,"rgba(0,0,0,0)"),i.addColorStop(1,`rgba(20,14,10,${t})`),n.fillStyle=i,n.fillRect(0,0,e,e)}function _c(n,e,t,i,r,s,o){n.strokeStyle=r,n.lineWidth=s;for(let a=0;a<i;a++){n.beginPath();let l=t()*e,u=t()*e;n.moveTo(l,u);for(let c=0;c<6;c++)l+=(t()-.5)*o,u+=(t()-.5)*o,n.lineTo(l,u);n.stroke()}}var sv=n=>ln(256,(e,t)=>{let i=Dt(n);e.fillStyle="#dcc699",e.fillRect(0,0,t,t),Et(e,t,i,260,"150,120,80",.06,6,26,!1),Et(e,t,i,220,"242,226,192",.1,5,20,!1),Et(e,t,i,1800,"120,96,66",.1,.6,2,!1),Et(e,t,i,900,"250,238,212",.12,.6,1.6,!1),_c(e,t,i,2,"rgba(120,94,62,.4)",1.3,60),As(e,t,.12)}),ov=()=>ln(256,(n,e)=>{let t=Dt(7);n.fillStyle="#15171a",n.fillRect(0,0,e,e);let i=e/4,r=e/2;for(let s=0;s<4;s++){let o=s%2?r/2:0;for(let a=-1;a<3;a++){let l=a*r+o,u=s*i,c=.75+t()*.35;n.fillStyle=`rgb(${90*c|0},${94*c|0},${100*c|0})`;for(let h of[0,e])n.fillRect(l+3-h,u+3,r-6,i-6)}}Et(n,e,t,1400,"16,18,22",.25,.7,2.2),Et(n,e,t,500,"150,156,166",.14,.7,2),Et(n,e,t,60,"20,22,26",.25,4,12)}),av=()=>ln(256,(n,e)=>{let t=Dt(11);n.fillStyle="#7a7e86",n.fillRect(0,0,e,e),Et(n,e,t,200,"26,28,32",.2,6,24),Et(n,e,t,1500,"16,18,20",.25,.6,2),Et(n,e,t,600,"140,146,156",.12,.6,1.8)});function lv(){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d"),i=t.createImageData(128,128),r=[[1,2,.3],[3,-1,1.7],[-2,3,4.1],[4,1,2.2],[-3,-4,5.3],[5,-3,.9]],s=(l,u)=>r.reduce((c,[h,f,d],g)=>c+Math.sin(2*Math.PI*(h*l+f*u)/128+d)/(1+g*.6),0),o=new P;for(let l=0;l<128;l++)for(let u=0;u<128;u++){let c=s(u+1,l)-s(u-1,l),h=s(u,l+1)-s(u,l-1);o.set(-c*1.4,-h*1.4,1).normalize();let f=(l*128+u)*4;i.data[f]=(o.x*.5+.5)*255,i.data[f+1]=(o.y*.5+.5)*255,i.data[f+2]=(o.z*.5+.5)*255,i.data[f+3]=255}t.putImageData(i,0,0);let a=new Sn(e);return a.wrapS=a.wrapT=Ai,a}var cv=()=>ln(256,(n,e)=>{let t=Dt(21);n.fillStyle="#1c120d",n.fillRect(0,0,e,e),Et(n,e,t,200,"50,30,20",.3,4,18,!1),n.lineCap="round";for(let i=0;i<14;i++){n.strokeStyle=`rgba(${200+t()*55|0},${70+t()*80|0},20,.9)`,n.lineWidth=1+t()*2.5,n.shadowColor="#ff6a10",n.shadowBlur=8,n.beginPath();let r=t()*e,s=t()*e;n.moveTo(r,s);for(let o=0;o<5;o++)r+=(t()-.5)*70,s+=(t()-.5)*70,n.lineTo(r,s);n.stroke()}n.shadowBlur=0,As(n,e,.7)}),uv=()=>ln(256,(n,e)=>{let t=Dt(31);for(let i=0;i<5;i++){let r=.85+t()*.25;n.fillStyle=`rgb(${196*r|0},${150*r|0},${98*r|0})`,n.fillRect(i*e/5,0,e/5,e),n.fillStyle="rgba(60,36,18,.6)",n.fillRect(i*e/5,0,2,e)}for(let i=0;i<160;i++){n.strokeStyle=`rgba(90,58,30,${.08+t()*.15})`,n.lineWidth=.6+t();let r=t()*e;n.beginPath(),n.moveTo(r,0),n.bezierCurveTo(r+(t()-.5)*8,e*.3,r+(t()-.5)*8,e*.7,r+(t()-.5)*6,e),n.stroke()}}),hv=()=>ln(256,(n,e)=>{let t=Dt(51);n.fillStyle="#3a2414",n.fillRect(0,0,e,e),Et(n,e,t,500,"20,12,6",.25,.6,2.4,!1),Et(n,e,t,80,"90,60,34",.15,4,16,!1),n.strokeStyle="#d8a640",n.lineWidth=22,n.lineJoin="miter";for(let i of[78,178])n.beginPath(),n.moveTo(40,i+38),n.lineTo(128,i-34),n.lineTo(216,i+38),n.stroke();n.strokeStyle="rgba(0,0,0,.6)",n.lineWidth=10,n.strokeRect(5,5,e-10,e-10)}),dv=()=>ln(256,(n,e)=>{let t=Dt(61);n.fillStyle="#b6dcea",n.fillRect(0,0,e,e),Et(n,e,t,120,"230,246,252",.25,6,30,!1),Et(n,e,t,90,"120,170,196",.15,6,24,!1),_c(n,e,t,6,"rgba(250,254,255,.8)",1.6,90),As(n,e,.25)}),fv=()=>ln(256,(n,e)=>{let t=Dt(71);n.fillStyle="#6a4626",n.fillRect(0,0,e,e),Et(n,e,t,260,"40,24,12",.22,4,20,!1),Et(n,e,t,200,"140,98,58",.16,3,14,!1),Et(n,e,t,2200,"30,18,8",.25,.6,2,!1),Et(n,e,t,40,"170,160,150",.7,2,4.5,!1),As(n,e,.45)}),pv=()=>ln(256,(n,e)=>{let t=Dt(81);n.fillStyle="#5e5a54",n.fillRect(0,0,e,e),Et(n,e,t,1600,"30,28,26",.3,.8,3,!1),Et(n,e,t,500,"160,154,146",.25,1,4,!1),As(n,e,.45)}),mv=()=>{let n=ln(256,(e,t)=>{e.translate(t/2,t/2),e.strokeStyle="rgba(214,200,160,.55)",e.lineWidth=3,e.beginPath();for(let i=0;i<6;i++){let r=i/6*Math.PI*2+.3;e.lineTo(Math.cos(r)*112,Math.sin(r)*112)}e.closePath(),e.stroke();for(let i=0;i<28;i++){let r=i/28*Math.PI*2;e.save(),e.rotate(r),e.translate(76,0),e.rotate(i%2?.6:-.6),e.fillStyle=i%2?"#4f7a3a":"#3d6a30",e.beginPath(),e.ellipse(0,0,14,6,0,0,7),e.fill(),e.restore()}});return n.wrapS=n.wrapT=Nt,n},gv=()=>{let n=ln(256,(e,t)=>{let i=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);i.addColorStop(0,"#f2fbff"),i.addColorStop(.35,"#6fc0ef"),i.addColorStop(1,"#1a4f9a"),e.fillStyle=i,e.fillRect(0,0,t,t),e.translate(t/2,t/2),e.lineCap="round";for(let r=0;r<3;r++){e.strokeStyle="rgba(255,255,255,.85)",e.lineWidth=9,e.beginPath();for(let s=0;s<=60;s++){let o=s/60,a=r*(Math.PI*2/3)+o*4.2,l=8+o*110;e.lineTo(Math.cos(a)*l,Math.sin(a)*l)}e.stroke()}});return n.wrapS=n.wrapT=Nt,n},xv=()=>{let n=ln(256,(e,t)=>{e.fillStyle="#3a1f52",e.fillRect(0,0,t,t),Et(e,t,Dt(91),300,"20,10,30",.3,1,4,!1),e.fillStyle="#e0a838",e.translate(t/2,t/2+18),e.beginPath(),e.roundRect(-46,-30,92,92,30),e.fill();for(let[i,r,s]of[[-34,70,18],[-12,92,19],[12,96,19],[35,78,18]])e.beginPath(),e.roundRect(i-s/2,-30-r,s,r+20,s/2),e.fill();e.save(),e.translate(-50,14),e.rotate(-.8),e.beginPath(),e.roundRect(-11,-58,22,66,11),e.fill(),e.restore()});return n.wrapS=n.wrapT=Nt,n},_v=()=>ln(256,(n,e)=>{let t=Dt(41);n.fillStyle="#ad9f86",n.fillRect(0,0,e,e),Et(n,e,t,300,"60,52,44",.15,4,20,!1),Et(n,e,t,1500,"50,44,38",.2,.6,2,!1),_c(n,e,t,4,"rgba(60,50,40,.45)",2,40);let i=(r,s,o)=>{n.save(),n.translate(e/2+r,e/2+s),n.fillStyle=o,n.fillRect(-7,-80,14,160);for(let a of[-1,1])n.beginPath(),n.moveTo(0,-38),n.quadraticCurveTo(a*60,-70,a*78,-50),n.quadraticCurveTo(a*58,0,a*78,50),n.quadraticCurveTo(a*60,70,0,38),n.fill();n.restore()};i(3,3,"rgba(225,210,185,.35)"),i(0,0,"rgba(40,32,26,.4)"),n.strokeStyle="rgba(40,32,26,.6)",n.lineWidth=6,n.strokeRect(10,10,e-20,e-20)}),yv=()=>{let n=ln(64,(e,t)=>{let i=e.createLinearGradient(0,0,0,t);i.addColorStop(0,"rgba(0,0,0,0.85)"),i.addColorStop(.18,"rgba(0,0,0,0.6)"),i.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=i,e.fillRect(0,0,t,t)});return n.wrapS=n.wrapT=Nt,n},vv=()=>{let n=ln(64,(e,t)=>{let i=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);i.addColorStop(0,"rgba(255,220,160,1)"),i.addColorStop(.35,"rgba(255,150,60,.45)"),i.addColorStop(1,"rgba(255,120,40,0)"),e.fillStyle=i,e.fillRect(0,0,t,t)});return n.wrapS=n.wrapT=Nt,n},Ne=(n,e={})=>new an({color:n,roughness:.8,metalness:0,...e}),di=(n,e=.9)=>new st({color:n,transparent:!0,opacity:e,blending:mn,depthWrite:!1}),bv=.022;function Mv(){let n=new st({color:656900,side:Lt});return n.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${bv.toFixed(3)};`)},n}function Od(n){let e=new zr(n),t=new ea(n),i=e.fromScene(t,.04).texture;t.dispose(),e.dispose();let r=(u,c=.35,h={})=>Ne(u,{roughness:c,metalness:.85,envMap:i,envMapIntensity:.55,...h}),s={brick:ov(),cap:av(),water:lv(),ember:cv(),wood:uv(),force:hv(),ice:dv(),dirt:fv(),gravel:pv(),wreath:mv(),swirl:gv(),hand:xv(),halo:vv(),ao:yv(),block:_v(),flags:[101,202,303].map(sv)},o={under:Ne(789e3,{roughness:1}),mortar:Ne(_n().caps?1972242:7232580,{roughness:1}),ao:new st({map:s.ao,transparent:!0,depthWrite:!1}),edge:Ne(789776,{roughness:1,side:Gt}),flags:s.flags.map(u=>Ne(16777215,{map:u,roughness:.88})),ember:Ne(16777215,{map:s.ember,emissiveMap:s.ember,emissive:16742960,emissiveIntensity:.9,roughness:.9}),ice:Ne(10274004,{map:s.ice,roughness:.08,metalness:.1,envMap:i,envMapIntensity:.35}),force:Ne(16777215,{map:s.force,roughness:.7}),dirt:Ne(16777215,{map:s.dirt,roughness:.97}),gravelBed:Ne(16777215,{map:s.gravel,roughness:.95}),pebble:Ne(9076850,{roughness:.9}),water:Ne(1722962,{roughness:.14,metalness:.1,normalMap:s.water,normalScale:new ie(.55,.55),emissive:399388,envMap:i,envMapIntensity:.25}),basin:Ne(925216,{roughness:.9}),side:Ne(11843776,{map:s.brick,roughness:.93}),top:Ne(_n().caps?15921128:10791602,{map:s.cap,roughness:.95}),wood:Ne(16777215,{map:s.wood,roughness:.75}),darkWood:Ne(9071178,{map:s.wood,roughness:.8}),iron:r(3025446,.6),bronze:r(12618308,.4,{emissive:2758664}),gold:r(15250496,.3,{emissive:5912064}),stone:Ne(9075818),paleStone:Ne(13285530,{roughness:.85}),dark:Ne(657415),keyColor:{red:Ne(14692382,{roughness:.45,emissive:5901316}),blue:Ne(3108576,{roughness:.45,emissive:794202}),yellow:Ne(15910968,{roughness:.45,emissive:5915648}),green:Ne(3127388,{roughness:.45,emissive:805406})},brownButton:Ne(6962718,{roughness:.55}),redButton:Ne(11545116,{roughness:.45,emissive:2753538}),cream:Ne(15260864,{roughness:.6}),wreath:new an({map:s.wreath,transparent:!0,roughness:.8,depthWrite:!1}),swirl:new an({map:s.swirl,emissiveMap:s.swirl,emissive:new qe(6994175),emissiveIntensity:.9,roughness:.3}),hand:Ne(16777215,{map:s.hand,roughness:.6}),clay:Ne(11564104,{roughness:.75}),block:Ne(16777215,{map:s.block,roughness:.85}),skin:Ne(12618338,{roughness:.7}),tunic:Ne(2383482,{roughness:.8}),cloak:Ne(9054750),leather:Ne(5913122,{roughness:.8}),steel:r(13225424,.3),heroSkin:Ne(15118472,{roughness:.6,emissive:3020298}),heroTunic:Ne(3117008,{roughness:.55,emissive:666180}),heroCloak:Ne(14170660,{roughness:.65,emissive:4328452}),heroLeather:Ne(9067058,{roughness:.7,emissive:1707012}),heroHair:Ne(5911576,{roughness:.8,emissive:1312770}),heroRing:new st({color:1284676,depthWrite:!1}),heroRingEdge:new st({color:398346,transparent:!0,opacity:.8,depthWrite:!1}),itemShade:new st({color:656900,transparent:!0,opacity:.9,depthWrite:!1}),itemRing:new st({color:16773304,depthWrite:!1}),heroBeam:new st({color:3593324,transparent:!0,opacity:.3,blending:mn,depthTest:!1,depthWrite:!1,side:Gt}),heroXray:new st({color:6090890,transparent:!0,opacity:.6,depthFunc:tc,depthWrite:!1,stencilWrite:!0,stencilRef:1,stencilFunc:Ah}),outline:Mv(),fur:Ne(5912096,{roughness:.9,emissive:1181700}),furDark:Ne(3941396,{roughness:.9}),snout:Ne(6965814),ivory:Ne(14866106,{roughness:.5}),kilt:Ne(11545116,{emissive:2754050}),hoof:Ne(1314832),eye:new st({color:16730650}),statue:Ne(9342088,{roughness:.9}),statueDark:Ne(6973540,{roughness:.92}),parchment:Ne(15785648,{emissive:3024920}),teal:Ne(3193004,{roughness:.4,emissive:670262}),boot:Ne(12596762,{roughness:.55,emissive:3804164}),bootTrim:Ne(14715424,{emissive:5906944}),skate:Ne(13162728,{roughness:.45,emissive:2634300}),suction:Ne(3445854,{roughness:.5,emissive:798234}),mirror:r(15132390,.08,{envMapIntensity:1,emissive:4211784}),gorgon:Ne(3450970,{roughness:.5,emissive:798744}),cake:Ne(15773768,{roughness:.55,emissive:4203528}),hide:Ne(16051938,{roughness:.65,emissive:2894374}),patch:Ne(5911072,{roughness:.8}),feather:Ne(9067058,{roughness:.8,emissive:1970184}),halo:s.halo,env:i},a=new Set([i,...s.flags,...Object.values(s).filter(u=>u instanceof Sn)]);for(let u of Object.values(o))u&&typeof u=="object"&&"isMaterial"in u?a.add(u):Array.isArray(u)&&u.forEach(c=>a.add(c));for(let u of Object.values(o.keyColor))a.add(u);return{t:s,m:o,metal:r,std:Ne,keeps:a,dispose:()=>{for(let u of a)u.dispose()}}}var te=.1,Ui=.035,ct=(n,e)=>n-(e-1)/2,ut=(n,e)=>n-(e-1)/2,Sv={"force-up":0,"force-left":Math.PI/2,"force-down":Math.PI,"force-right":-Math.PI/2},Fd=26;function kd(n){let{m:e}=n,t=new Se,i=new Yn(.97,.12,.97,2,.02);i.translate(0,te-.06,0);let r=new Ht(1,1);r.rotateX(-Math.PI/2),r.translate(0,Ui,0);let s=new Gr(.045,0),o=new se(new Ht(1,1),e.under);o.rotation.x=-Math.PI/2,o.position.y=-.02,o.receiveShadow=!0,t.add(o);let a=new Ht(1,1);a.rotateX(-Math.PI/2);let l=[],u=(h,f,d)=>{let g=new Lo(h,f,Math.max(1,d));return g.count=d,g.receiveShadow=!0,l.push(g),t.add(g),g},c=()=>{for(let h of l)t.remove(h),h.dispose();l=[]};return{group:t,set(h,f,d){c();let g=new Wt([new ie(-100,-100),new ie(100,-100),new ie(100,100),new ie(-100,100)]);g.holes.push(new Pi([new ie(-d/2,-f/2),new ie(-d/2,f/2),new ie(d/2,f/2),new ie(d/2,-f/2)])),o.geometry.dispose(),o.geometry=new Xn(g);let x=[[],[],[]],p={ember:[],ice:[],force:[],dirt:[],gravel:[],water:[],mortar:[]};h.forEach((S,T)=>{let R=Ts[S];p.mortar.push(T),R==="flag"?x[Dt(T*2654435761+7)()*3|0].push(T):R!=="none"&&p[R].push(T)});let m=new vt,y=new qe,_=(S,T,R,v)=>{T.forEach((M,L)=>{let z=Dt(M*40503+11);if(m.makeRotationY(R(M,z)).setPosition(ct(M%d,d),0,ut(Math.floor(M/d),f)),S.setMatrixAt(L,m),v){let V=.78+z()*.3;S.setColorAt(L,y.setRGB(V*(1+(z()-.5)*.06),V,V*(1-z()*.06)))}})},b=(S,T)=>(T()*4|0)*(Math.PI/2);_(u(a,e.mortar,p.mortar.length),p.mortar,()=>0,!1),x.forEach((S,T)=>_(u(i,e.flags[T],S.length),S,b,!0)),_(u(i,e.ember,p.ember.length),p.ember,b,!1),_(u(i,e.ice,p.ice.length),p.ice,b,!1),_(u(i,e.dirt,p.dirt.length),p.dirt,b,!0),_(u(i,e.gravelBed,p.gravel.length),p.gravel,b,!0),_(u(i,e.force,p.force.length),p.force,S=>Sv[h[S]]??0,!1),_(u(r,e.water,p.water.length),p.water,()=>0,!1);let E=p.gravel;if(E.length){let S=u(s,e.pebble,E.length*Fd);S.castShadow=!0;let T=0;for(let R of E){let v=Dt(R*7919+3);for(let M=0;M<Fd;M++){let L=.7+v()*.5;m.makeScale(L,.6*L,L).setPosition(ct(R%d,d)+(v()-.5)*.8,te+.015,ut(Math.floor(R/d),f)+(v()-.5)*.8),S.setMatrixAt(T,m),S.setColorAt(T++,y.setScalar(.75+v()*.5))}}}},loop(h){n.t.water.offset.set(Math.sin(h*.5)*.04,h*.025%1),e.water.emissiveIntensity=1+.15*Math.sin(h*1.3)},dispose(){c(),i.dispose(),r.dispose(),s.dispose(),a.dispose(),o.geometry.dispose()}}}var wv=15774761,Ev=.08,zd=.5;function Bd(){let n=new gn,e=new Wt;e.moveTo(-.5,-.5).lineTo(.5,-.5).lineTo(.5,.5).lineTo(-.5,.5).lineTo(-.5,-.5);let t=.5-Ev,i=new Pi;i.moveTo(-t,-t).lineTo(-t,t).lineTo(t,t).lineTo(t,-t).lineTo(-t,-t),e.holes.push(i);let r=new Xn(e);r.rotateX(-Math.PI/2);let s=new st({color:wv,depthTest:!1,depthWrite:!1,toneMapped:!1,fog:!1}),o=new se(r,s);o.visible=!1,o.renderOrder=2;let a=new Se;n.add(o,a);let l=new Map;function u(c){let h=l.get(c);if(h)return h;let f=document.createElement("canvas");f.width=f.height=64;let d=f.getContext("2d");d.fillStyle="rgba(1, 4, 9, 0.78)",d.fillRect(4,4,56,56),d.fillStyle="#f0b429",d.font="bold 44px system-ui, sans-serif",d.textAlign="center",d.textBaseline="middle",d.fillText(c,32,35);let g=new Sn(f);g.colorSpace=pt;let x=new Vn({map:g,depthTest:!1,depthWrite:!1,toneMapped:!1,fog:!1});return l.set(c,x),x}return{scene:n,hover(c,h,f){o.visible=c!==null,c&&o.position.set(ct(c.c,h),te+.01,ut(c.r,f))},marks(c,h,f){a.clear();for(let d of c){let g=new Wn(u(d.mark));g.scale.set(zd,zd,1),g.position.set(ct(d.c,h),te+.05,ut(d.r,f)),g.renderOrder=3,a.add(g)}},empty:()=>!o.visible&&a.children.length===0,dispose(){a.clear(),r.dispose(),s.dispose();for(let c of l.values())c.map?.dispose(),c.dispose();l.clear()}}}function Gd(n,e){let t=[];for(let i=0;i<n.terrain.length;i++)(n.terrain[i]!==e.terrain[i]||n.objects[i]!==e.objects[i])&&t.push(i);return t}function yc(n,e){let t=[];return n.forEach((i,r)=>{i==="water"&&e[r]==="dirt"&&t.push(r)}),t}function Hd(n,e){if(n<=0)return e;if(n<.25){let t=n/.25;return e+(-.2-e)*t*t}if(n<.25+.35){let t=(n-.25)/.35;return-.2+(.065- -.2)*(1-(1-t)**3)}return .065}function Vd(n,e){return e?0:.012*Math.sin(2*Math.PI*n/3)}var Tv=n=>Math.max(0,Math.min(1,n)),Av=.06666666666666667;function Wd(n){return 1-.67*Tv(n)}function Xd(n,e,t){let i=e-n;return Math.abs(i)<.005?e:n+i*(1-Math.exp(-t/Av))}function qd(n,e,t){let i=e?[e]:[];return n==="ghosted"?[...i,...t]:i}var Yd={minotaur:16730682,theseus:3593324,hazard:12614911,item:3859711},Kd=657414,Cv=10;function Zd(n){return Math.max(1,Cv/(Cs*Math.max(n,1e-6)))}var Cs=.18,ta=.3,Rv=.06,Pv=.02,Iv=2.4,Lv=new Set(Object.values(zn).map(n=>n.sprite)),Dv=new Set(Object.values(An).map(n=>n.sprite).filter(n=>n!==An.block.sprite));function $d(n,e=_n().items){return n.id?.startsWith("machine")?null:n.model==="theseus"?"theseus":n.model==="minotaur"||n.model==="minotaur-stone"?"minotaur":e==="plate"?null:Lv.has(n.model)?"hazard":Dv.has(n.model)?"item":null}function Jd(n,e,t=0){let i=e*Math.PI/180;return n*Math.cos(i)+t*Math.sin(i)+Rv}function jd(n,e){return e?0:-Pv*(1-Math.cos(2*Math.PI*n/Iv))}var Qd=.08;function ef(n,e,t,i,r,s,o){let a=(l,u,c)=>u>c?0:Math.max(u,Math.min(c,l))-l;return[a(n,-r+o+t/2,r-o-t/2),a(e,-s+o,s-o-i)]}var na=66,eS=Array.from({length:na*na},(n,e)=>({r:Math.floor(e/na)-1,c:e%na-1}));function Is(n,e){let t=n[e],i=n[e+1];return!t||!i||i.jump?null:i.r<t.r?"up":i.r>t.r?"down":i.c<t.c?"left":"right"}function oa(n){return n.length<2?null:Is(n,0)??n[0].way??null}var Ls=1.4,Ov=1.2;function aa(n){return 1+.05*(1-Math.cos(2*Math.PI*n/Ov))}function af(n,e,t){let i=n.getContext("2d"),r=e.rise/e.cell,s=16,o=0;return{size(a,l,u){let c=window.devicePixelRatio||1;s=Math.max(1,Math.round(u*c)),o=Math.round(r*s),n.width=a*s,n.height=l*s+o,n.style.width=`${n.width/c}px`,n.style.height=`${n.height/c}px`,n.dataset.cell=String(u),i.setTransform(1,0,0,1,0,0),i.imageSmoothingEnabled=!0,i.imageSmoothingQuality="high"},paint(a,l,u){i.clearRect(0,0,n.width,n.height);let c=e.cell,h=e.cell+e.rise;for(let f of a){let d=e.sprites[f.sprite];if(!d)continue;let g=Math.round(f.x*s),x=Math.round(f.y*s);if(f.sink){i.save(),i.beginPath(),i.rect(g,x,s,s+o),i.clip(),i.drawImage(t,d.x+f.frame*c,d.y,c,h,g,x+Math.round(f.sink*(s+o)),s,s+o),i.restore();continue}i.drawImage(t,d.x+f.frame*c,d.y,c,h,g,x,s,s+o)}l&&l.length>1&&Xv(i,l,s,o,u===void 0?1:aa(u))}}}var Fv="#8f291f",kv="#bb4131",zv="#ffd23f",of="#1c0402",Bv=12,Gv=.42,Hv=.14,Vv=.2,Wv={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function Xv(n,e,t,i,r){let s=c=>[(c.c+.5)*t,(c.r+.5)*t+i],o=Math.max(1.5,t/12),a=Math.max(.75,t/30);if(n.lineJoin="round",n.lineCap="round",n.beginPath(),e.forEach((c,h)=>{let[f,d]=s(c);h===0||c.jump?n.moveTo(f,d):n.lineTo(f,d)}),n.strokeStyle=of,n.lineWidth=o+2*a,n.stroke(),n.strokeStyle=Fv,n.lineWidth=o,n.stroke(),t<Bv)return;let l=(c,h,f,d)=>{let g=t*Gv*f,x=t*Hv*f,[p,m]=s(e[c]);n.save(),n.translate(p,m),n.rotate(Wv[h]),n.translate(t*Vv,0),n.beginPath(),n.moveTo(g/2,0),n.lineTo(-g/2,-x),n.lineTo(-g/4,0),n.lineTo(-g/2,x),n.closePath(),n.lineWidth=Math.max(1,t/21*f),n.strokeStyle=of,n.stroke(),n.fillStyle=d,n.fill(),n.restore()};n.lineJoin="miter";for(let c=1;c<e.length;c++){let h=Is(e,c);h&&l(c,h,1,kv)}let u=oa(e);u&&l(0,u,Ls*r,zv)}function qv(n,e,t){let i=n.sprites[e];return!i||i.frames<=1||i.fps<=0?0:Math.floor(t*i.fps/1e3)%i.frames}function lf(n,e,t="gate-slide"){let i=n.sprites[t]?.frames??1;return Math.max(-1,Math.min(i,Math.round(e*(i+1))-1))}function Yv(n,e){let t=lf(n,e,"exit-wake");return t<0?{sprite:"exit-off",frame:0}:t>=(n.sprites["exit-wake"]?.frames??1)?{sprite:"exit",frame:0}:{sprite:"exit-wake",frame:t}}function cf(n,e,t,i,r=bs){let s=[],o=(d,g,x)=>s.push({sprite:d,frame:qv(t,d,i),x:g,y:x}),a=(d,g,x)=>{let p=fc(n,g,d)==="v"?"-v":"",m=lf(t,x),y=t.sprites["gate-slide"]?.frames??1;m<0?o("gate-closed"+p,d,g):m>=y?o("gate-open"+p,d,g):s.push({sprite:"gate-slide"+p,frame:m,x:d,y:g})},l=(d,g,x,p)=>{o(`door-${d}-sill${fc(n,x,g)==="v"?"-v":""}`,g,x),p<1&&s.push({sprite:`door-${d}`,frame:0,x:g,y:x,sink:p})},{rows:u,cols:c}=n.level,h=(d,g)=>!!d&&Math.ceil(d.r-1e-9)===g,f=e.minotaur&&Jo(n,e.minotaur,r.hoof);for(let d=0;d<u;d++){for(let g=0;g<c;g++){let x=n.terrain[d*c+g],p=xn[x].sprites,m=x==="clone"?n.level.machines.find(b=>b.at.r===d&&b.at.c===g):void 0,y=d*c+g,_=xn[x].door??$o(n,y);m?o(p[tr.indexOf(m.dir)],g,d):x==="gate"?a(g,d,r.bars.get(y)??(n.relicsLeft===0?1:0)):x==="exit"?s.push({...Yv(t,Ms(n,r)),x:g,y:d}):_&&(x==="floor"||r.doors.has(y))?l(_,g,d,r.doors.get(y)??1):o(p[0],g,d)}for(let g=0;g<c;g++){let x=n.objects[d*c+g];x==="block"&&e.blocks?.some(p=>p.origin.r===d&&p.origin.c===g)||x&&o(An[x].sprite,g,d)}for(let g of n.level.machines)g.at.r===d&&o(g.template==="block"?An.block.sprite:zn[g.template].sprite,g.at.c,d);for(let g of e.blocks??[])h(g.at,d)&&o(An.block.sprite,g.at.c,g.at.r);for(let g of e.hazards)h(g.at,d)&&o(zn[g.kind].sprite,g.at.c,g.at.r);n.cow&&n.cow.r===d&&o("cow-standing",n.cow.c,d),f&&h(f,d)&&o(n.stone>0?"minotaur-stone":"minotaur",f.c,f.r),h(e.player,d)&&o("theseus",e.player.c,e.player.r)}return s}function uf(n){return!(n instanceof HTMLImageElement)||n.complete&&n.naturalWidth>0}function hf(n,e,t,i){let r=document.createElement("div");r.className="minimap",r.hidden=!0;let s=document.createElement("canvas");s.id="minimap",s.setAttribute("aria-hidden","true");let o=document.createElement("canvas");o.id="minimap-view",o.setAttribute("role","img"),o.setAttribute("aria-label","Mini map: the whole level from above; the outline is what the camera sees. Tap to look there."),r.append(s,o),n.append(r);let a=af(s,e,t),l=o.getContext("2d"),u=null,c=null,h=0,f=0,d=0,g=0,x=0,p=1,m=0;function y(){if(!u)return;let L=u.s.level.cols,z=u.s.level.rows,V=fd(h||1280,f||800,L,z);if(L===d&&z===g&&V===x)return;d=L,g=z,x=V,a.size(d,g,x);let I=window.devicePixelRatio||1;o.width=s.width,o.height=s.height,o.style.width=s.style.width,o.style.height=s.style.height,p=s.width/I/d,m=s.height/I-g*p}function _(){!u||!uf(t)||a.paint(cf(u.s,u.f,e,0),u.thread??void 0)}function b(){if(!c||!d)return;let L=window.devicePixelRatio||1;l.setTransform(1,0,0,1,0,0),l.clearRect(0,0,o.width,o.height),l.setTransform(L,0,0,L,0,0);let z=dd(c.c,c.aspect),V=X=>pd(X,d,g,p,m);l.save(),l.beginPath(),l.rect(0,m,d*p,g*p),l.clip(),l.beginPath(),z.corners.map(V).forEach(([X,N],H)=>H?l.lineTo(X,N):l.moveTo(X,N)),l.closePath(),l.fillStyle="rgba(255,230,180,0.10)",l.fill(),l.lineWidth=1.5,l.strokeStyle="#ffd890",l.stroke();let[I,O]=z.tick.map(V);l.beginPath(),l.moveTo(I[0],I[1]),l.lineTo(O[0],O[1]),l.stroke(),l.restore()}let E=()=>_();uf(t)||t.addEventListener("load",E,{once:!0});let S=!1,T=L=>{if(i.blocked()||!d)return;let z=o.getBoundingClientRect();i.look(md(L.clientX-z.left,L.clientY-z.top,d,g,p,m))},R=L=>{if(!i.blocked()){S=!0;try{o.setPointerCapture(L.pointerId)}catch{}T(L)}},v=L=>{S&&T(L)},M=()=>{S=!1};return o.addEventListener("pointerdown",R),o.addEventListener("pointermove",v),o.addEventListener("pointerup",M),o.addEventListener("pointercancel",M),{show(L){r.hidden=!L},paint(L,z,V){u={s:L,f:z,thread:V},y(),_(),b()},view(L,z){c={c:{...L},aspect:z},b()},fit(L,z){h=L,f=z;let V=x;y(),x!==V&&(_(),b())},dispose(){t.removeEventListener("load",E),r.remove()}}}function df(){return{q:3,gaps:[],skip:10,fails:[0,0,0,0]}}function Ds(n){n.gaps=[],n.skip=10}function la(n,e){let t=0;for(let i=n.length-1;i>=0;i--)if(t+=n[i],t>=e)return(n.length-i)*1e3/t;return null}function ff(n,e){if(e>250)return n.q;if(n.skip>0)return n.skip--,n.q;n.gaps.push(e);let t=0,i=0;for(let s=n.gaps.length-1;s>=0&&t<3e3;s--,i++)t+=n.gaps[s];i<n.gaps.length&&(n.gaps=n.gaps.slice(-i));let r=la(n.gaps,2e3);if(r!==null&&r<40&&n.q>0)n.fails[n.q]++,n.q=n.q-1,Ds(n);else if(n.q<3&&(n.fails[n.q+1]??0)<2){let s=la(n.gaps,3e3);s!==null&&s>55&&(n.q=n.q+1,Ds(n))}return n.q}function pf(n,e){return n?e:null}function ca(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),r=new Set(Object.keys(n[0].morphAttributes)),s={},o={},a=n[0].morphTargetsRelative,l=new Rt,u=0;for(let c=0;c<n.length;++c){let h=n[c],f=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let d in h.attributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;s[d]===void 0&&(s[d]=[]),s[d].push(h.attributes[d]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let d in h.morphAttributes){if(!r.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+".  .morphAttributes must be consistent throughout all geometries."),null;o[d]===void 0&&(o[d]=[]),o[d].push(h.morphAttributes[d])}if(e){let d;if(t)d=h.index.count;else if(h.attributes.position!==void 0)d=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". The geometry must have either an index or a position attribute"),null;l.addGroup(u,d,c),u+=d}}if(t){let c=0,h=[];for(let f=0;f<n.length;++f){let d=n[f].index;for(let g=0;g<d.count;++g)h.push(d.getX(g)+c);c+=n[f].attributes.position.count}l.setIndex(h)}for(let c in s){let h=mf(s[c]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+c+" attribute."),null;l.setAttribute(c,h)}for(let c in o){let h=o[c][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[c]=[];for(let f=0;f<h;++f){let d=[];for(let x=0;x<o[c].length;++x)d.push(o[c][x][f]);let g=mf(d);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+c+" morphAttribute."),null;l.morphAttributes[c].push(g)}}return l}function mf(n){let e,t,i,r=-1,s=0;for(let u=0;u<n.length;++u){let c=n[u];if(c.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=c.array.constructor),e!==c.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=c.itemSize),t!==c.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=c.normalized),i!==c.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=c.gpuType),r!==c.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=c.array.length}let o=new e(s),a=0;for(let u=0;u<n.length;++u)o.set(n[u].array,a),a+=n[u].array.length;let l=new Kt(o,t,i);return r!==void 0&&(l.gpuType=r),l}var nr=.38,Kv=.16,vc=.26,Zv=.05,$v={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};function Jv(n){let[e,,t]=Rn[n].n,i=1.002,r=.5,s=.5-Zv,o=e!==0?[[e*s,i,-.5*e],[e*s,i,.5*e],[e*r,i,.5*e],[e*r,i,-.5*e]]:[[.5*t,i,t*s],[-.5*t,i,t*s],[-.5*t,i,t*r],[.5*t,i,t*r]];return(e<0||t<0)&&o.reverse(),{v:o,n:[0,1,0],uvs:[[0,0],[1,0],[1,1],[0,1]],mat:2}}var Rn={n:{d:[-1,0],v:[[.5,0,-.5],[-.5,0,-.5],[-.5,1,-.5],[.5,1,-.5]],n:[0,0,-1],u:n=>-n[0]},s:{d:[1,0],v:[[-.5,0,.5],[.5,0,.5],[.5,1,.5],[-.5,1,.5]],n:[0,0,1],u:n=>n[0]},w:{d:[0,-1],v:[[-.5,0,-.5],[-.5,0,.5],[-.5,1,.5],[-.5,1,-.5]],n:[-1,0,0],u:n=>n[2]},e:{d:[0,1],v:[[.5,0,.5],[.5,0,-.5],[.5,1,-.5],[.5,1,.5]],n:[1,0,0],u:n=>-n[2]}},jv=Object.keys(Rn);function gf(n){let e=[],t=[],i=[],r=[],s=new Rt,o=0;for(let{v:a,n:l,uvs:u,mat:c}of n){let h=e.length/3;a.forEach((f,d)=>{e.push(...f),t.push(...l),i.push(...u[d])}),r.push(h,h+1,h+2,h,h+2,h+3),s.addGroup(o,6,c),o+=6}return s.setAttribute("position",new $e(e,3)),s.setAttribute("normal",new $e(t,3)),s.setAttribute("uv",new $e(i,2)),s.setIndex(r),s}var xf=(n,e,t)=>({v:Rn[n].v,n:Rn[n].n,mat:0,uvs:Rn[n].v.map(i=>[Rn[n].u([i[0]+e,0,i[2]+t]),i[1]*qn])}),bc=[];for(let n of[.15,.5,.85])for(let e of[.15,.5,.85])for(let t of[.15,.5,.85])bc.push([n,e,t]);function Qv(n,e,t,i){let r=-1e9,s=1e9;for(let o=0;o<3;o++){if(Math.abs(e[o])<1e-9){if(n[o]<t[o]||n[o]>i[o])return-1;continue}let a=(t[o]-n[o])/e[o],l=(i[o]-n[o])/e[o];if(a>l&&([a,l]=[l,a]),a>r&&(r=a),l<s&&(s=l),r>s)return-1}return r}function _f(n){let e=new Se,t=[],i=new Ht(1,vc);i.rotateX(-Math.PI/2);let r=[],s=new Map,o=0,a="solid",l=new P,u=h=>{let f=h.op<.999;for(let d of h.mats)d.transparent!==f&&(d.transparent=f,d.needsUpdate=!0),d.opacity=h.op},c=()=>{for(let h of t){e.remove(h.mesh),h.mesh.geometry.dispose();for(let f of h.inner)f.mesh.geometry.dispose();for(let f of h.mats)f.dispose()}t=[],s.clear();for(let h of r)e.remove(h);r=[]};return{group:e,list:()=>t,at:(h,f)=>s.get(h*o+f),build(h,f,d){c(),o=d;let g=(p,m)=>p<0||m<0||p>=f||m>=o||h[p*o+m]==="wall",x=a==="low"?nr:qn;for(let p=0;p<f;p++)for(let m=0;m<o;m++){if(h[p*o+m]!=="wall")continue;let y=ct(m,o),_=ut(p,f),b=[{v:[[-.5,1,.5],[.5,1,.5],[.5,1,-.5],[-.5,1,-.5]],n:[0,1,0],mat:1,uvs:[[y-.5,-_-.5],[y+.5,-_-.5],[y+.5,-_+.5],[y-.5,-_+.5]]}],E=[];for(let M of jv){let[L,z]=Rn[M].d,V=p+L,I=m+z;if(g(V,I)&&V>=0&&I>=0&&V<f&&I<o?E.push(M):b.push(xf(M,y,_)),g(V,I))continue;b.push(Jv(M));let[O,,X]=Rn[M].n,N=new se(i,n.m.ao);N.position.set(y+O*(.5+vc/2),te+.003,_+X*(.5+vc/2)),N.rotation.y=$v[M],N.renderOrder=1,e.add(N),r.push(N)}let S=[n.m.side.clone(),n.m.top.clone(),n.m.edge.clone()],T=p===0||m===0||p===f-1||m===o-1;if(!T){T=!0;for(let M=-1;M<=1;M++)for(let L=-1;L<=1;L++)g(p+M,m+L)||(T=!1)}T&&S[1].color.multiplyScalar(Kv);let R=new se(gf(b),S);R.position.set(y,0,_),R.scale.y=x,R.castShadow=R.receiveShadow=!0,e.add(R);let v={r:p,c:m,x:y,z:_,mesh:R,mats:S,op:1,target:1,inner:[]};for(let M of E){let L=new se(gf([xf(M,y,_)]),[S[0]]);L.visible=!1,R.add(L),v.inner.push({k:M,mesh:L,nb:null})}t.push(v),s.set(p*o+m,v)}for(let p of t)for(let m of p.inner){let[y,_]=Rn[m.k].d;m.nb=s.get((p.r+y)*o+p.c+_)??null}},setMode(h){a=h;let f=h==="low"?nr:qn;for(let d of t)d.mesh.scale.y=f},aim(h,f){let d=new Map,g=a==="low"?nr:qn;h.getWorldDirection(l);let x=[l.x,l.y,l.z],p=30,m=Math.max(3.2,g/Math.max(.05,-x[1]/Math.hypot(x[0],x[2]))+1.2);for(let y of f){let _=t.filter(E=>Math.abs(E.x-y.x)<m&&Math.abs(E.z-y.z)<m);if(_.length===0)continue;let b=new Map;for(let[E,S,T]of bc){let R=[y.x-y.half+2*y.half*E,te+y.h*S,y.z-y.half+2*y.half*T],v=[R[0]-x[0]*p,R[1]-x[1]*p,R[2]-x[2]*p];for(let M of _){let L=Qv(v,x,[M.x-.49,0,M.z-.49],[M.x+.49,g,M.z+.49]);L>=0&&L<p-.01&&b.set(M,(b.get(M)??0)+1)}}for(let[E,S]of b)d.set(E,Math.max(d.get(E)??0,S/bc.length))}for(let y of t){let _=Math.min(1,Math.max(0,((d.get(y)??0)-.03)/.45));y.target=Wd(_*_*(3-2*_))}},ease(h,f){let d=!1;for(let g of t)g.op!==g.target&&(g.op=f?g.target:Xd(g.op,g.target,h),d=!0,u(g));if(d)for(let g of t)for(let x of g.inner)x.mesh.visible=!!x.nb&&x.nb.op<.999&&g.op>x.nb.op+.02;return d},dispose(){c(),i.dispose()}}}var Pn=(n,e,t,i)=>(n.position.set(e,t,i),n);function Mc(n,e,t,i=!1){let r=document.createElement("canvas");r.width=n,r.height=e,t(r.getContext("2d"));let s=new Sn(r);return s.colorSpace=pt,s.wrapS=s.wrapT=i?Ai:Nt,s}function ua(n,e){return Mc(128,128,t=>{let i=t.createRadialGradient(64,64,0,64,64,64);i.addColorStop(0,n),i.addColorStop(.5,e),i.addColorStop(1,"rgba(0,0,0,0)"),t.fillStyle=i,t.fillRect(0,0,128,128)})}function tb(){return Mc(128,256,n=>{let e=n.createLinearGradient(0,0,128,0);e.addColorStop(0,"#0b5fa8"),e.addColorStop(.5,"#bfe9ff"),e.addColorStop(1,"#0b5fa8"),n.fillStyle=e,n.fillRect(0,0,128,256),n.strokeStyle="rgba(255,255,255,0.35)",n.lineWidth=3;for(let t=0;t<8;t++){n.beginPath();for(let i=0;i<=128;i+=4)n.lineTo(i,t*32+10*Math.sin(i/20+t));n.stroke()}},!0)}var vf=[[[32,12,32,52],[32,26,18,14],[32,26,46,14]],[[22,12,22,52],[22,14,44,30],[44,30,22,44]],[[18,52,32,12],[32,12,46,52],[22,36,42,36]],[[32,12,32,52],[18,22,46,42],[46,22,18,42]]];function nb(n){return Mc(64,64,e=>{let t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(255,200,80,0.55)"),t.addColorStop(1,"rgba(255,170,40,0)"),e.fillStyle=t,e.fillRect(0,0,64,64),e.strokeStyle="#b87400",e.lineWidth=6,e.lineCap="round";for(let[i,r,s,o]of vf[n])e.beginPath(),e.moveTo(i,r),e.lineTo(s,o),e.stroke()})}function ib(n,e,t,i,r,s,o){n.add(Pn(e(.2,.06,.2,i),0,te+.03,s)),n.add(Pn(t(.065,.075,o,i),0,te+.06+o/2,s)),n.add(Pn(e(.2,.07,.2,r),0,te+.06+o+.035,s))}function yf(n,e){let t=new Wt;t.moveTo(-n,te),t.lineTo(-n,e),t.absarc(0,e,n,Math.PI,0,!0),t.lineTo(n,te),t.lineTo(-n,te);let i=new Xn(t,24);return i.rotateY(Math.PI/2),i}function bf(n,e,t){let i=new Se,r=[],s=new an({color:15920352,roughness:.55}),o=.36,a=.62;for(let K of[-o,o])ib(i,e,t,s,n.m.gold,K,a);let l=te+.06+a+.07,u=new se(new on(o,.06,8,24,Math.PI),s);u.scale.z=1.6,u.rotation.y=Math.PI/2,i.add(Pn(u,0,l,0)),i.add(Pn(e(.16,.14,.1,n.m.gold),0,l+o+.02,0));let c=new an({color:2502715,roughness:.9,transparent:!0,side:Gt}),h=Pn(new se(yf(.3,l),c),.015,0,0);r.push(h);let f=tb(),d=new st({map:f,transparent:!0,opacity:.92,side:Gt,depthWrite:!1}),g=yf(.3,l);g.translate(0,-te,0);let x=Pn(new se(g,d),0,te,0);r.push(x);let p=new se(new on(.42,.03,6,40),s);p.rotation.x=Math.PI/2,i.add(Pn(p,0,te+.012,0));let m=new se(new $i(.42,40),new an({color:9077624,roughness:.95}));m.rotation.x=-Math.PI/2,i.add(Pn(m,0,te+.006,0));let y=new st({map:ua("rgba(190,235,255,1)","rgba(30,120,210,0.95)"),transparent:!0,opacity:.95,depthWrite:!1}),_=new se(new $i(.42,40),y);_.rotation.x=-Math.PI/2,r.push(Pn(_,0,te+.015,0));let b=new st({map:ua("rgba(150,215,255,0.8)","rgba(40,130,220,0.3)"),transparent:!0,opacity:.7,blending:mn,depthWrite:!1,side:Gt}),E=new se(new Ht(1.1,1.3),b);E.rotation.y=Math.PI/2,r.push(Pn(E,.01,l-.05,0));let S=(K,ee,me,q,oe)=>{let fe=new Wn(K);return fe.scale.set(ee,ee,1),fe.visible=!1,r.push(Pn(fe,me,q,oe)),fe},T=K=>new Vn({map:K,transparent:!0,opacity:0,blending:mn,depthWrite:!1}),R=9,v=[],M=vf.map((K,ee)=>nb(ee));for(let K of[-1,1])for(let ee=0;ee<R;ee++){let me=(ee+.5)/R,q=me*(Math.PI/2),oe=o+.07,fe=M[(ee+(K>0?R:0))%M.length],ve=new Vn({map:fe,transparent:!0,opacity:0,depthWrite:!1});v.push({m:S(ve,.13,-.05,l+Math.sin(q)*oe,K*Math.cos(q)*oe),u:me})}let L=S(T(ua("rgba(255,248,210,1)","rgba(255,190,60,0.6)")),.5,-.1,l+o+.02,0),z=ua("rgba(230,248,255,1)","rgba(120,200,255,0.5)"),V=$h.map(K=>({d:K,m:S(T(z),.08,K.x,te,K.z)})),I=(K,ee)=>{K.material.opacity=ee,K.visible=ee>.01},O=1,X=null,N=.92,H=.95,G=()=>{let K=X,ee=K===null?O:Zo(K);x.visible=_.visible=E.visible=ee>.001,h.visible=ee<.999,c.opacity=1-ee,x.scale.y=ee,_.scale.setScalar(Math.max(.001,ee)),d.opacity=N*ee,y.opacity=H*ee,b.opacity=.7*ee;for(let q of v)I(q.m,K===null?.1575*O:Zh(K,q.u));let me=K===null?0:Kh(K);I(L,me),L.scale.setScalar(.25+.5*me);for(let{d:q,m:oe}of V){let{o:fe,up:ve}=K===null?{o:0,up:0}:Jh(K,q);I(oe,fe),oe.visible&&(oe.position.y=te+.05+ve*q.rise)}};return G(),{g:i,live:r,h:l+.45,loop:K=>{f.offset.y=K*.06%1,N=.86+.08*Math.sin(K*1.4),H=.85+.1*Math.sin(K*1.4+1),G()},light:K=>{O=Math.min(1,Math.max(0,K)),X=null,G()},wake:K=>{O=1,X=Math.max(0,K),G()}}}var $=(n,e,t,i)=>(n.position.set(e,t,i),n),rb=(n,e,t,i=14)=>new En(n,e,t,i),Ve=(n,e,t,i,r=14)=>new se(rb(n,e,t,r),i),Je=(n,e,t,i)=>new se(new sn(n,e,t),i),ir=n=>(n.rotation.x=Math.PI/2,n);function sb(n){n.updateMatrixWorld(!0);let e=new Map;n.traverse(i=>{if(!(i instanceof se))return;let r=i.geometry.clone().applyMatrix4(i.matrixWorld);r.index&&(r=r.toNonIndexed());for(let o of Object.keys(r.attributes))o!=="position"&&o!=="normal"&&o!=="uv"&&r.deleteAttribute(o);let s=i.material;e.set(s,[...e.get(s)??[],r]),i.geometry.dispose()});let t=new Se;for(let[i,r]of e){let s=new se(ca(r),i);r.forEach(o=>o.dispose()),s.castShadow=s.receiveShadow=!0,t.add(s)}return t}function da(n,e){let t=[];for(let i of e.children)i instanceof se&&!i.userData.live&&t.push(new se(i.geometry,n.m.outline));return e.add(...t),e}function kt(n,e,t=[]){let i=sb(n);return t.length&&i.add(...t),i.userData=e,i}var Kn=()=>Object.assign(new Se,{userData:{half:0,h:0}}),Sc=n=>(n.wall(n.r-1,n.c)||n.wall(n.r+1,n.c))&&!(n.wall(n.r,n.c-1)&&n.wall(n.r,n.c+1));function Ni(n,e,t){let{m:i}=n.kit,r=i.keyColor[e],s=new Se,o=1.1,a=.26;s.add($(Je(1,.008,a+.08,i.dark),0,te+.003,0)),s.add($(Je(.98,.012,a,r),0,te+.007,0));let l=new Se;l.add($(Je(1,o,a,i.wood),0,o/2,0)),l.add($(Je(1,.06,a+.02,i.iron),0,.34,0)),l.add($(Je(1,.16,a+.02,r),0,.8,0)),l.add($(Je(1,.1,a+.02,r),0,.06,0)),l.add($(Je(1,.04,a+.02,r),0,o+.02,0)),l.add($(Je(.16,.18,a+.04,i.iron),.24,.55,0)),l.add(ir($(Ve(.05,.05,a+.08,r,12),.24,.55,0))),l.traverse(h=>{h instanceof se&&(h.castShadow=h.receiveShadow=!0)});let u=h=>{l.position.y=-(o+.14)*h,l.visible=h<1};u(t?1:0);let c=Ef(n,[l]);return Sc(n)&&(s.rotation.y=Math.PI/2),kt(s,{half:.4,h:t?.02:o,tall:!t,open:u},c)}var Us=null;function ob(){if(Us)return Us;let n=128,e=document.createElement("canvas");e.width=e.height=n;let t=e.getContext("2d");t.fillStyle="#050302",t.fillRect(0,0,n,n);let i=(o,a,l,u,c,h,f,d,g)=>{let x=t.createLinearGradient(c,h,f,d);x.addColorStop(0,g),x.addColorStop(1,"#0a0604"),t.fillStyle=x,t.fillRect(o,a,l-o,u-a)},r=n*.2;i(0,0,n,r,0,0,0,r,"#6a5236"),i(0,n-r,n,n,0,n,0,n-r,"#2a1e14"),i(0,0,r,n,0,0,r,0,"#4a3826"),i(n-r,0,n,n,n,0,n-r,0,"#4a3826"),t.fillStyle="#1e160f",t.fillRect(r,r,n-2*r,n-2*r);let s=Dt(7);for(let o=0;o<14;o++)t.fillStyle=["#3a2c1e","#2c2116","#4a3a28"][o%3],t.beginPath(),t.ellipse(r+s()*(n-2*r),r+s()*(n-2*r),3+s()*5,2+s()*4,s()*3,0,Math.PI*2),t.fill();return Us=new Sn(e),Us.colorSpace=pt,Us}function Mf(n,e){let{m:t}=n.kit,i=new Se,r=.7,s=.06,o=new se(new Ht(1,r),new st({map:ob()}));o.rotation.x=-Math.PI/2,i.add($(o,0,te+.004,0));for(let u of[-1,1])i.add($(Je(1,.07,.15,t.paleStone),0,te+.035,u*(r/2+.075))),i.add($(Je(1,.012,.02,t.dark),0,te+.072,u*(r/2+.005)));let a=[];for(let u=0;u<dc;u++){let c=-r/2+r*(u+.5)/dc;for(let h of[-1,1]){let f=$(Ve(s,s,.5,t.bronze,12),0,te+.06,c);f.rotation.z=Math.PI/2,f.castShadow=f.receiveShadow=!0,f.userData.side=h,a.push(f)}}let l=u=>{for(let c of a)c.visible=u>.01,c.scale.y=Math.max(.01,u),c.position.x=c.userData.side*(.5-.25*u)};return l(e?1:0),Sc(n)&&(i.rotation.y=Math.PI/2),kt(i,{half:.5,h:.15,open:l},Ef(n,a))}function Ef(n,e){let t=new Se;return t.add(...e),Sc(n)&&(t.rotation.y=Math.PI/2),[t]}function ab(n){let e=bf(n.kit,Je,Ve),[t,i]=Dd(n.wall,n.r,n.c);e.g.rotation.y=Math.atan2(t,-i);let r=new Se;return r.add(...e.live),r.rotation.y=e.g.rotation.y,kt(e.g,{half:.45,h:e.h,tall:!0,loop:e.loop,open:e.light,wake:e.wake},[r])}function Sf(n,e){let{m:t}=n.kit,i=new Se;if(e){i.add($(Je(.8,.72-.04,.8,t.dark),0,te+.72/2,0));for(let s of[te+.04,te+.72-.04])i.add($(Je(.92,.08,.92,t.darkWood),0,s,0));for(let s of[-1,1])for(let o of[-1,1])i.add($(Je(.1,.72,.1,t.darkWood),s*.41,te+.72/2,o*.41));for(let s=0;s<4;s++){let o=-.27+s*.18;for(let a of[-1,1])i.add($(Je(.07,.72-.12,.05,t.wood),o,te+.72/2,a*.43)),i.add($(Je(.05,.72-.12,.07,t.wood),a*.43,te+.72/2,o));i.add($(Je(.07,.04,.8,t.wood),o,te+.72-.01,0))}return kt(i,{half:.46,h:.72+.1})}i.add($(Je(.84,.02,.84,t.dark),0,te+.005,0));for(let r of[-1,1])i.add($(Je(.88,.04,.07,t.darkWood),0,te+.02,r*.42)),i.add($(Je(.07,.04,.88,t.darkWood),r*.42,te+.02,0));for(let r=0;r<4;r++)i.add($(Je(.08,.035,.8,t.wood),-.27+r*.18,te+.018,0));return kt(i,{half:.42,h:.06})}function Tf(n,e,t=.3){let i=new Se;return i.add($(Ve(t,t+.03,.05,n,28),0,te+.025,0)),i.add($(Ve(t-.05,t-.04,.03,e,28),0,te+.06,0)),i}function lb(n){let{m:e}=n.kit,t=new Se;t.add($(Ve(.28,.31,.05,e.iron,24),0,te+.025,0));let i=$(new se(new Fn(.21,20,10,0,Math.PI*2,0,Math.PI/2),e.brownButton),0,te+.04,0);return i.scale.y=.55,t.add(i),kt(t,{half:.3,h:.16})}function wf(n,e){let{m:t}=n.kit,i=Tf(t.bronze,e);return i.add(ir($(new se(new on(.15,.018,8,32),t.cream),0,te+.077,0))),i.add($(Ve(.05,.055,.04,t.bronze,16),0,te+.08,0)),kt(i,{half:.3,h:.12})}function cb(n){let{m:e}=n.kit,t=Tf(e.bronze,e.dark,.34);for(let i=0;i<12;i++){let r=i/12*Math.PI*2;t.add($(new se(new Jt(.028,.12,6),e.iron),Math.cos(r)*.22,te+.13,Math.sin(r)*.22))}return t.add($(Ve(.1,.11,.04,e.bronze,16),0,te+.09,0)),kt(t,{half:.34,h:.2})}function ub(n){let{m:e}=n.kit,t=new Se;t.add($(Ve(.07,.08,.03,e.gold,18),0,te+.015,0));let i=kt(t,{half:.4,h:.05}),r=new se(new Ht(.9,.9),e.wreath);return r.rotation.x=-Math.PI/2,r.position.y=te+.003,r.receiveShadow=!0,i.add(r),i}function hb(n){let{m:e}=n.kit,t=new Se;t.add($(Je(.78,.04,.78,e.paleStone),0,te+.02,0));for(let i of[-1,1])t.add($(Je(.9,.09,.07,e.darkWood),0,te+.045,i*.42)),t.add($(Je(.07,.09,.9,e.darkWood),i*.42,te+.045,0));return kt(t,{half:.45,h:.1})}function db(n){let{m:e}=n.kit,t=new Se;t.add($(Ve(.36,.38,.06,e.bronze,32),0,te+.03,0));let i=kt(t,{half:.36,h:.1}),r=$(Ve(.3,.3,.02,e.swirl,32),0,te+.065,0);return r.receiveShadow=!0,i.add(r),i.userData.loop=s=>{r.rotation.y=-s*1.6},i}function fb(n){let{m:e}=n.kit,t=new Se;t.add($(Ve(.36,.38,.06,e.gold,32),0,te+.03,0));let i=$(Ve(.3,.3,.02,e.hand,32),0,te+.065,0);return i.rotation.y=Math.PI,t.add(i),kt(t,{half:.36,h:.1})}function pb(n){let{m:e}=n.kit,t=new Se,i=[[0,0],[.12,0],[.2,.08],[.22,.2],[.18,.32],[.08,.4],[.07,.46],[.09,.48],[0,.48]].map(([a,l])=>new ie(a,l));t.add($(new se(new Br(i,24),e.clay),0,te,0)),t.add(ir($(new se(new on(.205,.012,6,28),e.dark),0,te+.22,0)));let r=$(Ve(.012,.012,.12,e.dark,6),.02,te+.53,0);r.rotation.z=-.3,t.add(r);let s=$(new se(new Jt(.035,.1,8),di(16760928)),.04,te+.62,0),o=kt(t,{half:.22,h:.6},[s]);return o.userData.loop=a=>s.scale.set(1,1+.2*Math.sin(a*9),1),o}function ha(n,e){let{m:t}=n.kit,i=new Se;i.add($(new se(new Yn(.86,.36,.86,2,.03),t.darkWood),0,te+.18,0)),i.add($(Je(.64,.02,.64,t.dark),0,te+.365,0));for(let a of[-1,1])for(let l of[-1,1])i.add($(Ve(.03,.03,.02,t.gold,10),a*.37,te+.365,l*.37));let r=new Wt;r.moveTo(0,.24),r.lineTo(.17,.04),r.lineTo(.07,.04),r.lineTo(.07,-.22),r.lineTo(-.07,-.22),r.lineTo(-.07,.04),r.lineTo(-.17,.04),r.closePath();let s=new se(new ji(r,{depth:.025,bevelEnabled:!1}),t.gold);s.rotation.x=-Math.PI/2,s.position.y=te+.37;let o=new Se;return o.add(s),o.rotation.y=e,i.add(o),kt(i,{half:.43,h:.4})}function mb(n){let e=new Se,t=Dt(n.r*31+n.c),i=[];for(let s=0;s<5;s++){let o=.3+t()*.28,a=$(new se(new Jt(.08+t()*.05,o,7),di(s%2?16738848:16756816,.8)),(t()-.5)*.55,te+o/2,(t()-.5)*.55);i.push(a),e.add(a)}let r=t()*6.28;return e.userData={half:.4,h:.5,loop:s=>i.forEach((o,a)=>o.scale.set(1,1+.12*Math.sin(s*(6+a)+r+a),1))},e}var Af={floor:Kn,wall:Kn,water:Kn,ice:Kn,dirt:Kn,gravel:Kn,"force-up":Kn,"force-down":Kn,"force-left":Kn,"force-right":Kn,exit:ab,fire:mb,"gate-closed":n=>Mf(n,!1),"gate-open":n=>Mf(n,!0),safe:ub,button:lb,trap:cb,popup:hb,teleport:db,thief:fb,bomb:pb,"toggle-open":n=>Sf(n,!1),"toggle-closed":n=>Sf(n,!0),"door-red":n=>Ni(n,"red",!1),"door-blue":n=>Ni(n,"blue",!1),"door-yellow":n=>Ni(n,"yellow",!1),"door-green":n=>Ni(n,"green",!1),"door-red-sill":n=>Ni(n,"red",!0),"door-blue-sill":n=>Ni(n,"blue",!0),"door-yellow-sill":n=>Ni(n,"yellow",!0),"door-green-sill":n=>Ni(n,"green",!0),"button-brown":n=>wf(n,n.kit.m.brownButton),"button-red":n=>wf(n,n.kit.m.redButton),"clone-up":n=>ha(n,0),"clone-left":n=>ha(n,Math.PI/2),"clone-down":n=>ha(n,Math.PI),"clone-right":n=>ha(n,-Math.PI/2)};function Oi(n,e){n.traverse(t=>{if(t instanceof Wn){e.keeps.has(t.material)||t.material.dispose();return}if(!(t instanceof se))return;t.geometry.dispose();let i=Array.isArray(t.material)?t.material:[t.material];for(let r of i)e.keeps.has(r)||r.dispose()})}var cn=(n,e,t=16,i=12)=>new se(new Fn(n,t,i),e);function Pf(n,e,t){let i=new Wt;i.moveTo(n[0][0],n[0][1]);for(let[s,o]of n.slice(1))i.lineTo(s,o);i.closePath();let r=new ji(i,{depth:e,bevelEnabled:!1,curveSegments:6});return r.translate(0,0,-e/2),new se(r,t)}function Ns(n,e,t,i,r=0,s=[]){let o=t.h*i;e.position.y-=te;let a=new Se;a.position.set(0,te,o/2*Math.sin(r)),a.rotation.x=-r,a.scale.setScalar(i),a.add(e);let l=new Se;return l.add(a),da(n,kt(l,{...t,half:Math.max(t.half*i,o/2*Math.sin(r)),h:o*Math.cos(r),back:o*Math.sin(r)/2},s))}var wc=.45,gb=.035;function If(n,e){return n.rotation.x=-Math.PI/2,n.position.y=te+e,n.userData.live=!0,n}var pa=(n,e=.42)=>If(new se(new $i(e,32),n.m.itemShade),.006);function Zn(n,e,t,i,r=0){let s=_n().items==="plate",o=[pa(n,s?wc:.42)];return s&&o.push(If(new se(new Ii(wc-gb,wc,48),n.m.itemRing),.008)),Ns(n,e,t,s?i*1.12:i,r,o)}function xb(n){let{m:e}=n,t=new Se;t.add($(Ve(.11,.13,.04,e.bronze,18),0,te+.02,0)),t.add($(Ve(.02,.022,.66,e.darkWood,8),0,te+.35,0)),t.add($(cn(.03,e.gold,10,8),0,te+.7,0));for(let i of[-1,1]){let r=Pf([[.02,.05],[.12,.08],[.21,.17],[.16,0],[.21,-.17],[.12,-.08],[.02,-.05]].map(([s,o])=>[i*s,o]),.03,e.gold);t.add($(r,0,te+.5,0))}return t.add($(Ve(.035,.035,.12,e.gold,10),0,te+.5,0)),Zn(n,t,{half:.22,h:.72},1.2,.85)}function fa(n,e){let{m:t}=n,i=new Se;i.add($(new se(new on(.075,.03,10,20),t.keyColor[e]),0,.2,0)),i.add(ir($(Ve(.05,.05,.034,t.keyColor[e],16),0,.2,0))),i.add($(Je(.035,.24,.03,t.bronze),0,0,0)),i.add($(Je(.07,.03,.03,t.bronze),.035,-.08,0)),i.add($(Je(.05,.03,.03,t.bronze),.025,-.03,0)),i.position.y=te+.2,i.rotation.z=.25;let r=new Se;return r.add(i),Zn(n,r,{half:.12,h:.42},2.05,1.1)}function _b(n){let{m:e}=n,t=new Se,i=new Wt;i.moveTo(0,0),i.bezierCurveTo(.08,.02,.1,.2,.07,.32),i.lineTo(-.07,.32),i.bezierCurveTo(-.1,.2,-.08,.02,0,0);let r=new ji(i,{depth:.025,bevelEnabled:!1});for(let s of[-1,1]){let o=new se(r,e.teal);o.rotation.x=-Math.PI/2+.35,o.rotation.z=s*.2,o.position.set(s*.1,te+.03,.14),t.add(o),t.add($(Je(.1,.07,.1,e.teal),s*.1,te+.06,.14))}return Zn(n,t,{half:.24,h:.2},1.8)}function Ec(n,e,t,i){let r=new Se;for(let s of[-1,1]){let o=new Se,a=i?.(o)??0;o.add($(Je(.09,.2,.09,e),0,a+.12,0)),o.add($(Je(.09,.06,.17,e),0,a+.03,.04)),o.add($(Je(.1,.045,.1,t),0,a+.225,0)),o.position.set(s*.09,te,0),o.rotation.y=s*.2,r.add(o)}return r}function yb(n){let{m:e}=n,t=Ec(n,e.boot,e.bootTrim,i=>(i.add($(new se(new Jt(.025,.07,6),e.gold),0,.11,.05)),0));return Zn(n,t,{half:.2,h:.28},1.9,.7)}function vb(n){let{m:e}=n,t=Ec(n,e.skate,e.cream,i=>{i.add($(Je(.02,.05,.24,e.steel),0,.025,.04));for(let r of[-.04,.12])i.add($(Je(.03,.03,.03,e.steel),0,.05,r));return .05});return Zn(n,t,{half:.2,h:.32},1.8,.7)}function bb(n){let{m:e}=n,t=Ec(n,e.suction,e.bootTrim,i=>(i.add($(Ve(.1,.07,.035,e.bronze,18),0,.018,.03)),.035));return Zn(n,t,{half:.22,h:.3},1.8,.7)}function Mb(n){let{m:e}=n,t=new Se,i=new Se;i.position.set(0,te+.32,0),i.rotation.x=-.25,i.add(ir(Ve(.13,.13,.02,e.mirror,28))),i.add(new se(new on(.13,.02,8,28),e.bronze));let r=$(cn(.045,e.gorgon,12,10),0,0,.012);r.scale.z=.5,i.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;i.add($(cn(.014,e.gorgon,6,5),Math.cos(o)*.08,Math.sin(o)*.08,.012))}return t.add(i),t.add($(Ve(.018,.025,.2,e.bronze,8),0,te+.1,0)),t.add($(Ve(.08,.09,.025,e.bronze),0,te+.012,0)),Zn(n,t,{half:.18,h:.48},1.55,.9)}function Sb(n){let{m:e}=n,t=new Se;t.add($(Ve(.24,.22,.03,e.bronze,24),0,te+.015,0)),t.add($(Ve(.17,.19,.16,e.cake,24),0,te+.11,0)),t.add($(Ve(.165,.17,.02,e.cream,24),0,te+.2,0));for(let i=0;i<8;i++){let r=i/8*Math.PI*2;t.add($(cn(.022,e.cream,8,6),Math.cos(r)*.12,te+.215,Math.sin(r)*.12))}return t.add($(cn(.035,e.cake,10,8),0,te+.22,0)),Zn(n,t,{half:.24,h:.26},1.4,.35)}function Cf(n,e,t=0,i=!1){let{m:r}=n,s=new Se;s.add($(Je(.56,.05,.3,r.wood),0,.1,0));for(let l of[-1,1])for(let u of[-1,1])s.add(ir($(Ve(.07,.07,.03,r.darkWood,14),l*.2,.07,u*.165))),s.add($(Ve(.028,.025,.14,r.hide,8),l*.16,.18,u*.08));s.add($(new se(new Yn(.46,.22,.24,2,.05),r.hide),0,.34,0));for(let[l,u,c,h]of[[-.1,0,.3,1],[.1,.05,.3,1],[-.04,.12,1,.3],[.12,-.12,1,.3],[-.14,-.12,1,.3]]){let f=$(cn(.075,r.patch,10,8),l,h===1?.44:.35,u);f.scale.set(1,c,h),s.add(f)}s.add($(new se(new Yn(.14,.15,.15,2,.03),r.hide),.29,.43,0)),s.add($(Je(.06,.08,.12,r.snout),.37,.4,0));for(let l of[-1,1]){let u=$(new se(new Jt(.02,.08,6),r.ivory),.28,.53,l*.06);u.rotation.x=l*.5,s.add(u)}let o=$(Ve(.012,.012,.16,r.patch,6),-.25,.36,0);o.rotation.z=-.4,s.add(o),s.position.y=te,s.rotation.y=.5;let a=new Se;return a.add(s),(i?Zn:Ns)(n,a,{half:.32,h:.56},e,t)}function wb(n){let{m:e}=n,t=new Se;t.add($(Je(.26,.008,.14,e.parchment),.02,te+.006,.08));let i=$(Ve(.06,.06,.34,e.parchment,14),0,te+.06,-.02);i.rotation.z=Math.PI/2,t.add(i);for(let s of[-1,1]){let o=$(Ve(.035,.035,.012,e.darkWood,10),s*.172,te+.06,-.02);o.rotation.z=Math.PI/2,t.add(o)}let r=$(Ve(.064,.064,.05,e.cloak,14),-.08,te+.06,-.02);return r.rotation.z=Math.PI/2,t.add(r),t.rotation.y=.3,Zn(n,t,{half:.2,h:.14},1.9,.5)}function Eb(n){let e=new Se;return e.add($(new se(new Yn(.84,.8,.84,3,.05),n.m.block),0,te+.4,0)),kt(e,{half:.42,h:.9})}function Tb(n){let{m:e}=n,t=new Se,i=te+.22;t.add($(cn(.22,e.bronze,24,16),0,i,0));let r=$(new se(new on(.222,.012,6,32),e.gold),0,i,0);r.rotation.y=Math.PI/2,t.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;t.add($(cn(.022,e.gold,6,5),Math.cos(o)*.222,i,Math.sin(o)*.222)),s%2===0&&t.add($(cn(.02,e.gold,6,5),0,i+Math.cos(o+.3)*.224,Math.sin(o+.3)*.224))}return Ns(n,t,{half:.24,h:.46},1.45,0,[pa(n)])}function Ab(n){let{m:e}=n,t=new Se,i=te+.4,r=$(cn(.12,e.feather,16,12),0,i,-.02);r.scale.set(.9,1.15,.85),t.add(r),t.add($(cn(.075,e.skin,14,10),0,i+.17,.03));let s=$(cn(.082,e.furDark,14,8),0,i+.19,.01);s.scale.set(1,.8,1),t.add(s);for(let a of[-1,1]){t.add($(cn(.012,e.dark,6,5),a*.028,i+.18,.1));let l=Pf([[.06,.08],[.24,.16],[.4,.14],[.38,.06],[.33,.08],[.33,-.01],[.26,.02],[.24,-.08],[.17,-.03],[.12,-.1],[.06,-.04]].map(([u,c])=>[a*u,c]),.025,e.feather);l.position.set(0,i+.04,-.04),l.rotation.x=-.9,t.add(l),t.add($(Ve(.014,.012,.16,e.bootTrim,6),a*.04,i-.18,.02))}let o=$(new se(new Jt(.06,.16,6),e.feather),0,i-.1,-.12);return o.rotation.x=-2.4,t.add(o),Ns(n,t,{half:.36,h:.66},1.05,0,[pa(n)])}var Rf=1.35;function Cb(n){let e=new Se;e.add($(cn(.13,n.m.bootTrim,12,8),0,te+.14,0));let t=[],i=$(cn(.16,di(13647888,.5),16,12),0,te+.17,0);t.push(i);for(let o=0;o<7;o++){let a=o/7*Math.PI*2,l=.24+o%3*.06,u=$(new se(new Jt(.08,l,7),di(o%2?13122060:14182424,.7)),Math.cos(a)*.12,te+l/2+.04,Math.sin(a)*.12);u.rotation.z=-Math.cos(a)*.3,u.rotation.x=Math.sin(a)*.3,t.push(u)}let r=new Se;for(let o of t)o.position.y-=te;r.add(...t),r.position.y=te,r.scale.setScalar(Rf),r.userData.live=!0;let s=Ns(n,e,{half:.26,h:.5},Rf,0,[r,pa(n)]);return s.userData.loop=o=>t.forEach((a,l)=>a.scale.set(1,1+.15*Math.sin(o*(7+l)+l*1.7),1)),s}var ma={relic:xb,"key-red":n=>fa(n,"red"),"key-blue":n=>fa(n,"blue"),"key-yellow":n=>fa(n,"yellow"),"key-green":n=>fa(n,"green"),flippers:_b,"fire-boots":yb,skates:vb,suction:bb,mirror:Mb,cake:Sb,cow:n=>Cf(n,1.1,.35,!0),"cow-standing":n=>Cf(n,1.1),page:wb,block:Eb,ball:Tb,glider:Ab,fireball:Cb};var fi=(n,e,t=16,i=12)=>new se(new Fn(n,t,i),e);function Uf(n,e,t,i=1.3,r=[]){e.scale.setScalar(i),e.position.y=te;let s=new Se;return s.add(e),da(n,kt(s,t,r))}function Rb(n,e,t){let i=[];for(let s of e.children){if(!(s instanceof se)||s.userData.live||s.material===n.m.outline)continue;let o=s.material;o.stencilWrite=!0,o.stencilRef=1,o.stencilZPass=Th;let a=new se(s.geometry,n.m.heroXray);a.renderOrder=20,a.userData.live=!0,i.push(a)}let r=new se(new En(.16,.24,2.2,24,1,!0),n.m.heroBeam);r.position.y=te+t+.25+1.1,r.renderOrder=21,r.userData.live=!0,e.add(...i,r)}var Tc=1.45;function Pb(n){let{m:e}=n,t=new Se;for(let c of[-1,1])t.add($(Ve(.045,.04,.28,e.heroSkin),c*.065,.14,0)),t.add($(Je(.07,.05,.12,e.heroLeather),c*.065,.025,.02));t.add($(Ve(.13,.2,.22,e.heroTunic),0,.35,0)),t.add($(Ve(.155,.13,.22,e.heroTunic),0,.55,0)),t.add($(Ve(.16,.16,.035,e.heroLeather),0,.45,0));let i=$(Je(.3,.44,.03,e.heroCloak),0,.44,-.14);i.rotation.x=.12,t.add(i);for(let c of[-1,1]){let h=$(Ve(.04,.035,.26,e.heroSkin),c*.19,.5,.02);h.rotation.z=c*.18,t.add(h)}t.add($(fi(.095,e.heroSkin),0,.75,0)),t.add($(new se(new Fn(.103,18,10,0,Math.PI*2,0,Math.PI/2),e.heroHair),0,.765,-.012));let r=$(Ve(.15,.15,.03,e.bronze,24),-.26,.5,.04);r.rotation.z=Math.PI/2,t.add(r);let s=$(Ve(.06,.06,.035,e.heroCloak,16),-.275,.5,.04);s.rotation.z=Math.PI/2,t.add(s);let o=$(Je(.03,.34,.012,e.steel),.23,.5,.1);o.rotation.x=.5,t.add(o),t.add($(Je(.09,.02,.03,e.bronze),.23,.37,.03));let a=(c,h,f,d)=>{let g=new se(new Ii(c,h,48),f);return g.rotation.x=-Math.PI/2,g.position.y=te+d,g.userData.live=!0,g},l=[a(.33,.47,e.heroRingEdge,.01),a(.36,.44,e.heroRing,.012)],u=Uf(n,t,{half:.26*Tc/1.3,h:1.2*Tc/1.3},Tc,l);return _n().beacon&&Rb(n,u,u.userData.h),u}var Ac=1.08,Ib=.24;function Lf(n,e){let{m:t}=n,i=x=>e?t.statue:x,r=i(t.fur),s=e?t.statueDark:t.furDark,o=new Se;for(let x of[-1,1]){let p=x*-.05;o.add($(Ve(.06,.068,.05,i(t.hoof)),x*.13,.025,p+.01));let m=$(Ve(.05,.06,.26,r),x*.125,.18,p);m.rotation.z=x*.04,o.add(m);let y=$(Ve(.09,.062,.26,r),x*.11,.42,p*.6);y.rotation.z=-x*.1,o.add(y)}o.add($(Ve(.15,.2,.14,i(t.kilt)),0,.54,0));let a=$(new se(new on(.155,.02,8,24),i(t.gold)),0,.605,0);a.rotation.x=Math.PI/2,o.add(a);let l=$(new Se,0,.6,0);l.rotation.x=Ib,o.add(l),l.add($(Ve(.21,.15,.2,r),0,.09,0));let u=$(fi(.25,r),0,.29,.01);u.scale.set(1.42,.85,.92),l.add(u);let c=$(fi(.17,s),0,.42,-.06);c.scale.set(1.5,.66,1),l.add(c);for(let x of[-1,1]){l.add($(fi(.12,r),x*.29,.39,0));let p=$(Ve(.088,.072,.26,r),x*.325,.24,.01);p.rotation.z=x*.1,l.add(p);let m=$(Ve(.074,.06,.24,r),x*.335,.04,.07);m.rotation.x=-.45,l.add(m),l.add($(fi(.072,s),x*.33,-.08,.13)),l.add($(Ve(.076,.076,.035,i(t.gold)),x*.33,.14,.03))}let h=$(new Se,0,.45,.13);h.rotation.x=.3,l.add(h);let f=fi(.125,s);f.scale.set(1.05,.95,1.15),h.add(f);let d=$(fi(.085,i(t.snout)),0,-.05,.12);d.scale.set(1.1,.8,.95),h.add(d),h.add($(new se(new on(.035,.008,6,16),i(t.gold)),0,-.1,.19));for(let x of[-1,1]){h.add($(fi(.02,e?t.statueDark:t.eye,8,6),x*.065,.03,.115));let p=$(fi(.04,s),x*.14,.02,-.03);p.scale.set(1.3,.6,.8),h.add(p);let m=new ms([new P(x*.08,.06,0),new P(x*.24,.07,-.03),new P(x*.37,.15,.01),new P(x*.42,.3,.1)]);h.add(new se(new zo(m,20,.036,8),i(t.ivory)));let y=$(new se(new Jt(.036,.11,8),i(t.ivory)),x*.425,.36,.125);y.rotation.x=.35,y.rotation.z=-x*.15,h.add(y)}let g=new Se;g.add(Ve(.02,.02,1,i(t.iron),8));for(let x of[-1,1]){let p=new se(new En(.17,.17,.022,24,1,!1,0,Math.PI),i(t.steel));p.rotation.z=Math.PI/2,p.rotation.y=x>0?0:Math.PI,p.position.set(0,.36,0),p.scale.set(1,1,.8),g.add(p)}return g.rotation.set(-.12,Math.PI/2,0),g.position.set(.33,.1,.13),l.add(g),Uf(n,o,{half:.42*Ac/1.3,h:1.6*Ac/1.3},Ac)}var Cc={theseus:Pb,minotaur:n=>Lf(n,!1),"minotaur-stone":n=>Lf(n,!0)},Lb={...ma,...Cc},Db=new Set([...Ud,"ball","glider","fireball"]),Ub={down:0,up:Math.PI,right:Math.PI/2,left:-Math.PI/2},Nb=1.5,Ob=.05,Df={y:.37,scale:.7},Fb=n=>Math.atan2(Math.sin(n),Math.cos(n));function Nf(n,e){let t=new Se,i=[],r=(d,g,x)=>{let p=$d(d),m=x.userData;return p?e.make(p,g,m.h,m.back??0):null};function s(d){d.foot.set(d.obj.position.x,te+d.y,d.obj.position.z)}function o(d){let g=Lb[d.model](n);return d.id?.startsWith("machine")&&g.scale.setScalar(Df.scale),t.add(g),g}function a(d,g){let x=d.id?.startsWith("machine")?Df.y:0,p=o(d),m=new P;return{model:d.model,id:d.id,obj:p,marker:r(d,m,p),foot:m,r:d.r,c:d.c,yaw:g,goal:g,y:x}}function l(d){t.remove(d.obj),Oi(d.obj,n),d.marker&&e.group.remove(d.marker)}function u(d,g){l(d),d.model=g.model,d.obj=o(g),d.marker=r(g,d.foot,d.obj)}function c(d,g,x,p){let m=!1,y=new Set(i),_=new Map,b=new Map(i.filter(R=>R.id).map(R=>[R.id,R]));for(let R of d){let v=R.id?b.get(R.id):void 0;v&&(y.delete(v),_.set(R,v))}let E=[];for(let R of d)if(!_.has(R))for(let v of y){let M=Math.hypot(v.r-R.r,v.c-R.c);v.model===R.model&&M<=Nb&&E.push([M,R,v])}E.sort((R,v)=>R[0]-v[0]);for(let[,R,v]of E)_.has(R)||!y.has(v)||(y.delete(v),v.id=R.id,_.set(R,v));for(let R of y)l(R),m=!0;let S=d.find(R=>R.model==="theseus"),T=[];for(let R of d){let v=_.get(R);if(!v){let z=R.dir?Ub[R.dir]:R.id==="minotaur"&&S?Math.atan2(S.c-R.c,S.r-R.r):0;v=a(R,z),m=!0}v.model!==R.model&&(u(v,R),m=!0);let M=R.r-v.r,L=R.c-v.c;Math.abs(M)+Math.abs(L)>1e-6&&(Db.has(v.model)&&(v.goal=Math.atan2(L,M)),m=!0),v.r=R.r,v.c=R.c,p&&(v.yaw=v.goal),v.obj.position.set(ct(v.c,g),v.y,ut(v.r,x)),v.obj.rotation.y=v.yaw,s(v),T.push(v)}return i=T,m}function h(d,g){let x=!1;for(let p of i){let m=Fb(p.goal-p.yaw);if(Math.abs(m)<.001){p.yaw=p.goal,p.obj.rotation.y=p.yaw;continue}p.yaw=g?p.goal:p.yaw+m*(1-Math.exp(-d/Ob)),p.obj.rotation.y=p.yaw,x=!0}return x}function f(){for(let d of i)l(d);i=[]}return{group:t,set:c,ease:h,seen(){let d=x=>{let p=x.obj.userData;return{x:x.obj.position.x,z:x.obj.position.z,half:p.half,h:p.h}},g=i.find(x=>x.model==="theseus");return{hero:g?d(g):null,rest:i.filter(x=>x!==g).map(d)}},hero:()=>i.find(d=>d.model==="theseus")?.obj??null,loop(d){for(let g of i)g.obj.userData.loop?.(d)},looping:()=>i.flatMap(d=>d.marker||d.obj.userData.loop?[d.obj]:[]),clear:f,dispose:f}}var Bf=.8,Ff=te+Bf-Ui,kf=9,Bb=9,zf=13823214;function Gf(n){let e=new Se,t=new Gr(.05,0),i=new Ii(.82,1,40);i.rotateX(-Math.PI/2);let r=new Map,s=0,o=(c,h)=>{c.block.position.y=Ui+h-(te+Bf)};function a(c){let h=c.splash;if(h){for(let f of[h.ring,...h.drops])e.remove(f),f.material.dispose();c.splash=null}}function l(c,h,f){let d=Dt(c*2246822519+5),g=new se(i,new st({color:zf,transparent:!0,depthWrite:!1}));g.position.set(h,Ui+.004,f),g.scale.setScalar(.35),e.add(g);let x=[],p=[];for(let m=0;m<kf;m++){let y=(m+d()*.6)/kf*Math.PI*2,_=.55+d()*.45;p.push([Math.cos(y)*_,Math.sin(y)*_,1.6+d()*.8]);let b=new se(t,new st({color:zf,transparent:!0,depthWrite:!1}));b.position.set(h,Ui,f),e.add(b),x.push(b)}return{t0:null,ring:g,drops:x,flight:p}}function u(c){let h=r.get(c);h&&(a(h),e.remove(h.block),Oi(h.block,n),r.delete(c))}return{group:e,set(c,h,f,d){let g=!1,x=new Set(c);for(let p of[...r.keys()])x.has(p)||(u(p),g=!0);for(let p of c){if(r.has(p))continue;let m=ct(p%h,h),y=ut(Math.floor(p/h),f),_=ma.block(n);_.position.set(m,0,y),e.add(_);let b={block:_,x:m,z:y,splash:d?l(p,m,y):null};o(b,d?Ff:.065+s),r.set(p,b),g=!0}return g},splashing:()=>[...r].filter(([,c])=>c.splash).map(([c])=>c),frame(c){let h=!1;for(let f of r.values()){let d=f.splash;if(!d)continue;d.t0??=c;let g=(c-d.t0)/1e3;if(g>=Math.max(.4,.25+.35)){a(f),o(f,.065+s);continue}h=!0,o(f,Hd(g,Ff));let x=Math.min(1,g/.4);d.ring.scale.setScalar(.35+.35*(1-(1-x)**2)),d.ring.material.opacity=.75*(1-x),d.drops.forEach((p,m)=>{let[y,_,b]=d.flight[m],E=Ui+b*g-Bb/2*g*g;p.visible=x<1&&E>=Ui,p.position.set(f.x+y*g,E,f.z+_*g),p.material.opacity=.9*(1-x*x)})}return h},loop(c,h){s=Vd(c,h);for(let f of r.values())f.splash||o(f,.065+s)},cells:()=>[...r.keys()].sort((c,h)=>c-h),clear(){for(let c of[...r.keys()])u(c)},dispose(){this.clear(),t.dispose(),i.dispose()}}}var Gb=Math.PI/6;function Hf(){let n=new gn,e=new Se,t=Cs/2,i=ta,r=new Br([new ie(0,0),new ie(t,i*.6),new ie(0,i)],6),s=new Map,o=_n().items==="white";for(let[f,d]of Object.entries(Yd)){let g=o&&f==="item"?16777215:d;s.set(f,new Bo({color:g,emissive:g,emissiveIntensity:.45,specular:16777215,shininess:80,flatShading:!0,transparent:!0,opacity:.9,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1}))}let a=new st({color:Kd,side:Lt,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1});a.onBeforeCompile=f=>{f.vertexShader=f.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${o?"0.04":"0.022"};`)};let l=new hi(16777215,2.2);n.add(new Ho(16777215,.7),l,e);let u=new P,c=new P,h=new P;return{scene:n,group:e,make(f,d,g,x=0){let p=new se(r,s.get(f));p.userData={kind:f,foot:d,h:g,back:x},p.renderOrder=10;let m=new se(r,a);return m.renderOrder=9,p.add(m),e.add(p),p},place(f,d,g,x,p){let m=Zd(p);u.setFromMatrixColumn(f.matrixWorld,0),c.setFromMatrixColumn(f.matrixWorld,1),h.setFromMatrixColumn(f.matrixWorld,2),l.position.copy(h).multiplyScalar(3).addScaledVector(c,2).addScaledVector(u,-1.5);let y=jd(g,x);for(let _ of e.children){let b=_.userData;_.position.copy(b.foot).addScaledVector(c,Jd(b.h,d,b.back)+y),_.quaternion.copy(f.quaternion),_.rotateY(Gb),_.scale.setScalar(m)}return m},dispose(){e.clear(),r.dispose();for(let f of s.values())f.dispose();a.dispose()}}}var Hb={"door-red":ga,"door-blue":ga,"door-yellow":ga,"door-green":ga,"gate-closed":Vf,"gate-open":Vf,exit:(n,e)=>pi(new Tn(5945599,4,4,1.6),n,.4,e)};function ga(n,e){return pi(new Tn(16756848,1.6,2.6,1.8),n,.9,e+.6)}function Vf(n,e){return pi(new Tn(16760944,1.2,2.5,1.8),n,1,e)}function pi(n,e,t,i){return n.position.set(e,t,i),n}var Wf=n=>n.endsWith("-sill")?"sill":n.startsWith("door")?"door":n.startsWith("gate")?"gate":n;function Pc(n,e,t,i,r){let{m:s}=n,o=new Se,a=[];o.add(new Wr(10131616,2761760,2.4));let l=Math.hypot(i,t)/2+1.5,u=new hi(11581648,1.6);u.position.set(-6,14,8),u.castShadow=!0,u.shadow.mapSize.set(2048,2048),Object.assign(u.shadow.camera,{left:-l,right:l,top:l,bottom:-l,near:1,far:40+l}),u.shadow.camera.updateProjectionMatrix(),u.shadow.bias=-8e-4,o.add(u,u.target);let c=new Tn(16758904,5.5,5.5,1.6);c.castShadow=!0,c.shadow.mapSize.set(512,512),c.shadow.bias=-.004,o.add(c);let h=[],f=[],d=Math.min(8,Math.max(3,Math.round(t*i/37))),g=["s","e","w","n"],x=[];for(let E of r)for(let S of g){let[T,R]=Rn[S].d,v=E.r+T,M=E.c+R;v<0||M<0||v>=t||M>=i||e[v*i+M]!=="floor"||x.push({w:E,k:S,r:v,c:M,pri:g.indexOf(S)})}x.sort((E,S)=>E.pri-S.pri||E.r-S.r||E.c-S.c);let p=[];for(let E of x){if(p.length>=d)break;p.some(S=>Math.max(Math.abs(S.r-E.r),Math.abs(S.c-E.c))<4)||p.push(E)}let m=new Vn({map:s.halo,blending:mn,depthWrite:!1,transparent:!0,opacity:.55});a.push(m),p.forEach(({w:E,k:S},T)=>{let[R,,v]=Rn[S].n,M=new Se;M.position.set(E.x+R*.5,0,E.z+v*.5),M.add(pi(new se(new sn(.08,.2,.08),s.iron),R*.04,.82,v*.04)),M.add(pi(new se(new En(.05,.03,.12,8),s.iron),R*.1,.92,v*.1));let L=pi(new se(new Jt(.055,.2,8),di(16747056)),R*.1,1.07,v*.1),z=pi(new se(new Jt(.03,.12,8),di(16769184)),R*.1,1.04,v*.1);a.push(L.material,z.material);let V=new Wn(m);V.scale.setScalar(.7),V.position.set(R*.12,1.05,v*.12),M.add(L,z,V);for(let O of M.children)O instanceof se&&O.material===s.iron&&(O.castShadow=!0);o.add(M);let I=pi(new Tn(16754788,4,6,1.7),M.position.x+R*.45,1.05,M.position.z+v*.45);o.add(I),f.push({g:M,flames:[L,z],halo:V,light:I,base:4,ph:T*2.39}),h.push(new P(M.position.x,1,M.position.z))});let y=[],_=[];e.forEach((E,S)=>{if(E!=="fire")return;let T=Math.floor(S/i),R=S%i,v=_.at(-1);v&&v.r===T&&v.c1===R-1?v.c1=R:_.push({r:T,c0:R,c1:R}),h.push(new P(ct(R,i),te+.2,ut(T,t)))});for(let E of _){let S=E.c1-E.c0+1,T=pi(new Tn(16742960,3+S*1.2,3+S*.8,1.6),(ct(E.c0,i)+ct(E.c1,i))/2,.8,ut(E.r,t));o.add(T),y.push({light:T,base:T.intensity,ph:E.r})}e.forEach((E,S)=>{(E==="water"||E==="teleport")&&h.push(new P(ct(S%i,i),te,ut(Math.floor(S/i),t)))});let b=new Map;return e.forEach((E,S)=>{let T=Hb[E];if(!T)return;let R=T(ct(S%i,i),ut(Math.floor(S/i),t));o.add(R),b.set(S,{light:R,base:R.intensity,kind:Wf(E)})}),{group:o,anchors:h,hero(E,S){c.position.set(E,1.5,S+.1)},setMode(E){for(let S of f)S.g.visible=E!=="low",S.light.position.y=E==="low"?.7:1.05},piece(E,S){let T=b.get(E);T&&(T.light.intensity=Wf(S)===T.kind?T.base:0)},portal(E,S){let T=b.get(E);T?.kind==="exit"&&(T.light.intensity=T.base*S)},shadows(E){u.castShadow=E,c.castShadow=E},loop(E){for(let S of f){let T=1+.07*Math.sin(E*7.1+S.ph)+.04*Math.sin(E*12.7+S.ph*2);S.flames.forEach(R=>R.scale.set(1,T,1)),S.light.intensity=S.base*(1+.1*Math.sin(E*6.3+S.ph)+.05*Math.sin(E*11.1))}m.opacity=.5+.06*Math.sin(E*5);for(let S of y)S.light.intensity=S.base*(1+.1*Math.sin(E*5.7+S.ph))},dispose(){o.traverse(E=>{E instanceof se&&E.geometry.dispose(),(E instanceof hi||E instanceof Tn)&&E.shadow.map?.dispose()});for(let E of a)E.dispose()}}}var Ic={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new ie(1/1024,1/512)}},vertexShader:`

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
	`};var Vb="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",Wb=`
uniform sampler2D tDiffuse; uniform float exposure; uniform vec2 res; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
void main(){
  vec3 col = pow(aces(texture2D(tDiffuse, vUv).rgb * exposure), vec3(1.0/2.2));
  float l = dot(col, vec3(.2126, .7152, .0722));
  col = col * vec3(1.02, 1.0, 0.96) + vec3(0.018, 0.009, 0.0) * (1.0 - l);
  vec2 q = (vUv - 0.5) * vec2(res.x / res.y, 1.0);
  col *= 1.0 - 0.5 * smoothstep(0.35, 0.95, length(q));
  gl_FragColor = vec4(col, 1.0);
}`;function Xf(n){let e=new Hn(-1,1,1,-1,0,1),t=new $t({uniforms:{tDiffuse:{value:null},exposure:{value:1.4},res:{value:new ie(1,1)}},vertexShader:Vb,fragmentShader:Wb,depthTest:!1,depthWrite:!1}),i=new $t({uniforms:{tDiffuse:{value:null},resolution:{value:new ie}},vertexShader:Ic.vertexShader,fragmentShader:Ic.fragmentShader,depthTest:!1,depthWrite:!1}),r=new se(new Ht(2,2),t);r.frustumCulled=!1;let s=new gn;s.add(r);let o=new rn(1,1,{type:Ki,samples:4,stencilBuffer:!0}),a=new rn(1,1);return{setSize(l,u){o.setSize(l,u),a.setSize(l,u),t.uniforms.res.value.set(l,u),i.uniforms.resolution.value.set(1/l,1/u)},render(l,u,c){n.setRenderTarget(o),n.render(l,u),r.material=t,t.uniforms.tDiffuse.value=o.texture,n.setRenderTarget(c?a:null),n.render(s,e),c&&(r.material=i,i.uniforms.tDiffuse.value=a.texture,n.setRenderTarget(null),n.render(s,e))},dispose(){o.dispose(),a.dispose(),t.dispose(),i.dispose(),r.geometry.dispose()}}}var qf=9382175,Xb=12271921,qb=16765503,Yf=1836034,ya=.03,Lc=te+.035,va=Lc+ya+.01,Kf=va+.006,Yb=.42,Kb=.2,Zb=.2,Zf=1.32,xa={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function _a(n){let e=Yb*n,t=Kb*n,i=new Wt;return i.moveTo(e/2,0),i.lineTo(-e/2,t),i.lineTo(-e/4,0),i.lineTo(-e/2,-t),i.closePath(),new Xn(i).rotateX(-Math.PI/2).translate(Zb,0,0)}function $f(){let n=new Se,e=new an({color:qf,roughness:.7,emissive:qf,emissiveIntensity:.35}),t=new st({color:Xb}),i=new st({color:Yf}),r=new st({color:qb,depthTest:!1}),s=new st({color:Yf,depthTest:!1}),o=[],a=null,l="",u=()=>{for(let h of o)h.parent?.remove(h),h.geometry.dispose();o.length=0,a&&n.remove(a.mesh),a=null},c=(h,f)=>{if(h.length===0)return null;let d=h.map(x=>x.index?x.toNonIndexed():x),g=new se(ca(d),f);return h.forEach(x=>x.dispose()),d.forEach(x=>x.dispose()),o.push(g),n.add(g),g};return{group:n,set(h,f,d){let g=h&&h.length>1?`${f}x${d}:${h.map(E=>`${E.jump?"^":""}${E.r},${E.c}${E.way??""}`).join(" ")}`:"";if(g===l)return!1;if(l=g,u(),!h||h.length<2)return!0;let x=h.map(E=>[ct(E.c,f),ut(E.r,d)]),p=[],m=[],y=[];x.forEach(([E,S],T)=>{p.push(new Fn(ya,8,6).translate(E,Lc,S));let R=Is(h,T);if(!R)return;let[v,M]=x[T+1],L=v-E,z=M-S,V=Math.hypot(L,z),I=new En(ya,ya,V,8,1,!0);I.rotateZ(Math.PI/2),I.rotateY(-Math.atan2(z,L)),I.translate(E+L/2,Lc,S+z/2),p.push(I),T!==0&&(y.push(_a(Zf).rotateY(-xa[R]).translate(E,va,S)),m.push(_a(1).rotateY(-xa[R]).translate(E,Kf,S)))});let _=c(p,e);_&&(_.receiveShadow=!0),c(y,i),c(m,t);let b=oa(h);if(b){let E=new Se,S=new se(_a(Zf).rotateY(-xa[b]),s),T=new se(_a(1).rotateY(-xa[b]).translate(0,Kf-va,0),r);S.renderOrder=10,T.renderOrder=11,o.push(S,T),E.add(S,T),E.position.set(x[0][0],va,x[0][1]),E.scale.setScalar(Ls),n.add(E),a={mesh:E,dir:b}}return!0},pulse(h){return a?(a.mesh.scale.setScalar(Ls*aa(h)),!0):!1},next(){return a?{dir:a.dir,scale:a.mesh.scale.x}:null},dispose(){u(),e.dispose(),t.dispose(),i.dispose(),r.dispose(),s.dispose()}}}var Jf=new qe(.55,.78,1),$b=new qe(1,.93,.82),ba=1.03,Dc=.012,Uc=.3,Ma=.24,jf=.94,Jb=1.8,Nc=`
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,jb=`
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
  float k = (d - uBand) * 5.0;
  float band = uFlash * exp(-k * k);
  a += 0.18 * uFlash + 0.55 * band;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), band) * a, 1.0);
}`,Qb=`
uniform vec3 uColor;
uniform float uA;
varying vec2 vUv;
void main() {
  vec2 e = abs(vUv - 0.5) * 2.0;
  float edge = smoothstep(0.7, 1.0, max(e.x, e.y));
  gl_FragColor = vec4(mix(uColor, vec3(1.0), 0.35 + 0.5 * edge), (0.1 + 0.4 * edge) * uA);
}`,eM=`
uniform vec3 uColor;
uniform float uA;
uniform float uT;
uniform float uStill;
varying vec2 vUv;
void main() {
  float ends = smoothstep(0.0, 0.18, vUv.x) * (1.0 - smoothstep(0.82, 1.0, vUv.x)) * smoothstep(0.0, 0.12, vUv.y) * (1.0 - smoothstep(0.85, 1.0, vUv.y));
  float wave = vUv.y * 16.0 + sin(vUv.x * 9.0 + uT * 2.2) * 1.4 - uT * 2.6;
  float bands = mix(0.5 + 0.5 * (0.5 + 0.5 * sin(wave)), 0.75, uStill);
  gl_FragColor = vec4(uColor * uA * bands * ends, 1.0);
}`,Qf={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};function ep(){let n=new Se,e=new sn(1,1,1),t=new Ht(1,1),i=[],r=[],s=[],o=()=>new $t({vertexShader:Nc,fragmentShader:jb,transparent:!0,depthWrite:!1,blending:mn,toneMapped:!1,uniforms:{uColor:{value:Jf},uH:{value:1},uBand:{value:-1},uFlash:{value:0}}}),a=()=>new $t({vertexShader:Nc,fragmentShader:Qb,transparent:!0,depthWrite:!1,toneMapped:!1,uniforms:{uColor:{value:Jf},uA:{value:0}}}),l=()=>new $t({vertexShader:Nc,fragmentShader:eM,transparent:!0,depthWrite:!1,blending:mn,toneMapped:!1,side:Gt,uniforms:{uColor:{value:$b},uA:{value:0},uT:{value:0},uStill:{value:0}}});function u(h,f,d){let g=h[f];return g||(g=d(),h.push(g),n.add(g)),g.visible=!0,g}function c(h,f,d,g,x,p,m){let[y,_]=Qf[h.face],b=ct(h.at.c,x),E=ut(h.at.r,p),S=Math.atan2(y,_),T=M=>{let L=M.material.uniforms;L.uA.value=(d.still?.04:.055)*g,L.uT.value=d.t,L.uStill.value=d.still?1:0},R=u(s,2*f,()=>new se(t,l()));R.scale.set(1,m,1),R.rotation.set(0,S,0),R.position.set(b+y*(.5+Dc),m/2,E+_*(.5+Dc)),T(R);let v=u(s,2*f+1,()=>new se(t,l()));v.scale.set(1,Uc,1),v.rotation.set(-Math.PI/2,S,0,"YXZ"),v.position.set(b+y*(.5-Uc/2),m+Dc,E+_*(.5-Uc/2)),T(v)}return{group:n,set(h,f,d,g){h.found.forEach((p,m)=>{let y=u(i,m,()=>new se(e,o()));y.scale.set(ba,g*ba,ba),y.position.set(ct(p.at.c,f),g*ba/2-.005,ut(p.at.r,d));let _=y.material.uniforms;_.uH.value=1,_.uBand.value=p.shimmer===null?-1:-.3+1.6*p.shimmer,_.uFlash.value=p.shimmer===null?0:Math.sin(Math.PI*p.shimmer)});for(let p=h.found.length;p<i.length;p++)i[p].visible=!1;h.glass.forEach((p,m)=>{let y=u(r,m,()=>new se(e,a())),[_,b]=Qf[p.face],E=_!==0;y.scale.set(E?Ma:jf,g,E?jf:Ma),y.position.set(ct(p.at.c,f)+_*(.5-Ma/2),g/2,ut(p.at.r,d)+b*(.5-Ma/2));let S=y.material.uniforms;S.uA.value=Jb*p.strength});for(let p=h.glass.length;p<r.length;p++)r[p].visible=!1;let x=h.haze?.faces??[];x.forEach((p,m)=>c(p,m,h,h.haze.strength,f,d,g));for(let p=2*x.length;p<s.length;p++)s[p].visible=!1},clear(){for(let h of[...i,...r,...s])h.visible=!1},dispose(){for(let h of[...i,...r,...s])h.material.dispose();e.dispose(),t.dispose()}}}var tp={found:[],glass:[],haze:null,t:0,still:!1};var np=n=>({found:n.found.map(e=>e.at),glass:n.glass.map(e=>({at:e.at,face:e.face})),haze:n.haze?n.haze.faces.map(e=>({at:e.at,face:e.face})):[],strength:n.haze?.strength??0});var ip=394500,nM=1.15,Fc=Math.PI/180,kc=12,rp=(n,e)=>e.wake!==null?Zo(e.wake):Ms(n,e),sp=.12,iM=400;function rM(n){let e=null;try{e=localStorage.getItem(xd)}catch{e=null}yd(e);let t=new hs({canvas:n.canvas,antialias:!0,powerPreference:"high-performance"});t.shadowMap.enabled=!0,t.shadowMap.type=ec,t.shadowMap.autoUpdate=!1;let i=Od(t),r=new gn;r.background=new qe(ip);let s=new Hn(-1,1,1,-1,.1,200),o=new P,a=new P,l=new P,u=Xf(t),c=kd(i),h=_f(i),f=new Se,d=Hf(),g=Nf(i,d),x=$f(),p=Gf(i),m=Bd(),y=ep(),_=tp;r.add(c.group,h.group,f,g.group,x.group,p.group,y.group);let b=!0,E=0,S=0,T=!1,R=!0,v=0,M=-1e9,L=!1,z=df(),V=z.q,I=1,O=1,X=Xh(F=>n.overlay.prepend(F),Wh(n.icons)),N="solid",H=_n(),G=null,K=null,ee=!0,me=td(),q=0,oe=bs,fe=null,ve=[],Te=new Set,Oe=[],Ie=null,Ce=0,Ge=0,D=!0,pe="",j=!0,ue=!0,Q=!0,de={yaw:0,pitch:75,tx:0,tz:0,zoom:10},ae={...de},A=!0,w=!1,k=()=>n.reducedMotion(),ce=()=>V===0?1:Math.min(globalThis.devicePixelRatio||1,2),re=()=>G?.level.rows??1,ne=()=>G?.level.cols??1,Ae=()=>I/O,be=(F,J)=>Te.has(J)?"water":Ld(F,J),Re=()=>cd(Ae(),ne(),re(),ae.pitch);function Pe(){!v&&b&&(v=requestAnimationFrame(ot))}function Ze(F){Ce=F,ue=!0,Pe()}let le=()=>b&&D&&!document.hidden&&!n.reducedMotion();function et(){Ge&&clearTimeout(Ge),Ge=0,le()&&(Ge=setTimeout(()=>{Ge=0,le()&&(G&&(it()||x.next())?Ze(Ce+1/kc):Ce+=1/kc,et())},1e3/kc))}function it(){Ye();let F=J=>(o.copy(J).project(s),Math.abs(o.x)<1.05&&Math.abs(o.y)<1.05);return(Ie?.anchors??[]).some(F)||g.looping().some(J=>F(J.position))||Oe.some(J=>!!J?.userData?.loop&&F(J.position))}function Ye(){let F=de.yaw*Fc,J=de.pitch*Fc,he=de.zoom/2,_e=Ae(),ze=id(de.pitch,de.zoom);s.position.set(de.tx+Math.sin(F)*Math.cos(J)*ze,te+Math.sin(J)*ze,de.tz+Math.cos(F)*Math.cos(J)*ze),s.up.set(-Math.sin(F),0,-Math.cos(F)),s.lookAt(de.tx,te,de.tz),s.far=ze+160,s.left=-he*_e,s.right=he*_e,s.top=he,s.bottom=-he,s.updateProjectionMatrix(),s.updateMatrixWorld()}function Fe(){w?(A&&fe&&(ae.tx=ct(fe.c,ne()),ae.tz=ut(fe.r,re())),ae.zoom=Qo(ae.zoom,Re())):(ae.tx=ae.tz=0,ae.zoom=ld(Ae(),ne(),re(),ae.pitch,ae.yaw)),Object.assign(ae,jo(ae,ne(),re(),Ae()))}function Le(){let{hero:F,rest:J}=g.seen();if(N==="ghosted"&&G){let he=ne(),_e=re();Oe.forEach((ze,Ue)=>{let we=ze?.userData;!we||we.h<=0||J.push({x:ct(Ue%he,he),z:ut(Math.floor(Ue/he),_e),half:we.half,h:we.h})})}return qd(N,F,J)}function je(){Ie?.shadows(V>=3),Q=!0,At()}function ot(F){if(v=0,!b||T){L=!1;return}let J=F-M;M=F;let he=pf(L,J);if(he!==null){let we=ff(z,he);we!==V&&(V=we,je())}let _e=he!==null?Math.min(.1,J/1e3):1/60;Fe();let ze=rd(de,ae,_e,k());if(ze&&(j=!0),Ye(),Ee.setView(de.yaw,de.pitch),j&&(h.aim(s,Le()),j=!1),ze=h.ease(_e,k())||ze,g.ease(_e,k())&&(ze=!0,Q=!0),p.frame(F)&&(ze=!0,Q=!0),Mt(F)&&(ze=!0,Q=!0),ue){c.loop(Ce),Ie?.loop(Ce),g.loop(Ce),p.loop(Ce,k()),x.pulse(Ce);for(let we of Oe)we?.userData?.loop?.(Ce);ue=!1}if(Q&&(t.shadowMap.needsUpdate=!0,Q=!1),u.render(r,s,V>=2),d.group.children.length){let we=d.place(s,de.pitch,Ce,k(),O/de.zoom);tt(we),t.autoClear=!1,t.render(d.scene,s),t.autoClear=!0}m.empty()||(t.autoClear=!1,t.render(m.scene,s),t.autoClear=!0),U();let Ue=`${de.yaw} ${de.tx} ${de.tz} ${de.zoom} ${I} ${O}`;Ue!==pe&&(pe=Ue,De?.view(de,Ae())),E++,R||(R=!0,n.levelDrawn?.()),L=ze,ze&&Pe()}function Mt(F){if(!G||!K)return!1;let J=oe=me.at(G,K,F,k(),ee);return G.terrain.forEach((he,_e)=>{let ze=Oe[_e]?.userData;ze?.open&&(he==="gate"?ze.open(J.bars.get(_e)??(G.relicsLeft===0?1:0)):he==="exit"?(J.wake!==null&&ze.wake?ze.wake(J.wake):ze.open(Ms(G,J)),Ie?.portal(_e,rp(G,J))):ze.open(J.doors.get(_e)??(he==="floor"?1:0)))}),J.hoof!==q&&(q=J.hoof,lt(G,K)),J.busy}function tt(F){let J=de.zoom/2,he=J*Ae();a.setFromMatrixColumn(s.matrixWorld,0),l.setFromMatrixColumn(s.matrixWorld,1);for(let _e of d.group.children){if(o.copy(_e.userData.foot).project(s),Math.abs(o.x)>1||Math.abs(o.y)>1)continue;o.copy(_e.position).project(s);let[ze,Ue]=ef(o.x*he,o.y*J,Cs*F,ta*F,he,J,Qd);_e.position.addScaledVector(a,ze).addScaledVector(l,Ue)}}function ge(){let F=J=>(o.copy(J).project(s),[(o.x+1)/2*I,(1-o.y)/2*O]);return d.group.children.map(J=>{let he=J.userData;return{kind:he.kind,at:F(J.position),foot:F(he.foot),cell:O/de.zoom}})}function U(){let F=G&&K?Hh(G,K):[];X.place(F.map(J=>{let he=ct(J.c,ne()),_e=ut(J.r,re());return o.set(he,te+nM,_e).project(s),{bubble:J,x:(o.x+1)/2*I,head:(1-o.y)/2*O,cell:O/de.zoom}}),I,O)}function Me(F,J){return o.set(ct(F,ne()),te,ut(J,re())).project(s),[(o.x+1)/2*I,(1-o.y)/2*O]}let xe=new Hn(-1,1,1,-1,.1,200),ke=null,Be=new Uint8Array(0);function ht(F,J,he,_e,ze){if(!G)return!1;let Ue=ne(),we=re(),gt=F.width,Xe=F.height,xt=(Pt,jn,Bn)=>Bn<=jn?(Bn-1)/2:Math.max((jn-1)/2,Math.min(Bn-1-(jn-1)/2,Pt)),jt=ct(xt(he,_e,Ue),Ue),hn=ut(xt(J,ze,we),we),Qt=75*Fc,_t=40;xe.position.set(jt,te+Math.sin(Qt)*_t,hn+Math.cos(Qt)*_t),xe.up.set(0,0,-1),xe.lookAt(jt,te,hn);let Xt=_e/2,Ct=ze*Math.sin(Qt)/2;Object.assign(xe,{left:-Xt,right:Xt,top:Ct,bottom:-Ct}),xe.updateProjectionMatrix(),xe.updateMatrixWorld(),(!ke||ke.width!==gt||ke.height!==Xe)&&(ke?.dispose(),ke=new rn(gt,Xe),ke.texture.colorSpace=pt,Be=new Uint8Array(gt*Xe*4)),t.toneMapping=Vo,t.toneMappingExposure=1.4,t.setRenderTarget(ke),t.render(r,xe),t.setRenderTarget(null),t.toneMapping=Nn,t.readRenderTargetPixels(ke,0,0,gt,Xe,Be);let yt=new ImageData(gt,Xe);for(let Pt=0;Pt<Xe;Pt++)yt.data.set(Be.subarray((Xe-1-Pt)*gt*4,(Xe-Pt)*gt*4),Pt*gt*4);return F.getContext("2d").putImageData(yt,0,0),!0}function dt(F){let J=F.width,he=F.height,_e=new gn,ze=Cc.theseus(i);_e.add(ze,new Wr(16773596,2759954,1.6));let Ue=new hi(16769720,2.4);Ue.position.set(1.5,3,4),_e.add(Ue);let we=new On().setFromObject(ze),gt=we.max.y,Xe=Math.max(we.max.y-we.min.y,we.max.x-we.min.x)*.8,xt=(we.min.x+we.max.x)/2,jt=(we.min.z+we.max.z)/2,hn=gt-Xe*.46,Qt=new Hn(-Xe/2,Xe/2,Xe/2,-Xe/2,.1,50);Qt.position.set(xt+3,hn+3,jt+9),Qt.lookAt(xt,hn,jt),Qt.updateMatrixWorld();let _t=new rn(J,he);_t.texture.colorSpace=pt;let Xt=new Uint8Array(J*he*4),Ct=t.getClearAlpha();t.setClearColor(0,0),t.toneMapping=Vo,t.toneMappingExposure=1.4,t.setRenderTarget(_t),t.clear(),t.render(_e,Qt),t.setRenderTarget(null),t.toneMapping=Nn,t.setClearColor(ip,Ct),t.readRenderTargetPixels(_t,0,0,J,he,Xt),_t.dispose(),Oi(ze,i);let yt=new ImageData(J,he);for(let Pt=0;Pt<he;Pt++)yt.data.set(Xt.subarray((he-1-Pt)*J*4,(he-Pt)*J*4),Pt*J*4);F.getContext("2d").putImageData(yt,0,0)}function At(){let F=n.canvas.clientWidth,J=n.canvas.clientHeight;if(F<=0||J<=0)return;I=F,O=J;let he=ce();t.setPixelRatio(he),t.setSize(F,J,!1),u.setSize(Math.round(F*he),Math.round(J*he)),De?.fit(n.overlay.clientWidth||F,n.overlay.clientHeight||J),w||(Fe(),de.zoom=ae.zoom),j=!0}function Ut(F){let J=Oe[F];J&&(f.remove(J),Oi(J,i));let he=ne(),_e=re(),ze=Math.floor(F/he),Ue=F%he,we=(xt,jt)=>xt<0||jt<0||xt>=_e||jt>=he||ve[xt*he+jt]==="wall",gt=Af[ve[F]]({kit:i,r:ze,c:Ue,wall:we}),Xe=gt.userData;if(!gt.children.length){Oe[F]=null;return}gt.position.set(ct(Ue,he),0,ut(ze,_e)),Xe.tall&&N==="low"&&(gt.scale.y=nr/qn),f.add(gt),Oe[F]=gt}function lt(F,J){fe&&(fe.r!==J.player.r||fe.c!==J.player.c)&&(A=!0),fe={r:J.player.r,c:J.player.c};let he=g.set(Nd(F,J,q),ne(),re(),k()),_e=g.hero();return _e&&Ie?.hero(_e.position.x,_e.position.z),he}function zt(){for(let F of Oe)F&&(f.remove(F),Oi(F,i));Oe=[],Ie&&(r.remove(Ie.group),Ie.dispose(),Ie=null),g.clear(),p.clear(),x.set(null,0,0)}function un(F){zt();let J=++S;G=F;let{rows:he,cols:_e}=F.level;Te=new Set(yc(F.level.terrain,F.terrain)),ve=F.terrain.map((Ue,we)=>be(F,we)),p.set([...Te],_e,he,!1),c.set(ve,he,_e),h.build(ve,he,_e),Oe=ve.map(()=>null);for(let Ue=0;Ue<ve.length;Ue++)Ut(Ue);Ie=Pc(i,ve,he,_e,h.list()),Ie.setMode(N),Ie.shadows(V>=3),r.add(Ie.group),Ds(z),fe=null,lt(F,{player:F.player,minotaur:F.minotaur,hazards:F.hazards.map(Ue=>({kind:Ue.kind,at:Ue.at}))}),A=!0,w=!1,ae.yaw=0,ae.pitch=75,Fe(),Object.assign(de,ae),j=ue=Q=!0,De?.paint(F,{player:F.player,minotaur:F.minotaur,hazards:F.hazards.map(Ue=>({kind:Ue.kind,at:Ue.at}))},null),T=!0,R=!1;let ze=()=>{J===S&&(T=!1,Pe())};t.compileAsync(r,s).then(ze,ze),Ge||et()}function Yr(F,J,he=!1){let _e=F.state;K=F.figures,ee=F.done??!0,(!G||_e.level!==G.level&&!he)&&un(_e);let ze=G,Ue=Gd(ze,_e);ze.relicsLeft!==_e.relicsLeft&&_e.terrain.forEach((Ct,yt)=>{(Ct==="gate"||Ct==="exit")&&Ue.push(yt)});let we=!1,gt=!1,{rows:Xe,cols:xt}=_e.level,jt=new Set,hn=yc(_e.level.terrain,_e.terrain);Te=new Set(hn);for(let Ct of Ue){let yt=be(_e,Ct),Pt=ve[Ct];if(yt!==Pt){if(Ts[yt]!==Ts[Pt]&&(we=!0),yt==="wall"!=(Pt==="wall")){gt=!0;let jn=Math.floor(Ct/xt),Bn=Ct%xt;for(let[Ea,Ta]of[[-1,0],[1,0],[0,-1],[0,1]])jn+Ea>=0&&jn+Ea<Xe&&Bn+Ta>=0&&Bn+Ta<xt&&jt.add((jn+Ea)*xt+Bn+Ta)}ve[Ct]=yt,Ut(Ct),Ie?.piece(Ct,yt)}}for(let Ct of jt)Ue.includes(Ct)||Ut(Ct);we&&c.set(ve,Xe,xt),gt&&(h.build(ve,Xe,xt),h.setMode(N)),G=_e;let Qt=lt(_e,F.figures),_t=x.set(J,xt,Xe),Xt=p.set(hn,xt,Xe,!k());Ue.length===0&&!Qt&&!_t&&!Xt&&_e===ze||((Ue.length||Qt||Xt)&&(j=!0,Q=!0),De?.paint(_e,F.figures,J),Pe(),Ge||et())}let Kr=F=>F.map((J,he)=>J==="wall"||J.startsWith("door")||J.startsWith("gate")||J==="exit"||J==="fire"?`${he}${J}`:"").join(","),mi="",$n=0;function rr(F){let J={player:F.player,minotaur:F.minotaur,hazards:F.hazards.map(he=>({kind:he.kind,at:he.at}))};if(!G||G.level.rows!==F.level.rows||G.level.cols!==F.level.cols){K=J,ee=!0,un(F),mi=Kr(ve),or(null);return}Yr({state:F,figures:J,done:!0},null,!0),Kr(ve)!==mi&&($n&&clearTimeout($n),$n=setTimeout(()=>{if($n=0,!G||!Ie)return;r.remove(Ie.group),Ie.dispose(),Ie=Pc(i,ve,re(),ne(),h.list()),Ie.setMode(N),Ie.shadows(V>=3);let he=g.hero();he&&Ie.hero(he.position.x,he.position.z),r.add(Ie.group),mi=Kr(ve),Q=ue=!0,Pe()},iM))}function sr(F,J){if(!G)return null;let he=n.canvas.getBoundingClientRect();return he.width<=0||he.height<=0?null:ud(de,Ae(),(F-he.left)/he.width-.5,.5-(J-he.top)/he.height,ne(),re())}let Jn=null;function or(F){F===Jn||F&&Jn&&F.r===Jn.r&&F.c===Jn.c||(Jn=F,m.hover(F,ne(),re()),Pe())}let ar=n.painter,wa=ar&&{stroke(F,J,he){let _e=sr(F,J);or(_e),_e&&ar.stroke(_e,he)},end(){ar.end()},drop(){or(null),ar.drop()},hover(F){or(F?sr(F.x,F.y):null)}};function C(F){let J=H.cutaway&&F==="solid"?"ghosted":F;N=J,h.setMode(J),Ie?.setMode(J);for(let he of Oe)he&&he.userData.tall&&(he.scale.y=J==="low"?nr/qn:1);j=Q=!0,B(_)}function B(F){_=F,y.set(F,ne(),re(),N==="low"?nr:qn),Pe()}function Y(){A=!0,w=!1,ae.yaw=od(0,de.yaw),ae.pitch=75,k()&&(de.yaw=ae.yaw,de.pitch=ae.pitch)}let Z={turn(F,J){ae.yaw+=F,(!J||k())&&(de.yaw+=F),j=!0,Pe()},pan(F,J){A=!1;let he=de.zoom/O;for(let _e of[de,ae])Object.assign(_e,jo(sd(_e,F,J,he),ne(),re(),Ae()));j=!0,Pe()},zoom(F,J,he,_e){w=!0;let ze=Re();if(_e)ae.zoom=Qo(ae.zoom*F,ze);else{let Ue=Math.abs(J)>sp||Math.abs(he)>sp;Ue&&(A=!1);let we=Ue?J*Ae():0,gt=Ue?he:0;for(let Xe of[de,ae])Object.assign(Xe,jo(hd(Xe,F,we,gt,ze),ne(),re(),Ae()))}j=!0,Pe()},tilt(F,J){ae.pitch=Ss(ae.pitch+F),(!J||k())&&(de.pitch=ae.pitch),j=!0,Pe()},reset(){Y(),j=!0,Pe()}},W=document.createElement("div");W.className="modern-ui",n.overlay.append(W);let Ee=Id(n.canvas,W,n,Z,wa),De=!n.painter&&n.atlas&&n.image?hf(W,n.atlas,n.image,{blocked:()=>n.blocked(),look(F){n.gesture(),A=!1,ae.tx=F.x,ae.tz=F.z,Pe()}}):null,He=()=>{Ds(z),et()};document.addEventListener("visibilitychange",He);let We=typeof IntersectionObserver=="function"?new IntersectionObserver(F=>{D=F.some(J=>J.isIntersecting),et()}):null;We?.observe(n.canvas);let Qe=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,Ke=()=>{ue=!0,Pe(),et()};return Qe?.addEventListener("change",Ke),At(),{level:un,show:(F,J)=>Yr(F,J),edit:rr,marks(F){m.marks(F,ne(),re()),Pe()},cellUnder:sr,hovered:()=>Jn,walls:C,cues:B,shownCues:()=>np(_),yaw:()=>de.yaw,zoom:()=>de.zoom,pitch:()=>de.pitch,setView(F,J){Z.turn(F-ae.yaw,!1),Z.tilt(J-ae.pitch,!1),Fe(),Object.assign(de,ae)},following:()=>A,reset:Z.reset,resize(){At(),Pe()},setActive(F){b=F,W.hidden=!F,F?Pe():(v&&cancelAnimationFrame(v),v=0,L=!1),et()},frames:()=>E,opening:()=>({bars:[...oe.bars.values()],portal:G?rp(G,oe):0,doors:[...oe.doors.values()],hoof:oe.hoof}),quality:()=>V,fps:()=>la(z.gaps,2e3),floating:()=>p.cells(),routeNext:()=>x.next(),markers:ge,cellAt:Me,bubbles:()=>X.shown(),splashing:()=>p.splashing(),minimap(F){De?.show(F)},showTips:()=>Ee.showTips(),snapshot:ht,portrait:dt,dispose(){v&&cancelAnimationFrame(v),v=0,$n&&clearTimeout($n),b=!1,et(),document.removeEventListener("visibilitychange",He),We?.disconnect(),Qe?.removeEventListener("change",Ke),Ee.dispose(),De?.dispose(),W.remove(),zt(),c.dispose(),h.dispose(),g.dispose(),p.dispose(),x.dispose(),y.dispose(),d.dispose(),m.dispose(),ke?.dispose(),u.dispose(),i.dispose(),t.dispose()}}}export{rM as createModernBoard};
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=modern.js.map
