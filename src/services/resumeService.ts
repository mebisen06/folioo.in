import { db, auth } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { ResumeData } from '../types'

const getDefaultResume = (): ResumeData => {
  const user = auth.currentUser
  return {
    name: user?.displayName || "Full Stack Engineer",
    title: "Full Stack Engineer",
    email: user?.email || "",
    phone: "+1 (555) 019-2834",
    website: `https://${(user?.displayName || "user").toLowerCase().replace(/\s+/g, '')}.dev`,
    skills: ["React", "TypeScript", "TailwindCSS", "Node.js", "Python"],
    education: {
      school: "Stanford University",
      degree: "B.S. in Computer Science",
      year: "2022 - 2026",
      description: "Relevant coursework: Distributed Systems, Database Systems, Web Applications."
    },
    projects: [
      { title: "Folioo Sandbox", role: "Creator", description: "A template platform built with React 19 and Bun.", tech: "React, TS" }
    ],
    experiences: [
      { company: "Vercel", position: "Software Engineer Intern", duration: "Summer 2025", description: "Worked on next-generation rendering engines and frontend components." }
    ],
    achievements: [
      { title: "Stanford Hackathon Winner", date: "Oct 2025", description: "First place out of 200 participants." }
    ],
    template: "modern"
  }
}

export const resumeService = {
  getResume: async (id: string): Promise<ResumeData> => {
    const uid = id === 'current' ? auth.currentUser?.uid : id
    if (!uid) {
      return getDefaultResume()
    }
    const docRef = doc(db, "resumes", uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data() as ResumeData
    }
    return getDefaultResume()
  },
  
  saveResume: async (resumeData: ResumeData): Promise<ResumeData> => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error("User must be logged in to save a resume.")
    
    await setDoc(doc(db, "resumes", uid), resumeData)
    return resumeData
  },
  
  updateResume: async (_id: string, resumeData: Partial<ResumeData>): Promise<ResumeData> => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error("User must be logged in to update a resume.")

    const currentResume = await resumeService.getResume(uid)
    const updated = { ...currentResume, ...resumeData }
    await setDoc(doc(db, "resumes", uid), updated)
    return updated
  }
}
