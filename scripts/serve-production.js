'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..','_production');
const port=Number(process.env.PORT||8765);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
http.createServer((request,response)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);}
  catch(_){response.writeHead(400).end('Bad URL');return;}
  if(pathname==='/home'){response.writeHead(301,{Location:'/'}).end();return;}
  const m=pathname.match(/^\/tools\/([a-z0-9-]+)\.html$/);
  if(m){response.writeHead(301,{Location:'/tools/'+m[1]+'/'}).end();return;}
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  try{
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    else if(!fs.existsSync(file)&&!path.extname(file)&&fs.existsSync(file+'.html'))file+='.html';
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404).end('Not found');return;}
    response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    if(request.method==='HEAD'){response.end();return;}
    fs.createReadStream(file).pipe(response);
  }catch(e){response.writeHead(500).end(String(e.message||e));}
}).listen(port,'127.0.0.1',()=>console.log('Local production server ready: http://127.0.0.1:'+port));
