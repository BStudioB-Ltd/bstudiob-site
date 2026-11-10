(() => {
  'use strict';
  const data=window.MEMGOS_DATA, canvas=document.getElementById('view'), error=document.getElementById('error');
  const gl=canvas.getContext('webgl2',{antialias:true});
  if(!gl||!data){error.hidden=false;error.textContent='This viewer requires WebGL 2 and the accompanying review-data.js file.';return;}
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  try {
    const vs=shader(gl.VERTEX_SHADER,`#version 300 es
      precision highp float;
      layout(location=0) in vec3 p; layout(location=1) in vec3 n;
      layout(location=2) in vec4 r0; layout(location=3) in vec4 r1; layout(location=4) in vec4 r2;
      layout(location=5) in vec2 meta; uniform mat4 mvp; uniform float current; out vec3 col; out float light;
      void main(){if(meta.x>current){gl_Position=vec4(2.,2.,2.,1.);return;}
        vec3 w=vec3(dot(r0.xyz,p)+r0.w,dot(r1.xyz,p)+r1.w,dot(r2.xyz,p)+r2.w);
        vec3 nn=normalize(vec3(dot(r0.xyz,n),dot(r1.xyz,n),dot(r2.xyz,n))); nn=vec3(nn.x,-nn.z,-nn.y);
        vec3 c=vec3(.63,.65,.68); if(meta.y<1.)c=vec3(.15,.16,.18); else if(meta.y<5.)c=vec3(.76,.13,.12); else if(meta.y<15.)c=vec3(.88,.65,.16); else if(meta.y>71.5)c=vec3(.40,.41,.43);
        col=abs(meta.x-current)<.1?vec3(.03,.30,.88):c; light=.48+.52*abs(dot(nn,normalize(vec3(.5,-.4,.8)))); gl_Position=mvp*vec4(w.x,-w.z,-w.y,1.);}`);
    const fs=shader(gl.FRAGMENT_SHADER,`#version 300 es
      precision highp float; in vec3 col; in float light; out vec4 color; void main(){color=vec4(col*light,1.);}`);
    const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
    const batches=[];
    for(const [name,vertices] of Object.entries(data.meshes)){
      const vao=gl.createVertexArray();gl.bindVertexArray(vao);
      const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
      for(let j=0;j<2;j++){gl.enableVertexAttribArray(j);gl.vertexAttribPointer(j,3,gl.FLOAT,false,24,j*12);}
      const ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);const rows=new Float32Array(data.instances[name]);gl.bufferData(gl.ARRAY_BUFFER,rows,gl.STATIC_DRAW);
      for(let j=0;j<3;j++){gl.enableVertexAttribArray(2+j);gl.vertexAttribPointer(2+j,4,gl.FLOAT,false,56,j*16);gl.vertexAttribDivisor(2+j,1);}
      gl.enableVertexAttribArray(5);gl.vertexAttribPointer(5,2,gl.FLOAT,false,56,48);gl.vertexAttribDivisor(5,1);
      batches.push({vao,count:vertices.length/6,instances:rows.length/14});
    }
    const norm=v=>{const l=Math.hypot(...v);return v.map(x=>x/l);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
    function view(eye,target){const z=norm(eye.map((x,i)=>x-target[i])),x=norm(cross([0,0,1],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
    function projection(aspect){const f=1/Math.tan(Math.PI/8),near=1,far=20000;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
    function multiply(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
    let yaw=.8,pitch=.65,distance=1800,step=data.steps.length,clearHighlight=true;
    let target=[0,-420,100];const range=document.getElementById('progress'),jump=range,heading=document.getElementById('heading'),part=document.getElementById('part'),status=document.getElementById('status');
    range.max=jump.max=String(data.steps.length);const names={'3007.dat':'Brick 2 × 8','3008.dat':'Brick 1 × 8','2456.dat':'Brick 2 × 6','3001.dat':'Brick 2 × 4','3002.dat':'Brick 2 × 3','3003.dat':'Brick 2 × 2','3004.dat':'Brick 1 × 2','3005.dat':'Brick 1 × 1','3010.dat':'Brick 1 × 4','3020.dat':'Plate 2 × 4','3022.dat':'Plate 2 × 2','3023.dat':'Plate 1 × 2','3024.dat':'Plate 1 × 1','3034.dat':'Plate 2 × 8','3039.dat':'Slope 2 × 2','3040b.dat':'Slope 1 × 2','3460.dat':'Plate 1 × 8','3700.dat':'Technic holder','3708.dat':'Technic axle 12L','3710.dat':'Plate 1 × 4','60479.dat':'Plate 1 × 12','2996c01.dat':'Wheel and tyre assembly','32123b.dat':'Technic half bush','3035.dat':'Plate 4 × 8'};
    function update(){range.value=step;if(step===0){heading.textContent='Ready to build';part.textContent='';status.textContent='Press Play or move the slider to explore the sequence.';draw();return;}const s=data.steps[step-1];heading.textContent=`Step ${step} of ${data.steps.length}`;part.textContent=s.operation==='section'?'Join the separately built 31-piece section':`${names[s.parts[0].part]||s.parts[0].part} · ${s.parts[0].part}`;status.className=s.operation==='seed'?'warn':'meta';status.textContent=s.instruction|| (s.operation==='seed'?'This begins a separate group in the abstract plan. Its physical support and join are not established.':s.operation==='section'?'The separately built section is shown as one event. Its physical fit and support are unverified.':s.operation==='support'?'Experimental interlocked support placement.':'This is a proposed digital placement; physical fit and support remain unverified.');draw();}
    function draw(){const ratio=Math.min(window.devicePixelRatio||1,2),w=Math.max(1,Math.floor(canvas.clientWidth*ratio)),h=Math.max(1,Math.floor(canvas.clientHeight*ratio));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.enable(gl.DEPTH_TEST);gl.clearColor(.84,.85,.86,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const eye=[target[0]+distance*Math.cos(pitch)*Math.sin(yaw),target[1]-distance*Math.cos(pitch)*Math.cos(yaw),target[2]+distance*Math.sin(pitch)];gl.uniformMatrix4fv(gl.getUniformLocation(program,'mvp'),false,multiply(projection(w/h),view(eye,target)));gl.uniform1f(gl.getUniformLocation(program,'current'),step+(clearHighlight ? .25 : 0));for(const b of batches){gl.bindVertexArray(b.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,b.count,b.instances);}gl.bindVertexArray(null);}
    function setStep(v){if(!Number.isFinite(v))return;clearHighlight=false;step=Math.min(data.steps.length,Math.max(0,Math.round(v)));update();}
    const play=document.getElementById('play');let timer=null;
    function stop(){if(timer!==null)clearInterval(timer);timer=null;play.textContent='Play build';}
    play.onclick=()=>{if(timer!==null){stop();return;}if(step===data.steps.length)setStep(0);play.textContent='Pause';timer=setInterval(()=>{if(step>=data.steps.length){stop();return;}setStep(Math.min(data.steps.length,step+10));},120);};
    const underneath=data.steps.map((item,index)=>item.instruction?.includes('Proposed approach from below')?index+1:0).filter(Boolean);
    document.getElementById('next-underneath').onclick=()=>{stop();if(underneath.length)setStep(underneath.find(position=>position>step)??underneath[0]);};
    document.getElementById('prev').onclick=()=>{stop();setStep(step-1);};
    document.getElementById('next').onclick=()=>{stop();setStep(step+1);};
    range.oninput=()=>{stop();setStep(Number(range.value));};
    document.getElementById('reset').onclick=()=>{stop();setStep(0);target=[0,-420,100];yaw=.8;pitch=.65;distance=1800;draw();};
    let pointer=null;canvas.onpointerdown=e=>{pointer=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(!pointer)return;yaw+=(e.clientX-pointer[0])*.008;pitch=Math.max(-1.45,Math.min(1.45,pitch+(e.clientY-pointer[1])*.008));pointer=[e.clientX,e.clientY];draw();};canvas.onpointerup=canvas.onpointercancel=()=>{pointer=null;};canvas.onwheel=e=>{e.preventDefault();distance=Math.min(6000,Math.max(350,distance*Math.exp(e.deltaY*.001)));draw();};window.addEventListener('resize',draw);update();status.textContent='Completed digital model. Press Play to watch the recorded sequence from the beginning.';
  }catch(e){error.hidden=false;error.textContent='The 3D viewer could not start: '+e.message;}
})();
