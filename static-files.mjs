import path from 'node:path';
import {realpath,stat} from 'node:fs/promises';
function inside(root,target){const relative=path.relative(root,target);return relative!==''&&!path.isAbsolute(relative)&&relative!=='..'&&!relative.startsWith('..'+path.sep)}
// Check both lexical traversal and symlink resolution; never rely on a trailing slash.
export async function resolvePublicFile(root,pathname){
 if(typeof pathname!=='string'||!pathname.startsWith('/')||pathname.includes('\0'))throw Object.assign(Error('Invalid asset path'),{status:400});
 const base=path.resolve(root),target=path.resolve(base,'.'+(pathname==='/'?'/index.html':pathname));
 if(!inside(base,target))throw Object.assign(Error('Asset outside public folder'),{status:403});
 const realBase=await realpath(base);let realTarget=await realpath(target);
 if(!inside(realBase,realTarget))throw Object.assign(Error('Asset outside public folder'),{status:403});
 if((await stat(realTarget)).isDirectory()){realTarget=await realpath(path.join(realTarget,'index.html'));if(!inside(realBase,realTarget))throw Object.assign(Error('Asset outside public folder'),{status:403})}
 return realTarget;
}
