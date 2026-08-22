(() => {
  'use strict';

  const STORAGE_KEY = 'digitalOrdersCashier_v1';

  const STORE_TEMPLATES = [
    { id:'muslim', name:'مسلم', color:'#19b77f', color2:'#d6b05a', reportTitle:'كشف حساب متجر مسلم', footer:'شكرًا لاستخدام خدمات متجر مسلم', currency:'ر.س', style:'رسمي فاخر' },
    { id:'royal', name:'رويال', color:'#7c5cff', color2:'#c4a3ff', reportTitle:'كشف حساب متجر رويال', footer:'Royal Digital Services', currency:'ر.س', style:'ملكي عصري' },
    { id:'codex', name:'كودكس', color:'#00a8ff', color2:'#53d6ff', reportTitle:'تقرير طلبات كودكس', footer:'CODEX • Digital Codes', currency:'ر.س', style:'تقني أزرق' },
    { id:'flash', name:'فلاش ستور', color:'#ff8a00', color2:'#ffd166', reportTitle:'تقرير الطلبات المنفذة', footer:'Flash Store • سريع وواضح', currency:'ر.س', style:'طاقة سريعة' },
    { id:'nova', name:'نوفا', color:'#ec4899', color2:'#8b5cf6', reportTitle:'ملخص طلبات نوفا', footer:'NOVA • Digital Store', currency:'ر.س', style:'نيون وردي' },
    { id:'gamepoint', name:'جيم بوينت', color:'#22c55e', color2:'#84cc16', reportTitle:'كشف طلبات جيم بوينت', footer:'GAME POINT', currency:'ر.س', style:'أخضر ألعاب' },
    { id:'mastercode', name:'ماستر كود', color:'#ef4444', color2:'#f97316', reportTitle:'كشف حساب ماستر كود', footer:'MASTER CODE', currency:'ر.س', style:'أحمر قوي' },
    { id:'digitalhub', name:'ديجيتال هب', color:'#06b6d4', color2:'#3b82f6', reportTitle:'تقرير ديجيتال هب', footer:'DIGITAL HUB', currency:'ر.س', style:'سيان حديث' },
    { id:'elite', name:'إيليت ستور', color:'#eab308', color2:'#fef08a', reportTitle:'كشف حساب إيليت ستور', footer:'ELITE STORE', currency:'ر.س', style:'ذهبي فاخر' },
    { id:'goldcharge', name:'غولد تشارج', color:'#f59e0b', color2:'#fff0a8', reportTitle:'كشف طلبات غولد تشارج', footer:'GOLD CHARGE', currency:'ر.س', style:'ذهبي داكن' },
  ];

  const DEFAULT_PRODUCTS = [
    { id:uid(), name:'iTunes 10$', icon:'IT', price:null, count:0 },
    { id:uid(), name:'Razer Gold', icon:'RZ', price:null, count:0 },
    { id:uid(), name:'PlayStation', icon:'PS', price:null, count:0 },
    { id:uid(), name:'Steam Wallet', icon:'ST', price:null, count:0 },
    { id:uid(), name:'Google Play', icon:'GP', price:null, count:0 },
    { id:uid(), name:'Xbox', icon:'XB', price:null, count:0 },
  ];

  let state = loadState();
  let confirmAction = null;
  let activeSnapshot = null;

  const $ = (sel) => document.querySelector(sel);
  const els = {
    storeName: $('#storeName'), storeDot: $('#storeDot'), storePickerBtn: $('#storePickerBtn'), storeList: $('#storeList'),
    grandCount: $('#grandCount'), grandSales: $('#grandSales'), activeProducts: $('#activeProducts'), todayLabel: $('#todayLabel'), salesStat: $('#salesStat'),
    productsGrid: $('#productsGrid'), emptyState: $('#emptyState'), addProductBtn: $('#addProductBtn'), emptyAddBtn: $('#emptyAddBtn'),
    bottomCount: $('#bottomCount'), bottomSales: $('#bottomSales'), reportBtn: $('#reportBtn'), settingsBtn: $('#settingsBtn'), historyBtn: $('#historyBtn'),
    sheetBackdrop: $('#sheetBackdrop'), storeSheet: $('#storeSheet'), productSheet: $('#productSheet'), settingsSheet: $('#settingsSheet'), historySheet: $('#historySheet'), reportSheet: $('#reportSheet'),
    productForm: $('#productForm'), editingProductId: $('#editingProductId'), productNameInput: $('#productNameInput'), productPriceInput: $('#productPriceInput'), productIconInput: $('#productIconInput'), deleteProductBtn: $('#deleteProductBtn'), productFormEyebrow: $('#productFormEyebrow'), productFormTitle: $('#productFormTitle'),
    settingsForm: $('#settingsForm'), settingsStoreName: $('#settingsStoreName'), settingsReportTitle: $('#settingsReportTitle'), settingsCurrency: $('#settingsCurrency'), settingsColor: $('#settingsColor'), settingsFooter: $('#settingsFooter'), settingsShowPrices: $('#settingsShowPrices'), resetShiftBtn: $('#resetShiftBtn'),
    historyList: $('#historyList'), reportPreview: $('#reportPreview'), reportLogo: $('#reportLogo'), reportStoreName: $('#reportStoreName'), reportTitle: $('#reportTitle'), reportDate: $('#reportDate'), reportTime: $('#reportTime'), reportRows: $('#reportRows'), reportTotalCount: $('#reportTotalCount'), reportSalesTotalRow: $('#reportSalesTotalRow'), reportTotalSales: $('#reportTotalSales'), reportPriceNote: $('#reportPriceNote'), reportFooter: $('#reportFooter'),
    downloadReportBtn: $('#downloadReportBtn'), shareReportBtn: $('#shareReportBtn'), exportCanvas: $('#exportCanvas'),
    confirmDialog: $('#confirmDialog'), confirmTitle: $('#confirmTitle'), confirmText: $('#confirmText'), confirmCancel: $('#confirmCancel'), confirmOk: $('#confirmOk'), toast: $('#toast')
  };

  function uid(){ return 'id_' + Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
  function cloneProducts(){ return DEFAULT_PRODUCTS.map(p => ({...p,id:uid()})); }
  function hexToRgb(hex){
    const h = (hex || '#8b5cf6').replace('#','');
    const v = h.length === 3 ? h.split('').map(x=>x+x).join('') : h;
    const n = parseInt(v,16);
    return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
  }
  function formatNumber(n){ return new Intl.NumberFormat('ar-SA',{maximumFractionDigits:2}).format(n || 0); }
  function formatDate(ts=Date.now()){
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ts));
  }
  function formatTime(ts=Date.now()){
    return new Intl.DateTimeFormat('ar-SA',{hour:'2-digit',minute:'2-digit'}).format(new Date(ts));
  }

  function initialStore(template){
    return {
      id:template.id, name:template.name, color:template.color, color2:template.color2,
      reportTitle:template.reportTitle, footer:template.footer, currency:template.currency,
      style:template.style, showPrices:true, products:cloneProducts(), history:[]
    };
  }

  function defaultState(){
    return { version:1, activeStoreId:'muslim', stores:Object.fromEntries(STORE_TEMPLATES.map(t => [t.id,initialStore(t)])) };
  }

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if(!parsed.stores || !parsed.activeStoreId) return defaultState();
      // Merge newly introduced templates without deleting user data.
      STORE_TEMPLATES.forEach(t => { if(!parsed.stores[t.id]) parsed.stores[t.id] = initialStore(t); });
      return parsed;
    }catch(e){ return defaultState(); }
  }
  function saveState(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
  function store(){ return state.stores[state.activeStoreId]; }
  function totals(s=store()){
    const count = s.products.reduce((sum,p)=>sum+(Number(p.count)||0),0);
    const active = s.products.filter(p=>Number(p.count)>0).length;
    const priced = s.products.filter(p=>Number(p.count)>0 && p.price !== null && p.price !== '' && Number.isFinite(Number(p.price)));
    const unpricedActive = s.products.some(p=>Number(p.count)>0 && (p.price === null || p.price === '' || !Number.isFinite(Number(p.price))));
    const sales = priced.reduce((sum,p)=>sum+Number(p.price)*Number(p.count),0);
    return {count,active,sales,hasPriced:priced.length>0,unpricedActive};
  }

  function setTheme(){
    const s=store();
    document.documentElement.style.setProperty('--brand',s.color || '#8b5cf6');
    document.documentElement.style.setProperty('--brand-rgb',hexToRgb(s.color || '#8b5cf6'));
    document.querySelector('meta[name="theme-color"]').setAttribute('content',s.color || '#0b1020');
  }

  function render(){
    setTheme();
    const s=store(), t=totals(s);
    els.storeName.textContent=s.name;
    els.storeDot.style.background=s.color;
    els.storeDot.style.boxShadow=`0 0 18px ${s.color}aa`;
    els.grandCount.textContent=formatNumber(t.count);
    els.activeProducts.textContent=formatNumber(t.active);
    els.grandSales.textContent=t.hasPriced ? `${formatNumber(t.sales)} ${s.currency}` : '—';
    els.salesStat.style.opacity=t.hasPriced?'1':'.5';
    els.bottomCount.textContent=formatNumber(t.count);
    els.bottomSales.textContent=t.hasPriced ? `${formatNumber(t.sales)} ${s.currency}${t.unpricedActive?' + غير مسعّر':''}` : 'لا توجد أسعار';
    els.todayLabel.textContent=`${formatDate()} • ${s.name}`;
    renderProducts();
    saveState();
  }

  function renderProducts(){
    const s=store();
    els.productsGrid.innerHTML='';
    els.emptyState.classList.toggle('hidden',s.products.length>0);
    els.productsGrid.classList.toggle('hidden',s.products.length===0);
    s.products.forEach(p=>{
      const priced=p.price !== null && p.price !== '' && Number.isFinite(Number(p.price));
      const card=document.createElement('article');
      card.className=`product-card ${Number(p.count)===0?'zero':''}`;
      card.dataset.id=p.id;
      const priceText = priced ? `${formatNumber(Number(p.price))} ${s.currency}` : 'بدون سعر';
      card.innerHTML=`
        <div class="product-main">
          <div class="product-badge">${escapeHtml((p.icon||initials(p.name)).slice(0,3))}</div>
          <div class="product-text">
            <h3>${escapeHtml(p.name)}</h3>
            <p>${s.showPrices ? priceText : (priced?'سعر محفوظ':'عداد فقط')}</p>
            <button class="edit-link" data-action="edit" data-id="${p.id}">تعديل</button>
          </div>
        </div>
        <div class="counter">
          <button class="counter-btn minus" data-action="minus" data-id="${p.id}" aria-label="نقص ${escapeHtml(p.name)}">−</button>
          <span class="counter-value">${formatNumber(p.count)}</span>
          <button class="counter-btn plus" data-action="plus" data-id="${p.id}" aria-label="زيادة ${escapeHtml(p.name)}">+</button>
        </div>`;
      els.productsGrid.appendChild(card);
    });
  }

  function initials(name){
    const words=(name||'').trim().split(/\s+/).filter(Boolean);
    if(!words.length)return 'PR';
    if(words.length===1)return words[0].slice(0,2).toUpperCase();
    return (words[0][0]+words[1][0]).toUpperCase();
  }
  function escapeHtml(str=''){
    return String(str).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));
  }

  function openSheet(el){
    document.querySelectorAll('.sheet').forEach(s=>s.classList.add('hidden'));
    el.classList.remove('hidden');
    els.sheetBackdrop.classList.remove('hidden');
    document.body.style.overflow='hidden';
  }
  function closeSheets(){
    document.querySelectorAll('.sheet').forEach(s=>s.classList.add('hidden'));
    els.sheetBackdrop.classList.add('hidden');
    document.body.style.overflow='';
  }

  function renderStoreList(){
    els.storeList.innerHTML='';
    STORE_TEMPLATES.forEach(t=>{
      const s=state.stores[t.id];
      const btn=document.createElement('button');
      btn.className=`store-option ${t.id===state.activeStoreId?'active':''}`;
      btn.dataset.store=t.id;
      btn.innerHTML=`<i class="store-swatch" style="background:${s.color}"></i><span><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(t.style)}</small></span>`;
      els.storeList.appendChild(btn);
    });
  }

  function openProduct(product=null){
    els.productForm.reset();
    els.editingProductId.value=product?.id||'';
    els.productNameInput.value=product?.name||'';
    els.productPriceInput.value=(product && product.price!==null && product.price!=='')?product.price:'';
    els.productIconInput.value=product?.icon||'';
    els.deleteProductBtn.classList.toggle('hidden',!product);
    els.productFormEyebrow.textContent=product?'تعديل المنتج':'منتج جديد';
    els.productFormTitle.textContent=product?'تعديل المنتج':'إضافة منتج';
    openSheet(els.productSheet);
    setTimeout(()=>els.productNameInput.focus(),120);
  }

  function openSettings(){
    const s=store();
    els.settingsStoreName.value=s.name;
    els.settingsReportTitle.value=s.reportTitle;
    els.settingsCurrency.value=s.currency;
    els.settingsColor.value=s.color;
    els.settingsFooter.value=s.footer||'';
    els.settingsShowPrices.checked=s.showPrices!==false;
    openSheet(els.settingsSheet);
  }

  function makeSnapshot(s=store()){
    const ts=Date.now();
    return {
      id:uid(), storeId:s.id, storeName:s.name, color:s.color, color2:s.color2, reportTitle:s.reportTitle,
      footer:s.footer, currency:s.currency, createdAt:ts,
      products:s.products.filter(p=>Number(p.count)>0).map(p=>({name:p.name,icon:p.icon,price:p.price,count:Number(p.count)}))
    };
  }

  function renderReport(snapshot=null){
    const snap=snapshot||makeSnapshot();
    activeSnapshot=snap;
    const t=snapshotTotals(snap);
    els.reportPreview.style.setProperty('--report-brand',snap.color||store().color);
    els.reportLogo.style.background=snap.color||store().color;
    els.reportLogo.textContent=(snap.storeName||'م').trim().charAt(0)||'م';
    els.reportStoreName.textContent=snap.storeName;
    els.reportTitle.textContent=snap.reportTitle||'كشف حساب الطلبات المنفذة';
    els.reportDate.textContent=formatDate(snap.createdAt);
    els.reportTime.textContent=formatTime(snap.createdAt);
    els.reportTotalCount.textContent=formatNumber(t.count);
    els.reportRows.innerHTML='';
    snap.products.forEach(p=>{
      const priced=p.price!==null && p.price!=='' && Number.isFinite(Number(p.price));
      const row=document.createElement('div');
      row.className=`report-row ${priced?'':'no-price'}`;
      row.innerHTML=`<span class="name">${escapeHtml(p.name)}</span><span class="qty">× ${formatNumber(p.count)}</span>${priced?`<span class="value">${formatNumber(Number(p.price)*p.count)} ${escapeHtml(snap.currency)}</span>`:''}`;
      els.reportRows.appendChild(row);
    });
    if(!snap.products.length){
      els.reportRows.innerHTML='<div style="text-align:center;padding:26px 10px;color:#9299aa;font-size:11px">لا توجد طلبات منفذة في هذا الكشف</div>';
    }
    els.reportSalesTotalRow.classList.toggle('hidden',!t.hasPriced);
    els.reportTotalSales.textContent=`${formatNumber(t.sales)} ${snap.currency}`;
    els.reportPriceNote.classList.toggle('hidden',!t.unpricedActive || !t.hasPriced);
    els.reportFooter.textContent=snap.footer||'';
    openSheet(els.reportSheet);
  }

  function snapshotTotals(snap){
    const count=snap.products.reduce((sum,p)=>sum+Number(p.count||0),0);
    const priced=snap.products.filter(p=>p.price!==null && p.price!=='' && Number.isFinite(Number(p.price)));
    return {
      count,
      sales:priced.reduce((sum,p)=>sum+Number(p.price)*Number(p.count||0),0),
      hasPriced:priced.length>0,
      unpricedActive:snap.products.some(p=>p.price===null || p.price==='' || !Number.isFinite(Number(p.price)))
    };
  }

  function renderHistory(){
    const s=store();
    els.historyList.innerHTML='';
    if(!s.history.length){
      els.historyList.innerHTML='<div class="history-empty">لا توجد كشوف محفوظة لهذا المتجر حتى الآن.</div>';
      return;
    }
    [...s.history].sort((a,b)=>b.createdAt-a.createdAt).forEach(h=>{
      const t=snapshotTotals(h);
      const card=document.createElement('article');
      card.className='history-card';
      card.innerHTML=`<div><h3>${escapeHtml(h.reportTitle||'كشف حساب')}</h3><p>${formatDate(h.createdAt)} • ${formatTime(h.createdAt)}${t.hasPriced?` • ${formatNumber(t.sales)} ${escapeHtml(h.currency)}`:''}</p><button data-history="${h.id}">فتح الكشف</button></div><div class="history-total">${formatNumber(t.count)}<small style="display:block;font-size:9px;color:var(--muted);font-weight:600">طلب</small></div>`;
      els.historyList.appendChild(card);
    });
  }

  function archiveAndReset(){
    const s=store(), t=totals(s);
    if(t.count===0){ showToast('لا توجد طلبات لحفظها'); return; }
    const snap=makeSnapshot(s);
    s.history.push(snap);
    s.history=s.history.slice(-80);
    s.products.forEach(p=>p.count=0);
    saveState();render();closeConfirm();closeSheets();showToast('تم حفظ الوردية وتصفير العدادات');
  }

  function showConfirm(title,text,action){
    els.confirmTitle.textContent=title;els.confirmText.textContent=text;confirmAction=action;
    els.confirmDialog.classList.remove('hidden');
  }
  function closeConfirm(){els.confirmDialog.classList.add('hidden');confirmAction=null;}
  let toastTimer;
  function showToast(msg){clearTimeout(toastTimer);els.toast.textContent=msg;els.toast.classList.add('show');toastTimer=setTimeout(()=>els.toast.classList.remove('show'),1800);}

  function roundRect(ctx,x,y,w,h,r){
    const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
  }
  function drawText(ctx,text,x,y,size,weight='400',color='#111827',align='right'){
    ctx.save();ctx.direction='rtl';ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillStyle=color;ctx.font=`${weight} ${size}px system-ui,-apple-system,"Segoe UI",Tahoma,Arial,sans-serif`;ctx.fillText(text,x,y);ctx.restore();
  }
  function fitText(ctx,text,maxWidth,startSize,minSize=26,weight='700'){
    let s=startSize;while(s>minSize){ctx.font=`${weight} ${s}px system-ui,-apple-system,"Segoe UI",Tahoma,Arial,sans-serif`;if(ctx.measureText(text).width<=maxWidth)break;s-=2;}return s;
  }

  function drawSnapshotToCanvas(snap){
    const canvas=els.exportCanvas, ctx=canvas.getContext('2d');
    const W=1080, margin=72, rowH=78;
    const count=Math.max(snap.products.length,1);
    const dynamicH=420 + count*rowH + 330;
    const H=Math.max(1350,dynamicH);
    canvas.width=W;canvas.height=H;
    const brand=snap.color||'#7c5cff', brand2=snap.color2||brand, t=snapshotTotals(snap);

    ctx.fillStyle='#f5f7fb';ctx.fillRect(0,0,W,H);
    const grad=ctx.createLinearGradient(0,0,W,0);grad.addColorStop(0,brand2);grad.addColorStop(1,brand);ctx.fillStyle=grad;ctx.fillRect(0,0,W,22);

    // decorative glow
    const rg=ctx.createRadialGradient(W-120,90,10,W-120,90,230);rg.addColorStop(0,hexAlpha(brand,.18));rg.addColorStop(1,hexAlpha(brand,0));ctx.fillStyle=rg;ctx.fillRect(W-360,0,360,320);

    // logo
    roundRect(ctx,W-margin-116,74,116,116,34);ctx.fillStyle=brand;ctx.fill();
    drawText(ctx,(snap.storeName||'م').trim().charAt(0)||'م',W-margin-58,153,52,'900','#ffffff','center');
    drawText(ctx,'DIGITAL ORDERS',W-margin-150,104,20,'800','#8790a3','right');
    const storeSize=fitText(ctx,snap.storeName,W-300,55,34,'900');drawText(ctx,snap.storeName,W-margin-150,160,storeSize,'900','#121725','right');
    drawText(ctx,snap.reportTitle||'كشف حساب الطلبات المنفذة',W-margin-150,205,25,'600','#687086','right');

    ctx.strokeStyle='#dfe4ec';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(margin,255);ctx.lineTo(W-margin,255);ctx.stroke();
    drawText(ctx,formatDate(snap.createdAt),W-margin,300,24,'700','#6f7789','right');
    drawText(ctx,formatTime(snap.createdAt),margin,300,24,'700','#6f7789','left');

    let y=360;
    if(!snap.products.length){
      drawText(ctx,'لا توجد طلبات منفذة في هذا الكشف',W/2,y+80,30,'600','#939bad','center');y+=160;
    }else{
      snap.products.forEach((p,i)=>{
        const priced=p.price!==null && p.price!=='' && Number.isFinite(Number(p.price));
        if(i%2===0){roundRect(ctx,margin,y-48,W-margin*2,rowH-8,18);ctx.fillStyle='#ffffff';ctx.fill();}
        const nameSize=fitText(ctx,p.name,560,31,22,'800');drawText(ctx,p.name,W-margin,y,nameSize,'800','#1a2030','right');
        drawText(ctx,`× ${formatNumber(p.count)}`,W-700,y,29,'900',brand,'center');
        if(priced) drawText(ctx,`${formatNumber(Number(p.price)*p.count)} ${snap.currency}`,margin,y,25,'700','#626c80','left');
        y+=rowH;
      });
    }

    y+=35;roundRect(ctx,margin,y,W-margin*2,142,t.hasPriced?24:20);ctx.fillStyle='#e9edf4';ctx.fill();
    drawText(ctx,'إجمالي الطلبات',W-margin-28,y+52,25,'700','#70798b','right');
    drawText(ctx,formatNumber(t.count),margin+28,y+55,42,'900','#151a26','left');
    if(t.hasPriced){
      drawText(ctx,'إجمالي قيمة المنتجات المسعّرة',W-margin-28,y+105,23,'700','#70798b','right');
      drawText(ctx,`${formatNumber(t.sales)} ${snap.currency}`,margin+28,y+106,31,'900',brand,'left');
    }
    y+=185;
    if(t.hasPriced && t.unpricedActive){drawText(ctx,'* الإجمالي المالي يشمل المنتجات المسعّرة فقط.',W-margin,y,19,'500','#8c94a4','right');y+=42;}
    if(snap.footer){drawText(ctx,snap.footer,W/2,y+30,20,'600','#929aab','center');}
    drawText(ctx,'كشف مُنشأ بواسطة أداة عداد الطلبات',W/2,H-62,18,'500','#a8afbd','center');
    return canvas;
  }

  function hexAlpha(hex,a){
    const h=hex.replace('#','');const v=h.length===3?h.split('').map(x=>x+x).join(''):h;const n=parseInt(v,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
  }
  async function canvasBlob(canvas){ return await new Promise(resolve=>canvas.toBlob(resolve,'image/png',1)); }
  function filenameFor(snap){ return `${sanitizeFile(snap.storeName)}-${sanitizeFile(snap.reportTitle||'كشف')}-${new Date(snap.createdAt).toISOString().slice(0,10)}.png`; }
  function sanitizeFile(s){ return String(s||'report').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,'-'); }

  async function downloadReport(){
    if(!activeSnapshot)return;
    const canvas=drawSnapshotToCanvas(activeSnapshot);
    const blob=await canvasBlob(canvas);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filenameFor(activeSnapshot);document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),800);showToast('تم تجهيز صورة الكشف');
  }
  async function shareReport(){
    if(!activeSnapshot)return;
    const canvas=drawSnapshotToCanvas(activeSnapshot);const blob=await canvasBlob(canvas);const file=new File([blob],filenameFor(activeSnapshot),{type:'image/png'});
    if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
      try{await navigator.share({title:activeSnapshot.reportTitle,text:`${activeSnapshot.storeName} — ${activeSnapshot.reportTitle}`,files:[file]});}catch(e){if(e.name!=='AbortError')downloadReport();}
    }else{downloadReport();showToast('المشاركة غير مدعومة؛ تم تنزيل الصورة بدلًا منها');}
  }

  // Events
  els.storePickerBtn.addEventListener('click',()=>{renderStoreList();openSheet(els.storeSheet)});
  els.storeList.addEventListener('click',e=>{
    const btn=e.target.closest('[data-store]');if(!btn)return;
    state.activeStoreId=btn.dataset.store;render();closeSheets();showToast(`تم اختيار ${store().name}`);
  });
  els.addProductBtn.addEventListener('click',()=>openProduct());els.emptyAddBtn.addEventListener('click',()=>openProduct());
  els.productsGrid.addEventListener('click',e=>{
    const btn=e.target.closest('[data-action]');if(!btn)return;
    const p=store().products.find(x=>x.id===btn.dataset.id);if(!p)return;
    if(btn.dataset.action==='plus'){p.count=Number(p.count||0)+1;bump(btn);render();}
    if(btn.dataset.action==='minus'){p.count=Math.max(0,Number(p.count||0)-1);bump(btn);render();}
    if(btn.dataset.action==='edit'){openProduct(p);}
  });
  function bump(btn){const card=btn.closest('.product-card');if(!card)return;card.classList.remove('bump');void card.offsetWidth;card.classList.add('bump');}

  els.productForm.addEventListener('submit',e=>{
    e.preventDefault();
    const name=els.productNameInput.value.trim();if(!name)return;
    const priceRaw=els.productPriceInput.value.trim();const price=priceRaw===''?null:Number(priceRaw);
    const icon=(els.productIconInput.value.trim()||initials(name)).slice(0,3);
    const id=els.editingProductId.value;
    if(id){const p=store().products.find(x=>x.id===id);if(p){p.name=name;p.price=price;p.icon=icon;}}
    else store().products.push({id:uid(),name,price,icon,count:0});
    render();closeSheets();showToast(id?'تم تعديل المنتج':'تمت إضافة المنتج');
  });
  els.deleteProductBtn.addEventListener('click',()=>{
    const id=els.editingProductId.value;if(!id)return;
    const p=store().products.find(x=>x.id===id);showConfirm('حذف المنتج',`سيتم حذف «${p?.name||'المنتج'}» من هذا المتجر.`,()=>{store().products=store().products.filter(x=>x.id!==id);render();closeConfirm();closeSheets();showToast('تم حذف المنتج');});
  });

  els.settingsBtn.addEventListener('click',openSettings);
  els.settingsForm.addEventListener('submit',e=>{
    e.preventDefault();const s=store();
    s.name=els.settingsStoreName.value.trim()||s.name;
    s.reportTitle=els.settingsReportTitle.value.trim()||'كشف حساب الطلبات المنفذة';
    s.currency=els.settingsCurrency.value.trim()||'ر.س';
    s.color=els.settingsColor.value||s.color;
    s.footer=els.settingsFooter.value.trim();
    s.showPrices=els.settingsShowPrices.checked;
    render();closeSheets();showToast('تم حفظ إعدادات المتجر');
  });
  els.resetShiftBtn.addEventListener('click',()=>showConfirm('إنهاء الوردية',`سيُحفظ كشف ${store().name} في السجل ثم تُصفّر جميع العدادات.`,archiveAndReset));

  els.historyBtn.addEventListener('click',()=>{renderHistory();openSheet(els.historySheet)});
  els.historyList.addEventListener('click',e=>{const btn=e.target.closest('[data-history]');if(!btn)return;const h=store().history.find(x=>x.id===btn.dataset.history);if(h)renderReport(h);});
  els.reportBtn.addEventListener('click',()=>renderReport());
  els.downloadReportBtn.addEventListener('click',downloadReport);els.shareReportBtn.addEventListener('click',shareReport);

  document.querySelectorAll('.close-sheet').forEach(btn=>btn.addEventListener('click',closeSheets));
  els.sheetBackdrop.addEventListener('click',closeSheets);
  els.confirmCancel.addEventListener('click',closeConfirm);els.confirmOk.addEventListener('click',()=>{const fn=confirmAction;if(fn)fn();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!els.confirmDialog.classList.contains('hidden'))closeConfirm();else closeSheets();}});

  render();
})();
