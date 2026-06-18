import os
import sqlite3
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Header, status, Form, File as FastAPIFile, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# FastAPI app
app = FastAPI(title="Folioo Backend API", version="1.0.0")

import logging
logger = logging.getLogger(__name__)

# Allowed Origins
ALLOWED_ORIGINS = [
    "https://folioo.in",
    "https://www.folioo.in",
    "https://folioo.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    ALLOWED_ORIGINS = [o.strip() for o in env_origins.split(",") if o.strip()]

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_FILE = os.path.join(os.path.dirname(__file__), "database.db")

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    logger.warning("WARNING: JWT_SECRET environment variable is not set. Using insecure default secret.")
    JWT_SECRET = "folioo-super-secret-key-12345"

JWT_ALGORITHM = "HS256"

# Bcrypt helpers
def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

# Database initialization
def init_db():
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Create Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            uid TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            password_hash TEXT,
            created_at TEXT NOT NULL,
            status TEXT DEFAULT 'Active'
        )
    """)
    
    # Check if 'status' column exists in 'users' table, and add if it doesn't
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    if columns and "status" not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'Active'")
    
    # Create Portfolios table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS portfolios (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            category TEXT NOT NULL,
            views INTEGER DEFAULT 0,
            downloads INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Active',
            tech_stack TEXT,
            description TEXT,
            tags TEXT,
            submitted_at TEXT NOT NULL,
            difficulty TEXT DEFAULT 'Beginner'
        )
    """)
    
    # Create Resumes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            user_uid TEXT PRIMARY KEY,
            resume_data TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    
    # Insert default admin if not exists
    cursor.execute("SELECT * FROM users WHERE email = 'admin@folioo.in' OR email = 'admin@portifyhub.com'")
    if not cursor.fetchone():
        admin_hash = hash_password("password123")
        cursor.execute(
            "INSERT INTO users (uid, email, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            ("admin-uid", "admin@folioo.in", "Admin User", "Admin", admin_hash, datetime.utcnow().isoformat())
        )
        
    # Insert default mock portfolios if empty
    cursor.execute("SELECT COUNT(*) FROM portfolios")
    if cursor.fetchone()[0] == 0:
        default_portfolios = [
            ("1", "Geist Minimal Portfolio", "Jane Doe", "Minimal", 1250, 340, "Active", "React, TypeScript, TailwindCSS", "A beautiful minimal portfolio designed for software engineers who love simple aesthetics.", "React,TypeScript,TailwindCSS", datetime.utcnow().isoformat(), "Beginner"),
            ("2", "Terminal CLI Portfolio", "John Smith", "Developer", 890, 210, "Active", "TypeScript, Node.js, TailwindCSS", "An interactive command-line style portfolio with directory navigation and a mock shell.", "TypeScript,TailwindCSS,Node.js", datetime.utcnow().isoformat(), "Intermediate"),
            ("3", "ThreeJS 3D Showcase", "Alice Johnson", "3D", 2450, 680, "Active", "Three.js, React, Framer Motion", "A gorgeous 3D portfolio featuring interactive fluid simulations, custom models, and camera paths.", "Three.js,React,Framer Motion", datetime.utcnow().isoformat(), "Advanced")
        ]
        cursor.executemany(
            "INSERT INTO portfolios (id, title, author, category, views, downloads, status, tech_stack, description, tags, submitted_at, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            default_portfolios
        )

    conn.commit()
    conn.close()

init_db()

# Pydantic Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str

class GoogleAuthRequest(BaseModel):
    uid: str
    email: str
    name: str
    role: str
    photoURL: Optional[str] = None

class PortfolioCreate(BaseModel):
    title: str
    author: str
    category: str
    techStack: str
    description: str
    tags: List[str]
    difficulty: Optional[str] = "Beginner"

# Helper: Token generation
def create_token(user_uid: str, email: str, name: str, role: str) -> str:
    payload = {
        "sub": user_uid,
        "email": email,
        "name": name,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# Helper: Verify JWT token from Header
def get_current_user_from_token(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    try:
        # Handle "Bearer <token>"
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {
            "uid": payload["sub"],
            "email": payload["email"],
            "name": payload["name"],
            "role": payload["role"]
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {str(e)}")

# Endpoints: Auth
@app.post("/api/auth/login")
@app.post("/api/v1/auth/login")
def login(req: LoginRequest):
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email = ?", (req.email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not user["password_hash"] or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    token = create_token(user["uid"], user["email"], user["name"], user["role"])
    return {
        "token": token,
        "type": "Bearer",
        "user": {
            "uid": user["uid"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "createdAt": user["created_at"]
        }
    }

@app.post("/api/auth/signup")
@app.post("/api/v1/auth/signup")
@app.post("/api/auth/register")
@app.post("/api/v1/auth/register")
def signup(req: SignupRequest):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email = ?", (req.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
        
    uid = f"user-{os.urandom(6).hex()}"
    pwd_hash = hash_password(req.password)
    created_at = datetime.utcnow().isoformat()
    
    cursor.execute(
        "INSERT INTO users (uid, email, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (uid, req.email, req.name, req.role, pwd_hash, created_at)
    )
    conn.commit()
    conn.close()
    
    token = create_token(uid, req.email, req.name, req.role)
    return {
        "token": token,
        "type": "Bearer",
        "user": {
            "uid": uid,
            "email": req.email,
            "name": req.name,
            "role": req.role,
            "createdAt": created_at
        }
    }

@app.post("/api/auth/google")
@app.post("/api/v1/auth/google")
def google_auth(req: GoogleAuthRequest):
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE uid = ?", (req.uid,))
    user = cursor.fetchone()
    
    created_at = datetime.utcnow().isoformat()
    if not user:
        # Register new Google user
        cursor.execute(
            "INSERT INTO users (uid, email, name, role, created_at) VALUES (?, ?, ?, ?, ?)",
            (req.uid, req.email, req.name, req.role, created_at)
        )
        conn.commit()
        role = req.role
    else:
        role = user["role"]
        created_at = user["created_at"]
        
    conn.close()
    
    token = create_token(req.uid, req.email, req.name, role)
    return {
        "token": token,
        "type": "Bearer",
        "user": {
            "uid": req.uid,
            "email": req.email,
            "name": req.name,
            "role": role,
            "createdAt": created_at
        }
    }

# Endpoints: Portfolios
@app.get("/api/portfolios")
@app.get("/api/v1/portfolios")
def get_portfolios(category: Optional[str] = None, search: Optional[str] = None):
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = "SELECT * FROM portfolios WHERE status = 'Active'"
    params = []
    
    if category and category != "All":
        query += " AND LOWER(category) = ?"
        params.append(category.lower())
        
    if search:
        query += " AND (LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(description) LIKE ?)"
        term = f"%{search.lower()}%"
        params.extend([term, term, term])
        
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    portfolios = []
    for r in rows:
        portfolios.append({
            "id": r["id"],
            "name": r["title"],
            "title": r["title"],
            "author": r["author"],
            "category": r["category"],
            "views": r["views"],
            "downloads": r["downloads"],
            "status": r["status"],
            "techStack": r["tech_stack"],
            "description": r["description"],
            "tags": r["tags"].split(",") if r["tags"] else [],
            "submittedAt": r["submitted_at"],
            "difficulty": r["difficulty"]
        })
        
    return portfolios

@app.get("/api/portfolios/templates")
@app.get("/api/v1/portfolios/templates")
def get_portfolio_templates():
    return get_portfolios()

@app.post("/api/portfolios")
@app.post("/api/v1/portfolios")
def upload_portfolio(req: PortfolioCreate, user: Dict[str, Any] = Depends(get_current_user_from_token)):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    pid = f"port-{os.urandom(4).hex()}"
    submitted_at = datetime.utcnow().isoformat()
    tags_str = ",".join(req.tags)
    
    cursor.execute(
        """INSERT INTO portfolios (id, title, author, category, tech_stack, description, tags, submitted_at, difficulty) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (pid, req.title, req.author, req.category, req.techStack, req.description, tags_str, submitted_at, req.difficulty)
    )
    conn.commit()
    conn.close()
    
    return {
        "id": pid,
        "title": req.title,
        "name": req.title,
        "author": req.author,
        "category": req.category,
        "views": 0,
        "downloads": 0,
        "status": "Active",
        "techStack": req.techStack,
        "description": req.description,
        "tags": req.tags,
        "submittedAt": submitted_at,
        "difficulty": req.difficulty
    }

@app.post("/api/portfolios/upload")
@app.post("/api/v1/portfolios/upload")
def upload_portfolio_with_assets(
    portfolioData: str = Form(...),
    thumbnail: Optional[UploadFile] = FastAPIFile(None),
    screenshots: List[UploadFile] = FastAPIFile([]),
    sourceFile: Optional[UploadFile] = FastAPIFile(None),
    user: Dict[str, Any] = Depends(get_current_user_from_token)
):
    import json
    try:
        data = json.loads(portfolioData)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid portfolioData JSON")
        
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    pid = f"port-{os.urandom(4).hex()}"
    submitted_at = datetime.utcnow().isoformat()
    tags_str = ",".join(data.get("tags", []))
    
    cursor.execute(
        """INSERT INTO portfolios (id, title, author, category, tech_stack, description, tags, submitted_at, difficulty) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (pid, data.get("title", "Untitled"), data.get("author", user["name"]), data.get("category", "Minimal"), 
         data.get("techStack", ""), data.get("description", ""), tags_str, submitted_at, data.get("difficulty", "Beginner"))
    )
    conn.commit()
    conn.close()
    
    return {
        "id": pid,
        "title": data.get("title", "Untitled"),
        "author": data.get("author", user["name"]),
        "category": data.get("category", "Minimal"),
        "views": 0,
        "downloads": 0,
        "status": "Active",
        "techStack": data.get("techStack", ""),
        "description": data.get("description", ""),
        "tags": data.get("tags", []),
        "submittedAt": submitted_at,
        "difficulty": data.get("difficulty", "Beginner")
    }

# Endpoints: Resumes
@app.get("/api/resumes/current")
@app.get("/api/v1/resumes/current")
@app.get("/api/resumes/{id}")
@app.get("/api/v1/resumes/{id}")
def get_resume(id: Optional[str] = "current", user: Dict[str, Any] = Depends(get_current_user_from_token)):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT resume_data FROM resumes WHERE user_uid = ?", (user["uid"],))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        import json
        return json.loads(row[0])
        
    # Return default empty/placeholder resume matching DEFAULT_RESUME structure
    return {
        "name": user["name"],
        "title": "Full Stack Engineer",
        "email": user["email"],
        "phone": "+1 (555) 019-2834",
        "website": f"https://{user['name'].lower().replace(' ', '')}.dev",
        "skills": ["React", "TypeScript", "TailwindCSS", "Node.js", "Python"],
        "education": {
            "school": "Stanford University",
            "degree": "B.S. in Computer Science",
            "year": "2022 - 2026",
            "description": "Relevant coursework: Distributed Systems, Database Systems, Web Applications."
        },
        "projects": [
            {"title": "Folioo Sandbox", "role": "Creator", "description": "A template platform built with React 19 and Bun.", "tech": "React, TS"}
        ],
        "experiences": [
            {"company": "Vercel", "position": "Software Engineer Intern", "duration": "Summer 2025", "description": "Worked on next-generation rendering engines and frontend components."}
        ],
        "achievements": [
            {"title": "Stanford Hackathon Winner", "date": "Oct 2025", "description": "First place out of 200 participants."}
        ],
        "template": "modern"
    }

@app.post("/api/resumes")
@app.post("/api/v1/resumes")
def save_resume(req_data: Dict[str, Any], user: Dict[str, Any] = Depends(get_current_user_from_token)):
    import json
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    resume_json = json.dumps(req_data)
    now = datetime.utcnow().isoformat()
    
    cursor.execute("INSERT OR REPLACE INTO resumes (user_uid, resume_data, updated_at) VALUES (?, ?, ?)", 
                   (user["uid"], resume_json, now))
    conn.commit()
    conn.close()
    
    return req_data

# Endpoints: Guides
@app.get("/api/guides")
@app.get("/api/v1/guides")
def get_guides():
    return [
        {"id": "1", "name": "Vercel Deploy Guide", "provider": "Vercel", "time": "5 mins", "difficulty": "Beginner", "status": "Ready"},
        {"id": "2", "name": "Docker & AWS ECS", "provider": "AWS", "time": "20 mins", "difficulty": "Advanced", "status": "Ready"},
        {"id": "3", "name": "GitHub Actions CI/CD", "provider": "GitHub", "time": "10 mins", "difficulty": "Intermediate", "status": "Ready"}
    ]

# Endpoints: Dashboard Analytics
@app.get("/api/creator/dashboard")
@app.get("/api/v1/creator/dashboard")
def get_creator_dashboard(user: Dict[str, Any] = Depends(get_current_user_from_token)):
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM portfolios")
    list_p = cursor.fetchall()
    conn.close()
    
    total_views = sum(r["views"] for r in list_p)
    total_downloads = sum(r["downloads"] for r in list_p)
    
    portfolios_list = []
    for r in list_p:
        portfolios_list.append({
            "id": r["id"],
            "title": r["title"],
            "name": r["title"],
            "author": r["author"],
            "category": r["category"],
            "views": r["views"],
            "downloads": r["downloads"],
            "status": r["status"],
            "techStack": r["tech_stack"],
            "description": r["description"]
        })
        
    return {
        "stats": {
            "totalPortfolios": len(list_p),
            "totalViews": total_views,
            "totalDownloads": total_downloads,
            "engagementRate": "27%" if len(list_p) > 0 else "0%"
        },
        "portfolios": portfolios_list,
        "chartData": [
            {"month": "Jan", "views": 400, "downloads": 100},
            {"month": "Feb", "views": 800, "downloads": 240},
            {"month": "Mar", "views": 1200, "downloads": 350},
            {"month": "Apr", "views": 1500, "downloads": 480},
            {"month": "May", "views": int(total_views * 0.7), "downloads": int(total_downloads * 0.7)},
            {"month": "Jun", "views": total_views, "downloads": total_downloads}
        ]
    }

@app.get("/api/admin/dashboard")
@app.get("/api/v1/admin/dashboard")
def get_admin_dashboard(user: Dict[str, Any] = Depends(get_current_user_from_token)):
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users")
    users_rows = cursor.fetchall()
    
    cursor.execute("SELECT * FROM portfolios")
    port_rows = cursor.fetchall()
    conn.close()
    
    users = []
    for u in users_rows:
        users.append({
            "id": u["uid"],
            "name": u["name"],
            "email": u["email"],
            "role": u["role"],
            "status": u["status"] if "status" in u.keys() else "Active",
            "createdAt": u["created_at"],
            "portfoliosCount": sum(1 for p in port_rows if p["author"] == u["name"])
        })
        
    portfolios = []
    for r in port_rows:
        portfolios.append({
            "id": r["id"],
            "title": r["title"],
            "name": r["title"],
            "author": r["author"],
            "category": r["category"],
            "views": r["views"],
            "downloads": r["downloads"],
            "status": r["status"],
            "techStack": r["tech_stack"],
            "description": r["description"]
        })
        
    total_downloads = sum(r["downloads"] for r in port_rows)
    
    return {
        "stats": {
            "totalUsers": len(users),
            "totalCreators": sum(1 for u in users if u["role"] == "Creator"),
            "totalPortfolios": len(portfolios),
            "totalDownloads": total_downloads
        },
        "users": users,
        "portfolios": portfolios
    }

# Portfolio Update Schema
class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    name: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    views: Optional[int] = None
    downloads: Optional[int] = None
    status: Optional[str] = None
    techStack: Optional[str] = None
    tech_stack: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    difficulty: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

# Portfolio Details / CRUD Endpoints
@app.get("/api/portfolios/{id}")
@app.get("/api/v1/portfolios/{id}")
def get_portfolio_by_id(id: str):
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM portfolios WHERE id = ?", (id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return {
        "id": r["id"],
        "name": r["title"],
        "title": r["title"],
        "author": r["author"],
        "category": r["category"],
        "views": r["views"],
        "downloads": r["downloads"],
        "status": r["status"],
        "techStack": r["tech_stack"],
        "description": r["description"],
        "tags": r["tags"].split(",") if r["tags"] else [],
        "submittedAt": r["submitted_at"],
        "difficulty": r["difficulty"]
    }

@app.put("/api/portfolios/{id}")
@app.put("/api/v1/portfolios/{id}")
def update_portfolio(id: str, req: PortfolioUpdate, user: Dict[str, Any] = Depends(get_current_user_from_token)):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Check if portfolio exists
    cursor.execute("SELECT * FROM portfolios WHERE id = ?", (id,))
    r = cursor.fetchone()
    if not r:
        conn.close()
        raise HTTPException(status_code=404, detail="Portfolio not found")
        
    update_fields = []
    params = []
    
    title_val = req.title or req.name
    if title_val is not None:
        update_fields.append("title = ?")
        params.append(title_val)
        
    if req.author is not None:
        update_fields.append("author = ?")
        params.append(req.author)
        
    if req.category is not None:
        update_fields.append("category = ?")
        params.append(req.category)
        
    if req.views is not None:
        update_fields.append("views = ?")
        params.append(req.views)
        
    if req.downloads is not None:
        update_fields.append("downloads = ?")
        params.append(req.downloads)
        
    if req.status is not None:
        update_fields.append("status = ?")
        params.append(req.status)
        
    tech_stack_val = req.tech_stack or req.techStack
    if tech_stack_val is not None:
        update_fields.append("tech_stack = ?")
        params.append(tech_stack_val)
        
    if req.description is not None:
        update_fields.append("description = ?")
        params.append(req.description)
        
    if req.tags is not None:
        update_fields.append("tags = ?")
        params.append(",".join(req.tags))
        
    if req.difficulty is not None:
        update_fields.append("difficulty = ?")
        params.append(req.difficulty)
        
    if not update_fields:
        conn.close()
        return {"success": True}
        
    params.append(id)
    query = f"UPDATE portfolios SET {', '.join(update_fields)} WHERE id = ?"
    cursor.execute(query, tuple(params))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/portfolios/{id}")
@app.delete("/api/v1/portfolios/{id}")
def delete_portfolio(id: str, user: Dict[str, Any] = Depends(get_current_user_from_token)):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM portfolios WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return {"success": True}

# Admin Portfolio Status Updates / Deletions
@app.put("/api/admin/portfolios/{id}/status")
@app.put("/api/v1/admin/portfolios/{id}/status")
def admin_update_portfolio_status(id: str, req: StatusUpdate, user: Dict[str, Any] = Depends(get_current_user_from_token)):
    if user["role"] != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    cursor.execute("UPDATE portfolios SET status = ? WHERE id = ?", (req.status, id))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/admin/portfolios/{id}")
@app.delete("/api/v1/admin/portfolios/{id}")
def admin_delete_portfolio(id: str, user: Dict[str, Any] = Depends(get_current_user_from_token)):
    if user["role"] != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM portfolios WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return {"success": True}

# Admin User Management (Suspend, Activate, Delete)
@app.put("/api/admin/users/{id}/suspend")
@app.put("/api/v1/admin/users/{id}/suspend")
def admin_suspend_user(id: str, user: Dict[str, Any] = Depends(get_current_user_from_token)):
    if user["role"] != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET status = 'Suspended' WHERE uid = ?", (id,))
    conn.commit()
    conn.close()
    return {"success": True}

@app.put("/api/admin/users/{id}/activate")
@app.put("/api/v1/admin/users/{id}/activate")
def admin_activate_user(id: str, user: Dict[str, Any] = Depends(get_current_user_from_token)):
    if user["role"] != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET status = 'Active' WHERE uid = ?", (id,))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/admin/users/{id}")
@app.delete("/api/v1/admin/users/{id}")
def admin_delete_user(id: str, user: Dict[str, Any] = Depends(get_current_user_from_token)):
    if user["role"] != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE uid = ?", (id,))
    conn.commit()
    conn.close()
    return {"success": True}

