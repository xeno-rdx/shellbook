(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const OS={cmd:{secs:CMD_SECTIONS.map((s,i)=>({id:String(i),title:s.title,html:s.content}))},
          linux:{secs:(window.LINUX_SECTIONS||[]).map(s=>({id:s.id,title:s.title,lx:s}))}};
const hid=(os,c)=>{let h=0;for(const ch of os+c)h=(h*31+ch.charCodeAt(0))|0;return'c'+(h>>>0).toString(36)};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const RT={safe:'امن',warning:'هشدار',danger:'خطرناک'};
// ---- index
const IDX=[];
for(const os in OS)OS[os].secs.forEach(sec=>{
  if(sec.lx)sec.lx.cmds.forEach(c=>IDX.push({os,sec:sec.id,st:sec.title,c:c.c,d:c.d,id:hid(os,c.c),risk:c.risk||'safe'}));
  else{const t=document.createElement('template');t.innerHTML=sec.html;
    $$('.code-block',t.content).forEach(b=>{const c=b.querySelector('code').textContent.trim(),d=b.parentElement.querySelector('.cmd-desc');
      IDX.push({os,sec:sec.id,st:sec.title,c,d:d?d.textContent.trim():'',id:hid(os,c),risk:d&&d.classList.contains('danger-desc')?'danger':d&&d.classList.contains('warning-desc')?'warning':'safe'})})}
});
let fav=new Set(LS.get('xfav',[])),sel=new Set();
const saveFav=()=>{LS.set('xfav',[...fav]);$('#favN').textContent=fav.size};
// ---- render
function cmdBlock(e){return`<div><div class="code-block" data-os="${e.os}" data-risk="${e.risk}"><code>${esc(e.c)}</code><button class="copy-btn" onclick="copyCode(this)">Copy</button></div><div class="cmd-desc"><span>${esc(e.d)}</span></div></div>`}
function lxCard(os,c){const id=hid(os,c.c);
  const fl=c.flags?`<table>${c.flags.map(f=>`<tr><td>${esc(f[0])}</td><td>${f[1]}</td></tr>`).join('')}</table>`:'';
  const ex=c.ex?`<pre class="ex"><b>$ ${esc(c.ex)}</b>\n${esc(c.out||'')}</pre>`:'';
  return`<details class="lx"><summary class="code-block" data-os="linux" data-risk="${c.risk||'safe'}"><code>${esc(c.c)}</code><span class="sd">${c.d}</span><button class="copy-btn" onclick="copyCode(this);event.preventDefault()">Copy</button></summary><div class="bd">${fl}${ex}</div></details>`}
function enhance(root){$$('.code-block',root).forEach(b=>{const cmd=b.querySelector('code').textContent.trim(),os=b.dataset.os||'cmd';
  b.dataset.os=os;b.dataset.cmd=cmd;const id=hid(os,cmd);(b.closest('details')||b).id=id;
  const risk=b.dataset.risk||(()=>{const d=b.parentElement.querySelector('.cmd-desc');return d&&d.classList.contains('danger-desc')?'danger':d&&d.classList.contains('warning-desc')?'warning':'safe'})();
  b.insertAdjacentHTML('beforeend',`<span class="risk ${risk}">${RT[risk]}</span><span class="tb"><input type="checkbox" class="sel" title="انتخاب برای کپی چندتایی" ${sel.has(cmd)?'checked':''}><button class="star ${fav.has(id)?'on':''}">${fav.has(id)?'★':'☆'}</button><button class="lnk" title="کپی لینک">#</button></span>`)})}
const route=()=>{const p=location.hash.replace(/^#\/?/,'').split('/');return{os:p[0]||'cmd',sec:p[1],id:p[2]}};
function render(){
  const r=route();$$('.tabs a').forEach(a=>a.classList.toggle('on',a.dataset.os===r.os));
  const pg=$('#page'),side=$('#side');let h='',secs=[];
  if(r.os==='fav'){side.innerHTML='<h4>FAVORITES</h4>';
    const L=IDX.filter(e=>fav.has(e.id));h=`<h1>★ علاقه‌مندی‌ها</h1>`+(L.length?L.map(cmdBlock).join(''):'<p>هنوز دستوری را ستاره‌دار نکرده‌اید.</p>')}
  else{const o=OS[r.os]||OS.cmd;secs=o.secs;
    if(!secs.length){pg.innerHTML='<h1>به‌زودی</h1>';return}
    const cur=secs.find(s=>s.id===r.sec)||secs[0],i=secs.indexOf(cur);
    side.innerHTML=`<h4>${r.os.toUpperCase()} / ${secs.length}</h4>`+secs.map(s=>`<a href="#/${r.os}/${s.id}" class="${s===cur?'on':''}">${esc(s.title)}</a>`).join('');
    h=cur.lx?`<h1>${esc(cur.title)}</h1><p>${cur.lx.intro||''}</p>${cur.lx.cmds.map(c=>lxCard(r.os,c)).join('')}`:cur.html;
    h+=`<div class="pn"><span>${secs[i+1]?`<a href="#/${r.os}/${secs[i+1].id}">← ${esc(secs[i+1].title)}</a>`:''}</span><span>${secs[i-1]?`<a href="#/${r.os}/${secs[i-1].id}">${esc(secs[i-1].title)} →</a>`:''}</span></div>`}
  pg.innerHTML=h;enhance(pg);side.classList.remove('open');
  const t=r.id&&document.getElementById(r.id);
  if(t){if(t.tagName==='DETAILS')t.open=true;t.scrollIntoView({block:'center'});t.classList.add('hl')}else scrollTo(0,0);
}
// ---- actions
window.copyCode=btn=>{const t=btn.closest('.code-block').querySelector('code').textContent;navigator.clipboard.writeText(t).then(()=>{const o=btn.textContent;btn.textContent='✓';setTimeout(()=>btn.textContent=o,1200)})};
document.addEventListener('click',e=>{const b=e.target.closest('.star,.lnk');if(!b)return;e.preventDefault();e.stopPropagation();
  const blk=b.closest('.code-block'),id=(blk.closest('details')||blk).id;
  if(b.classList.contains('star')){fav.has(id)?fav.delete(id):fav.add(id);b.classList.toggle('on');b.textContent=fav.has(id)?'★':'☆';saveFav()}
  else{const e2=IDX.find(x=>x.id===id);navigator.clipboard.writeText(location.origin+location.pathname+`#/${e2.os}/${e2.sec}/${id}`)}});
document.addEventListener('change',e=>{if(!e.target.classList.contains('sel'))return;const c=e.target.closest('.code-block').dataset.cmd;e.target.checked?sel.add(c):sel.delete(c);bar()});
const bar=()=>{$('#bar').classList.toggle('on',sel.size>0);$('#barN').textContent=sel.size+' دستور انتخاب شد'};
$('#barCopy').onclick=()=>navigator.clipboard.writeText([...sel].join('\n'));
$('#barClr').onclick=()=>{sel.clear();$$('.sel').forEach(c=>c.checked=false);bar()};
$('#themeBtn').onclick=()=>{const d=document.documentElement,n=d.dataset.theme==='dark'?'light':'dark';d.dataset.theme=n;try{localStorage.setItem('xtheme',n)}catch(e){}};
$('#menuBtn').onclick=()=>$('#side').classList.toggle('open');
// ---- search
const ov=$('#ov'),q=$('#q'),res=$('#res');let ri=0;
const open=()=>{ov.classList.add('on');q.value='';q.focus();find()};
const find=()=>{const t=q.value.trim().toLowerCase();
  const L=(t?IDX.filter(e=>(e.c+' '+e.d).toLowerCase().includes(t)):IDX.slice(0,0)).slice(0,40);ri=0;
  res.innerHTML=L.map((e,i)=>`<a href="#/${e.os}/${e.sec}/${e.id}" class="${i?'':'on'}"><code>${esc(e.c)}</code><small>${e.os.toUpperCase()} · ${esc(e.st)} — ${esc(e.d.slice(0,80))}</small></a>`).join('')||(t?'<a>نتیجه‌ای پیدا نشد</a>':'')};
q.oninput=find;$('#srchBtn').onclick=open;ov.onclick=e=>{if(e.target===ov)ov.classList.remove('on')};
res.onclick=()=>ov.classList.remove('on');
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open()}
  else if(e.key==='Escape')ov.classList.remove('on');
  else if(ov.classList.contains('on')&&(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Enter')){const a=$$('a',res);if(!a.length)return;e.preventDefault();
    if(e.key==='Enter'){a[ri].click();return}
    a[ri].classList.remove('on');ri=(ri+(e.key==='ArrowDown'?1:-1)+a.length)%a.length;a[ri].classList.add('on');a[ri].scrollIntoView({block:'nearest'})}});
addEventListener('hashchange',render);
saveFav();if(!location.hash)location.hash='#/cmd/0';render();
})();
