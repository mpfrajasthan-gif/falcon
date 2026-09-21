const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('falconDesktop', {
  openGoogleEarthOverlay: () => ipcRenderer.invoke('open-google-earth-overlay'),
  openFreeMapOverlay: options => ipcRenderer.invoke('open-free-map-overlay', options || {}),
  openExternal: url => ipcRenderer.invoke('open-external', url),
  exportPolishedMap: payload => ipcRenderer.invoke('export-polished-map', payload || {}),
  loadProjects: () => ipcRenderer.invoke('projects-load'),
  saveProjects: projects => ipcRenderer.invoke('projects-save', projects),
  deleteProject: projectId => ipcRenderer.invoke('projects-delete', projectId),
  openDxfEngineV15: project => ipcRenderer.invoke('open-dxf-engine-v15', project),
  openPremiumMapViewer: project => ipcRenderer.invoke('open-premium-map-viewer', project),
  loadPremiumProjectMap: project => ipcRenderer.invoke('premium-map-load-project', project),
  currentSession: () => ipcRenderer.invoke('auth-current-session'),
  logout: () => ipcRenderer.invoke('auth-logout')
});

window.addEventListener('DOMContentLoaded', () => {
  document.title = 'Falcon Hybrid Desktop V1.5.7 — Jaipur Pride Vistar';
  const style = document.createElement('style');
  style.textContent = `
    #falconSplash{position:fixed;inset:0;z-index:9999;background:radial-gradient(circle at 50% 38%,#26302b,#090d0b 68%);display:grid;place-items:center;transition:opacity .5s;color:#f6e7b5;font-family:Segoe UI,sans-serif}
    #falconSplash.hide{opacity:0;pointer-events:none}.splashBox{text-align:center}.splashLogo{width:112px;height:112px;margin:auto;border:2px solid #caa447;border-radius:28px;display:grid;place-items:center;font-size:64px;font-weight:900;color:#d7b557;background:#111815;box-shadow:0 0 45px #caa44744}.splashTitle{font-size:30px;font-weight:800;letter-spacing:3px;margin-top:20px}.splashProject{color:#b8b09a;margin-top:5px}.splashCredit{margin-top:28px;color:#928b79;font-size:12px;line-height:1.7}.splashCredit b{color:#d7b557;font-size:16px}
    #desktopHeader,#desktopLayers{display:none}
    @media(min-width:800px){
      #desktopHeader{display:flex;position:fixed;z-index:34;left:0;right:0;top:0;height:66px;background:#111614;border-bottom:1px solid #a98b45;align-items:center;padding:0 18px;gap:14px;box-shadow:0 5px 18px #0008}
      .dhLogo{width:42px;height:42px;border:1px solid #caa447;border-radius:12px;display:grid;place-items:center;color:#d7b557;font-weight:900;font-size:24px}.dhTitle b{display:block;color:#f2d67d;font-size:17px}.dhTitle small{color:#9d9786}.dhCredit{margin-left:auto;text-align:right;color:#8f8979;font-size:10px}.dhCredit b{display:block;color:#d7b557;font-size:12px}
      #desktopLayers{display:block;position:fixed;z-index:33;left:0;top:66px;bottom:28px;width:252px;background:#121816;border-right:1px solid #a98b45;padding:14px;color:#eee;overflow:auto;scrollbar-width:thin;scrollbar-color:#a98b45 #18211d}.dlHead{color:#d7b557;font-weight:800;margin:14px 0 8px}.layerHead{width:100%;display:flex;justify-content:space-between;border:0;background:none;color:#d7b557;font-weight:800;padding:14px 0 8px;cursor:pointer}.layerToggle{display:flex;align-items:center;gap:9px;padding:8px 6px;border-bottom:1px solid #28312d;font-size:12px}.layerToggle input{accent-color:#caa447}.legend{margin-top:18px;color:#d7b557;font-size:12px}.legendRow{display:flex;align-items:center;gap:8px;margin-top:9px;color:#c8c2af}.swatch{width:16px;height:16px;border-radius:4px}.moduleGrid{display:grid;grid-template-columns:1fr 1fr;gap:6px}.moduleBtn{min-height:38px;border:1px solid #34413b;border-radius:9px;background:#1b2521;color:#ddd;font:600 11px Segoe UI;cursor:pointer}.moduleBtn:hover{border-color:#caa447;color:#f2d67d}.moduleBtn.active{background:#caa447;color:#111;border-color:#caa447}.moduleBtn.soon{color:#8e978f}.moduleBtn.admin{border-color:#705f34}.moduleStatus{font-size:9px;display:block;font-weight:400;margin-top:2px;opacity:.72}.headerMeta{display:flex;align-items:center;gap:8px;margin-left:22px}.headerMeta select,.headerBadge{height:32px;border:1px solid #4c554f;border-radius:8px;background:#1a211e;color:#ddd;padding:0 9px;font:600 11px Segoe UI}.headerBadge{display:grid;place-items:center;color:#d7b557}.headerBadge.test{border-color:#806a35}.adminHead{color:#d7b557;font-size:10px;font-weight:800;margin:14px 0 7px;border-top:1px solid #303a35;padding-top:12px}#desktopActionDock{display:none!important}.dhCredit{display:none!important}#gridStatus{position:fixed;z-index:45;left:0;right:0;bottom:0;height:28px;background:#0d1311;border-top:1px solid #4d4328;color:#9fa79f;display:flex;align-items:center;padding:0 14px;gap:18px;font:10px Segoe UI}#gridStatus .statusRight{margin-left:auto;display:flex;gap:16px}#gridStatus b{color:#d7b557;font-weight:600}
      #map{left:252px!important;right:370px!important;top:66px!important;bottom:28px!important}
      #popup{display:flex!important;transform:none!important;right:0!important;top:66px!important;bottom:28px!important;width:370px!important;border-radius:0!important;border-left:1px solid #a98b45!important;height:auto!important;max-height:none!important;padding:20px!important}
      #popup .close{display:none!important}#popup .action{min-height:42px;border:1px solid #45534c;border-radius:9px;background:#1b2521;color:#eee;font:700 12px Segoe UI}#popup #bookAction{background:#d9b84f;color:#111;border-color:#d9b84f}.tools{right:388px!important;top:82px!important}.brand,#menu{display:none!important}.overlay{padding-left:270px!important;padding-right:388px!important}
      body.gridIvory #desktopHeader,body.gridIvory #desktopLayers,body.gridIvory #popup,body.gridIvory #gridStatus{background:#f6f0e3!important;color:#2d2a23!important}body.gridIvory #desktopHeader{border-bottom-color:#a37d2c!important}body.gridIvory #desktopLayers,body.gridIvory #popup{border-color:#a37d2c!important}body.gridIvory .dhTitle b,body.gridIvory .dlHead,body.gridIvory .adminHead,body.gridIvory .layerHead,body.gridIvory #popup h2,body.gridIvory #gridStatus b{color:#7a5a18!important}body.gridIvory .moduleBtn,body.gridIvory .headerMeta select,body.gridIvory .headerBadge{background:#e7ddc8!important;color:#2d2a23!important;border-color:#b9a77e!important}body.gridIvory .moduleBtn.active{background:#cba74e!important;color:#111!important}body.gridIvory .layerToggle,body.gridIvory .legendRow,body.gridIvory .grid{color:#5f584d!important}
      #gridModulePanel{position:fixed;z-index:80;inset:84px 392px 48px 274px;background:#111816;border:1px solid #9b7c36;border-radius:14px;color:#ddd;padding:20px;box-shadow:0 18px 60px #000b;overflow:auto;font:13px Segoe UI}#gridModulePanel[hidden]{display:none}#gridModulePanel h2{color:#f2d67d;margin:0}#gridModulePanel .mpTop{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #34413b;padding-bottom:12px}.mpClose{border:1px solid #665a3c;background:#202824;color:#eee;border-radius:8px;padding:7px 12px;cursor:pointer}.mpGrid{display:grid;grid-template-columns:repeat(2,minmax(180px,1fr));gap:12px;margin-top:16px}.mpCard{border:1px solid #34413b;border-radius:11px;background:#17201c;padding:14px}.mpCard b{display:block;color:#e5c461;margin-bottom:7px}.mpCard input,.mpCard select,.mpCard textarea{box-sizing:border-box;width:100%;margin-top:7px;padding:9px;border:1px solid #46534c;border-radius:7px;background:#0d1311;color:#eee}.mpCard textarea{min-height:72px;resize:vertical}.mpAction{margin-top:10px;border:1px solid #b59343;border-radius:8px;background:#d5b34f;color:#111;padding:9px 13px;font-weight:700;cursor:pointer}.mpNote{color:#9ca69e;font-size:11px;line-height:1.6}.moduleBtn .moduleStatus{color:#91a099}body.gridIvory #gridModulePanel{background:#f6f0e3;color:#2d2a23}body.gridIvory .mpCard{background:#ebe1cd;color:#2d2a23}body.gridIvory .mpCard input,body.gridIvory .mpCard select,body.gridIvory .mpCard textarea{background:#fffaf0;color:#222}
    }`;
    style.textContent += `@media(min-width:800px){body.falconCanonicalActive #map,body.falconCanonicalActive #popup,body.falconCanonicalActive .tools{visibility:hidden!important;pointer-events:none!important}#falconCanonicalMapHost{left:252px!important;top:66px!important;right:0!important;bottom:28px!important;width:auto!important;height:auto!important}#falconCanonicalMapFrame{width:100%!important;height:100%!important}}@media(max-width:799px){#falconCanonicalMapHost{left:0!important;top:0!important;right:0!important;bottom:0!important}}`;
style.textContent += `.dhLogo,.splashLogo{font-size:0!important;background-color:#111815!important;background-image:url('falcon_logo.png')!important;background-repeat:no-repeat!important;background-position:center!important;background-size:88%!important}`;
  document.head.appendChild(style);

  const splash = document.createElement('div');
  splash.id = 'falconSplash';
  splash.style.display = 'none';
  splash.innerHTML = '<div class="splashBox"><div class="splashLogo">F</div><div class="splashTitle">FALCON GRID</div><div class="splashProject">Jaipur Pride Vistar • Township Intelligence Platform • TEST BUILD</div><div class="splashCredit">CONCEPT, DESIGN &amp; DEVELOPED BY<br><b>SHADAB AZIZ</b></div></div>';
  document.body.appendChild(splash);
  setTimeout(() => { splash.classList.add('hide'); setTimeout(() => splash.remove(), 550); }, 2200);

  const header = document.createElement('header');
  header.id = 'desktopHeader';
  header.innerHTML = '<div class="dhLogo">F</div><div class="dhTitle"><b>FALCON GRID</b><small>TOWNSHIP INTELLIGENCE PLATFORM</small></div><div class="headerMeta"><select aria-label="Active developer"><option>Falcon Township</option></select><select id="falconActiveProject" aria-label="Active project"><option value="">No active project</option></select><button id="openPremiumMapBtn" class="headerBadge" type="button" disabled>Client Viewer</button><select id="gridTheme" aria-label="Theme"><option value="black">Black Gold</option><option value="ivory">Ivory Gold</option></select><span class="headerBadge">Admin</span><span class="headerBadge test">TEST LICENSE</span><span class="headerBadge" id="gridClockTop"></span></div>';
  document.body.appendChild(header);

  // MAP.8.5.1 — robust real-project dropdown normalization
  const activeProjectSelect = header.querySelector('#falconActiveProject');
  const openPremiumMapBtn = header.querySelector('#openPremiumMapBtn');
  let falconRegisteredProjects = [];

  const unwrapProjectList = raw => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.projects)) return raw.projects;
    if (Array.isArray(raw?.data?.projects)) return raw.data.projects;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  };

  const normalizeRegisteredProject = raw => {
    if (!raw || typeof raw !== 'object') return null;
    const id = String(
      raw.id ??
      raw.projectId ??
      raw.permanentProjectId ??
      raw.permanentId ??
      raw.code ??
      ''
    ).trim();

    const name = String(
      raw.name ??
      raw.projectName ??
      raw.title ??
      ''
    ).trim();

    if (!/^FP-\d{6}$/.test(id) || !name) return null;

    return { ...raw, id, name };
  };

  const syncPremiumMapButton = () => {
    const selectedId = String(activeProjectSelect?.value || '');
    const selected = falconRegisteredProjects.find(p => String(p.id) === selectedId);
    if (!openPremiumMapBtn) return;

    openPremiumMapBtn.disabled = !selected;
    openPremiumMapBtn.textContent = 'Client Viewer';
    openPremiumMapBtn.title = selected
      ? `Open Client Viewer for ${selected.name}`
      : 'Select a registered Falcon project first';
  };

  const renderRegisteredProjects = raw => {
    if (!activeProjectSelect) return [];

    const list = unwrapProjectList(raw)
      .map(normalizeRegisteredProject)
      .filter(Boolean);

    // De-duplicate by permanent Project ID.
    const seen = new Set();
    falconRegisteredProjects = list.filter(project => {
      if (seen.has(project.id)) return false;
      seen.add(project.id);
      return true;
    });

    activeProjectSelect.innerHTML =
      '<option value="">No active project</option>';

    falconRegisteredProjects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = `${project.id} • ${project.name}`;
      activeProjectSelect.appendChild(option);
    });

    const savedId = localStorage.getItem('falconActiveProjectId') || '';

    if (falconRegisteredProjects.some(p => p.id === savedId)) {
      activeProjectSelect.value = savedId;
    } else if (falconRegisteredProjects.length === 1) {
      // If there is only one real registered project, make it active automatically.
      activeProjectSelect.value = falconRegisteredProjects[0].id;
      localStorage.setItem('falconActiveProjectId', falconRegisteredProjects[0].id);
    }

    syncPremiumMapButton();
    return falconRegisteredProjects;
  };

  const loadRegisteredProjectsIntoHeader = async () => {
    if (!activeProjectSelect) return;

    activeProjectSelect.disabled = true;
    activeProjectSelect.innerHTML = '<option value="">Loading projects...</option>';

    try {
      const raw = await ipcRenderer.invoke('projects-load');
      const projects = renderRegisteredProjects(raw);

      if (!projects.length) {
        activeProjectSelect.innerHTML =
          '<option value="">No registered FP project</option>';
        activeProjectSelect.value = '';
        openPremiumMapBtn.disabled = true;
        console.warn('Falcon MAP.8.5.1: projects-load returned no valid FP project.', raw);
      }
    } catch (error) {
      activeProjectSelect.innerHTML =
        '<option value="">Project load failed</option>';
      activeProjectSelect.value = '';
      openPremiumMapBtn.disabled = true;
      console.error('Falcon registered project load failed:', error);
    } finally {
      activeProjectSelect.disabled = false;
      syncPremiumMapButton();
    }
  };

  activeProjectSelect?.addEventListener('change', () => {
    const id = String(activeProjectSelect.value || '');

    if (id) localStorage.setItem('falconActiveProjectId', id);
    else localStorage.removeItem('falconActiveProjectId');

    syncPremiumMapButton();

    document.dispatchEvent(new CustomEvent(
      'falcon-active-project-changed',
      { detail: { projectId: id } }
    ));
  });

  document.addEventListener('falcon-active-project-changed',()=>setTimeout(loadCanonicalFrame,30));

  openPremiumMapBtn?.addEventListener('click', async () => {
    const selected = falconRegisteredProjects.find(
      p => p.id === String(activeProjectSelect?.value || '')
    );

    if (!selected) {
      window.alert('Select a registered Falcon project first.');
      return;
    }

    openPremiumMapBtn.disabled = true;
    const oldText = openPremiumMapBtn.textContent;
    openPremiumMapBtn.textContent = 'Opening Map...';

    try {
      const result = await ipcRenderer.invoke('open-premium-map-viewer', {...selected, theme:(document.querySelector('#gridTheme')?.value||localStorage.getItem('falconGridTheme')||'black')});

      if (!result?.ok) {
        window.alert(
          result?.error ||
          'Premium Viewer could not be opened.'
        );
      }
    } catch (error) {
      window.alert(
        String(error?.message || error || 'Premium Viewer could not be opened.')
      );
    } finally {
      openPremiumMapBtn.textContent = oldText;
      syncPremiumMapButton();
    }
  });

  loadRegisteredProjectsIntoHeader();
  ipcRenderer.invoke('auth-current-session').then(session => {
    if (!session) return;
    const roleBadge = header.querySelector('.headerMeta > span.headerBadge:not(.test)');
    if (roleBadge) roleBadge.textContent = session.role;
    const userBadge = document.createElement('span');
    userBadge.className = 'headerBadge';
    userBadge.textContent = session.displayName;
    userBadge.title = `${session.userId} • ${session.username}`;
    const logout = document.createElement('button');
    logout.className = 'headerBadge';
    logout.style.cursor = 'pointer';
    logout.textContent = 'Logout';
    logout.addEventListener('click', async () => {
      if (window.confirm('Logout from Falcon?')) await ipcRenderer.invoke('auth-logout');
    });
    const clock = header.querySelector('#gridClockTop');
    header.querySelector('.headerMeta')?.insertBefore(userBadge, clock);
    header.querySelector('.headerMeta')?.insertBefore(logout, clock);
  });
  const aboutVersion = document.querySelector('#aboutPanel .grid div:first-child b');
  if (aboutVersion) aboutVersion.textContent = '0.10 Consolidated Workflow';

  const modulePanel=document.createElement('section');modulePanel.id='gridModulePanel';modulePanel.hidden=true;modulePanel.innerHTML='<div class="mpTop"><div><h2 id="mpTitle">Module</h2><div class="mpNote" id="mpSub">Falcon Grid test workspace</div></div><button class="mpClose">Close</button></div><div class="mpGrid" id="mpBody"></div>';document.body.appendChild(modulePanel);modulePanel.querySelector('.mpClose').onclick=()=>modulePanel.hidden=true;
  const moduleCopy={
    Projects:[['Project Profile','Project name, address, RERA and developer mapping','Project name'],['Portfolio','Multiple projects under one developer','Add test project']],
    Leads:[['New Lead','Capture enquiry and follow-up','Customer name / mobile'],['Lead Pipeline','New • Contacted • Visit • Converted','Next follow-up note']],
    Payments:[['Payment Register','Search booking and record actual receipts','Booking ID / receipt'],['Discount Control','Fixed amount or percentage; admin reason required','Approval note']],
    Reports:[['Business Reports','Inventory, booking, collection and outstanding','Choose report'],['Export Centre','Print/PDF/CSV foundation','Report date range']],
    Connect:[['WhatsApp Templates','Greetings, offers, receipts and project updates','Message template'],['Campaign Test','Select project/customer segment','Campaign name']],
    Staff:[['Staff & Brokers','Team, broker and commission registry','Name / mobile']],
    Studio:[['Project Studio','Admin project/map preparation workspace','Studio project name'],['Publish Control','Draft → Validate → Publish','Revision note']],
    'DXF Engine':[['DXF Import','Admin-only DXF staging and layer mapping','DXF file path'],['Validation','Plot closure, numbering, road and coordinate checks','EPSG / CRS']],
    'Audit Vault':[['Audit Events','Bookings, discounts, payments and status changes','Search event'],['Restore Point','Create a recoverable test checkpoint','Checkpoint note']],
    'Users/Roles':[['User Account','Admin, Manager, Sales, Accounts, Viewer','User name'],['Permissions','Module/action-level access test','Role name']],
    Licensing:[['Test Activation','Device and developer licence foundation','Activation key'],['Licence Status','TEST LICENSE • offline mode','Device name']],
    Settings:[['Company Branding','Company name/logo placeholder and receipt identity','Company name'],['System Settings','Currency, timezone, numbering and backups','Receipt prefix']]
  };
  const openTestModule=label=>{
    const cards=moduleCopy[label]||[[label,'Working test module','Test value']];
    modulePanel.querySelector('#mpTitle').textContent=label;
    modulePanel.querySelector('#mpSub').textContent='Active V0.5 test workspace • entries are saved locally on this computer';
    modulePanel.querySelector('#mpBody').innerHTML=cards.map((c,i)=>`<div class="mpCard"><b>${c[0]}</b><div class="mpNote">${c[1]}</div><input id="mp_${i}" placeholder="${c[2]}"><textarea id="mpn_${i}" placeholder="Notes / test observations"></textarea><button class="mpAction" data-save="${i}">Save Test Entry</button></div>`).join('');
    cards.forEach((c,i)=>{
      const key='falconGridModule_'+label+'_'+i;
      const noteKey=key+'_note';
      modulePanel.querySelector('#mp_'+i).value=localStorage.getItem(key)||'';
      modulePanel.querySelector('#mpn_'+i).value=localStorage.getItem(noteKey)||'';
      modulePanel.querySelector(`[data-save="${i}"]`).onclick=()=>{
        localStorage.setItem(key,modulePanel.querySelector('#mp_'+i).value);
        localStorage.setItem(noteKey,modulePanel.querySelector('#mpn_'+i).value);
        window.alert(label+' test entry saved offline.');
      };
    });
    modulePanel.hidden=false;
  };

  const layers = document.createElement('aside');
  layers.id = 'desktopLayers';
  layers.innerHTML = '<div class="dlHead" style="margin-top:0">WORKSPACE</div><div class="moduleGrid" id="moduleGrid"></div><div class="adminHead">ADMIN / CONTROL</div><div class="moduleGrid" id="adminModuleGrid"></div><button class="layerHead" id="layerHead">LAYER MANAGER <span>▾</span></button><div id="layerBody"></div>';
  const openDrawerItem = label => {
    const item=Array.from(document.querySelectorAll('#drawer .menuItem')).find(x=>x.textContent.includes(label));
    if(item){item.click();return true}return false;
  };
  const openV06Module=label=>{hideCanonicalMap();document.dispatchEvent(new CustomEvent('falcon-module',{detail:label}))};
  const modules = [
    ['Dashboard','active',()=>showCanonicalMap()],
    ['Projects','',()=>openV06Module('Projects')],
    ['Map','',()=>showCanonicalMap()],
    ['Leads','',()=>openV06Module('Leads')],
    ['Customers','',()=>openV06Module('Customers')],
    ['Bookings','',()=>openV06Module('Bookings')],
    ['Payments','',()=>openV06Module('Payments')],
    ['Receipts','',()=>openV06Module('Receipts')],
    ['Reports','',()=>openV06Module('Reports')],
    ['Connect','',()=>openV06Module('Connect')],
    ['Staff','',()=>openV06Module('Staff')],
    ['Backup','',()=>openV06Module('Backup')]
  ];
  const adminModules = [
    ['Studio','admin',()=>openV06Module('Studio')],
    ['DXF Engine','admin',()=>openV06Module('DXF Engine')],
    ['Audit Vault','admin',()=>openV06Module('Audit Vault')],
    ['Users/Roles','admin',()=>openV06Module('Users/Roles')],
    ['Licensing','admin',()=>openV06Module('Licensing')],
    ['Settings','admin',()=>openV06Module('Settings')]
  ];
  const addModuleButtons=(targetId,items)=>{const target=layers.querySelector('#'+targetId);items.forEach(([label,cls,action])=>{const b=document.createElement('button');b.className='moduleBtn '+cls;b.innerHTML=`${label}${cls.includes('soon')?'<span class="moduleStatus">Coming Soon</span>':''}`;b.addEventListener('click',action);target.appendChild(b)})};
  addModuleButtons('moduleGrid',modules);
  addModuleButtons('adminModuleGrid',adminModules);
  const layerDefs = [['plots','Plots'],['texts','Plot Numbers & Text'],['roads','Roads'],['specials','Facilities / Other Land'],['dims','Dimensions']];
  layerDefs.forEach(([id,label]) => {
    const row=document.createElement('label'); row.className='layerToggle';
    row.innerHTML=`<input type="checkbox" checked> ${label}`;
    row.querySelector('input').addEventListener('change',e=>{const n=document.getElementById(id);if(n)n.style.display=e.target.checked?'':'none'});
    layers.querySelector('#layerBody').appendChild(row);
  });
  layers.querySelector('#layerBody').insertAdjacentHTML('beforeend','<div class="legend">STATUS LEGEND</div><div class="legendRow"><i class="swatch" style="background:#eadcae"></i>Available</div><div class="legendRow"><i class="swatch" style="background:#dba64a"></i>Booked</div><div class="legendRow"><i class="swatch" style="background:#c45b55"></i>Sold</div><div class="legendRow"><i class="swatch" style="background:#6084ae"></i>Hold</div>');
  layers.querySelector('#layerHead').addEventListener('click',()=>{const body=layers.querySelector('#layerBody'),open=body.style.display!=='none';body.style.display=open?'none':'';layers.querySelector('#layerHead span').textContent=open?'▸':'▾'});
  document.body.appendChild(layers);



  // Falcon 1.5.0 — dedicated canonical Map Host.
  // The host owns the entire content rectangle; the iframe itself is 100% x 100%.
  // This avoids intrinsic iframe sizing/clipping and permanently removes the legacy map surface from Dashboard/Map.
  const canonicalHost=document.createElement('section');
  canonicalHost.id='falconCanonicalMapHost';
  canonicalHost.style.cssText='position:fixed;z-index:70;left:252px;top:66px;right:0;bottom:28px;overflow:hidden;background:#0b100e;display:block;min-width:0;min-height:0';
  const canonicalFrame=document.createElement('iframe');
  canonicalFrame.id='falconCanonicalMapFrame';
  canonicalFrame.setAttribute('title','Falcon Canonical Map Engine');
  canonicalFrame.setAttribute('frameborder','0');
  canonicalFrame.style.cssText='display:block;width:100%;height:100%;border:0;margin:0;padding:0;background:transparent;min-width:0;min-height:0';
  canonicalHost.appendChild(canonicalFrame);
  document.body.appendChild(canonicalHost);

  const currentShellTheme=()=>String(header.querySelector('#gridTheme')?.value||localStorage.getItem('falconGridTheme')||'black');
  const syncCanonicalTheme=()=>{
    const theme=currentShellTheme()==='ivory'?'ivory':'black';
    canonicalHost.style.background=theme==='ivory'?'#e9e2d3':'#0b100e';
    try{canonicalFrame.contentWindow?.postMessage({type:'falcon-shell-theme',theme},'*')}catch{}
  };
  const loadCanonicalFrame=()=>{
    const theme=currentShellTheme()==='ivory'?'ivory':'black';
    const projectId=String(activeProjectSelect?.value||localStorage.getItem('falconActiveProjectId')||'');
    const project=falconRegisteredProjects.find(p=>String(p.id)===projectId);
    const qp=new URLSearchParams({embed:'1',theme});
    if(projectId)qp.set('projectId',projectId);
    if(project?.name)qp.set('projectName',project.name);
    canonicalFrame.src=`canonical_map/index.html?${qp.toString()}`;
  };
  canonicalFrame.addEventListener('load',()=>{syncCanonicalTheme();setTimeout(()=>{try{canonicalFrame.contentWindow?.FalconMap?.fitHome?.()}catch{}},40)});
  loadCanonicalFrame();

  const showCanonicalMap=()=>{
    canonicalHost.style.display='block';
    document.body.classList.add('falconCanonicalActive');
    document.getElementById('v06Workspace')?.setAttribute('hidden','');
    syncCanonicalTheme();
  };
  const hideCanonicalMap=()=>{canonicalHost.style.display='none';document.body.classList.remove('falconCanonicalActive');};
  window.falconShowCanonicalMap=showCanonicalMap;
  window.falconHideCanonicalMap=hideCanonicalMap;
  document.body.classList.add('falconCanonicalActive');

  const savedTheme=localStorage.getItem('falconGridTheme')||'black';
  const themeSelect=header.querySelector('#gridTheme');themeSelect.value=savedTheme;document.body.classList.toggle('gridIvory',savedTheme==='ivory');syncCanonicalTheme();
  themeSelect.addEventListener('change',()=>{localStorage.setItem('falconGridTheme',themeSelect.value);document.body.classList.toggle('gridIvory',themeSelect.value==='ivory');syncCanonicalTheme()});

  const status=document.createElement('footer');status.id='gridStatus';status.innerHTML='<span><b>Falcon Hybrid V1.5.5</b> • Jaipur Pride Vistar</span><span>Database: Offline Workflow • Backup: Not created</span><span>GPS: Source KML</span><span class="statusRight"><span>Concept, Design &amp; Developed by <b>Shadab Aziz</b></span></span>';document.body.appendChild(status);
  const tick=()=>{const d=new Date(),date=[String(d.getDate()).padStart(2,'0'),String(d.getMonth()+1).padStart(2,'0'),d.getFullYear()].join('-');header.querySelector('#gridClockTop').textContent=date+' • '+d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})};tick();setInterval(tick,1000);

  const popup = document.getElementById('popup');
  if (popup) {
    const dock = document.createElement('div');
    dock.id = 'desktopActionDock';
    dock.innerHTML = '<div style="color:#d7b557;font-weight:800;font-size:12px;margin:13px 0 7px">DESKTOP ACTIONS</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><button class="mini gold" data-menu="Booking List">Bookings</button><button class="mini" data-menu="Customer List">Customers</button><button class="mini" data-menu="Receipts">Receipts</button><button class="mini" data-menu="Backup / Restore">Backup</button><button class="mini" id="desktopEarth" style="grid-column:1/-1">Google Earth Overlay</button></div>';
    dock.querySelectorAll('[data-menu]').forEach(button => button.addEventListener('click', () => {
      const label = button.dataset.menu;
      const target = Array.from(document.querySelectorAll('#drawer .menuItem')).find(x => x.textContent.includes(label));
      target?.click();
    }));
    dock.querySelector('#desktopEarth').addEventListener('click', async () => {
      const result = await ipcRenderer.invoke('open-google-earth-overlay');
      if (!result.ok) window.alert('Install Google Earth Pro and try again.\n\n' + result.error);
    });
    popup.appendChild(dock);
  }

  const drawer = document.getElementById('drawer');
  if (!drawer || document.getElementById('googleEarthOverlayButton')) return;

  const button = document.createElement('button');
  button.id = 'googleEarthOverlayButton';
  button.className = 'menuItem';
  button.innerHTML = '<span class="menuIcon">◎</span>Google Earth Overlay';
  button.addEventListener('click', async () => {
    drawer.classList.remove('show');
    document.getElementById('shade')?.classList.remove('show');
    const result = await ipcRenderer.invoke('open-google-earth-overlay');
    if (!result.ok) {
      window.alert('Google Earth overlay could not be opened. Install Google Earth Pro, then try again.\n\n' + result.error);
    }
  });

  const bookingButton = Array.from(drawer.querySelectorAll('.menuItem'))
    .find(item => item.textContent.includes('Booking List'));
  drawer.insertBefore(button, bookingButton || null);
});
