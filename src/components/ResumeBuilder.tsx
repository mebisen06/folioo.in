import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  Terminal,
  User,
  GraduationCap,
  Cpu,
  FolderCode,
  Briefcase,
  Trophy,
  LayoutTemplate,
  AlertTriangle
} from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Badge } from './ui/Badge'

import type { ResumeData, Project, Experience, Achievement } from '../types'
import { useResumeBuilder } from '../hooks/useResumeBuilder'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'


const DEFAULT_RESUME: ResumeData = {
  name: '',
  title: '',
  email: '',
  phone: '',
  website: '',
  skills: [],
  education: {
    school: '',
    degree: '',
    year: '',
    description: ''
  },
  projects: [],
  experiences: [],
  achievements: [],
  template: 'modern'
}

export default function ResumeBuilder() {
  const { resumeData: apiResumeData, saveResume } = useResumeBuilder('current')
  const [step, setStep] = React.useState<number>(1)
  const [newSkill, setNewSkill] = React.useState<string>('')
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [generatingPdf, setGeneratingPdf] = React.useState(false)
  const [pdfError, setPdfError] = React.useState<string | null>(null)
  const [pdfSuccess, setPdfSuccess] = React.useState(false)

  const handleDownloadPDF = async () => {
    const element = document.getElementById('resume-pdf-content')
    if (!element) {
      setPdfError('Preview element not found.')
      return
    }
    // Select the inner template element to avoid outer shadows and rounded corners
    const targetElement = (element.firstElementChild || element) as HTMLElement
    setGeneratingPdf(true)
    setPdfError(null)
    setPdfSuccess(false)

    // Helper functions to parse OKLCH colors and convert to RGB to prevent html2canvas crash
    const oklchToRgb = (oklchStr: string): string => {
      const match = oklchStr.match(/oklch\s*\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+(?:deg|rad|grad|turn)?)(?:\s*\/\s*([0-9.]+%?))?\s*\)/i);
      if (!match) return oklchStr;

      let L = parseFloat(match[1]);
      if (match[1].endsWith('%')) L /= 100;

      const C = parseFloat(match[2]);

      let H = parseFloat(match[3]);
      if (match[3].endsWith('rad')) {
        H = H * (180 / Math.PI);
      } else if (match[3].endsWith('grad')) {
        H = H * 0.9;
      } else if (match[3].endsWith('turn')) {
        H = H * 360;
      }
      const hRad = H * (Math.PI / 180);

      const a = C * Math.cos(hRad);
      const b = C * Math.sin(hRad);

      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

      const l = l_ * l_ * l_;
      const m = m_ * m_ * m_;
      const s = s_ * s_ * s_;

      let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      let b_val = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      const f = (x: number) => {
        if (x <= 0.0031308) return 12.92 * x;
        return 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
      };

      r = Math.max(0, Math.min(1, r));
      g = Math.max(0, Math.min(1, g));
      b_val = Math.max(0, Math.min(1, b_val));

      const rInt = Math.round(f(r) * 255);
      const gInt = Math.round(f(g) * 255);
      const bInt = Math.round(f(b_val) * 255);

      const alpha = match[4];
      if (alpha !== undefined) {
        let aVal = parseFloat(alpha);
        if (alpha.endsWith('%')) aVal /= 100;
        return `rgba(${rInt}, ${gInt}, ${bInt}, ${aVal})`;
      }

      return `rgb(${rInt}, ${gInt}, ${bInt})`;
    };

    const replaceOklchWithRgb = (str: string): string => {
      if (typeof str !== 'string' || !str.includes('oklch')) return str;
      return str.replace(/oklch\([^)]+\)/g, (match) => {
        try {
          return oklchToRgb(match);
        } catch (e) {
          return match;
        }
      });
    };

    const originalGetComputedStyle = window.getComputedStyle;
    
    // Override window.getComputedStyle to intercept oklch color references
    window.getComputedStyle = function (elt, pseudoElt) {
      const style = originalGetComputedStyle(elt, pseudoElt);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return function (propertyName: string) {
              const val = target.getPropertyValue(propertyName);
              if (typeof val === 'string' && val.includes('oklch')) {
                return replaceOklchWithRgb(val);
              }
              return val;
            };
          }
          const val = Reflect.get(target, prop);
          if (typeof val === 'string' && val.includes('oklch')) {
            return replaceOklchWithRgb(val);
          }
          if (typeof val === 'function') {
            return val.bind(target);
          }
          return val;
        }
      });
    };

    try {
      const template = resumeData.template || 'modern'
      const bgColor = template === 'ats' ? '#ffffff' : (template === 'student' ? '#171717' : '#111111')

      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: bgColor,
        logging: false
      })

      if (!canvas.width || !canvas.height) {
        throw new Error('Canvas rendering generated an empty image.')
      }

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0 && isFinite(heightLeft)) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save('resume.pdf')
      setPdfSuccess(true)
      setTimeout(() => setPdfSuccess(false), 4000)
    } catch (err) {
      console.error('PDF Generation Error:', err)
      setPdfError('Failed to generate PDF. Please try again.')
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
      setGeneratingPdf(false)
    }
  }

  // Initialize form states
  const [resumeData, setResumeData] = React.useState<ResumeData>(DEFAULT_RESUME)

  React.useEffect(() => {
    if (apiResumeData) {
      setResumeData(apiResumeData)
    }
  }, [apiResumeData])

  // Debounced auto-save effect
  React.useEffect(() => {
    if (!resumeData || !resumeData.name) return

    const timer = setTimeout(async () => {
      try {
        await saveResume(resumeData)
        console.log('Resume auto-saved successfully')
      } catch (err) {
        console.error('Failed to auto-save resume:', err)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [resumeData, saveResume])

  // Validate fields for current step
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (currentStep === 1) {
      if (!resumeData.name.trim()) newErrors.name = 'Full name is required'
      if (!resumeData.title.trim()) newErrors.title = 'Job title/role is required'
      if (!resumeData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(resumeData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }
    
    if (currentStep === 2) {
      if (!resumeData.education.school.trim()) newErrors.school = 'School name is required'
      if (!resumeData.education.degree.trim()) newErrors.degree = 'Degree/Major is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 7) setStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (step > 1) setStep(prev => prev - 1)
  }

  // Dynamic lists manipulators
  const handleAddProject = () => {
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, { title: '', role: '', description: '', tech: '' }]
    })
  }

  const handleRemoveProject = (index: number) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((_, idx) => idx !== index)
    })
  }

  const handleUpdateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...resumeData.projects]
    updated[index] = { ...updated[index], [field]: value }
    setResumeData({ ...resumeData, projects: updated })
  }

  const handleAddExperience = () => {
    setResumeData({
      ...resumeData,
      experiences: [...resumeData.experiences, { company: '', position: '', duration: '', description: '' }]
    })
  }

  const handleRemoveExperience = (index: number) => {
    setResumeData({
      ...resumeData,
      experiences: resumeData.experiences.filter((_, idx) => idx !== index)
    })
  }

  const handleUpdateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...resumeData.experiences]
    updated[index] = { ...updated[index], [field]: value }
    setResumeData({ ...resumeData, experiences: updated })
  }

  const handleAddAchievement = () => {
    setResumeData({
      ...resumeData,
      achievements: [...resumeData.achievements, { title: '', date: '', description: '' }]
    })
  }

  const handleRemoveAchievement = (index: number) => {
    setResumeData({
      ...resumeData,
      achievements: resumeData.achievements.filter((_, idx) => idx !== index)
    })
  }

  const handleUpdateAchievement = (index: number, field: keyof Achievement, value: string) => {
    const updated = [...resumeData.achievements]
    updated[index] = { ...updated[index], [field]: value }
    setResumeData({ ...resumeData, achievements: updated })
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(s => s !== skill)
    })
  }

  // Steps definition
  const steps = [
    { id: 1, label: 'Personal', icon: User },
    { id: 2, label: 'Education', icon: GraduationCap },
    { id: 3, label: 'Skills', icon: Cpu },
    { id: 4, label: 'Projects', icon: FolderCode },
    { id: 5, label: 'Experience', icon: Briefcase },
    { id: 6, label: 'Achievements', icon: Trophy },
    { id: 7, label: 'Template', icon: LayoutTemplate }
  ]

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="accent" dot>ATS Compliant Parser</Badge>
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">v2.1 Stable</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Interactive Resume Builder</h1>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Compose your professional developer identity. Edit details on the left, watch live updates rendered instantly inside custom template stylesheets on the right.
        </p>
      </div>

      {/* Progress Tracker bar */}
      <div className="bg-surface/50 border border-border/60 p-4 rounded-xl flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {steps.map(s => {
            const Icon = s.icon
            const isCompleted = s.id < step
            const isActive = s.id === step
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id <= step || validateStep(step)) setStep(s.id)
                }}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all cursor-pointer
                  ${isActive 
                    ? 'bg-accent text-white shadow-glow border border-accent/40' 
                    : isCompleted 
                      ? 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-400' 
                      : 'bg-neutral-900 border border-border/40 text-zinc-500 hover:text-zinc-300'}
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{s.label}</span>
              </button>
            )
          })}
        </div>
        <div className="text-xs font-mono font-semibold text-zinc-400">
          Step {step} of 7 ({Math.round(((step - 1) / 6) * 100)}%)
        </div>
      </div>

      {/* Split layout: Form on Left, Preview Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form panel Column */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="p-6 border-border/60 bg-surface/30">
            <AnimatePresence mode="wait">
              
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-white">Personal Information</h3>
                    <p className="text-[11px] text-zinc-500">Contact coordinates recruiters use to reach out.</p>
                  </div>
                  
                  <div className="space-y-3.5">
                    <Input
                      label="Full Name"
                      placeholder="e.g. Jane Doe"
                      value={resumeData.name}
                      onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                      error={errors.name}
                    />
                    <Input
                      label="Professional Headline"
                      placeholder="e.g. Full Stack Developer"
                      value={resumeData.title}
                      onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                      error={errors.title}
                    />
                    <Input
                      label="Email Address"
                      placeholder="e.g. jane@example.com"
                      value={resumeData.email}
                      onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                      error={errors.email}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Phone Number"
                        placeholder="e.g. +1 (555) 019-2834"
                        value={resumeData.phone}
                        onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                      />
                      <Input
                        label="Website / Link"
                        placeholder="e.g. https://janedoe.dev"
                        value={resumeData.website}
                        onChange={(e) => setResumeData({ ...resumeData, website: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Education */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-white">Education History</h3>
                    <p className="text-[11px] text-zinc-500">Academic pedigree and degree status certifications.</p>
                  </div>

                  <div className="space-y-3.5">
                    <Input
                      label="School / University Name"
                      placeholder="e.g. Stanford University"
                      value={resumeData.education.school}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        education: { ...resumeData.education, school: e.target.value }
                      })}
                      error={errors.school}
                    />
                    <Input
                      label="Degree & Major / Course"
                      placeholder="e.g. B.S. in Computer Science"
                      value={resumeData.education.degree}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        education: { ...resumeData.education, degree: e.target.value }
                      })}
                      error={errors.degree}
                    />
                    <Input
                      label="Years / Duration"
                      placeholder="e.g. 2022 - 2026"
                      value={resumeData.education.year}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        education: { ...resumeData.education, year: e.target.value }
                      })}
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 block">Education Description (Optional)</label>
                      <textarea
                        value={resumeData.education.description}
                        onChange={(e) => setResumeData({
                          ...resumeData,
                          education: { ...resumeData.education, description: e.target.value }
                        })}
                        placeholder="Relevant courses, academic minors, grade levels..."
                        className="w-full text-xs bg-neutral-900 border border-border hover:border-zinc-800 focus:border-accent p-3.5 rounded-lg text-white font-medium placeholder-zinc-600 focus:outline-none transition-all min-h-[80px]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Skills */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-white">Technical Skills</h3>
                    <p className="text-[11px] text-zinc-500">Core technologies, libraries, frameworks, and tools.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add skill tag (e.g. Docker, PyTorch)..."
                        className="w-full"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSkill()
                          }
                        }}
                      />
                      <Button variant="secondary" onClick={handleAddSkill} className="shrink-0">
                        Add Tag
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 p-3.5 bg-neutral-950/40 border border-border/40 rounded-lg min-h-[100px] items-start">
                      {resumeData.skills.length === 0 ? (
                        <span className="text-xs text-zinc-600 italic">No skills added yet. Type a skill tag and click add.</span>
                      ) : (
                        resumeData.skills.map(skill => (
                          <Badge key={skill} variant="default" className="gap-1 pr-1 cursor-default font-mono">
                            {skill}
                            <button
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-zinc-500 hover:text-red-400 p-0.5 cursor-pointer rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Projects */}
              {step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <h3 className="text-sm sm:text-base font-bold text-white">Projects</h3>
                      <p className="text-[11px] text-zinc-500">Open source and hackathon coding portfolios.</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleAddProject} className="gap-1.5 text-[10px]">
                      <Plus className="w-3.5 h-3.5" /> Add Project
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {resumeData.projects.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-border/60 rounded-xl text-zinc-500 text-xs italic">
                        No projects listed. Click "Add Project" to add.
                      </div>
                    ) : (
                      resumeData.projects.map((proj, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-border/60 bg-neutral-950/20 relative space-y-3 text-left">
                          <button
                            onClick={() => handleRemoveProject(idx)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">PROJECT #{idx + 1}</span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              label="Project Title"
                              placeholder="e.g. Folioo Sandbox"
                              value={proj.title}
                              onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                            />
                            <Input
                              label="Your Role"
                              placeholder="e.g. Lead Frontend Developer"
                              value={proj.role}
                              onChange={(e) => handleUpdateProject(idx, 'role', e.target.value)}
                            />
                          </div>
                          
                          <Input
                            label="Technologies used"
                            placeholder="e.g. React, Next.js, Framer Motion"
                            value={proj.tech}
                            onChange={(e) => handleUpdateProject(idx, 'tech', e.target.value)}
                          />

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 block">Project Description</label>
                            <textarea
                              placeholder="Describe your design decisions, key features, and accomplishments..."
                              value={proj.description}
                              onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                              className="w-full text-xs bg-neutral-900 border border-border hover:border-zinc-800 focus:border-accent p-3.5 rounded-lg text-white font-medium placeholder-zinc-600 focus:outline-none transition-all min-h-[60px]"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Experience */}
              {step === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <h3 className="text-sm sm:text-base font-bold text-white">Work Experience</h3>
                      <p className="text-[11px] text-zinc-500">Professional positions, internships, and freelance jobs.</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleAddExperience} className="gap-1.5 text-[10px]">
                      <Plus className="w-3.5 h-3.5" /> Add Job
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {resumeData.experiences.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-border/60 rounded-xl text-zinc-500 text-xs italic">
                        No work experience listed. Click "Add Job" to add.
                      </div>
                    ) : (
                      resumeData.experiences.map((exp, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-border/60 bg-neutral-950/20 relative space-y-3 text-left">
                          <button
                            onClick={() => handleRemoveExperience(idx)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">EXPERIENCE #{idx + 1}</span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              label="Company / Employer"
                              placeholder="e.g. Vercel Inc."
                              value={exp.company}
                              onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                            />
                            <Input
                              label="Job Position"
                              placeholder="e.g. Software Engineer Intern"
                              value={exp.position}
                              onChange={(e) => handleUpdateExperience(idx, 'position', e.target.value)}
                            />
                          </div>
                          
                          <Input
                            label="Duration / Years"
                            placeholder="e.g. Summer 2025"
                            value={exp.duration}
                            onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                          />

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 block">Job Description</label>
                            <textarea
                              placeholder="Outline your job responsibilities, project metrics, and technical contributions..."
                              value={exp.description}
                              onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                              className="w-full text-xs bg-neutral-900 border border-border hover:border-zinc-800 focus:border-accent p-3.5 rounded-lg text-white font-medium placeholder-zinc-600 focus:outline-none transition-all min-h-[60px]"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 6: Achievements */}
              {step === 6 && (
                <motion.div
                  key="step-6"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <h3 className="text-sm sm:text-base font-bold text-white">Achievements & Certifications</h3>
                      <p className="text-[11px] text-zinc-500">Hackathons, awards, licenses, or exam completions.</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleAddAchievement} className="gap-1.5 text-[10px]">
                      <Plus className="w-3.5 h-3.5" /> Add Award
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {resumeData.achievements.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-border/60 rounded-xl text-zinc-500 text-xs italic">
                        No achievements listed. Click "Add Award" to add.
                      </div>
                    ) : (
                      resumeData.achievements.map((ach, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-border/60 bg-neutral-950/20 relative space-y-3 text-left">
                          <button
                            onClick={() => handleRemoveAchievement(idx)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">ACHIEVEMENT #{idx + 1}</span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              label="Achievement Title"
                              placeholder="e.g. Stanford Hackathon winner"
                              value={ach.title}
                              onChange={(e) => handleUpdateAchievement(idx, 'title', e.target.value)}
                            />
                            <Input
                              label="Date / Year"
                              placeholder="e.g. Oct 2025"
                              value={ach.date}
                              onChange={(e) => handleUpdateAchievement(idx, 'date', e.target.value)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 block">Short Description</label>
                            <textarea
                              placeholder="Outline the award description, scale, or metrics..."
                              value={ach.description}
                              onChange={(e) => handleUpdateAchievement(idx, 'description', e.target.value)}
                              className="w-full text-xs bg-neutral-900 border border-border hover:border-zinc-800 focus:border-accent p-3.5 rounded-lg text-white font-medium placeholder-zinc-600 focus:outline-none transition-all min-h-[60px]"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 7: Template Selection */}
              {step === 7 && (
                <motion.div
                  key="step-7"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-white">Select Resume Template</h3>
                    <p className="text-[11px] text-zinc-500">Pick a styling theme configuration for your exported resume document.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Modern Developer */}
                    <button
                      onClick={() => setResumeData({ ...resumeData, template: 'modern' })}
                      className={`
                        p-4 rounded-xl border text-left space-y-2 cursor-pointer transition-all
                        ${resumeData.template === 'modern' 
                          ? 'border-accent bg-accent/5 ring-1 ring-accent/30' 
                          : 'border-border/60 bg-neutral-950/20 hover:border-zinc-700'}
                      `}
                    >
                      <Sparkles className="w-5 h-5 text-accent" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Modern Developer</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">Dark-mode SaaS theme with accent badges and sidebar metadata.</p>
                      </div>
                    </button>

                    {/* ATS Friendly */}
                    <button
                      onClick={() => setResumeData({ ...resumeData, template: 'ats' })}
                      className={`
                        p-4 rounded-xl border text-left space-y-2 cursor-pointer transition-all
                        ${resumeData.template === 'ats' 
                          ? 'border-accent bg-accent/5 ring-1 ring-accent/30' 
                          : 'border-border/60 bg-neutral-950/20 hover:border-zinc-700'}
                      `}
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-bold text-white">ATS Friendly</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">Minimalist black & white printed stylesheet optimized for parsing algorithms.</p>
                      </div>
                    </button>

                    {/* Student Resume */}
                    <button
                      onClick={() => setResumeData({ ...resumeData, template: 'student' })}
                      className={`
                        p-4 rounded-xl border text-left space-y-2 cursor-pointer transition-all
                        ${resumeData.template === 'student' 
                          ? 'border-accent bg-accent/5 ring-1 ring-accent/30' 
                          : 'border-border/60 bg-neutral-950/20 hover:border-zinc-700'}
                      `}
                    >
                      <GraduationCap className="w-5 h-5 text-violet-400" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Student Resume</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">Clean grid layout emphasizing courseworks, school degrees, and internships.</p>
                      </div>
                    </button>

                    {/* Cybersecurity Resume */}
                    <button
                      onClick={() => setResumeData({ ...resumeData, template: 'cyber' })}
                      className={`
                        p-4 rounded-xl border text-left space-y-2 cursor-pointer transition-all
                        ${resumeData.template === 'cyber' 
                          ? 'border-accent bg-accent/5 ring-1 ring-accent/30' 
                          : 'border-border/60 bg-neutral-950/20 hover:border-zinc-700'}
                      `}
                    >
                      <Terminal className="w-5 h-5 text-emerald-500" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Cybersecurity track</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">Monospace terminal layout with amber / green tags and security tags.</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Error alerts indicator */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-red-950/20 border border-red-900/40 text-red-400 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Please fix details before proceeding to next steps.</span>
              </div>
            )}

            {/* Action buttons row */}
            <div className="mt-6 pt-5 border-t border-border/40 flex justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={step === 1}
                className="gap-1.5 border-border/80 text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              
              {step < 7 ? (
                <Button variant="secondary" size="sm" onClick={handleNext} className="gap-1.5">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  variant="glow" 
                  size="sm" 
                  onClick={() => {
                    if (validateStep(step)) handleDownloadPDF()
                  }} 
                  isLoading={generatingPdf}
                  className="gap-1.5"
                >
                  Generate Resume <Sparkles className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="space-y-2 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Live Document Preview</span>
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">Format: {resumeData.template.toUpperCase()}</span>
          </div>

          {/* Dynamic Template rendering container */}
          <div id="resume-pdf-content" className="w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
            
            {/* 1. Modern Developer Template */}
            {resumeData.template === 'modern' && (
              <div className="bg-[#111111] border border-border text-left p-6 sm:p-8 min-h-[500px] flex flex-col justify-between text-xs space-y-6 text-zinc-300">
                <div className="space-y-5">
                  {/* Header */}
                  <div className="border-b border-border/60 pb-4 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">{resumeData.name || 'Your Full Name'}</h2>
                      <span className="text-xs font-semibold text-accent uppercase tracking-wider block">{resumeData.title || 'Role/Specialty'}</span>
                    </div>
                    <div className="text-[10px] text-right text-zinc-500 space-y-0.5 font-mono">
                      <div>{resumeData.email}</div>
                      <div>{resumeData.phone}</div>
                      <div>{resumeData.website}</div>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Technical Stack</span>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeData.skills.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-neutral-900 border border-border/80 rounded text-[10px] font-mono font-bold text-accent">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Academic Credentials</span>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <strong className="text-white font-extrabold">{resumeData.education.school}</strong>
                        <span className="text-zinc-500 font-mono">{resumeData.education.year}</span>
                      </div>
                      <div className="text-zinc-400 italic text-[11px]">{resumeData.education.degree}</div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">{resumeData.education.description}</p>
                    </div>
                  </div>

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Featured Portfolios</span>
                      <div className="space-y-2.5">
                        {resumeData.projects.map((proj, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <strong className="text-white font-bold">{proj.title || 'Untitled Project'}</strong>
                              <span className="text-zinc-500 text-[10px] italic">{proj.role}</span>
                            </div>
                            {proj.tech && <span className="text-[9px] font-mono font-bold text-zinc-500 block">Stack: {proj.tech}</span>}
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experiences.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Work Experience</span>
                      <div className="space-y-2.5">
                        {resumeData.experiences.map((exp, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <strong className="text-white font-bold">{exp.company || 'Employer'}</strong>
                              <span className="text-zinc-500 text-[10px] font-mono">{exp.duration}</span>
                            </div>
                            <div className="text-zinc-400 text-[11px] italic">{exp.position}</div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {resumeData.achievements.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Achievements & Honors</span>
                      <div className="space-y-2">
                        {resumeData.achievements.map((ach, idx) => (
                          <div key={idx} className="text-[11px]">
                            <div className="flex justify-between font-bold text-zinc-300">
                              <span>{ach.title}</span>
                              <span className="text-zinc-500 font-mono font-normal">{ach.date}</span>
                            </div>
                            <p className="text-zinc-400 mt-0.5 leading-relaxed">{ach.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border/40 text-[9px] font-mono text-zinc-600 flex justify-between">
                  <span>GEN: FOLIOO BUILDER</span>
                  <span>v2.1 COMPILER STATUS: OK</span>
                </div>
              </div>
            )}

            {/* 2. ATS Friendly Template (Pure white background, clean simple spacing) */}
            {resumeData.template === 'ats' && (
              <div className="bg-white text-zinc-950 text-left p-6 sm:p-8 min-h-[500px] flex flex-col justify-between text-xs font-sans space-y-5">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="text-center space-y-1 border-b border-zinc-300 pb-3">
                    <h2 className="text-2xl font-serif font-black uppercase tracking-tight text-zinc-900 leading-none">{resumeData.name || 'Your Full Name'}</h2>
                    <div className="text-xs font-semibold text-zinc-600">{resumeData.title || 'Role/Specialty'}</div>
                    <div className="text-[10px] text-zinc-500 flex flex-wrap justify-center gap-x-3 gap-y-0.5 font-serif pt-1">
                      <span>{resumeData.email}</span>
                      <span>•</span>
                      <span>{resumeData.phone}</span>
                      <span>•</span>
                      <span>{resumeData.website}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5">Technical Stack</h3>
                    <p className="text-[11px] text-zinc-700 leading-relaxed font-serif">
                      <strong>Skills:</strong> {resumeData.skills.join(', ')}
                    </p>
                  </div>

                  {/* Education */}
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5">Education History</h3>
                    <div className="space-y-1 font-serif text-[11px]">
                      <div className="flex justify-between items-center">
                        <strong className="text-zinc-900">{resumeData.education.school}</strong>
                        <span className="text-zinc-600">{resumeData.education.year}</span>
                      </div>
                      <div className="italic text-zinc-700">{resumeData.education.degree}</div>
                      <p className="text-zinc-600 leading-relaxed">{resumeData.education.description}</p>
                    </div>
                  </div>

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                    <div className="space-y-1.5">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5">Projects</h3>
                      <div className="space-y-2 font-serif text-[11px]">
                        {resumeData.projects.map((proj, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex justify-between items-center">
                              <strong className="text-zinc-900">{proj.title} — {proj.role}</strong>
                              {proj.tech && <span className="text-[10px] text-zinc-500">({proj.tech})</span>}
                            </div>
                            <p className="text-zinc-600 leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experiences.length > 0 && (
                    <div className="space-y-1.5">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5">Professional Experience</h3>
                      <div className="space-y-2 font-serif text-[11px]">
                        {resumeData.experiences.map((exp, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex justify-between items-center">
                              <strong className="text-zinc-900">{exp.company}</strong>
                              <span className="text-zinc-600">{exp.duration}</span>
                            </div>
                            <div className="italic text-zinc-700">{exp.position}</div>
                            <p className="text-zinc-600 leading-relaxed">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {resumeData.achievements.length > 0 && (
                    <div className="space-y-1.5">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5">Honors & Awards</h3>
                      <div className="space-y-1 font-serif text-[11px]">
                        {resumeData.achievements.map((ach, idx) => (
                          <div key={idx} className="flex justify-between text-zinc-700">
                            <span><strong>{ach.title}</strong> — {ach.description}</span>
                            <span className="text-zinc-600 shrink-0 font-normal ml-3">{ach.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-200 text-[8px] text-zinc-400 text-center font-mono">
                  PARSER INDEX READY • GENERATED VIA FOLIOO
                </div>
              </div>
            )}

            {/* 3. Student Resume Template */}
            {resumeData.template === 'student' && (
              <div className="bg-neutral-900 border border-border text-left p-6 sm:p-8 min-h-[500px] flex flex-col justify-between text-xs space-y-6 text-zinc-300 font-sans">
                <div className="space-y-5">
                  {/* Header */}
                  <div className="border-l-4 border-violet-500 pl-4 space-y-1 py-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-none">{resumeData.name || 'Your Full Name'}</h2>
                    <span className="text-xs text-violet-400 font-semibold">{resumeData.title || 'Role/Specialty'}</span>
                    <div className="text-[10px] text-zinc-500 flex flex-wrap gap-x-2 pt-1 font-mono">
                      <span>{resumeData.email}</span>
                      <span>|</span>
                      <span>{resumeData.phone}</span>
                      <span>|</span>
                      <span>{resumeData.website}</span>
                    </div>
                  </div>

                  {/* Grid layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Left Column (Skills / Education) */}
                    <div className="sm:col-span-1 space-y-4">
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Education</h4>
                        <div className="text-[11px] space-y-1">
                          <strong className="text-white block leading-tight">{resumeData.education.school}</strong>
                          <span className="text-zinc-400 italic block">{resumeData.education.degree}</span>
                          <span className="text-zinc-500 block font-mono">{resumeData.education.year}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Expertise</h4>
                        <div className="flex flex-wrap gap-1">
                          {resumeData.skills.map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-neutral-950 text-zinc-400 border border-border text-[9px] rounded font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column (Projects & Experiences) */}
                    <div className="sm:col-span-2 space-y-4 border-t sm:border-t-0 sm:border-l border-border/60 pt-4 sm:pt-0 sm:pl-6">
                      {resumeData.projects.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Featured Projects</h4>
                          <div className="space-y-3">
                            {resumeData.projects.map((proj, idx) => (
                              <div key={idx} className="space-y-0.5 text-[11px]">
                                <strong className="text-white block">{proj.title}</strong>
                                <span className="text-zinc-500 text-[10px] font-medium italic block">{proj.role} ({proj.tech})</span>
                                <p className="text-zinc-400 leading-relaxed mt-0.5">{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {resumeData.experiences.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Experience</h4>
                          <div className="space-y-3">
                            {resumeData.experiences.map((exp, idx) => (
                              <div key={idx} className="space-y-0.5 text-[11px]">
                                <div className="flex justify-between items-start">
                                  <strong className="text-white">{exp.company}</strong>
                                  <span className="text-zinc-500 text-[9px] font-mono">{exp.duration}</span>
                                </div>
                                <span className="text-zinc-400 italic block">{exp.position}</span>
                                <p className="text-zinc-400 leading-relaxed mt-0.5">{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 text-[8px] text-zinc-600 text-center font-mono">
                  ACADEMIC PREVIEW STYLESHEET • FOLIOO
                </div>
              </div>
            )}

            {/* 4. Cybersecurity Resume Template */}
            {resumeData.template === 'cyber' && (
              <div className="bg-[#050505] border border-emerald-950 text-left p-6 sm:p-8 min-h-[500px] flex flex-col justify-between text-xs space-y-6 text-emerald-400 font-mono">
                <div className="space-y-5">
                  {/* Header */}
                  <div className="border border-emerald-800 p-4 bg-[#0a0a0a] space-y-1 relative">
                    <div className="absolute top-1 right-2 text-[8px] text-emerald-600">SECURE SHELL MODE</div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">C:\\USER\\{resumeData.name.toUpperCase().replace(/\s+/g, '')}&gt;</h2>
                    <span className="text-xs font-bold text-emerald-500">{resumeData.title.toUpperCase()}</span>
                    <div className="text-[10px] text-emerald-600 space-y-0.5 pt-1">
                      <div>EMAIL: {resumeData.email}</div>
                      <div>PHONE: {resumeData.phone}</div>
                      <div>LINK: {resumeData.website}</div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">[$] TARGET_CORE_SKILLS:</span>
                    <div className="flex flex-wrap gap-1">
                      {resumeData.skills.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 text-[9px] rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">[$] ACADEMIC_CERTIFICATION:</span>
                    <div className="text-[11px] p-2 bg-neutral-900/30 border border-emerald-900/20 rounded">
                      <div className="flex justify-between font-bold text-white">
                        <span>{resumeData.education.school}</span>
                        <span>{resumeData.education.year}</span>
                      </div>
                      <div className="text-emerald-500 italic">{resumeData.education.degree}</div>
                      <p className="text-emerald-600 mt-1 leading-relaxed">{resumeData.education.description}</p>
                    </div>
                  </div>

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">[$] EXPLOITS_AND_REPOS:</span>
                      <div className="space-y-2">
                        {resumeData.projects.map((proj, idx) => (
                          <div key={idx} className="text-[11px] border-l border-emerald-900/40 pl-2.5">
                            <strong className="text-white">{proj.title}</strong>
                            <div className="text-emerald-500 text-[10px]">ROLE: {proj.role} | TECH: {proj.tech}</div>
                            <p className="text-emerald-600 leading-relaxed mt-0.5">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experiences.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">[$] CONCURRENT_EXPERIENCE:</span>
                      <div className="space-y-2">
                        {resumeData.experiences.map((exp, idx) => (
                          <div key={idx} className="text-[11px] border-l border-emerald-900/40 pl-2.5">
                            <div className="flex justify-between font-bold text-white">
                              <span>{exp.company}</span>
                              <span className="text-emerald-600 text-[10px]">{exp.duration}</span>
                            </div>
                            <div className="text-emerald-500 italic">{exp.position}</div>
                            <p className="text-emerald-600 leading-relaxed mt-0.5">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-emerald-950 text-[8px] text-emerald-600 text-center font-mono flex justify-between">
                  <span>ROOT@FOLIOO_BUILDER:~#</span>
                  <span>SYSTEM_READY</span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>



      <AnimatePresence>
        {pdfSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 animate-bounce" />
            <span className="text-sm font-semibold">Resume Compiled & Downloaded!</span>
          </motion.div>
        )}
        {pdfError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-red-500 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-semibold">{pdfError}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
