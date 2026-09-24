import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {findRegion,mapAnatomy,type RegionId} from './brain-data';
type State={active:RegionId[];selected:RegionId|null;onSelect:(id:RegionId)=>void};
type Triangle={points:T.Vector3[];id:RegionId|undefined};
// CPU projection of the same anatomical mesh for browsers without WebGL.
export function createBrainFallback(host:HTMLElement,state:()=>State,status:(s:string)=>void){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx){status('This browser cannot display the brain. Chat still works.');return ()=>{}}
 host.appendChild(canvas);let disposed=false,triangles:Triangle[]=[],yaw=0,pitch=0,zoom=1,dirty=true,last='';
 let hitTriangles:{xy:number[];depth:number;id:RegionId}[]=[];
 const camera=new T.PerspectiveCamera(36,1,.01,100);camera.position.set(-5.6,2.4,5.8);camera.lookAt(0,0,0);camera.updateMatrixWorld();
 const draco=new DRACOLoader().setDecoderPath('/draco/');const loader=new GLTFLoader().setDRACOLoader(draco);
 status('Loading brain…');
 loader.load('/models/brain.glb',gltf=>{
  if(disposed)return;gltf.scene.updateMatrixWorld(true);const meshes:T.Mesh[]=[],box=new T.Box3();
  gltf.scene.traverse(o=>{if(!(o instanceof T.Mesh))return;const ex=o.userData.bx_cat?o.userData:o.parent?.userData||{};if(mapAnatomy(ex)||ex.bx_cat==='cortex'){meshes.push(o);box.expandByObject(o)}});
  const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3()),scale=3.8/Math.max(size.x,size.y,size.z);
  for(const mesh of meshes){const ex=mesh.userData.bx_cat?mesh.userData:mesh.parent?.userData||{},id=mapAnatomy(ex),p=mesh.geometry.getAttribute('position'),idx=mesh.geometry.index;const count=idx?idx.count:p.count;const step=Math.max(1,Math.ceil(count/3/150));
   for(let i=0;i+2<count;i+=3*step){const points=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,idx?idx.getX(i+k):i+k).applyMatrix4(mesh.matrixWorld).sub(center).multiplyScalar(scale));triangles.push({points,id})}
  }
  gltf.scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()}});status('');dirty=true;
 },undefined,()=>{if(!disposed)status('The brain could not load. Refresh to retry.')});
 const resize=new ResizeObserver(()=>{const ratio=Math.min(devicePixelRatio,1.5);canvas.width=host.clientWidth*ratio;canvas.height=host.clientHeight*ratio;canvas.style.width=host.clientWidth+'px';canvas.style.height=host.clientHeight+'px';camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();dirty=true});resize.observe(host);
 let start=[0,0],previous=[0,0],dragging=false,moved=0;
 const down=(e:PointerEvent)=>{start=previous=[e.clientX,e.clientY];moved=0;dragging=true;canvas.setPointerCapture(e.pointerId)};
 const move=(e:PointerEvent)=>{if(!dragging)return;const dx=e.clientX-previous[0],dy=e.clientY-previous[1];yaw+=dx*.008;pitch=Math.max(-1.2,Math.min(1.2,pitch+dy*.008));moved+=Math.abs(dx)+Math.abs(dy);previous=[e.clientX,e.clientY];dirty=true};
 const up=(e:PointerEvent)=>{dragging=false;if(moved>5)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;
  const inside=(p:number[])=>{const cross=(ax:number,ay:number,bx:number,by:number)=>(x-bx)*(ay-by)-(ax-bx)*(y-by);const a=cross(p[0],p[1],p[2],p[3]),b=cross(p[2],p[3],p[4],p[5]),c=cross(p[4],p[5],p[0],p[1]);return !((a<0||b<0||c<0)&&(a>0||b>0||c>0))};
  const hit=hitTriangles.filter(t=>inside(t.xy)).sort((a,b)=>a.depth-b.depth)[0];if(hit)state().onSelect(hit.id);
 };
 const wheel=(e:WheelEvent)=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.7,zoom-e.deltaY*.001));dirty=true};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',()=>{dragging=false});canvas.addEventListener('wheel',wheel,{passive:false});
 const timer=setInterval(()=>{const s=state(),signature=s.active.join(',')+s.selected;if(signature!==last){dirty=true;last=signature}if(!dirty||!triangles.length)return;dirty=false;
  ctx.clearRect(0,0,canvas.width,canvas.height);const rotation=new T.Matrix4().makeRotationFromEuler(new T.Euler(pitch,yaw,0)),matrix=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(rotation),w=canvas.width,h=canvas.height;hitTriangles=[];
  for(const triangle of triangles){const lit=!!triangle.id&&(s.active.includes(triangle.id)||s.selected===triangle.id),color=triangle.id?findRegion(triangle.id).color:'#8c9db9';const ps=triangle.points.map(p=>p.clone().multiplyScalar(zoom).applyMatrix4(matrix));if(ps.some(p=>p.z>1))continue;const xy=ps.flatMap(p=>[(p.x+1)*w/2,(1-p.y)*h/2]);ctx.beginPath();ctx.moveTo(xy[0],xy[1]);ctx.lineTo(xy[2],xy[3]);ctx.lineTo(xy[4],xy[5]);ctx.closePath();ctx.strokeStyle=color;ctx.globalAlpha=lit?.22:.045;ctx.lineWidth=.7*(w/host.clientWidth);ctx.stroke();if(lit){ctx.fillStyle=color;ctx.globalAlpha=.08;ctx.fill()}if(triangle.id)hitTriangles.push({xy,depth:(ps[0].z+ps[1].z+ps[2].z)/3,id:triangle.id});
  }ctx.globalAlpha=1;
 },100);
 return()=>{disposed=true;clearInterval(timer);resize.disconnect();draco.dispose();canvas.remove();triangles=[];hitTriangles=[]};
}
