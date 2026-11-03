(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = !reduce && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (G) gsap.registerPlugin(ScrollTrigger);
  var CONFIG = {
    colors:["#6B3CFF","#4dacff"], backgroundColor:"#0A0A0A", mode:"auto",
    wires:64, lineWidth:1.6, ribbonWidth:0.24, amplitude:0.6, waveLength:1, angle:42,
    twist:1.6, curl:0.25, depth:0.65, stripes:2.2, colorFlow:0.04, glow:0.45, intensity:1,
    speed:0.7, spin:0.35, interactive:true, hoverPulses:true, clickPulse:true,
    pulseSpeed:1.1, pulseStrength:1, hoverBoost:1, paused:false
  };
  var navEl=document.querySelector('.nav'), navLinks=document.querySelectorAll('.nav [data-nav]');
  var navMap=[['layers','services'],['services','services'],['flow','flow'],['process','process'],['contact','contact']];
  function navSync(){
    navEl.classList.toggle('solid',window.scrollY>40);
    var mid=window.innerHeight*.45, cur=null;
    navMap.forEach(function(m){ var el=document.getElementById(m[0]); if(!el) return; var sp=el.parentElement&&el.parentElement.classList.contains('pin-spacer')?el.parentElement:el; var r=sp.getBoundingClientRect(); if(r.top<=mid&&r.bottom>mid) cur=m[1]; });
    navLinks.forEach(function(a){a.classList.toggle('on',a.dataset.nav===cur);});
  }
  window.addEventListener('scroll',navSync,{passive:true}); navSync();
  var hero = InterferenceRibbons(document.getElementById('heroRibbons'), Object.assign({target:document.querySelector('.hero')}, CONFIG));
  InterferenceRibbons(document.getElementById('contactRibbons'), Object.assign({target:document.getElementById('contact')}, CONFIG));

  var split = function(el){
    var txt = el.textContent; el.textContent = '';
    Array.from(txt).forEach(function(c){ var s=document.createElement('span'); s.className='ch'; s.textContent=c===' '?' ':c; el.appendChild(s); });
    return el.querySelectorAll('.ch');
  };

  /* ── services ── */
  var SVC = [
    {id:'web', layer:0, name:'網頁開發', desc:'官網、電商與品牌網站，以下為實際上線作品。', hint:'拖曳或點擊切換作品'},
    {id:'system', layer:0, name:'系統開發', desc:'內部系統、報表、流程自動化與 API 串接。', hint:'滑過卡片，點擊重播'},
    {id:'app', layer:0, name:'App 開發', desc:'iOS／Android 雙平台，從原型到上架。', hint:'點畫面暫停播放，點下方標籤切換畫面'},
    {id:'ai', layer:1, name:'AI 整合', desc:'AI 自動化、客製化模型，以及到校與企業的 AI 顧問培訓。', hint:'拖曳瀏覽，點中央卡片看細節'},
    {id:'xr', layer:2, name:'虛擬實境', desc:'Meta Quest VR／MR：訓練、導覽、展示。', hint:'移動滑鼠換視角，點擊發出掃描波'},
    {id:'print', layer:2, name:'3D 列印', desc:'打樣、少量客製、展品與紀念品。', hint:'拖曳旋轉，選模型重新列印'}
  ];
  var N = SVC.length, XR = SVC.findIndex(function(x){return x.id==='xr';});
  var listEl=document.getElementById('svcList'), idxEl=document.getElementById('svcIdx'), nameEl=document.getElementById('svcName'), descEl=document.getElementById('svcDesc'), hintEl=document.getElementById('svcHint'), stage=document.getElementById('svcStage');
  var demos=SVC.map(function(s){return document.querySelector('.demo[data-id="'+s.id+'"]');});
  var btns=[], fills=[], inst={}, cur=-1, stageVisible=true, svcST=null;
  SVC.forEach(function(s,k){
    var li=document.createElement('li'), b=document.createElement('button');
    b.type='button';
    b.innerHTML='<span class="k">0'+(k+1)+'</span><span>'+s.name+'</span><span class="fill"><i></i></span>';
    b.addEventListener('click',function(){
      if(svcST){ window.scrollTo({top:svcST.start+(svcST.end-svcST.start)*((k+0.08)/N)+1,behavior:'smooth'}); }
      else { setFill(k,1); show(k); }
    });
    li.appendChild(b); listEl.appendChild(li); btns.push(b); fills.push(b.querySelector('.fill i'));
  });
  function setFill(i,frac){ fills.forEach(function(f,k){ f.style.transform='scaleX('+(k<i?1:k===i?Math.max(.04,Math.min(1,frac)):0)+')'; }); }
  function show(i){
    if(cur===i) return;
    if(cur>=0 && inst[cur]) inst[cur].stop();
    var s=SVC[i];
    demos.forEach(function(d,k){ d.hidden=k!==i; btns[k].classList.toggle('on',k===i); if(k===i) btns[k].setAttribute('aria-current','true'); else btns[k].removeAttribute('aria-current'); });
    idxEl.textContent=('0'+(i+1)).slice(-2);
    document.querySelectorAll('.sl').forEach(function(sp){sp.classList.toggle('on',+sp.dataset.l===s.layer);});
    document.getElementById('slNum').textContent=['SOFTWARE','INTELLIGENCE','OFFLINE'][s.layer];
    document.getElementById('slName').textContent=['軟體','AI','線下互動'][s.layer];
    nameEl.textContent=s.name; descEl.textContent=s.desc; hintEl.textContent=s.hint;
    if(!inst[i] && window.WeavexDemos) inst[i]=WeavexDemos[s.id](demos[i]);
    cur=i;
    if(inst[i] && stageVisible) inst[i].start();
    if(s.id==='xr') initQuest();
    if(G){
      gsap.fromTo(split(nameEl),{yPercent:110},{yPercent:0,stagger:.04,duration:.7,ease:'expo.out'});
      gsap.fromTo(idxEl,{yPercent:60,opacity:0},{yPercent:0,opacity:1,duration:.5,ease:'expo.out'});
      gsap.fromTo([descEl,hintEl],{y:10,opacity:0},{y:0,opacity:1,stagger:.06,duration:.45,ease:'power2.out'});
      gsap.fromTo(demos[i],{opacity:0,scale:.975},{opacity:1,scale:1,duration:.65,ease:'power2.out',clearProps:'transform'});
    }
  }
  new IntersectionObserver(function(es){
    stageVisible=es[0].isIntersecting;
    if(cur<0||!inst[cur]) return;
    if(stageVisible) inst[cur].start(); else inst[cur].stop();
  },{threshold:.02}).observe(stage);
  setFill(0,0); show(0);
  document.getElementById('xrScan').addEventListener('click',function(){ var x=inst[XR]; if(x) x.sweep(); });
  /* Meta Quest 3 model (three.js, parsed in memory) */
  var q3Started=false;
  function loadScript(src){return new Promise(function(res,rej){var e=document.createElement('script');e.src=src;e.onload=res;e.onerror=rej;document.head.appendChild(e);});}
  function initQuest(){
    if(q3Started) return; q3Started=true;
    var cv=document.getElementById('q3'), msg=document.getElementById('q3Load');
    var T='vendor/three/';
    loadScript(T+'three.min.js')
      .then(function(){return Promise.all([loadScript(T+'GLTFLoader.js'),loadScript(T+'RoomEnvironment.js'),loadScript('assets/model/quest3-data.js')]);})
      .then(function(){
        var bin=atob(window.QUEST3_GLB), buf=new Uint8Array(bin.length);
        for(var i=0;i<bin.length;i++) buf[i]=bin.charCodeAt(i);
        var renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
        renderer.outputEncoding=THREE.sRGBEncoding; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
        var scene=new THREE.Scene(), pm=new THREE.PMREMGenerator(renderer);
        scene.environment=pm.fromScene(new THREE.RoomEnvironment(),0.04).texture;
        var key=new THREE.DirectionalLight(0xbfe0ff,1.2); key.position.set(2,3,4); scene.add(key);
        var cam=new THREE.PerspectiveCamera(30,1,0.01,100);
        var pivot=new THREE.Group(); scene.add(pivot);
        var cib=window.createImageBitmap; try{window.createImageBitmap=undefined;}catch(e){}
        new THREE.GLTFLoader().parse(buf.buffer,'',function(g){
          var m=g.scene, box=new THREE.Box3().setFromObject(m), c=box.getCenter(new THREE.Vector3()), sz=box.getSize(new THREE.Vector3());
          m.position.sub(c); pivot.add(m);
          var r=Math.max(sz.x,sz.y,sz.z); cam.position.set(0,r*0.25,r*2.35); cam.lookAt(0,0,0);
          msg.hidden=true;
          var rotY=0.6, rotX=0.12, vel=0.35, drag=null, last=performance.now();
          cv.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY,ry:rotY,rx:rotX};cv.setPointerCapture(e.pointerId);});
          cv.addEventListener('pointermove',function(e){if(!drag)return;var ny=drag.ry+(e.clientX-drag.x)*0.012;vel=(ny-rotY)*20;rotY=ny;rotX=Math.max(-.5,Math.min(.6,drag.rx+(e.clientY-drag.y)*0.008));});
          var up=function(){drag=null;if(Math.abs(vel)<.2)vel=.35*Math.sign(vel||1);}; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
          function size(){var w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
          new ResizeObserver(size).observe(cv); size();
          (function loop(now){
            requestAnimationFrame(loop);
            var dt=Math.min(.05,(now-last)/1000); last=now;
            if(cur!==XR||!stageVisible) return;
            if(!drag){ var target=reduce?0:.35*Math.sign(vel||1); vel+=(target-vel)*Math.min(1,dt*1.5); rotY+=vel*dt; }
            pivot.rotation.set(rotX,rotY,0);
            renderer.render(scene,cam);
          })(last);
        },function(err){msg.textContent='3D 模型載入失敗';console.warn(err);});
        try{window.createImageBitmap=cib;}catch(e){}
      })
      .catch(function(e){msg.textContent='3D 模型載入失敗';console.warn(e);});
  }
  var pts=document.getElementById('xrPts'), np=12480;
  setInterval(function(){ if(cur===XR&&stageVisible){ np+=Math.floor(Math.random()*90); pts.textContent=np.toLocaleString('en-US'); } },400);

  /* ── flow ── */
  var jsEls=[].slice.call(document.querySelectorAll('#jr .js')), fps=document.querySelectorAll('.fp'), fnum=document.getElementById('flowNum');
  var jrMain=document.querySelector('.jr-main'), jrRail=document.querySelector('.jr-rail'), jrFill=document.getElementById('jrFill'), fork=document.getElementById('jrFork'), jrBranch=document.querySelector('.jr-branch');
  var fk=['fkA','fkB','fkA0','fkB0'].map(function(id){return document.getElementById(id);});
  var fCur=-1, flowST=null, fP=0, FMID=[.08,.3,.52,.72,.92], TH=[0,.2,.42,.64,.82];
  var cl=function(x){return Math.max(0,Math.min(1,x));}, lerp=function(a,b,t){return a+(b-a)*cl(t);};
  function flowStep(i){
    if(fCur===i) return;
    jsEls.forEach(function(el,k){el.classList.toggle('act',k===i);});
    fps.forEach(function(p,k){p.hidden=k!==i;});
    document.querySelector('.fl-right').dataset.dev=fps[i].dataset.dev;
    fnum.textContent='0'+(i+1);
    document.getElementById('flowLbl').textContent=jsEls[i].querySelector('.jt b').textContent;
    if(G){
      gsap.fromTo(fps[i],{opacity:0,y:30,rotationY:fCur<i?-14:14},{opacity:1,y:0,rotationY:0,duration:.6,ease:'power3.out',clearProps:'transform'});
      gsap.fromTo(fnum,{yPercent:50,opacity:0},{yPercent:0,opacity:1,duration:.4,ease:'expo.out'});
    }
    fCur=i;
  }
  function flowAt(p){
    fP=p;
    var i=0; for(var k=0;k<5;k++){ if(p>=TH[k]) i=k; jsEls[k].classList.toggle('on',p>=TH[k]); }
    flowStep(i);
    var dots=jsEls.slice(0,3).map(function(el){return el.offsetTop+el.querySelector('.jd').offsetTop+7;});
    var end=jrMain.offsetHeight, top=dots[0];
    jrRail.style.top=top+'px';
    var y=p<TH[1]?lerp(dots[0],dots[1],p/TH[1]):p<TH[2]?lerp(dots[1],dots[2],(p-TH[1])/(TH[2]-TH[1])):lerp(dots[2],end,(p-TH[2])/(TH[3]-TH[2]-.07));
    jrFill.style.height=Math.max(0,y-top)+'px';
    var f=cl((p-(TH[3]-.07))/.07);
    [fk[0],fk[1]].forEach(function(e){e.style.strokeDashoffset=(e._l||0)*(1-f);});
  }
  function layoutFork(){
    var w=fork.clientWidth||300, bx=jrBranch.children[1].offsetLeft+14;
    fork.setAttribute('viewBox','0 0 '+w+' 52');
    var a='M14 0 L14 60', b='M14 0 C14 30, '+bx+' 22, '+bx+' 60';
    fk[0].setAttribute('d',a); fk[2].setAttribute('d',a); fk[1].setAttribute('d',b); fk[3].setAttribute('d',b);
    [fk[0],fk[1]].forEach(function(e){e._l=e.getTotalLength();e.style.strokeDasharray=e._l;});
    flowAt(fP);
  }
  jsEls.forEach(function(el,k){
    el.addEventListener('click',function(){ if(!flowST&&window.innerWidth<=900){el.scrollIntoView({behavior:'smooth',block:'center'});return;} if(flowST){window.scrollTo({top:flowST.start+(flowST.end-flowST.start)*FMID[k],behavior:'smooth'});} else {flowAt(TH[k]+.01);} });
    el.querySelector('.jp').addEventListener('transitionend',function(){flowAt(fP);});
  });
  /* 手機版：裝置 mockup 以固定尺寸繪製再等比縮放 */
  var flStage=document.querySelector('.fl-stage');
  var mqMob=window.matchMedia('(max-width: 900px)');
  function fitDev(){
    var r=flStage.getBoundingClientRect(), mob=mqMob.matches;
    if(mob&&(r.width<10||r.height<10)){requestAnimationFrame(fitDev);return;}
    fps.forEach(function(p){var d=p.firstElementChild, lap=d.classList.contains('lap');
      if(!mob){d.style.removeProperty('--s');return;}
      d.style.setProperty('--s',Math.min(r.width/(lap?620:300),r.height/(lap?480:620)).toFixed(3));});
  }
  new ResizeObserver(fitDev).observe(flStage); window.addEventListener('resize',fitDev); window.addEventListener('load',fitDev); if(mqMob.addEventListener) mqMob.addEventListener('change',fitDev); fitDev();
  new ResizeObserver(layoutFork).observe(fork);
  layoutFork();
  flowAt(G?0:.01);

  /* 3D print tile: layers deposit strictly bottom-up, nozzle rides the current layer */
  (function(){
    var tile=document.querySelector('.t-print'); if(!tile) return;
    var layers=[].slice.call(tile.querySelectorAll('.vs i')), head=tile.querySelector('.vh'), plate=tile.closest('.plate'), scene=document.getElementById('lyScene');
    var N=layers.length, PER=.55, HOLD=1.2, t=0, last=performance.now(), hover=false;
    tile.addEventListener('pointerenter',function(){hover=true;}); tile.addEventListener('pointerleave',function(){hover=false;});
    var reduceM=matchMedia('(prefers-reduced-motion: reduce)').matches;
    function draw(){
      var build=N*PER, cyc=build+HOLD, tt=t%cyc, prog=Math.min(tt/PER,N), done=Math.floor(prog), frac=prog-done;
      layers.forEach(function(l,k){ l.style.transform='scaleX('+(k<done?1:k===done?frac:0)+')'; l.style.opacity=tt>build+HOLD*.75?String(1-(tt-build-HOLD*.75)/(HOLD*.25)):'1'; });
      var k=Math.min(done,N-1), lw=layers[k].offsetWidth||60, x=(tt<build?frac:1)*lw-lw/2;
      head.style.bottom=(5+Math.min(done+1,N)*7+1)+'px';
      head.style.transform='translateX('+x.toFixed(1)+'px)';
    }
    if(reduceM){ t=N*PER+.1; draw(); return; }
    (function loop(now){
      requestAnimationFrame(loop);
      var dt=Math.max(0,Math.min(.05,(now-last)/1000)); last=now;
      var paused=scene&&scene.classList.contains('focus')&&!plate.classList.contains('on');
      if(!paused){ t+=dt*(hover?2.2:1); draw(); }
    })(last);
  })();

  /* mobile floating menu */
  (function(){
    var fab=document.getElementById('fab'), menu=document.getElementById('fabMenu'); if(!fab) return;
    var links=[].slice.call(menu.querySelectorAll('a'));
    function setOpen(o){ menu.hidden=!o; fab.setAttribute('aria-expanded',o); fab.setAttribute('aria-label',o?'關閉選單':'開啟選單');
      if(o){ var y=window.scrollY+window.innerHeight*.4, cur=0; links.forEach(function(a,k){var t=document.querySelector(a.getAttribute('href')); if(t&&t.getBoundingClientRect().top+window.scrollY<=y) cur=k;}); links.forEach(function(a,k){a.classList.toggle('on',k===cur);}); } }
    fab.addEventListener('click',function(e){e.stopPropagation(); setOpen(menu.hidden);});
    links.forEach(function(a){ a.addEventListener('click',function(e){ e.preventDefault(); setOpen(false);
      var t=document.querySelector(a.getAttribute('href')); if(!t) return;
      var top=t.getBoundingClientRect().top+window.scrollY; if(t.parentNode&&t.parentNode.classList&&t.parentNode.classList.contains('pin-spacer')) top=t.parentNode.getBoundingClientRect().top+window.scrollY;
      window.scrollTo({top:Math.max(0,top),behavior:'smooth'}); }); });
    document.addEventListener('click',function(e){ if(!menu.hidden&&!menu.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') setOpen(false); });
  })();
  document.getElementById('contactForm').addEventListener('submit',function(e){
    e.preventDefault();
    var n=document.getElementById('fName').value.trim(), m=document.getElementById('fMail').value.trim(), msg=document.getElementById('formMsg');
    if(!n||!/.+@.+\..+/.test(m)){msg.style.color='#ff8fa3';msg.textContent='請填寫姓名與有效的 Email。';return;}
    /* TODO(後端)：在此串接表單 API，例如 fetch('/api/contact',{method:'POST',body:JSON.stringify({...})}) */
    msg.style.color='';msg.textContent='已收到（示意表單）。';
  });

  if(!G){ document.querySelector('.hero-statement').hidden=true; document.getElementById('layers').classList.add('static'); return; }

  /* anchor links: smooth scroll that respects pins */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href').slice(1), t=document.getElementById(id);
      if(!t) return;
      e.preventDefault();
      var y = id==='services'&&svcST ? svcST.start+2 : id==='top' ? 0 : (ScrollTrigger.getAll().filter(function(s){return s.pin && s.trigger===t;})[0]||{start:null}).start;
      if(y==null) y=t.getBoundingClientRect().top+window.scrollY-64;
      window.scrollTo({top:y,behavior:'smooth'});
    });
  });

  /* hero: intro + pinned morph */
  var lines=gsap.utils.toArray('.hero h1 .ln > span');
  gsap.from(lines,{yPercent:110,duration:1.1,stagger:.1,ease:'expo.out',delay:.1});
  gsap.from('.hero .eyebrow, .hero .lede, .hero .cta-row',{y:20,opacity:0,duration:.9,stagger:.08,ease:'expo.out',delay:.45});
  var heroTL=gsap.timeline({scrollTrigger:{trigger:'.hero',start:'top top',end:'+=130%',pin:true,scrub:.6,
    onUpdate:function(s){ var p=s.progress; hero.set({angle:42+p*58,amplitude:.6+p*.45,twist:1.6+p*1.6,ribbonWidth:.24+p*.22,speed:.7+p*.5}); }}});
  heroTL.to(lines[0],{xPercent:-30,opacity:0,ease:'power2.in'},0)
        .to(lines[1],{xPercent:30,opacity:0,ease:'power2.in'},.05)
        .to(lines[2],{xPercent:-30,opacity:0,ease:'power2.in'},.1)
        .to('.hero .eyebrow, .hero .lede, .hero .cta-row',{y:-30,opacity:0,stagger:.03},0)
        .to('.scroll-cue',{opacity:0,duration:.2},0)
        .to('.hero-veil',{opacity:.35},0)
        .fromTo('.hero-statement',{opacity:0,scale:.55},{opacity:1,scale:1,ease:'power3.out',duration:.6},.32)
        .to('.hero-statement',{scale:1.06,duration:.3},.92);

  var mm=gsap.matchMedia();
  /* layers (depth) */
  var lyScene=document.getElementById('lyScene'), plates=lyScene.querySelectorAll('.plate'), lyLis=document.querySelectorAll('#lyText li');
  var lyIdx=-2;
  function lyFocus(p){
    var i=p<.58?-1:p<.71?0:p<.86?1:2;
    if(i===lyIdx) return; lyIdx=i;
    lyScene.classList.toggle('focus',i>=0);
    plates.forEach(function(pl){pl.classList.toggle('on',+pl.dataset.l===i);});
    lyLis.forEach(function(li){li.classList.toggle('on',+li.dataset.l===i);});
  }
  var lyStage=document.querySelector('.ly-stage'), lyPin=document.querySelector('.ly-pin');
  var pw=function(){return lyScene.offsetWidth;};
  var spreadK=function(){var w=lyStage.clientWidth;return Math.max(.3,Math.min(.62,(w-pw()*1.15)/(2*pw())));};
  var centerShift=function(){var p=lyPin.getBoundingClientRect(),st=lyStage.getBoundingClientRect();return (p.left+p.width/2)-(st.left+st.width/2);};
  var stackX=function(i){return i*pw()*.17;}, stackY=function(i){return -i*pw()*.12;}, stackZ=function(i){return -i*70;};
  var sprX=function(i){return i*pw()*spreadK();};
  gsap.set(lyScene,{rotationY:-22,rotationX:5,x:function(){return centerShift()-stackX(1);}});
  plates.forEach(function(pl,i){gsap.set(pl,{x:stackX(i),y:function(){return -window.innerHeight*1.15;},z:stackZ(i),rotationZ:[-7,6,-5][i],opacity:0});});
  gsap.set('#lyText',{opacity:0,x:40});
  var lyTL=gsap.timeline({scrollTrigger:{trigger:'#layers',start:'top top',end:'+=400%',pin:true,scrub:.6,invalidateOnRefresh:true,onUpdate:function(s){lyFocus(s.progress);}}});
  lyTL.to('#lyTitle .lw',{y:function(i){return [-90,-30,40][i];},opacity:0,stagger:.02,duration:.12},.02)
      .to('#lyTitle .lx',{opacity:0,scale:.4,duration:.08},.02);
  plates.forEach(function(pl,i){
    lyTL.to(pl,{y:function(){return stackY(i);},rotationZ:0,opacity:1,duration:.12,ease:'back.out(1.5)'},.12+i*.09);
  });
  var lyMob=function(){return window.innerWidth<=900;};
  var slotX=function(k){return lyMob()?k*pw()*.13:sprX(k);}, slotY=function(k){return lyMob()?-k*pw()*.17:-k*pw()*.05;}, slotZ=function(k){return lyMob()?-k*70:-k*40;};
  lyTL.to(lyScene,{x:function(){return lyMob()?centerShift()-slotX(1):-sprX(1);},rotationY:function(){return lyMob()?-8:-14;},duration:.14,ease:'power2.inOut'},.42);
  plates.forEach(function(pl,i){
    lyTL.to(pl,{x:function(){return slotX(i);},y:function(){return slotY(i);},z:function(){return slotZ(i);},duration:.14,ease:'power2.inOut'},.42);
  });
  lyTL.to('#lyText',{opacity:1,x:0,duration:.08},.5);
  /* shuffle: the front card lifts off and is tucked in at the back of the deck */
  function toBack(order,at){
    var card=order[0], pl=plates[card], d=.12, last=order.length-1;
    var lift=function(){return -lyScene.offsetHeight*.42;};
    lyTL.to(pl,{x:function(){return (slotX(0)+slotX(last))/2;},y:function(){return lift()*1.15;},z:function(){return slotZ(last)-60;},rotationZ:7,duration:d*.5,ease:'power2.out'},at)
        .to(pl,{x:function(){return slotX(last);},y:function(){return slotY(last);},z:function(){return slotZ(last);},rotationZ:0,duration:d*.5,ease:'back.out(1.2)'},at+d*.5);
    var next=order.slice(1).concat(card);
    next.forEach(function(c,k){
      if(c===card) return;
      lyTL.to(plates[c],{x:function(){return slotX(k);},y:function(){return slotY(k);},z:function(){return slotZ(k);},duration:d*.7,ease:'power2.inOut'},at+d*.25);
    });
    return next;
  }
  var ord=[0,1,2];
  ord=toBack(ord,.68);
  ord=toBack(ord,.83);
  lyTL.to({},{duration:.02},.98);

  /* giant words */
  gsap.fromTo('.words .r1',{xPercent:0},{xPercent:-28,ease:'none',scrollTrigger:{trigger:'.words',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.fromTo('.words .r2',{xPercent:-30},{xPercent:-4,ease:'none',scrollTrigger:{trigger:'.words',start:'top bottom',end:'bottom top',scrub:true}});

  /* services pin */
  svcST=ScrollTrigger.create({trigger:'#services',start:'top top',end:function(){return '+='+Math.round(window.innerHeight*.85*N);},pin:true,anticipatePin:1,
    onUpdate:function(s){ var f=s.progress*N, i=Math.min(N-1,Math.floor(f)); setFill(i,f-i); show(i); }});
  gsap.from('.svc-side > *',{y:30,opacity:0,stagger:.06,duration:.8,ease:'expo.out',scrollTrigger:{trigger:'#services',start:'top 75%'}});
  gsap.from('#svcStage',{y:60,scale:.96,opacity:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:'#services',start:'top 75%'}});

  /* flow */
  mm.add('(min-width: 901px)',function(){
    flowST=ScrollTrigger.create({trigger:'#flow',start:'top top',end:'+=260%',pin:true,scrub:.5,onUpdate:function(s){flowAt(s.progress);}});
    return function(){flowST=null;};
  });
  mm.add('(max-width: 900px)',function(){
    ScrollTrigger.create({trigger:'#jr',start:'top 70%',end:'bottom 75%',onUpdate:function(s){flowAt(s.progress);}});
  });

  /* reveals */
  gsap.utils.toArray('[data-reveal]').forEach(function(el){
    gsap.from(el,{y:50,opacity:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 86%'}});
  });

  /* process horizontal */
  mm.add('(min-width: 700px)',function(){
    var track=document.getElementById('procTrack'), prog=document.getElementById('procProg');
    var dist=function(){return Math.max(0,track.scrollWidth-window.innerWidth);};
    gsap.to(track,{x:function(){return -dist();},ease:'none',scrollTrigger:{trigger:'#process',start:'top top',end:function(){return '+='+dist();},pin:true,scrub:.6,invalidateOnRefresh:true,
      onUpdate:function(s){prog.style.transform='scaleX('+s.progress+')';}}});
    gsap.from('.proc-card .num',{yPercent:40,opacity:0,stagger:.12,duration:1,ease:'expo.out',scrollTrigger:{trigger:'#process',start:'top 70%'}});
  });

  /* contact heading */
  var chars=[];
  document.querySelectorAll('#contactBig .ln').forEach(function(ln,i){
    var t=ln.textContent; ln.textContent='';
    Array.from(t).forEach(function(c){var s=document.createElement('span');s.className='ch'+(i===1?' grad':'');s.textContent=c;ln.appendChild(s);chars.push(s);});
  });
  gsap.from(chars,{yPercent:110,opacity:0,stagger:.05,ease:'power3.out',scrollTrigger:{trigger:'#contact',start:'top 80%',end:'top 30%',scrub:.6}});
  gsap.from('.contact > *',{y:40,opacity:0,stagger:.1,duration:1,ease:'expo.out',scrollTrigger:{trigger:'.contact',start:'top 85%'}});

  window.addEventListener('load',function(){ScrollTrigger.refresh();});
})();
