/* Procedural chrome sculpture. No downloads, textures or third-party runtime. */
(function bootChrome() {
  'use strict';
  const canvas = document.querySelector('.ma-chrome-canvas');
  window.MyDayChrome={ready:true,mode:'fallback',refresh(){}};
  if (!canvas){window.MyDayChrome={ready:false,mode:'pending',refresh:bootChrome};return}
  const stage = canvas.closest('.ma-chrome-stage');
  let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power',premultipliedAlpha:false})}catch{return}
  if (!gl) return;
  const vs = `attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uModel;uniform mat4 uProjection;varying vec3 vPosition;varying vec3 vNormal;void main(){vec4 p=uModel*vec4(aPosition,1.0);vPosition=p.xyz;vNormal=mat3(uModel)*aNormal;gl_Position=uProjection*vec4(p.xyz-vec3(0.0,0.0,6.5),1.0);}`;
  const fs = `precision mediump float;varying vec3 vPosition;varying vec3 vNormal;uniform float uLight;
  void main(){vec3 n=normalize(vNormal);vec3 v=normalize(vec3(0.0,0.0,6.5)-vPosition);vec3 r=reflect(-v,n);
  float softbox=pow(max(dot(r,normalize(vec3(-0.6,0.7,0.8))),0.0),18.0);
  float s=(r.y+0.18+0.22*sin(r.x*3.0))/0.075;float strip=exp(-s*s);
  float l=(r.y-0.55+0.12*r.x)/0.11;float lower=exp(-l*l);
  float rim=pow(1.0-clamp(dot(n,v),0.0,1.0),3.0);
  float reflection=0.018+softbox*1.6+strip*0.94+lower*0.72+rim*0.48;
  reflection+=0.06*smoothstep(-0.7,0.7,r.x)*max(r.z,0.0);
  reflection=mix(reflection,0.17+reflection*0.83,uLight);vec3 color=vec3(pow(clamp(reflection,0.0,1.0),0.82));
  color*=mix(vec3(0.90,0.93,0.96),vec3(1.0),min(reflection,1.0));gl_FragColor=vec4(color,1.0);}`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw Error('Chrome shader unavailable')}return s}
  let program;
  try{program=gl.createProgram();const vertex=shader(gl.VERTEX_SHADER,vs),fragment=shader(gl.FRAGMENT_SHADER,fs);gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Chrome shader unavailable')}catch{if(program)gl.deleteProgram(program);return}
  const TAU=Math.PI*2,segments=196,sides=32,positions=[],normals=[],indices=[];
  const add=(a,b)=>a.map((v,i)=>v+b[i]),scale=(a,k)=>a.map(v=>v*k),sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const unit=a=>scale(a,1/(Math.hypot(...a)||1));
  function center(u){const r=1.18+0.24*Math.cos(3*u);return[r*Math.cos(u),r*Math.sin(u),0.62*Math.sin(2*u)]}
  function surface(u,v){const c=center(u),t=unit(sub(center(u+.001),center(u-.001))),normal=unit(cross(t,[0,0,1])),binormal=unit(cross(t,normal)),radius=.66+.12*Math.sin(3*u+.4);return add(c,add(scale(normal,Math.cos(v)*radius),scale(binormal,Math.sin(v)*radius*.92)))}
  for(let i=0;i<=segments;i++)for(let j=0;j<=sides;j++){const u=i/segments*TAU,v=j/sides*TAU,p=surface(u,v),du=sub(surface(u+.001,v),surface(u-.001,v)),dv=sub(surface(u,v+.001),surface(u,v-.001)),normal=unit(cross(dv,du));positions.push(...p);normals.push(...normal)}
  for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1)}
  gl.useProgram(program);
  function attribute(name,data){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0)}
  attribute('aPosition',positions);attribute('aNormal',normals);
  const index=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  const modelLocation=gl.getUniformLocation(program,'uModel'),projectionLocation=gl.getUniformLocation(program,'uProjection'),lightLocation=gl.getUniformLocation(program,'uLight');
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
  let frame=0,last=0,rotation=0,visible=true,pointerX=0,pointerY=0,lost=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function animated(){return (!document.documentElement.dataset.cover||document.documentElement.dataset.cover==='sculpture')&&visible&&!document.hidden&&stage.isConnected&&!reduced.matches&&document.documentElement.dataset.motion!=='reduced'&&!lost}
  function matrix(x,y,z){const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z),m=[cy*cz,cx*sz+sx*sy*cz,sx*sz-cx*sy*cz,0,-cy*sz,cx*cz-sx*sy*sz,sx*cz+cx*sy*sz,0,sy,-sx*cy,cx*cy,0,0,0,0,1];for(let i=0;i<12;i++)m[i]*=.88;return new Float32Array(m)}
  function draw(){if(lost)return;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const ratio=Math.min(devicePixelRatio||1,1.5),width=Math.min(800,Math.round(rect.width*ratio)),height=Math.min(520,Math.round(rect.height*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}gl.viewport(0,0,width,height);const f=1/Math.tan(.64/2),aspect=rect.width/rect.height,near=.1,far=30;gl.uniformMatrix4fv(projectionLocation,false,new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]));gl.uniformMatrix4fv(modelLocation,false,matrix(-.35+pointerY*.14,.58+rotation+pointerX*.12,-.58));gl.uniform1f(lightLocation,document.documentElement.dataset.theme==='light'?1:0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0)}
  function tick(time){frame=0;if(!animated()){draw();return}if(time-last>32){rotation+=.002;last=time;draw()}frame=requestAnimationFrame(tick)}
  function resume(){draw();if(animated()&&!frame)frame=requestAnimationFrame(tick)}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;if(frame)cancelAnimationFrame(frame);frame=0;stage.classList.remove('has-webgl');window.MyDayChrome.mode='fallback'});
  stage.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!animated())return;const r=stage.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5});
  stage.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0});
  const resize=new ResizeObserver(resume);resize.observe(stage);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume()},{threshold:0.02});intersection.observe(stage);
  new MutationObserver(resume).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion','data-theme','data-cover']});
  document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
  window.MyDayChrome={ready:true,mode:'webgl',refresh:resume};stage.classList.add('has-webgl');resume();
})();
