import { db, auth } from '../firebase'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import type { Portfolio, TemplateDiscoveryItem, DeploymentGuide } from '../types'

const DEFAULT_PORTFOLIOS: Portfolio[] = [
  {
    id: "1",
    title: "Geist Minimal Portfolio",
    author: "Jane Doe",
    category: "Minimal",
    views: 1250,
    downloads: 340,
    likes: 85,
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
    description: "A beautiful minimal portfolio designed for software engineers who love simple aesthetics.",
    techStack: "React, TypeScript, TailwindCSS",
    tags: ["React", "TypeScript", "TailwindCSS"],
    submittedAt: new Date().toISOString(),
    difficulty: "Beginner",
    creator_id: "default-jane-doe",
    status: "Active",
    screenshots: ["https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80"],
    features: ["Responsive", "Dark Mode", "Framer Motion Animations"]
  },
  {
    id: "2",
    title: "Terminal CLI Portfolio",
    author: "John Smith",
    category: "Developer",
    views: 890,
    downloads: 210,
    likes: 54,
    thumbnailUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80",
    description: "An interactive command-line style portfolio with directory navigation and a mock shell.",
    techStack: "TypeScript, Node.js, TailwindCSS",
    tags: ["TypeScript", "Node.js", "TailwindCSS"],
    submittedAt: new Date().toISOString(),
    difficulty: "Intermediate",
    creator_id: "default-john-smith",
    status: "Active",
    screenshots: ["https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80"],
    features: ["Interactive Command Prompt", "Custom Command Scripts", "Retro Styling"]
  },
  {
    id: "3",
    title: "ThreeJS 3D Showcase",
    author: "Alice Johnson",
    category: "3D",
    views: 2450,
    downloads: 680,
    likes: 198,
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
    description: "A gorgeous 3D portfolio featuring interactive fluid simulations, custom models, and camera paths.",
    techStack: "Three.js, React, Framer Motion",
    tags: ["Three.js", "React", "Framer Motion"],
    submittedAt: new Date().toISOString(),
    difficulty: "Advanced",
    creator_id: "default-alice-johnson",
    status: "Active",
    screenshots: ["https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80"],
    features: ["Custom WebGL Shaders", "3D Interactive Scene", "Responsive Raycasting"]
  }
]

const DEFAULT_GUIDES: DeploymentGuide[] = [
  { id: "1", name: "Vercel Deploy Guide", provider: "Vercel", time: "5 mins", difficulty: "Beginner", status: "Ready" },
  { id: "2", name: "Docker & AWS ECS", provider: "AWS", time: "20 mins", difficulty: "Advanced", status: "Ready" },
  { id: "3", name: "GitHub Actions CI/CD", provider: "GitHub", time: "10 mins", difficulty: "Intermediate", status: "Ready" }
]

const seedDataIfEmpty = async () => {
  try {
    const user = auth.currentUser
    if (!user) return // Guests do not have permissions to write, so skip seeding.

    const portfolioSnap = await getDocs(collection(db, "portfolios"))
    if (portfolioSnap.empty) {
      for (const p of DEFAULT_PORTFOLIOS) {
        await setDoc(doc(db, "portfolios", p.id.toString()), p)
      }
    }

    const guideSnap = await getDocs(collection(db, "guides"))
    if (guideSnap.empty) {
      for (const g of DEFAULT_GUIDES) {
        await setDoc(doc(db, "guides", g.id), g)
      }
    }
  } catch (err) {
    console.warn("Auto-seeding ignored or failed:", err)
  }
}

export const portfolioService = {
  getAll: async (params?: { category?: string; search?: string }): Promise<Portfolio[]> => {
    let portfolios: Portfolio[] = []
    
    try {
      await seedDataIfEmpty()
      const querySnapshot = await getDocs(collection(db, "portfolios"))
      querySnapshot.forEach((doc) => {
        portfolios.push(doc.data() as Portfolio)
      })
      
      if (portfolios.length === 0) {
        portfolios = [...DEFAULT_PORTFOLIOS]
      }
    } catch (err) {
      console.warn("Failed to fetch portfolios from Firestore, using default local data:", err)
      portfolios = [...DEFAULT_PORTFOLIOS]
    }

    // Filter active/approved items
    portfolios = portfolios.filter(p => p.status === 'Active' || p.status === 'Approved')

    if (params?.category && params.category !== 'All') {
      portfolios = portfolios.filter(p => p.category.toLowerCase() === params.category!.toLowerCase())
    }

    if (params?.search) {
      const term = params.search.toLowerCase()
      portfolios = portfolios.filter(p => 
        p.title.toLowerCase().includes(term) ||
        p.author.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      )
    }

    return portfolios
  },
  
  getById: async (id: string | number): Promise<Portfolio> => {
    try {
      const docRef = doc(db, "portfolios", id.toString())
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return docSnap.data() as Portfolio
      }
    } catch (err) {
      console.warn("Failed to fetch portfolio from Firestore, checking local defaults:", err)
    }
    
    const local = DEFAULT_PORTFOLIOS.find(p => p.id.toString() === id.toString())
    if (local) return local
    
    throw new Error("Portfolio not found.")
  },

  getTemplates: async (): Promise<TemplateDiscoveryItem[]> => {
    const portfolios = await portfolioService.getAll()
    return portfolios.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      rating: "4.8",
      views: p.views.toString(),
      author: p.author,
      badge: p.difficulty || "Popular"
    }))
  },

  getDeploymentGuides: async (): Promise<DeploymentGuide[]> => {
    let guides: DeploymentGuide[] = []
    try {
      await seedDataIfEmpty()
      const querySnapshot = await getDocs(collection(db, "guides"))
      querySnapshot.forEach((doc) => {
        guides.push(doc.data() as DeploymentGuide)
      })
      if (guides.length === 0) {
        guides = [...DEFAULT_GUIDES]
      }
    } catch (err) {
      console.warn("Failed to fetch deployment guides from Firestore, using default local data:", err)
      guides = [...DEFAULT_GUIDES]
    }
    return guides
  },

  create: async (data: Partial<Portfolio>): Promise<Portfolio> => {
    const colRef = collection(db, "portfolios")
    const newDocRef = doc(colRef)
    
    const portfolio: Portfolio = {
      id: newDocRef.id,
      title: data.title || "Untitled",
      author: data.author || auth.currentUser?.displayName || "Google User",
      category: data.category || "Minimal",
      views: 0,
      downloads: 0,
      likes: 0,
      thumbnailUrl: data.thumbnailUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
      description: data.description || "",
      techStack: data.techStack || "",
      tags: data.tags || [],
      submittedAt: new Date().toISOString(),
      difficulty: data.difficulty || "Beginner",
      creator_id: auth.currentUser?.uid || "anonymous",
      status: "Active",
      screenshots: data.screenshots || [],
      features: data.features || []
    }

    await setDoc(newDocRef, portfolio)
    return portfolio
  },

  update: async (id: string | number, data: Partial<Portfolio>): Promise<Portfolio> => {
    const docRef = doc(db, "portfolios", id.toString())
    await updateDoc(docRef, data as any)
    return portfolioService.getById(id)
  },

  delete: async (id: string | number): Promise<{ success: boolean }> => {
    const docRef = doc(db, "portfolios", id.toString())
    await deleteDoc(docRef)
    return { success: true }
  },

  uploadPortfolioWithAssets: async (portfolioData: any, _thumbnail?: File, _screenshots?: File[], _sourceFile?: File): Promise<Portfolio> => {
    const thumbnailMock = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80"
    const screenshotsMocks = [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80"
    ]

    const fullData = {
      ...portfolioData,
      thumbnailUrl: thumbnailMock,
      screenshots: screenshotsMocks
    }

    return portfolioService.create(fullData)
  }
}
