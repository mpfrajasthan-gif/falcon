const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

app.setName('Falcon Hybrid');
const userData = path.join(app.getPath('appData'), 'FalconHybrid');
app.setPath('userData', userData);
app.setPath('cache', path.join(userData, 'Cache'));

const storePath = () => path.join(app.getPath('userData'), 'falcon-store.json');
function readStore() {
  try { return JSON.parse(fs.readFileSync(storePath(), 'utf8')); }
  catch { return { projects: [] }; }
}
function writeStore(data) {
  fs.mkdirSync(path.dirname(storePath()), { recursive: true });
  const temp = `${storePath()}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8');
  try { fs.renameSync(temp, storePath()); }
  catch { fs.copyFileSync(temp, storePath()); fs.unlinkSync(temp); }
}


const authPath = () => path.join(app.getPath('userData'), 'falcon-auth.json');
let activeSession = null;
let loginWindow = null;

function readAuth() {
  try { return JSON.parse(fs.readFileSync(authPath(), 'utf8')); }
  catch { return { users: [], audit: [] }; }
}
function writeAuth(data) {
  fs.mkdirSync(path.dirname(authPath()), { recursive: true });
  const temp = `${authPath()}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8');
  try { fs.renameSync(temp, authPath()); }
  catch { fs.copyFileSync(temp, authPath()); fs.unlinkSync(temp); }
}
function cleanText(value, max = 80) { return String(value || '').trim().slice(0, max); }
function normalizeUser(value) { return cleanText(value, 50).toLowerCase().replace(/\s+/g, ''); }
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}
function verifyPassword(password, user) {
  try {
    const candidate = crypto.scryptSync(String(password), user.salt, 64);
    const stored = Buffer.from(user.passwordHash, 'hex');
    return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
  } catch { return false; }
}
function appendAuthAudit(data, action, details = {}) {
  data.audit = Array.isArray(data.audit) ? data.audit : [];
  data.audit.push({ id: crypto.randomUUID(), at: new Date().toISOString(), action, ...details });
  if (data.audit.length > 1000) data.audit = data.audit.slice(-1000);
}
function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 1040, height: 670, minWidth: 760, minHeight: 560, resizable: true,
    center: true, show: false, backgroundColor: '#09100d', autoHideMenuBar: true,
    title: 'Falcon Secure Login', icon: path.join(__dirname, 'build', 'falcon.ico'),
    webPreferences: { preload: path.join(__dirname, 'auth-preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  loginWindow.loadFile(path.join(__dirname, 'auth', 'login.html'));
  loginWindow.once('ready-to-show', () => loginWindow.show());
  loginWindow.on('closed', () => { loginWindow = null; if (!activeSession && !mainWindow) app.quit(); });
}

let mainWindow;
function createSplash() {
  const splash = new BrowserWindow({
    width: 620, height: 390, frame: false, transparent: false, resizable: false,
    alwaysOnTop: true, center: true, show: false, backgroundColor: '#0b110f',
    icon: path.join(__dirname, 'build', 'falcon.ico'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  splash.loadFile(path.join(__dirname, 'app', 'splash.html'));
  splash.once('ready-to-show', () => splash.show());
  return splash;
}
function createWindow() {
  if (!activeSession) return createLoginWindow();
  const splash = createSplash();
  mainWindow = new BrowserWindow({
    width: 1440, height: 900, minWidth: 980, minHeight: 650,
    backgroundColor: '#37382f', title: 'Falcon Hybrid V1 — Integrated 1.3.0',
    icon: path.join(__dirname, 'build', 'falcon.ico'), autoHideMenuBar: true, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  const showMain = () => { if (!splash.isDestroyed()) splash.close(); if (!mainWindow.isDestroyed()) mainWindow.show(); };
  setTimeout(showMain, 3000);
}


ipcMain.handle('auth-status', () => {
  const data = readAuth();
  return { hasAdmin: Array.isArray(data.users) && data.users.some(user => user.role === 'Admin' && user.active !== false) };
});
ipcMain.handle('auth-setup-admin', (_event, payload = {}) => {
  const data = readAuth();
  if (Array.isArray(data.users) && data.users.some(user => user.role === 'Admin' && user.active !== false)) return { ok: false, error: 'Administrator already exists.' };
  const displayName = cleanText(payload.displayName, 80);
  const username = normalizeUser(payload.username);
  const password = String(payload.password || '');
  if (displayName.length < 2) return { ok: false, error: 'Enter administrator name.' };
  if (username.length < 3) return { ok: false, error: 'Username must contain at least 3 characters.' };
  if (password.length < 8) return { ok: false, error: 'Password must contain at least 8 characters.' };
  const secured = hashPassword(password);
  const user = { uuid: crypto.randomUUID(), userId: 'FU-000001', displayName, username, role: 'Admin', active: true, salt: secured.salt, passwordHash: secured.hash, createdAt: new Date().toISOString() };
  data.users = [user];
  appendAuthAudit(data, 'ADMIN_CREATED', { userId: user.userId, username: user.username });
  writeAuth(data);
  activeSession = { userId: user.userId, uuid: user.uuid, displayName: user.displayName, username: user.username, role: user.role, loginAt: new Date().toISOString() };
  if (loginWindow && !loginWindow.isDestroyed()) loginWindow.close();
  createWindow();
  return { ok: true };
});
ipcMain.handle('auth-login', (_event, payload = {}) => {
  const data = readAuth();
  const username = normalizeUser(payload.username);
  const user = (data.users || []).find(item => item.username === username && item.active !== false);
  if (!user || !verifyPassword(payload.password, user)) {
    appendAuthAudit(data, 'LOGIN_FAILED', { username }); writeAuth(data);
    return { ok: false, error: 'Incorrect username or password.' };
  }
  activeSession = { userId: user.userId, uuid: user.uuid, displayName: user.displayName, username: user.username, role: user.role, loginAt: new Date().toISOString() };
  appendAuthAudit(data, 'LOGIN_SUCCESS', { userId: user.userId, username: user.username }); writeAuth(data);
  if (loginWindow && !loginWindow.isDestroyed()) loginWindow.close();
  createWindow();
  return { ok: true };
});
ipcMain.handle('auth-current-session', () => activeSession ? { ...activeSession } : null);
ipcMain.handle('auth-logout', () => {
  if (activeSession) { const data = readAuth(); appendAuthAudit(data, 'LOGOUT', { userId: activeSession.userId, username: activeSession.username }); writeAuth(data); }
  activeSession = null;
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
  createLoginWindow();
  return { ok: true };
});

const projectsRoot = () => path.join(app.getPath('userData'), 'projects');
function projectFolder(projectId) { return path.join(projectsRoot(), String(projectId)); }
function ensureProjectFolders(project) {
  const root = projectFolder(project.id);
  ['database','customers','bookings','payments','documents','receipts','maps','dxf','backup','logs','reports'].forEach(name => fs.mkdirSync(path.join(root, name), { recursive: true }));
  fs.writeFileSync(path.join(root, 'project.json'), JSON.stringify(project, null, 2), 'utf8');
}
ipcMain.handle('projects-load', () => activeSession ? (readStore().projects || []) : []);
ipcMain.handle('projects-save', (_event, projects) => {
  if (!activeSession) return { ok: false, error: 'Login required' };
  if (!Array.isArray(projects)) return { ok: false, error: 'Invalid project list' };
  const ids = new Set();
  for (const p of projects) {
    if (!p || !/^FP-\d{6}$/.test(String(p.id || ''))) return { ok: false, error: 'Invalid permanent Project ID' };
    if (!p.uuid || !p.name) return { ok: false, error: 'Project identity is incomplete' };
    if (ids.has(p.id)) return { ok: false, error: 'Duplicate Project ID blocked' };
    ids.add(p.id); ensureProjectFolders(p);
  }
  const store = readStore(); store.projects = projects; writeStore(store); return { ok: true };
});
ipcMain.handle('projects-delete', (_event, projectId) => {
  if (!activeSession || activeSession.role !== 'Admin') return { ok: false, error: 'Administrator access required' };
  if (!/^FP-\d{6}$/.test(String(projectId || ''))) return { ok: false, error: 'Invalid Project ID' };
  const store = readStore(); const project = (store.projects || []).find(p => p.id === projectId);
  if (!project || project.status !== 'Archived') return { ok: false, error: 'Only archived projects can be deleted' };
  try { fs.rmSync(projectFolder(projectId), { recursive: true, force: true }); return { ok: true }; }
  catch (error) { return { ok: false, error: error.message }; }
});
ipcMain.handle('open-dxf-engine-v15', async (_event, project = {}) => {
  if (!activeSession || activeSession.role !== 'Admin') return { ok: false, error: 'Administrator access required.' };
  if (!project.id || !project.name) return { ok: false, error: 'Select a registered target project first.' };
  const parent = BrowserWindow.getFocusedWindow() || mainWindow;
  const win = new BrowserWindow({
    width: 1500, height: 940, minWidth: 980, minHeight: 700, parent, modal: false,
    backgroundColor: '#0d1512', title: `Falcon DXF Intelligence V1.5 — ${project.name}`,
    autoHideMenuBar: true, icon: path.join(__dirname, 'dxf_engine', 'assets', 'falcon-dxf.ico'),
    webPreferences: { preload: path.join(__dirname, 'dxf-preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  await win.loadFile(path.join(__dirname, 'dxf_engine', 'app', 'index.html'), {
    query: { projectId: String(project.id), projectName: String(project.name), projectCode: String(project.code || project.id) }
  });
  return { ok: true };
});

function resolveRegisteredProject(projectRef = {}) {
  const projectId = String(projectRef.id || projectRef.projectId || '').trim();
  if (!/^FP-\d{6}$/.test(projectId)) return null;
  return (readStore().projects || []).find(p => String(p.id) === projectId) || null;
}

function loadPremiumProjectMap(projectRef = {}) {
  const project = resolveRegisteredProject(projectRef);
  if (!project) throw new Error('Registered Falcon project not found.');
  ensureProjectFolders(project);
  const mapPath = path.join(projectFolder(project.id), 'maps', 'map-ready.json');
  // One-time migration only for the proven Jaipur Pride canonical map. Once seeded,
  // every viewer reads the project folder, never a shared global map file.
  if (!fs.existsSync(mapPath) && /jaipur\s+pride\s+vistar/i.test(String(project.name || ''))) {
    const seedPath = path.join(__dirname, 'app', 'canonical_map', 'data', 'canonical-map.json');
    if (fs.existsSync(seedPath)) {
      const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      seed.project = { ...(seed.project || {}), id: project.id, name: project.name };
      seed.project_details = { ...(seed.project_details || {}), project_id: project.id, project_name: project.name };
      fs.writeFileSync(mapPath, JSON.stringify(seed, null, 2), 'utf8');
      const logPath = path.join(projectFolder(project.id), 'logs', 'map-migration.jsonl');
      fs.appendFileSync(logPath, JSON.stringify({at:new Date().toISOString(), action:'SEEDED_CANONICAL_MAP', projectId:project.id, source:'bundled-jaipur-pride-canonical'})+'\n', 'utf8');
    }
  }
  if (!fs.existsSync(mapPath)) throw new Error(`No published map for ${project.name} (${project.id}). Open DXF Engine, approve the DXF, then Publish.`);
  const payload = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const boundId = String(payload?.project?.id || payload?.project_details?.project_id || project.id);
  if (boundId !== project.id) throw new Error(`Project isolation blocked: map belongs to ${boundId}, active project is ${project.id}.`);
  if (!payload?.layers || !Array.isArray(payload.layers.plots) || payload.layers.plots.length === 0) {
    throw new Error('Approved map-ready.json contains no plot geometry.');
  }
  return { project, mapPath, payload };
}

ipcMain.handle('project-map-clear', (_event, projectRef = {}) => {
  if (!activeSession || activeSession.role !== 'Admin') return { ok:false, error:'Administrator access required.' };
  try {
    const project = resolveRegisteredProject(projectRef);
    if (!project) throw new Error('Select a registered Falcon project first.');
    ensureProjectFolders(project);
    const root = projectFolder(project.id), stamp = new Date().toISOString().replace(/[:.]/g,'-');
    const backupDir = path.join(root, 'backup', `map-replaced-${stamp}`); fs.mkdirSync(backupDir,{recursive:true});
    const targets=[path.join(root,'maps','map-ready.json'),path.join(root,'dxf','current-import.json')];
    let moved=0;
    for(const src of targets){ if(fs.existsSync(src)){ fs.copyFileSync(src,path.join(backupDir,path.basename(src))); fs.rmSync(src,{force:true}); moved++; } }
    fs.appendFileSync(path.join(root,'logs','project-map-clear.jsonl'),JSON.stringify({at:new Date().toISOString(),userId:activeSession.userId,projectId:project.id,backupDir,moved})+'\n','utf8');
    return {ok:true, project:{id:project.id,name:project.name}, backupDir, cleared:moved};
  } catch(error){ return {ok:false,error:String(error.message||error)}; }
});

ipcMain.handle('premium-map-load-project', (_event, projectRef = {}) => {
  if (!activeSession) return { ok: false, error: 'Login required.' };
  try {
    const loaded = loadPremiumProjectMap(projectRef);
    return {
      ok: true,
      project: { id: loaded.project.id, name: loaded.project.name },
      mapModel: loaded.payload,
      plotCount: loaded.payload.layers.plots.length
    };
  } catch (error) {
    return { ok: false, error: String(error.message || error) };
  }
});

ipcMain.handle('open-premium-map-viewer', async (_event, projectRef = {}) => {
  if (!activeSession) return { ok: false, error: 'Login required.' };
  try {
    const project = resolveRegisteredProject(projectRef);
    if (!project) return { ok: false, error: 'Select a registered Falcon project first.' };
    const parent = BrowserWindow.getFocusedWindow() || mainWindow;
    const win = new BrowserWindow({
      width: 1500, height: 940, minWidth: 980, minHeight: 700,
      parent, modal: false, autoHideMenuBar: true,
      backgroundColor: '#071724',
      title: `Falcon Hybrid V1.5.7 — ${project.name}`,
      icon: path.join(__dirname, 'build', 'falcon.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'client-preload.js'),
        contextIsolation: true, nodeIntegration: false, sandbox: true
      }
    });
    await win.loadFile(path.join(__dirname, 'app', 'canonical_map', 'index.html'), {
      query: { client: '1', theme: (String(projectRef.theme||'black')==='ivory'?'ivory':'black'), projectId: String(project.id), projectName: String(project.name) }
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error.message || error) };
  }
});

ipcMain.handle('open-google-earth-overlay', async () => {
  const overlayPath = app.isPackaged ? path.join(process.resourcesPath, 'overlay', 'FALCON_CURRENT_MAP_GOOGLE_EARTH.kml') : path.join(__dirname, 'app', 'FALCON_CURRENT_MAP_GOOGLE_EARTH.kml');
  const error = await shell.openPath(overlayPath); return { ok: !error, error };
});
ipcMain.handle('open-free-map-overlay', async (_event, options = {}) => {
  const parent = BrowserWindow.getFocusedWindow();
  const overlay = new BrowserWindow({ width:1280,height:820,minWidth:820,minHeight:560,parent,modal:false,autoHideMenuBar:true,backgroundColor:'#101613',title:'Falcon Hybrid • Free Map Overlay',icon:path.join(__dirname,'build','falcon.ico'),webPreferences:{preload:path.join(__dirname,'overlay-preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true} });
  overlay.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//i.test(url))shell.openExternal(url);return{action:'deny'}});
  const maptilerKey=typeof options.maptilerKey==='string'?options.maptilerKey.trim().slice(0,300):'';
  await overlay.loadFile(path.join(__dirname,'app','free_map_overlay.html'),{query:{...(maptilerKey?{maptilerKey}:{}),...(projectId?{projectId}:{})}});return{ok:true};
});
ipcMain.handle('export-polished-map', async (_event, payload = {}) => {
  let exportWin = null;
  let tempHtml = '';
  try {
    const requested = String(payload.type || 'png').toLowerCase();
    const type = ['pdf','html'].includes(requested) ? requested : 'png';
    const stamp = new Date().toISOString().slice(0,10);
    const parent = BrowserWindow.getFocusedWindow() || mainWindow;
    const pick = await dialog.showSaveDialog(parent, {
      title: type==='pdf' ? 'Export Full Polished Falcon Map - Vector PDF' : type==='html' ? 'Export Clickable Falcon Map Viewer' : 'Export Polished Falcon Map - High Resolution PNG',
      defaultPath:type==='html'?`Falcon_Clickable_Map_Viewer_${stamp}.html`:`Falcon_Polished_Full_Map_${stamp}.${type}`,
      filters:[{name:type==='pdf'?'Vector PDF':type==='html'?'Clickable HTML Viewer':'High Resolution PNG',extensions:[type]}]
    });
    if (pick.canceled || !pick.filePath) return { ok:false, cancelled:true };
    if (type === 'html') {
      const html = String(payload.html || '');
      if (!/^<!doctype html>|^<html/i.test(html.trim())) throw new Error('Clickable viewer data was not received');
      fs.writeFileSync(pick.filePath, html, 'utf8');
      return {ok:true,path:pick.filePath,clickable:true};
    }
    if (type === 'png') {
      const dataUrl = String(payload.dataUrl || '');
      if (!dataUrl.startsWith('data:image/png;base64,')) throw new Error('Invalid map image');
      const png = Buffer.from(dataUrl.split(',')[1], 'base64');
      fs.writeFileSync(pick.filePath, png);
      return {ok:true,path:pick.filePath};
    }
    const svg = String(payload.svg || '');
    if (!/^<\?xml|^<svg/i.test(svg.trim())) throw new Error('Full-map vector data was not received');
    const aspect = Number(payload.width)>0 && Number(payload.height)>0 ? Number(payload.width)/Number(payload.height) : 1.414;
    tempHtml = path.join(app.getPath('temp'), `falcon-vector-map-${Date.now()}.html`);
    const safeTitle = String(payload.project || 'Falcon Polished Map').replace(/[<>&]/g,'');
    const exportHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title><style>
      @page{size:A3 landscape;margin:6mm}
      html,body{margin:0;padding:0;width:100%;height:100%;background:#fff;overflow:hidden}
      body{display:flex;align-items:center;justify-content:center}
      .sheet{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
      svg{display:block;width:100%;height:100%;max-width:100%;max-height:100%}
    </style></head><body><div class="sheet">${svg}</div></body></html>`;
    fs.writeFileSync(tempHtml, exportHtml, 'utf8');
    exportWin = new BrowserWindow({show:false,width:1600,height:1100,webPreferences:{sandbox:true}});
    await exportWin.loadFile(tempHtml);
    await new Promise(resolve=>setTimeout(resolve,250));
    const pdf = await exportWin.webContents.printToPDF({
      landscape:true,
      printBackground:true,
      pageSize:'A3',
      preferCSSPageSize:true,
      margins:{top:0,bottom:0,left:0,right:0}
    });
    fs.writeFileSync(pick.filePath,pdf);
    return {ok:true,path:pick.filePath,vector:true,aspect};
  } catch (error) {
    return {ok:false,error:error.message};
  } finally {
    try{ if(exportWin && !exportWin.isDestroyed()) exportWin.destroy(); }catch{}
    try{ if(tempHtml && fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml); }catch{}
  }
});

ipcMain.handle('open-external', async (_event, url) => {
  try { const target=new URL(String(url)); if(!['https:','http:','mailto:','sms:'].includes(target.protocol))return{ok:false,error:'Unsupported external link'}; await shell.openExternal(target.toString()); return{ok:true}; }
  catch(error){return{ok:false,error:String(error.message||error)}}
});

app.whenReady().then(()=>{createLoginWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0){activeSession?createWindow():createLoginWindow()}})});
app.on('window-all-closed',()=>process.platform!=='darwin'&&app.quit());
