import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,symlink,rm,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {resolvePublicFile} from './static-files.mjs';
test('static files stay inside the real public folder including symlink and sibling boundaries',async()=>{
 const folder=await mkdtemp(path.join(tmpdir(),'isv-assets-'));
 try{const root=path.join(folder,'dist');await mkdir(root);await mkdir(path.join(folder,'dist-private'));await writeFile(path.join(root,'index.html'),'public');await writeFile(path.join(folder,'dist-private','secret.txt'),'private');await symlink(path.join(folder,'dist-private'),path.join(root,'linked'));
 for(const base of [root,root+path.sep]){assert.equal(await resolvePublicFile(base,'/'),await realpath(path.join(root,'index.html')));for(const name of ['/../dist-private/secret.txt','/linked/secret.txt','/..'])await assert.rejects(resolvePublicFile(base,name),{status:403});}
 await mkdir(path.join(root,'company'));await writeFile(path.join(root,'company','index.html'),'company');assert.equal(await resolvePublicFile(root,'/company/'),await realpath(path.join(root,'company','index.html')));
 await assert.rejects(resolvePublicFile(root,'/bad\0name'),{status:400});await assert.rejects(resolvePublicFile(root,'/missing.js'),{code:'ENOENT'});
 }finally{await rm(folder,{recursive:true,force:true})}
});
