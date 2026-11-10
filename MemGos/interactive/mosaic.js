(() => {
  'use strict';
  const canvas=document.querySelector('#mosaic'), ctx=canvas.getContext('2d');
  const range=document.querySelector('#mosaic-progress'), label=document.querySelector('#mosaic-label'), button=document.querySelector('#mosaic-play');
  const image=new Image();let timer=null;
  function draw(){const count=Number(range.value),size=canvas.width/4;ctx.fillStyle='#e4e8e3';ctx.fillRect(0,0,canvas.width,canvas.height);if(image.complete&&image.naturalWidth){for(let i=0;i<count;i++){const x=i%4,y=Math.floor(i/4);ctx.drawImage(image,x*image.width/4,y*image.height/4,image.width/4,image.height/4,x*size,y*size,size,size);}}label.textContent=`${count} of 16 sections`;}
  function stop(){if(timer!==null)clearInterval(timer);timer=null;button.textContent='Play mosaic';}
  image.onload=draw;image.onerror=()=>{label.textContent='Mosaic preview could not load.'};image.src='radcliffe-mosaic.png';
  button.onclick=()=>{if(timer!==null){stop();return;}if(Number(range.value)===16)range.value=0;button.textContent='Pause';draw();timer=setInterval(()=>{range.value=Number(range.value)+1;draw();if(Number(range.value)===16)stop();},350);};
  range.oninput=()=>{stop();draw();};document.querySelector('#mosaic-reset').onclick=()=>{stop();range.value=0;draw();};draw();
})();
