import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Activity, AlertTriangle, Archive, ArrowLeft, BarChart3, Bell, Bot, Camera, CheckCircle2, ChevronRight, ClipboardList, Download, FileCheck2, FileText, FolderSearch, LayoutDashboard, LockKeyhole, LogOut, Menu, MessageSquare, Search, Send, ShieldCheck, Upload, X } from "lucide-react";
import "./App.css";

const API = "http://localhost:8000/api";
const call = async (path, options = {}) => { const res = await fetch(`${API}${path}`, { credentials: "include", ...options }); const data = await res.json(); if (!res.ok) throw new Error(data.detail || "Request failed"); return data; };
const statusClass = (s) => `status status-${String(s).toLowerCase().replaceAll(" ", "-")}`;

function Login({ onLogin }) { 
  const [id, setId] = useState("anuj.prasad"); 
  const [password, setPassword] = useState("Anuj@7003"); 
  const [error, setError] = useState(""); 
  const [busy, setBusy] = useState(false); 
  const navigate = useNavigate();
  
  const submit = async (e) => { 
    e.preventDefault(); 
    setBusy(true); 
    setError(""); 
    
    const makeRequest = async () => call("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ officer_id: id, password }) });

    try { 
      let user;
      try {
        user = await makeRequest();
      } catch (err) {
        if (err.message === "Failed to fetch") {
          await new Promise(resolve => setTimeout(resolve, 500));
          user = await makeRequest();
        } else {
          throw err;
        }
      }
      onLogin(user); 
      navigate("/dashboard"); 
    } catch (err) { 
      setError(err.message === "Failed to fetch" ? "Network error: Make sure backend server is running." : err.message); 
    } finally { 
      setBusy(false); 
    } 
  };

  return (
    <main className="login-shell" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      width: '100vw',
      margin: 0,
      padding: '20px',
      boxSizing: 'border-box',
      backgroundColor: '#f1f5f9',
      backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>
      <section className="login-panel" style={{ margin: 0, width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)' }}>
        <div className="eyebrow" style={{ color: '#f97316' }}>NYAY SULBH / ACCESS</div>
        <h1>Secure officer sign in</h1>
        <p className="login-copy">Access case records, evidence history, and integrity controls through your authorized workspace.</p>
        
        <form onSubmit={submit} data-testid="login-form">
          <label>Officer ID
            <input data-testid="officer-id-input" value={id} onChange={e => setId(e.target.value)} placeholder="e.g. rahul.sharma" autoComplete="username" />
          </label>
          <label>Password
            <input data-testid="password-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          
          {error && <div className="error-banner" data-testid="login-error">{error}</div>}
          
          <button className="primary-button login-button" data-testid="login-submit-button" disabled={busy}>
            {busy ? "Verifying access…" : "Enter secure workspace"}<ChevronRight size={17}/>
          </button>
        </form>
        
        <div className="login-foot">
          <LockKeyhole size={14}/> Session protected with role-based controls
        </div>
      </section>
    </main>
  );
}

const navItems = [{ path: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, { path: "/cases", label: "Cases", icon: FolderSearch }, { path: "/documents", label: "Documents", icon: Archive }, { path: "/audit", label: "Audit trail", icon: ClipboardList }, { path: "/security-alerts", label: "Security alerts", icon: AlertTriangle }];

function Shell({ user, onLogout, children }) { 
  const [open, setOpen] = useState(false); 
  const navigate = useNavigate(); 
  const location = useLocation(); 
  
  const logout = async () => { 
    try { await call("/auth/logout", { method: "POST" }); } catch (e) {} 
    onLogout(); 
    navigate("/dashboard"); 
  };

  const handleDepartmentClick = (clickedDept) => {
    if (!user) {
      navigate("/login");
    } else {
      if (user.role === clickedDept || (user.role === "Administrator" && clickedDept === "Administrator")) {
        alert(`✅ You are actively operating as ${user.role}. Access granted.`);
      } else {
        alert(`⚠️ SECURITY ALERT: You are currently logged in as '${user.role}'. You cannot access the '${clickedDept}' portal without switching accounts. Please logout first.`);
      }
    }
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "expanded" : ""}`}>
        <div className="side-top" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', cursor: 'pointer' }} onClick={() => setOpen(!open)} title="Click to toggle sidebar">
          <div className="mini-crest" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={26} color="#22c55e"/>
          </div>
          {open && <div className="side-brand" style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px', marginTop: '8px', textAlign: 'center' }}>NYAY SULBH</div>}
        </div>

        <nav className="main-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} className={location.pathname === path ? "nav-item active" : "nav-item"} data-testid={`nav-${label.toLowerCase().replaceAll(" ", "-")}`}>
              <Icon size={19}/>
              {open && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="departments">
          <div className="nav-kicker">{open ? "DEPARTMENTS" : "DEPT."}</div>
          
          {user && (
            <div className="department" style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="dept-dot" style={{ color: '#22c55e' }}>•</span>
              {open && <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Active: {user.role}</span>}
            </div>
          )}

          {["Administrator", "Investigation Dept.", "Police Department", "Forensics & Evidence", "Records Management", "Court", "Internal Audit"].map((x, i) => (
            <div 
              className="department" 
              key={x} 
              data-testid={`department-${i + 1}`}
              onClick={() => handleDepartmentClick(x)}
              style={{ cursor: 'pointer' }}
            >
              <span className="dept-dot" style={{ color: '#22c55e' }}>•</span>
              {open && <span className="dept-text" style={{ color: '#e2e8f0' }}>{x}</span>}
            </div>
          ))}
        </div>

        <div className="side-bottom">
          <div className="online-dot" style={{ backgroundColor: '#22c55e' }}/>
          {open && <span>System operational</span>}
        </div>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div>  
            <div className="breadcrumb">NYAY SULBH <span>/</span> {location.pathname === "/audit" ? "AUDIT TRAIL" : location.pathname === "/documents" ? "CASE DOCUMENTS" : location.pathname === "/cases" ? "CASES" : location.pathname === "/security-alerts" ? "SECURITY ALERTS" : "COMMAND OVERVIEW"}</div>
            <div className="top-title">Secure records command</div>
          </div>
          <div className="top-actions">
            <div className="security-chip"><span className="pulse-dot"/> All systems verified</div>  
            <button className="icon-button notification-button" onClick={() => navigate("/security-alerts")} data-testid="notifications-button" title="View security alerts">
              <Bell size={18}/><span className="notification-dot"/>
            </button>
            <div className="profile">
              <div className="avatar">{user ? user.name.split(" ").map(n => n[0]).join("") : "G"}</div>
              <div className="profile-text">
                <strong data-testid="profile-name">{user ? user.name : "Public Access"}</strong>
                <span>{user ? user.role : "Guest Viewer"}</span>
              </div>
              {user ? (
                <button className="logout-button" onClick={logout} data-testid="logout-button"><LogOut size={16}/></button>
              ) : (
                <button className="logout-button" onClick={() => navigate("/login")} title="Login"><LockKeyhole size={16}/></button>
              )}
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, note, alert }) { return <div className={`metric ${alert ? "metric-alert" : ""}`} data-testid={`metric-${label.toLowerCase().replaceAll(" ", "-")}`}><div className="metric-icon"><Icon size={18}/></div><div><div className="metric-label">{label}</div><strong>{value}</strong><div className="metric-note">{note}</div></div></div>; }
function Status({ value }) { return <span className={statusClass(value)}>{value === "Verified" && <CheckCircle2 size={13}/>} {value === "Tampered" && <AlertTriangle size={13}/>} {value}</span>; }

function Dashboard({ user }) { 
  const [data, setData] = useState(null); 
  const navigate = useNavigate(); 
  
  useEffect(() => { 
    call("/dashboard").then(setData).catch((err) => {
      setData({ metrics: { cases: 0, documents: 0, activities: 0, alerts: 0 }, documents: [], audits: [] });
    }); 
  }, []); 

  if (!data) return <div className="loading">Loading public workspace…</div>; 
  
  const tampered = data.documents?.find(d => d.integrity_status === "Tampered"); 

  const currentHour = new Date().getHours();
  let greeting = "Good evening";
  if (currentHour < 12) greeting = "Good morning";
  else if (currentHour < 17) greeting = "Good afternoon";

  const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">COMMAND OVERVIEW / {formattedDate} — {formattedTime}</div>
          <h1>{greeting}, {user ? user.role : "Citizen"}.</h1>
          <p>Case activity and document integrity overview for <strong>{user ? user.name : "Public Portal"}</strong>.</p>
        </div>
        <button className="primary-button" onClick={() => navigate("/documents")} data-testid="open-document-register-button">
          <FolderSearch size={17}/> Open document register
        </button>
      </div>
      
      <div className="metrics-grid">
        <Metric icon={BarChart3} label="Total cases" value={data.metrics.cases} note="Across active departments"/>
        <Metric icon={FileText} label="Total documents" value={data.metrics.documents} note="Updated this week"/>
        <Metric icon={Activity} label="Recent activities" value={data.metrics.activities} note="All actions recorded"/>
        <Metric icon={AlertTriangle} label="Integrity alerts" value={data.metrics.alerts} note="Requires review" alert/>
      </div>

      {tampered && (
        <section className="alert-strip" data-testid="integrity-alert">
          <div className="alert-symbol"><AlertTriangle size={23}/></div>
          <div>
            <div className="alert-label">SECURITY EVENT / IMMEDIATE REVIEW</div>
            <h2>Document integrity violation detected</h2>
            <p><strong>{tampered.document_name}</strong> · {tampered.document_id} · {tampered.case_id}</p>
            <div className="alert-meta">
              <span>Previous version {tampered.version - 1}</span>
              <span>Current version {tampered.version}</span>
              <span>Detected {formattedDate}</span>
            </div>
          </div>
          <button className="alert-action" onClick={() => navigate(`/documents/${tampered.document_id}`)} data-testid="review-integrity-alert-button">
            Review incident <ChevronRight size={16}/>
          </button>
        </section>
      )}

      <div className="dashboard-columns">
        <section className="panel recent-panel">
          <div className="section-heading">
            <div>
              <div className="eyebrow">LIVE REGISTER</div>
              <h2>Recent document activity</h2>
            </div>
            <Link to="/documents" className="text-link" data-testid="view-all-documents-link">View all <ChevronRight size={15}/></Link>
          </div>
          <div className="document-list">
            {(data.documents || []).slice(0, 5).map(d => (
              <button key={d.document_id} className="document-row" onClick={() => navigate(`/documents/${d.document_id}`)} data-testid={`document-row-${d.document_id}`}>
                <div className="doc-type">{d.document_type.slice(0, 3).toUpperCase()}</div>
                <div className="doc-main">
                  <strong>{d.document_name}</strong>
                  <span>{d.case_id} · {d.owner}</span>
                </div>
                <div className="doc-version">v{d.version}</div>
                <Status value={d.integrity_status}/>
                <ChevronRight size={16} className="row-arrow"/>
              </button>
            ))}
          </div>
        </section>

        <section className="panel audit-mini">
          <div className="section-heading">
            <div>
              <div className="eyebrow">TRACEABILITY</div>
              <h2>Latest audit entries</h2>
            </div>
            <Link to="/audit" className="text-link" data-testid="view-audit-link">Full trail <ChevronRight size={15}/></Link>
          </div>
          {(data.audits || []).slice(0, 4).map((a, i) => (
            <div className="audit-line" key={i}>
              <div className={`audit-icon ${a.result === "Violation detected" ? "audit-danger" : ""}`}>
                {a.result === "Violation detected" ? <AlertTriangle size={14}/> : <Activity size={14}/>}
              </div>
              <div>
                <strong>{a.officer_name} <span>{a.action.toLowerCase()}</span></strong>
                <p>{a.document_name}</p>
              </div>
              <time>{a.time}</time>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

// 🚀 YAHAN DOCUMENTS FUNCTION KO PURI TARAH SE UPDATE KIYA GAYA HAI 🚀
function Documents() { 
  const [docs, setDocs] = useState([]); 
  const [search, setSearch] = useState(""); 
  const navigate = useNavigate(); 
  
  // Camera aur New Record ke states
  const [showScanner, setShowScanner] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [newName, setNewName] = useState("");
  const [newCaseId, setNewCaseId] = useState("CASE-2026-" + Math.floor(1000 + Math.random() * 9000));
  const videoRef = useRef(null);

  const load = () => call(`/documents?search=${encodeURIComponent(search)}`).then(setDocs).catch(()=>setDocs([])); 
  
  useEffect(() => { 
    const t = setTimeout(load, 180); 
    return () => clearTimeout(t); 
  }, [search]); 

  // Camera start karne ka effect
  useEffect(() => {
    if (showScanner && !previewUrl && videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [showScanner, videoStream, previewUrl]);

  const openScanner = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("Camera API not supported.");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setVideoStream(stream);
      setShowScanner(true);
      setCapturedBlob(null);
      setPreviewUrl(null);
      setNewName("");
    } catch (err) {
      alert("❌ Camera not found or permission denied. Please check your device hardware or browser permissions.");
    }
  };

  const closeScanner = () => {
    if (videoStream) videoStream.getTracks().forEach(t => t.stop());
    setVideoStream(null);
    setShowScanner(false);
  };

  // Photo capture karna
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      setCapturedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    }, 'image/jpeg');
  };

  // Save dabane par naya document banakar list mein upar add karna
  const saveNewDocument = async (e) => {
    e.preventDefault();
    if (!newName) { alert("Please enter a document name."); return; }
    
    const newDoc = {
      document_id: "DOC-2026-" + Math.floor(100000 + Math.random() * 900000),
      document_name: newName,
      document_type: "Scanned Evidence",
      case_id: newCaseId,
      department: "Investigation Dept.",
      owner: "Authorized Officer",
      classification: "RESTRICTED",
      version: 1,
      integrity_status: "Verified"
    };
    
    setDocs(prev => [newDoc, ...prev]);
    closeScanner();
    alert(`✅ Document '${newName}' successfully scanned and saved to the register!`);
  };

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">CASE-CENTRIC REGISTER / RECORDS</div>
          <h1>Case documents</h1>
          <p>Find records by case, document ID, type, or responsible officer.</p>
        </div>
        
        <button className="primary-button" onClick={openScanner} style={{ background: '#f97316', borderColor: '#f97316' }}>
          <Camera size={17}/> Scan & Add New Record
        </button>
      </div>
      
      <div className="search-bar">
        <Search size={18}/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search case ID, document name, officer…" data-testid="document-search-input"/>
        <span>{docs.length} records</span>
      </div>
      
      <section className="panel table-panel">
        <div className="table-head">
          <span>Document</span><span>Case ID</span><span>Department / owner</span><span>Classification</span><span>Version</span><span>Integrity</span><span></span>
        </div>
        {docs.map(d => (
          <Link to={`/documents/${d.document_id}`} className="table-row" key={d.document_id} data-testid={`document-table-row-${d.document_id}`}>
            <div className="table-doc">
              <div className="file-icon"><FileText size={17}/></div>
              <div><strong>{d.document_name}</strong><small>{d.document_id} · {d.document_type}</small></div>
            </div>
            <span className="mono">{d.case_id}</span>
            <span>{d.owner}<small>{d.department}</small></span>
            <span><span className="classification">{d.classification}</span></span>
            <span className="mono">v{d.version}</span>
            <Status value={d.integrity_status}/>
            <ChevronRight size={16}/>
          </Link>
        ))}
      </section>

      {/* NEW DOCUMENT SCANNER MODAL */}
      {showScanner && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, color: '#0f172a' }}>{previewUrl ? 'Save Document' : 'Scan New Document'}</h2>
              <button onClick={closeScanner} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={20}/></button>
            </div>
            
            {!previewUrl ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxHeight: '50vh', backgroundColor: '#000', borderRadius: '8px', objectFit: 'cover' }}></video>
                <button onClick={capturePhoto} style={{ marginTop: '15px', padding: '14px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <Camera size={18}/> Capture Image
                </button>
              </>
            ) : (
              <form onSubmit={saveNewDocument} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <img src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: '30vh', objectFit: 'contain', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Document Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Crime Scene Photo 1" style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Assign to Case ID</label>
                  <input type="text" value={newCaseId} onChange={e => setNewCaseId(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Save to Register
                  </button>
                  <button type="button" onClick={() => setPreviewUrl(null)} style={{ padding: '14px 20px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Retake
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  ); 
}

function Detail({ user }) { 
  const { id } = useParams(); 
  const [doc, setDoc] = useState(null); 
  const [message, setMessage] = useState(""); 
  const navigate = useNavigate(); 
  const fileInputRef = useRef(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);

  const load = () => call(`/documents/${id}`).then(setDoc).catch(console.error); 
  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (showCamera && videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [showCamera, videoStream]);
  
  if (!doc) return <div className="loading">Loading document record…</div>; 

  const requireAuth = (actionCallback) => {
    if (!user) {
      alert("⚠️ ACCESS DENIED: Please login as an authorized officer (Administrator or Investigation Officer) from the sidebar to edit or upload documents.");
      return;
    }
    actionCallback();
  };

  const handleAction = async (name) => { 
    try { 
      await call(`/documents/${id}/action`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: name }) });
      setMessage(`${name} recorded in the audit trail`); 
    } catch (e) { setMessage(e.message); } 
  }; 

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setMessage("Uploading document...");
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch(`${API}/documents/${id}/version`, { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Upload failed. Permission denied.");
      }
      setMessage("File successfully uploaded & verified.");
      await load();
    } catch (err) { setMessage(err.message); }
  };

  const handleDownload = () => {
    window.open(`${API}/documents/${id}/download`, "_blank");
    handleAction("Downloaded");
  };

  const handleScanClick = async () => {
    if (!user) {
      alert("⚠️ ACCESS DENIED: Please login as an authorized officer.");
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported.");
      }
      
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setVideoStream(stream);
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("❌ Camera not found or permission denied. Please check your device hardware or browser permissions.");
    }
  };

  const closeCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop()); 
      setVideoStream(null);
    }
    setShowCamera(false);
  };

  const captureImageAndUpload = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "scanned_document.jpg", { type: "image/jpeg" });
      
      closeCamera(); 
      await handleUpload({ target: { files: [file] } });
      
    }, 'image/jpeg');
  };

  return (
    <main className="page detail-page">
      <button className="back-link" onClick={() => navigate("/documents")} data-testid="back-to-documents-button"><ArrowLeft size={16}/> Back to document register</button>
      
      <div className="detail-title">
        <div><div className="eyebrow">DOCUMENT RECORD / {doc.document_id}</div><h1>{doc.document_name}</h1><p>{doc.document_type} · {doc.case_id}</p></div>
        <Status value={doc.integrity_status}/>
      </div>
      
      {doc.integrity_status === "Tampered" && <section className="violation-panel" data-testid="document-violation-panel"><div className="violation-icon"><AlertTriangle size={25}/></div><div><div className="alert-label">HIGH PRIORITY SECURITY WARNING</div><h2>Document integrity violation detected</h2><p>Current content differs from the trusted record. The previous trusted version remains preserved.</p><div className="violation-grid"><span>Previous version <strong>v{doc.version - 1}</strong></span><span>Current version <strong>v{doc.version}</strong></span><span>Detection time <strong>25 Sep 2026 · 02:03 PM</strong></span></div></div></section>}
      
      <div className="detail-grid">
        <section className="panel info-panel"><div className="section-heading"><div><div className="eyebrow">DOCUMENT INFORMATION</div><h2>Record metadata</h2></div><ShieldCheck size={21} color="#22c55e"/></div><div className="info-grid">{[["Document name", doc.document_name],["Case ID", doc.case_id],["Document type", doc.document_type],["Owner / officer", doc.owner],["Classification", doc.classification],["Created date", doc.created_date],["Current version", `Version ${doc.version}`],["Last modified", doc.modified_date]].map(([k,v]) => <div className="info-cell" key={k}><span>{k}</span><strong>{v}</strong></div>)}</div></section>
        
        <section className="panel security-panel">
          <div className="section-heading"><div><div className="eyebrow">VERIFICATION</div><h2>Security information</h2></div><ShieldCheck size={21} color="#22c55e"/></div>
          <div className="security-check"><div className="check-badge"><CheckCircle2 size={18}/></div><div><strong>{doc.integrity_status === "Tampered" ? "Review required" : "Integrity verified"}</strong><p>SHA-256 comparison result</p></div></div>
          <div className="hash-box"><span>TRUSTED HASH</span><code>{doc.trusted_hash}</code></div>
          
          <div className="action-stack">
            <button onClick={() => handleAction("Viewed")}><FileCheck2 size={16}/> View document</button>
            <button onClick={handleDownload}><Download size={16}/> Download record</button>
            <button onClick={() => requireAuth(() => fileInputRef.current.click())}><Upload size={16}/> Upload real file</button>
            
            <button onClick={handleScanClick} style={{ background: '#f97316', color: 'white', borderColor: '#f97316' }}>
              <Camera size={16}/> Scan New
            </button>
            
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUpload} />
          </div>
          {message && <div className="action-message">{message}</div>}
        </section>
      </div>

      <section className="panel version-panel"><div className="section-heading"><div><div className="eyebrow">CHAIN OF CUSTODY</div><h2>Version history</h2></div><span className="muted">{doc.versions.length} preserved versions</span></div><div className="version-list">{doc.versions.slice().reverse().map(v => <div className="version-row" key={v.version}><div className="version-number">v{v.version}</div><div><strong>{v.version === doc.version ? "Current record" : "Preserved trusted version"}</strong><span>Modified by {v.modified_by} · {new Date(v.modified_at).toLocaleString()}</span></div><Status value={v.integrity}/><button className="outline-button" onClick={() => window.open(`${API}/documents/${id}/download?version=${v.version}`, "_blank")}>Download</button></div>)}</div></section>

      {showCamera && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', color: '#0f172a' }}>Scanner Active</h2>
            
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxHeight: '60vh', backgroundColor: '#000', borderRadius: '8px', objectFit: 'cover' }}></video>
            
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', width: '100%' }}>
              <button onClick={captureImageAndUpload} style={{ flex: 1, padding: '14px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <Camera size={18}/> Capture & Upload
              </button>
              <button onClick={closeCamera} style={{ padding: '14px 20px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  ); 
}

function Audit() { 
  const [items, setItems] = useState([]); 
  const [filters, setFilters] = useState({ officer: "", case_id: "", action: "", department: "" }); 
  
  const load = () => call(`/audits?${new URLSearchParams(filters)}`).then(setItems).catch(() => setItems([])); 
  
  useEffect(() => { load(); }, []); 

  return <main className="page"><div className="page-heading"><div><div className="eyebrow">TRACEABILITY / IMMUTABLE LOG</div><h1>Audit trail</h1><p>Every document interaction is recorded with officer, time, action, and version.</p></div><div className="audit-integrity"><ShieldCheck size={17} color="#22c55e"/> Recording active</div></div><section className="filter-panel"><div className="filter-title"><ClipboardList size={17}/> Filter activity</div><div className="filters">{[["officer", "Officer name"],["case_id", "Case ID"],["action", "Action"],["department", "Department"]].map(([key, placeholder]) => <input key={key} value={filters[key]} onChange={e => setFilters({...filters, [key]: e.target.value})} placeholder={placeholder} data-testid={`audit-${key}-filter`}/>)}<button className="primary-button filter-button" onClick={load} data-testid="audit-apply-filters-button"><Search size={16}/> Apply filters</button></div></section><section className="panel audit-table"><div className="audit-table-head"><span>Officer</span><span>Activity</span><span>Document / case</span><span>Date & time</span><span>Result</span><span>Version</span></div>{items.map((a, i) => <div className="audit-table-row" key={i} data-testid={`audit-event-${i}`}><div className="officer-cell"><div className="avatar small-avatar">{a.officer_name.split(" ").map(n => n[0]).join("")}</div><div><strong>{a.officer_name}</strong><small>{a.officer_id}</small></div></div><div className="action-cell"><span className={a.result === "Violation detected" ? "danger-action" : "normal-action"}>{a.action}</span></div><div><strong>{a.document_name}</strong><small>{a.document_id} · {a.case_id}</small></div><div className="date-cell"><strong>{a.date}</strong><small>{a.time}</small></div><div><Status value={a.result === "Violation detected" ? "Tampered" : "Verified"}/></div><span className="mono">v{a.document_version}</span></div>)}</section></main>; 
}

function Cases() { const [docs, setDocs] = useState([]); useEffect(() => { call("/documents").then(setDocs).catch(() => setDocs([])); }, []); const cases = Object.values(docs.reduce((groups, doc) => { const item = groups[doc.case_id] || { case_id: doc.case_id, department: doc.department, owner: doc.owner, documents: 0, modified_date: doc.modified_date, tampered: false }; item.documents += 1; item.tampered = item.tampered || doc.integrity_status === "Tampered"; groups[doc.case_id] = item; return groups; }, {})); return <main className="page"><div className="page-heading"><div><div className="eyebrow">CASE MANAGEMENT</div><h1>Cases</h1><p>Open a case to review its related legal and investigation records.</p></div></div><section className="panel table-panel"><div className="table-head"><span>Case ID</span><span>Department</span><span>Assigned officer</span><span>Documents</span><span>Last updated</span><span>Status</span></div>{cases.map(item => <Link to={`/documents?search=${encodeURIComponent(item.case_id)}`} className="table-row" key={item.case_id}><strong className="mono">{item.case_id}</strong><span>{item.department}</span><span>{item.owner}</span><span>{item.documents} documents</span><span>{item.modified_date}</span><Status value={item.tampered ? "Tampered" : "Active"}/></Link>)}</section></main>; }

function SecurityAlerts() { const [docs, setDocs] = useState([]); useEffect(() => { call("/documents").then(setDocs).catch(() => setDocs([])); }, []); const alerts = docs.filter(doc => ["Tampered", "Modified"].includes(doc.integrity_status)); return <main className="page"><div className="page-heading"><div><div className="eyebrow">SECURITY MONITOR</div><h1>Security alerts</h1><p>Integrity exceptions remain visible while trusted versions are preserved.</p></div></div>{alerts.length ? alerts.map(doc => <section className="violation-panel" key={doc.document_id}><div className="violation-icon"><AlertTriangle size={22}/></div><div><div className="alert-label">DOCUMENT INTEGRITY VIOLATION DETECTED</div><h2>{doc.document_name}</h2><p>{doc.document_id} · {doc.case_id} · {doc.integrity_status}</p><div className="alert-meta"><span>Previous version v{Math.max(1, doc.version - 1)}</span><span>Current version v{doc.version}</span><span>Trusted hash {doc.trusted_hash.slice(0, 16)}…</span></div></div><div className="alert-actions"><Link className="alert-action" to={`/documents/${doc.document_id}`}>View document <ChevronRight size={16}/></Link><Link className="alert-action" to="/audit">View audit trail <ChevronRight size={16}/></Link></div></section>) : <section className="panel"><h2>No active integrity alerts</h2><p>All tracked documents are currently verified.</p></section>}</main>; }

function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hello Officer. I am your AI Assistant. How can I help you with current legal news or case analysis today?", sender: "ai" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      setTimeout(() => {
        setMessages(prev => [...prev, { text: "OpenAI is analyzing your request regarding current news...", sender: "ai" }]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Connection error.", sender: "ai" }]);
      setLoading(false);
    }
  };

  return (
    <div className="ai-widget-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {open ? (
        <div className="ai-chat-window" style={{ width: '350px', height: '450px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ background: '#0f172a', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bot size={20}/> <strong>AI Command Intel</strong></div>
            <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18}/></button>
          </div>
          
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", background: m.sender === "user" ? "#f97316" : "#e2e8f0", color: m.sender === "user" ? "white" : "#0f172a", padding: '10px 14px', borderRadius: '8px', maxWidth: '80%', fontSize: '14px' }}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{ alignSelf: 'flex-start', background: '#e2e8f0', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>Thinking...</div>}
          </div>

          <form onSubmit={sendMessage} style={{ display: 'flex', padding: '10px', background: 'white', borderTop: '1px solid #e2e8f0' }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about case laws or news..." style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
            <button type="submit" style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: '6px', padding: '0 15px', marginLeft: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={loading}>
              <Send size={16}/>
            </button>
          </form>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{ width: '56px', height: '56px', borderRadius: '28px', background: '#f97316', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(249,115,22,0.4)' }}>
          <MessageSquare size={24}/>
        </button>
      )}
    </div>
  );
}

function App() { 
  const [user, setUser] = useState(null); 
  const [checking, setChecking] = useState(true); 
  
  useEffect(() => { 
    call("/auth/me").then(setUser).catch(() => {}).finally(() => setChecking(false)); 
  }, []); 
  
  if (checking) return <div className="loading">Initializing Secure Portal…</div>; 
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser}/>}/>
        
        <Route path="*" element={
          <Shell user={user} onLogout={() => setUser(null)}>
            <Routes>
              <Route path="/" element={<Dashboard user={user}/>}/>
              <Route path="/dashboard" element={<Dashboard user={user}/>}/>
              <Route path="/cases" element={<Cases/>}/>
              <Route path="/documents" element={<Documents/>}/>
              <Route path="/documents/:id" element={<Detail user={user}/>}/>
              <Route path="/audit" element={<Audit/>}/>
              <Route path="/security-alerts" element={<SecurityAlerts/>}/>
            </Routes>
          </Shell>
        }/>
      </Routes>
      <AIChatWidget />
    </BrowserRouter>
  ); 
}

export default App;