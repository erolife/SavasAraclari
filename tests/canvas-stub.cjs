// Only the procedural bump canvas is stubbed. Geometry uses real Three.js;
// browser screenshots verify the actual texture rendering separately.
const noop=()=>{};
module.exports={document:{createElement:tag=>{
 if(tag!=='canvas')throw Error('Unexpected DOM element: '+tag);
 return {width:0,height:0,getContext:type=>{if(type!=='2d')throw Error(type);return {fillRect:noop,beginPath:noop,moveTo:noop,lineTo:noop,stroke:noop,arc:noop,fill:noop};}};
}}};
