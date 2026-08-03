// Frame.io-style local review app: watch the latest cut, click to drop
// timestamped comments, everything persists to out/review_comments.json
// (which Claude reads in one pass). No dependencies — plain node http.
import http from "http";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const VIDEO = path.join(ROOT, "out", "reel_current.mp4");
const DB = path.join(ROOT, "out", "review_comments.json");
const PORT = 3444;

const load = () => {
  try {
    return JSON.parse(fs.readFileSync(DB, "utf8"));
  } catch {
    return [];
  }
};
const save = (c) => fs.writeFileSync(DB, JSON.stringify(c, null, 1));

const HTML = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reel Review</title>
<style>
  :root { --cream:#F1ECE3; --ink:#2E2A24; --orange:#DE5F3B; --muted:#8A8478; }
  * { box-sizing:border-box; margin:0; }
  body { background:#1C1915; color:var(--cream); font:15px/1.45 'Helvetica Neue',Helvetica,Arial,sans-serif; }
  .wrap { display:flex; gap:20px; padding:20px; max-width:1200px; margin:0 auto; height:100vh; }
  .left { flex:0 0 auto; display:flex; flex-direction:column; gap:10px; }
  video { height:calc(100vh - 130px); aspect-ratio:9/16; background:#000; border-radius:14px; }
  .timeline { position:relative; height:26px; background:#2A251F; border-radius:8px; cursor:pointer; }
  .playhead { position:absolute; top:0; bottom:0; width:2px; background:var(--cream); }
  .marker { position:absolute; top:4px; width:10px; height:18px; border-radius:3px; background:var(--orange); transform:translateX(-5px); cursor:pointer; }
  .marker.done { background:#3E7C56; }
  .right { flex:1; display:flex; flex-direction:column; gap:12px; min-width:340px; }
  h1 { font-size:17px; font-weight:600; letter-spacing:.02em; }
  h1 small { color:var(--muted); font-weight:400; }
  .composer { display:flex; gap:8px; }
  .composer .at { background:#2A251F; border-radius:8px; padding:9px 12px; color:var(--orange); font-variant-numeric:tabular-nums; white-space:nowrap; }
  textarea { flex:1; background:#2A251F; border:1px solid #3A342C; color:var(--cream); border-radius:8px; padding:9px 12px; resize:none; height:64px; font:inherit; }
  button { background:var(--orange); color:#fff; border:0; border-radius:8px; padding:0 18px; font:600 14px/1 inherit; cursor:pointer; }
  button:hover { filter:brightness(1.08); }
  .list { overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding-right:4px; }
  .c { background:#26211B; border:1px solid #3A342C; border-radius:10px; padding:10px 12px; display:flex; gap:10px; align-items:flex-start; }
  .c.done { opacity:.5; }
  .c .t { color:var(--orange); font-variant-numeric:tabular-nums; cursor:pointer; font-weight:600; white-space:nowrap; }
  .c .txt { flex:1; }
  .c .x, .c .e { color:var(--muted); cursor:pointer; border:0; background:none; padding:0 2px; font-size:15px; }
  .c .e:hover, .c .x:hover { color:var(--cream); }
  .hint { color:var(--muted); font-size:13px; }
  kbd { background:#2A251F; border-radius:4px; padding:1px 6px; border:1px solid #3A342C; }
</style></head><body>
<div class="wrap">
  <div class="left">
    <video id="v" src="/video" controls playsinline></video>
    <div class="timeline" id="tl"><div class="playhead" id="ph"></div></div>
  </div>
  <div class="right">
    <h1>Reel review <small>— comments land in review_comments.json for Claude</small></h1>
    <div class="composer">
      <div class="at" id="at">0:00.0</div>
      <textarea id="txt" placeholder="Pause where you want, type the note, hit Send (or Cmd+Enter)"></textarea>
      <button id="send">Send</button>
    </div>
    <button id="gen" style="background:#3E7C56;padding:12px 18px">✨ Generate next version</button>
    <div class="hint">Click the timeline or a timestamp to jump. <kbd>c</kbd> pauses + focuses the note box.</div>
    <div class="list" id="list"></div>
  </div>
</div>
<script>
const v=document.getElementById('v'),tl=document.getElementById('tl'),ph=document.getElementById('ph'),
      at=document.getElementById('at'),txt=document.getElementById('txt'),list=document.getElementById('list');
let comments=[];
const fmt=t=>Math.floor(t/60)+':'+String((t%60).toFixed(1)).padStart(4,'0');
async function refresh(){comments=await (await fetch('/comments')).json();draw();}
function draw(){
  list.innerHTML='';
  [...comments].sort((a,b)=>a.t-b.t).forEach(c=>{
    const d=document.createElement('div');d.className='c'+(c.done?' done':'');
    d.innerHTML='<span class="t">'+fmt(c.t)+'</span><span class="txt">'+c.text.replace(/</g,'&lt;')+'</span><button class="e" title="edit">✎</button><button class="x" title="delete">✕</button>';
    d.querySelector('.t').onclick=()=>{v.currentTime=c.t;v.pause();};
    d.querySelector('.e').onclick=()=>{
      const span=d.querySelector('.txt');
      const ta=document.createElement('textarea');ta.value=c.text;ta.style.cssText='flex:1;background:#2A251F;border:1px solid #3A342C;color:var(--cream);border-radius:6px;padding:6px 8px;font:inherit;min-height:56px';
      span.replaceWith(ta);ta.focus();
      const commit=async()=>{await fetch('/comments/'+c.id,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({text:ta.value.trim()})});refresh();};
      ta.addEventListener('keydown',ev=>{if((ev.metaKey||ev.ctrlKey)&&ev.key==='Enter')commit();if(ev.key==='Escape')refresh();});
      ta.addEventListener('blur',commit);
    };
    d.querySelector('.x').onclick=async()=>{await fetch('/comments/'+c.id,{method:'DELETE'});refresh();};
    list.appendChild(d);
  });
  tl.querySelectorAll('.marker').forEach(m=>m.remove());
  comments.forEach(c=>{
    const m=document.createElement('div');m.className='marker'+(c.done?' done':'');
    m.style.left=(c.t/(v.duration||1)*100)+'%';m.title=fmt(c.t)+' '+c.text;
    m.onclick=e=>{e.stopPropagation();v.currentTime=c.t;v.pause();};
    tl.appendChild(m);
  });
}
v.addEventListener('timeupdate',()=>{at.textContent=fmt(v.currentTime);ph.style.left=(v.currentTime/(v.duration||1)*100)+'%';});
tl.addEventListener('click',e=>{const r=tl.getBoundingClientRect();v.currentTime=(e.clientX-r.left)/r.width*(v.duration||0);});
async function send(){
  const text=txt.value.trim();if(!text)return;
  await fetch('/comments',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({t:Math.round(v.currentTime*10)/10,text})});
  txt.value='';refresh();
}
document.getElementById('send').onclick=send;
const gen=document.getElementById('gen');
gen.onclick=async()=>{
  await fetch('/generate',{method:'POST'});
  gen.textContent='✓ Sent to Claude — next version on the way';
  gen.style.background='#5a5347';gen.disabled=true;
  setTimeout(()=>{gen.textContent='✨ Generate next version';gen.style.background='#3E7C56';gen.disabled=false;},30000);
};
txt.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')send();});
document.addEventListener('keydown',e=>{if(e.key==='c'&&document.activeElement!==txt){e.preventDefault();v.pause();txt.focus();}});
v.addEventListener('loadedmetadata',refresh);
refresh();
</script></body></html>`;

http
  .createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    if (u.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html" }).end(HTML);
    } else if (u.pathname === "/video") {
      if (!fs.existsSync(VIDEO)) return res.writeHead(404).end("no video");
      const size = fs.statSync(VIDEO).size;
      const range = req.headers.range;
      if (range) {
        const [s, e] = range.replace("bytes=", "").split("-");
        const start = parseInt(s, 10);
        const end = e ? parseInt(e, 10) : Math.min(start + 4_000_000, size - 1);
        res.writeHead(206, {
          "content-range": `bytes ${start}-${end}/${size}`,
          "accept-ranges": "bytes",
          "content-length": end - start + 1,
          "content-type": "video/mp4",
        });
        fs.createReadStream(VIDEO, { start, end }).pipe(res);
      } else {
        res.writeHead(200, { "content-length": size, "content-type": "video/mp4" });
        fs.createReadStream(VIDEO).pipe(res);
      }
    } else if (u.pathname === "/generate" && req.method === "POST") {
      fs.writeFileSync(path.join(ROOT, "out", "review_ready.flag"),
        JSON.stringify({ at: new Date().toISOString(), comments: load().length }));
      res.writeHead(200).end("ok");
    } else if (u.pathname === "/comments" && req.method === "GET") {
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(load()));
    } else if (u.pathname === "/comments" && req.method === "POST") {
      let body = "";
      req.on("data", (d) => (body += d));
      req.on("end", () => {
        const c = load();
        const { t, text } = JSON.parse(body);
        c.push({ id: Date.now().toString(36), t, text, done: false, at: new Date().toISOString() });
        save(c);
        res.writeHead(200).end("ok");
      });
    } else if (u.pathname.startsWith("/comments/") && req.method === "PUT") {
      let body = "";
      req.on("data", (d) => (body += d));
      req.on("end", () => {
        const { text } = JSON.parse(body);
        const id = u.pathname.split("/")[2];
        save(load().map((c) => (c.id === id && text ? { ...c, text } : c)));
        res.writeHead(200).end("ok");
      });
    } else if (u.pathname.startsWith("/comments/") && req.method === "DELETE") {
      save(load().filter((c) => c.id !== u.pathname.split("/")[2]));
      res.writeHead(200).end("ok");
    } else res.writeHead(404).end();
  })
  .listen(PORT, () => console.log(`review app on http://localhost:${PORT}`));
