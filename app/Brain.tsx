'use client';
import {useEffect,useRef,useState} from 'react';
import {createBrainFallback} from './brain-fallback';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {findRegion,mapAnatomy,type RegionId} from './brain-data';
export default function Brain({active,selected,onSelect,xray,rotate,reset}:{active:RegionId[];selected:RegionId|null;onSelect:(id:RegionId)=>void;xray:boolean;rotate:boolean;reset:number}){
 const host=useRef<HTMLDivElement>(null); const state=useRef({active,selected,xray,rotate,onSelect});state.current={active,selected,xray,rotate,onSelect};
 const resetCamera=useRef<()=>void>(()=>{}); const [status,setStatus]=useState('Loading anatomical model…');
 useEffect(()=>{resetCamera.current()},[reset]);
 useEffect(()=>{
  const container=host.current!;let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}catch{const fallback=createBrainFallback(container,()=>state.current,setStatus);resetCamera.current=fallback.reset;return()=>{resetCamera.current=()=>{};fallback.dispose()};}
  let disposed=false,frame=0;renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.setClearColor(0,0);container.appendChild(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.01,100);camera.position.set(-5.6,2.4,5.8);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=12;controls.autoRotateSpeed=.45;
  resetCamera.current=()=>{const damping=controls.enableDamping;controls.enableDamping=false;controls.update();camera.position.set(-5.6,2.4,5.8);controls.target.set(0,0,0);controls.update();controls.enableDamping=damping};
  scene.add(new T.AmbientLight('#a8bfe5',1.1));const key=new T.DirectionalLight('#d2deff',3);key.position.set(-4,6,5);scene.add(key);const rim=new T.DirectionalLight('#819be5',2);rim.position.set(4,1,-4);scene.add(rim);
  const model=new T.Group();scene.add(model);const meshes:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>[]=[];const wires:T.LineSegments<T.WireframeGeometry,T.LineBasicMaterial>[]=[];
  const draco=new DRACOLoader().setDecoderPath('/draco/');const loader=new GLTFLoader().setDRACOLoader(draco);
  loader.load('/models/brain.glb',gltf=>{
   if(disposed){gltf.scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()}});return;}
   const core=new T.Box3();gltf.scene.updateMatrixWorld(true);
   gltf.scene.traverse(o=>{if(o instanceof T.Mesh){const ex=o.userData.bx_cat?o.userData:o.parent?.userData||{};const id=mapAnatomy(ex);if(id || ex.bx_cat==='cortex')core.expandByObject(o);}});
   const center=core.getCenter(new T.Vector3());gltf.scene.position.sub(center);const size=core.getSize(new T.Vector3());model.scale.setScalar(3.8/Math.max(size.x,size.y,size.z));model.add(gltf.scene);
   gltf.scene.traverse(o=>{if(!(o instanceof T.Mesh))return;const ex=o.userData.bx_cat?o.userData:o.parent?.userData||{};const id=mapAnatomy(ex);o.visible=!!id||ex.bx_cat==='cortex';if(!o.visible)return;
    const old=Array.isArray(o.material)?o.material:[o.material];old.forEach(m=>m.dispose());o.userData.region=id;
    o.material=new T.MeshStandardMaterial({color:'#697b95',emissive:'#111b32',roughness:.65,metalness:.2,transparent:true,opacity:.18,depthWrite:false,side:T.DoubleSide});meshes.push(o as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>);
   });
   // Separate traversal: keep actual anatomy and expose its triangulated skeleton.
   for(const m of meshes){const wire=new T.LineSegments(new T.WireframeGeometry(m.geometry),new T.LineBasicMaterial({color:'#9eafcb',transparent:true,opacity:.055,depthWrite:false}));wire.userData.region=m.userData.region;m.add(wire);wires.push(wire)}
   scene.updateMatrixWorld(true);setStatus('');
  },undefined,()=>setStatus('The brain could not load. Refresh to retry. Chat still works.'));
  const ray=new T.Raycaster(),pointer=new T.Vector2();let start=[0,0];const down=(e:PointerEvent)=>{start=[e.clientX,e.clientY]};
  const up=(e:PointerEvent)=>{if(Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(meshes,false).find(h=>h.object.userData.region);if(hit)state.current.onSelect(hit.object.userData.region)};
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);
  const resize=new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()});resize.observe(container);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const draw=(time:number)=>{if(disposed)return;frame=requestAnimationFrame(draw);const s=state.current;controls.autoRotate=s.rotate&&!reduced;controls.update();
   for(const m of meshes){const id=m.userData.region as RegionId|undefined;const lit=!!id&&s.active.includes(id);const focused=id===s.selected;const c=id?findRegion(id).color:'#6e819e';m.material.color.set(lit||focused?c:'#697d9a');m.material.emissive.set(lit||focused?c:'#111b32');m.material.emissiveIntensity=lit?(.38+(reduced?0:.07*Math.sin(time*.0018))):focused?.24:.03;m.material.opacity=lit||focused?(s.xray?.36:.86):(s.xray?.065:.6);m.material.depthWrite=!s.xray;}
   for(const w of wires){const id=w.userData.region as RegionId;const lit=s.active.includes(id)||id===s.selected;w.material.color.set(lit?findRegion(id).color:'#9faec5');w.material.opacity=s.xray?(lit?.17:.065):.025;}
   renderer.render(scene,camera);
  };frame=requestAnimationFrame(draw);
  return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();controls.dispose();draco.dispose();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);for(const w of wires){w.geometry.dispose();w.material.dispose()}for(const m of meshes){m.geometry.dispose();m.material.dispose()}renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
 },[]);
 return <div className="brain-canvas" role="img" aria-label="Interactive 3D anatomical human brain. Drag to rotate; scroll to zoom. Use the arrow keys on the brain to explore regions."><div className="renderer-canvas" ref={host}/>{status&&<div className="model-status" role="status">{status}</div>}</div>
}
