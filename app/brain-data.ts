export type RegionId = 'frontal'|'parietal'|'temporal'|'occipital'|'hippocampus'|'amygdala'|'cerebellum'|'brainstem';
export const regions: {id:RegionId;name:string;role:string;color:string;description:string}[] = [
 {id:'frontal',name:'Frontal lobe',role:'Planning & reasoning',color:'#aab4ff',description:'Frontal networks help hold information in mind, plan actions, and organize a response. Parts of the left inferior frontal cortex often contribute to language.'},
 {id:'parietal',name:'Parietal lobe',role:'Numbers & spatial thinking',color:'#efbb77',description:'Parietal networks integrate sensory and spatial information. The intraparietal sulcus is often involved when comparing quantities or calculating.'},
 {id:'temporal',name:'Temporal lobe',role:'Language & meaning',color:'#60d7c8',description:'Temporal networks help connect words with meaning and, when listening, process sounds. Language relies on interacting frontal, temporal, and other networks.'},
 {id:'occipital',name:'Occipital lobe',role:'Visual processing',color:'#80baff',description:'Occipital cortex processes visual input. Reading this screen involves vision even when your message is about something else; imagery may also recruit visual networks.'},
 {id:'hippocampus',name:'Hippocampus',role:'Learning & episodic memory',color:'#f5cd67',description:'The hippocampus helps form and retrieve episodes and associations. Memories are distributed across the brain; it is not a single storage box.'},
 {id:'amygdala',name:'Amygdala',role:'Emotional significance',color:'#ee94b9',description:'Amygdala networks help evaluate emotionally significant events and support emotional learning. Emotion involves many regions, not one emotion center.'},
 {id:'cerebellum',name:'Cerebellum',role:'Coordination & prediction',color:'#91caa7',description:'The cerebellum contributes to movement coordination, timing, and learning. It also participates in cognitive networks. Talking about movement is different from performing it.'},
 {id:'brainstem',name:'Brainstem',role:'Essential background functions',color:'#95a3bb',description:'The brainstem supports vital functions, arousal, and pathways connecting the brain and body. These functions continue regardless of the topic of a conversation.'},
];
export const findRegion=(id:RegionId)=>regions.find(r=>r.id===id)!;
export type Activity={title:string;explanation:string;regions:RegionId[]};
export function analyze(text:string):Activity {
 const t=text.toLowerCase();
 const ids:RegionId[]=['temporal','frontal']; let title='Language & understanding'; let explanation='Reading and forming a reply draw on a distributed language network. Temporal regions support meaning; frontal regions help organize the response.';
 if(/\d|math|calculat|multiply|divid|algebra|equation|number/.test(t)){ids.push('parietal');title='Working through a problem';explanation='Calculation can recruit parietal quantity-processing networks alongside frontal working memory and language. The exact pattern depends on the strategy and the person.';}
 if(/remember|recall|memory|forgot|yesterday|childhood|last (week|year)|my name/.test(t)){ids.push('hippocampus');title='Connecting a memory';explanation='Forming or recalling an episode can engage hippocampal networks with distributed cortical areas. Saving a note here is a software analogy, not biological memory.';}
 if(/feel|happy|sad|afraid|anxious|love|excited|angry|stress|scared|emotion/.test(t)){ids.push('amygdala');title='Making emotional meaning';explanation='Emotional meaning can involve the amygdala alongside frontal and other networks. Words alone cannot tell us what someone feels or which neurons are active.';}
 if(/imagine|visuali[sz]e|picture|color|colour|sunset|see a/.test(t)){ids.push('occipital');title='Imagining a scene';explanation='Visual imagery can recruit some of the networks used for seeing, interacting with memory and attention. Reading the screen also involves visual processing.';}
 if(/dance|walk|balance|bicycle|piano|movement/.test(t)){ids.push('cerebellum');title='Thinking about movement';explanation='The cerebellum helps coordinate and predict movement. This highlight teaches its role; discussing movement does not reproduce the activity of actually moving.';}
 return {title,explanation,regions:[...new Set(ids)]};
}
export const prompts=[{label:'Solve a little math',text:'What is 24 × 7? Explain how to solve it mentally.',icon:'math'}, {label:'Make a memory',text:'Remember that my favorite place is the ocean.',icon:'memory'}, {label:'Explore a feeling',text:'Why do I feel nervous before trying something new?',icon:'feeling'}, {label:'Imagine something',text:'Imagine a quiet forest after the rain.',icon:'imagine'}];
export function mapAnatomy(ex:Record<string,unknown>):RegionId|undefined {
 const label=String(ex.bx_label||'').toLowerCase(),region=String(ex.bx_region||'').toLowerCase(),cat=String(ex.bx_cat||'');
 if(label==='hippocampus')return 'hippocampus'; if(/amygdal/.test(label))return 'amygdala';
 if(cat==='cerebellum')return 'cerebellum'; if(cat==='brainstem')return 'brainstem';
 if(cat!=='cortex')return;
 if(region.includes('frontal'))return 'frontal';if(region.includes('parietal'))return 'parietal';if(region.includes('temporal'))return 'temporal';if(region.includes('occipital'))return 'occipital';
}
