
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  Languages, 
  Code, 
  Briefcase, 
  GraduationCap,
  Globe,
  User,
  CheckCircle2,
  Camera,
  X,
  FileText,
  Linkedin,
  Github,
  Layout,
  Maximize2,
  Edit3,
  ExternalLink,
  Instagram,
  Twitter,
  Settings2
} from 'lucide-react';
import { CVData, WorkExperience, Education, CVTemplate, SectionTitles } from './types';
import { optimizeText } from './services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

declare var html2pdf: any;

type Language = 'it' | 'pt' | 'en' | 'es';

const STORAGE_KEY = 'cv_editor_data_v1';

const LOCALES: Record<Language, {
  label: string;
  sectionTitles: SectionTitles;
  defaults: {
    experience: { company: string; role: string; period: string; description: string };
    education: { school: string; degree: string; year: string };
    listItems: { skills: string; languages: string; softSkills: string };
    websiteLabel: string;
  };
  template: {
    curriculumTitle: string;
    statusLabel: string;
    roleLabel: string;
    availableForHire: string;
    stackLabel: string;
    networkLabel: string;
    emailLabel: string;
  };
  ui: {
    language: string;
    save: string;
    saved: string;
    clickToEdit: string;
    addTab: string;
    removeTab: string;
    addExperience: string;
    addEducation: string;
    addSkills: string;
    addLanguages: string;
    addSoftSkills: string;
    experiencesLabel: string;
    educationLabel: string;
    skillsLabel: string;
    languagesLabel: string;
    softSkillsLabel: string;
    emptyExperience: string;
    emptyEducation: string;
    emptySkills: string;
    emptyLanguages: string;
    emptySoftSkills: string;
    emptySkillFallback: string;
    emptyLanguageFallback: string;
    emptySoftSkillFallback: string;
    privacyNote: string;
  };
}> = {
  it: {
    label: 'Italiano',
    sectionTitles: {
      experience: "Esperienze Lavorative",
      education: "Istruzione",
      skills: "Competenze Tecniche",
      languages: "Lingue",
      softSkills: "Soft Skills",
      summary: "Profilo Professionale",
      contact: "Contatti",
      social: "Web & Social",
      personalInfo: "Anagrafica"
    },
    defaults: {
      experience: {
        company: "Nuova Azienda",
        role: "Ruolo",
        period: "2024 - Presente",
        description: "Descrizione delle attività..."
      },
      education: {
        school: "Nome Istituto",
        degree: "Titolo di Studio",
        year: "2024"
      },
      listItems: {
        skills: "Nuova competenza",
        languages: "Nuova lingua",
        softSkills: "Nuova soft skill"
      },
      websiteLabel: "Sito Web"
    },
    template: {
      curriculumTitle: "Curriculum Vitae",
      statusLabel: "Stato",
      roleLabel: "Ruolo",
      availableForHire: "disponibile_per_assunzione",
      stackLabel: "Stack",
      networkLabel: "Rete",
      emailLabel: "email"
    },
    ui: {
      language: "Lingua",
      save: "Salva nel browser",
      saved: "Salvato",
      clickToEdit: "CLICCA DIRETTAMENTE SULLA CARTA PER MODIFICARE",
      addTab: "Aggiungi",
      removeTab: "Rimuovi",
      addExperience: "Esperienza",
      addEducation: "Istruzione",
      addSkills: "Competenze",
      addLanguages: "Lingue",
      addSoftSkills: "Soft Skills",
      experiencesLabel: "Esperienze",
      educationLabel: "Istruzione",
      skillsLabel: "Competenze",
      languagesLabel: "Lingue",
      softSkillsLabel: "Soft Skills",
      emptyExperience: "Nessuna esperienza",
      emptyEducation: "Nessuna istruzione",
      emptySkills: "Nessuna competenza",
      emptyLanguages: "Nessuna lingua",
      emptySoftSkills: "Nessuna soft skill",
      emptySkillFallback: "Competenza vuota",
      emptyLanguageFallback: "Lingua vuota",
      emptySoftSkillFallback: "Soft skill vuota",
      privacyNote: "Autorizzo il trattamento dei miei dati personali ai sensi del Dlgs 196 del 30 giugno 2003 e dell'art. 13 GDPR ai fini della ricerca e selezione del personale."
    }
  },
  pt: {
    label: 'Português',
    sectionTitles: {
      experience: "Experiências Profissionais",
      education: "Formação",
      skills: "Competências",
      languages: "Idiomas",
      softSkills: "Soft Skills",
      summary: "Resumo Profissional",
      contact: "Contato",
      social: "Web & Social",
      personalInfo: "Dados Pessoais"
    },
    defaults: {
      experience: {
        company: "Nova Empresa",
        role: "Cargo",
        period: "2024 - Presente",
        description: "Descrição das atividades..."
      },
      education: {
        school: "Nome da Instituição",
        degree: "Grau",
        year: "2024"
      },
      listItems: {
        skills: "Nova competência",
        languages: "Novo idioma",
        softSkills: "Nova soft skill"
      },
      websiteLabel: "Site"
    },
    template: {
      curriculumTitle: "Currículo Vitae",
      statusLabel: "Status",
      roleLabel: "Cargo",
      availableForHire: "disponível_para_contratação",
      stackLabel: "Stack",
      networkLabel: "Rede",
      emailLabel: "email"
    },
    ui: {
      language: "Idioma",
      save: "Salvar no navegador",
      saved: "Salvo",
      clickToEdit: "CLIQUE DIRETAMENTE NO CURRÍCULO PARA EDITAR",
      addTab: "Adicionar",
      removeTab: "Apagar",
      addExperience: "Experiência",
      addEducation: "Formação",
      addSkills: "Competências",
      addLanguages: "Idiomas",
      addSoftSkills: "Soft Skills",
      experiencesLabel: "Experiências",
      educationLabel: "Formação",
      skillsLabel: "Competências",
      languagesLabel: "Idiomas",
      softSkillsLabel: "Soft Skills",
      emptyExperience: "Nenhuma experiência",
      emptyEducation: "Nenhuma formação",
      emptySkills: "Nenhuma competência",
      emptyLanguages: "Nenhum idioma",
      emptySoftSkills: "Nenhuma soft skill",
      emptySkillFallback: "Competência vazia",
      emptyLanguageFallback: "Idioma vazio",
      emptySoftSkillFallback: "Soft skill vazia",
      privacyNote: "Autorizo o tratamento dos meus dados pessoais nos termos do Decreto Legislativo 196 de 30 de junho de 2003 e do art. 13 do GDPR para fins de recrutamento e seleção."
    }
  },
  en: {
    label: 'English',
    sectionTitles: {
      experience: "Work Experience",
      education: "Education",
      skills: "Skills",
      languages: "Languages",
      softSkills: "Soft Skills",
      summary: "Professional Summary",
      contact: "Contact",
      social: "Web & Social",
      personalInfo: "Personal Info"
    },
    defaults: {
      experience: {
        company: "New Company",
        role: "Role",
        period: "2024 - Present",
        description: "Description of activities..."
      },
      education: {
        school: "School Name",
        degree: "Degree",
        year: "2024"
      },
      listItems: {
        skills: "New skill",
        languages: "New language",
        softSkills: "New soft skill"
      },
      websiteLabel: "Website"
    },
    template: {
      curriculumTitle: "Curriculum Vitae",
      statusLabel: "Status",
      roleLabel: "Role",
      availableForHire: "available_for_hire",
      stackLabel: "Stack",
      networkLabel: "Network",
      emailLabel: "email"
    },
    ui: {
      language: "Language",
      save: "Save in browser",
      saved: "Saved",
      clickToEdit: "CLICK DIRECTLY ON THE CV TO EDIT",
      addTab: "Add",
      removeTab: "Remove",
      addExperience: "Experience",
      addEducation: "Education",
      addSkills: "Skills",
      addLanguages: "Languages",
      addSoftSkills: "Soft Skills",
      experiencesLabel: "Experiences",
      educationLabel: "Education",
      skillsLabel: "Skills",
      languagesLabel: "Languages",
      softSkillsLabel: "Soft Skills",
      emptyExperience: "No experience",
      emptyEducation: "No education",
      emptySkills: "No skills",
      emptyLanguages: "No languages",
      emptySoftSkills: "No soft skills",
      emptySkillFallback: "Empty skill",
      emptyLanguageFallback: "Empty language",
      emptySoftSkillFallback: "Empty soft skill",
      privacyNote: "I authorize the processing of my personal data pursuant to Legislative Decree 196 of June 30, 2003 and Article 13 of the GDPR for recruitment and selection purposes."
    }
  },
  es: {
    label: 'Español',
    sectionTitles: {
      experience: "Experiencia Laboral",
      education: "Educación",
      skills: "Habilidades",
      languages: "Idiomas",
      softSkills: "Soft Skills",
      summary: "Resumen Profesional",
      contact: "Contacto",
      social: "Web y Social",
      personalInfo: "Información Personal"
    },
    defaults: {
      experience: {
        company: "Nueva Empresa",
        role: "Puesto",
        period: "2024 - Presente",
        description: "Descripción de actividades..."
      },
      education: {
        school: "Nombre del Instituto",
        degree: "Título",
        year: "2024"
      },
      listItems: {
        skills: "Nueva habilidad",
        languages: "Nuevo idioma",
        softSkills: "Nueva soft skill"
      },
      websiteLabel: "Sitio web"
    },
    template: {
      curriculumTitle: "Currículum Vitae",
      statusLabel: "Estado",
      roleLabel: "Rol",
      availableForHire: "disponible_para_contratación",
      stackLabel: "Stack",
      networkLabel: "Red",
      emailLabel: "email"
    },
    ui: {
      language: "Idioma",
      save: "Guardar en el navegador",
      saved: "Guardado",
      clickToEdit: "HAZ CLIC DIRECTAMENTE EN EL CV PARA EDITAR",
      addTab: "Agregar",
      removeTab: "Eliminar",
      addExperience: "Experiencia",
      addEducation: "Educación",
      addSkills: "Habilidades",
      addLanguages: "Idiomas",
      addSoftSkills: "Soft Skills",
      experiencesLabel: "Experiencias",
      educationLabel: "Educación",
      skillsLabel: "Habilidades",
      languagesLabel: "Idiomas",
      softSkillsLabel: "Soft Skills",
      emptyExperience: "Sin experiencia",
      emptyEducation: "Sin educación",
      emptySkills: "Sin habilidades",
      emptyLanguages: "Sin idiomas",
      emptySoftSkills: "Sin soft skills",
      emptySkillFallback: "Habilidad vacía",
      emptyLanguageFallback: "Idioma vacío",
      emptySoftSkillFallback: "Soft skill vacía",
      privacyNote: "Autorizo el tratamiento de mis datos personales de acuerdo con el Decreto Legislativo 196 de 30 de junio de 2003 y el art. 13 del GDPR para fines de selección y contratación."
    }
  }
};

const INITIAL_DATA: CVData = {
  fullName: "Guilherme Tebaldi",
  role: "Full Stack Developer & Marketing Specialist",
  email: "guilherme.tebaldi@email.com",
  phone: "+39 123 456 7890",
  location: "Italia / Remoto",
  nationality: "Brasiliano",
  birthDate: "1996",
  profileImagePos: 50,
  github: "github.com/GuilhermeTebaldi",
  linkedin: "linkedin.com/in/guilherme-tebaldi",
  portfolio: "guilhermetebaldi.dev",
  instagram: "@guilhermetebaldi",
  twitter: "",
  template: 'modern',
  summary: "Programmatore appassionato con solida esperienza nel marketing digitale e nella gestione dei social media. Specializzato nello sviluppo di siti web e applicazioni scalabili. Elevata capacità di concentrazione e resistenza nel lavoro di sviluppo software, unita a una profonda conoscenza degli strumenti di marketing per la crescita del business.",
  experiences: [
    {
      id: '1',
      company: "Freelance",
      role: "Sviluppatore Full Stack & Digital Strategist",
      period: "Dal 2014 al 2025 - Presente",
      description: "Sviluppo di applicazioni web e mobile su misura. Gestione di campagne marketing multicanale e ottimizzazione della presenza sui social media per diversi clientes internazionali."
    }
  ],
  education: [
    {
      id: '1',
      school: "SENAI",
      degree: "Programmatore e Marketing Digitale",
      year: "2011"
    }
  ],
  skills: ["React", "Java", "C#", "Render", "Vercel", "Social Media Management", "Digital Marketing"],
  languages: ["Portoghese (Madrelingua)", "Italiano"],
  softSkills: ["Problem Solving", "Focus Profondo", "Creatività", "Adattabilità"],
  sectionTitles: { ...LOCALES.it.sectionTitles }
};

const Editable: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className?: string;
  tag?: keyof React.JSX.IntrinsicElements;
  isExample?: boolean;
}> = ({ value, onChange, className, tag: Tag = 'div' as any, isExample }) => {
  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    if (isExample) {
      e.currentTarget.innerText = '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const newVal = e.currentTarget.innerText;

    if (isExample && newVal.trim() === '') {
      e.currentTarget.innerText = value;
      return;
    }

    onChange(newVal);
  };

  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`hover:bg-blue-50/50 hover:outline-dashed hover:outline-1 hover:outline-blue-400 transition-all cursor-text focus:outline-blue-500 focus:bg-blue-50/80 outline-none ${className}`}
    >
      {value}
    </Tag>
  );
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ProfilePhoto: React.FC<{
  src?: string;
  position?: number;
  onPositionChange?: (val: number) => void;
  grayscale?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ src, position = 50, onPositionChange, grayscale, className, fallback }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startPos: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!src || !onPositionChange) return;
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = { startY: e.clientY, startPos: position };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !containerRef.current || !onPositionChange) return;
    const rect = containerRef.current.getBoundingClientRect();
    const delta = ((e.clientY - dragRef.current.startY) / (rect.height || 1)) * 100;
    const nextPos = clamp(dragRef.current.startPos + delta, 0, 100);
    onPositionChange(nextPos);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${src ? 'cursor-ns-resize' : ''} ${className ?? ''}`}
      style={
        src
          ? {
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: `50% ${position}%`,
              backgroundRepeat: 'no-repeat',
              filter: grayscale ? 'grayscale(100%)' : undefined,
              touchAction: 'none'
            }
          : undefined
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {!src && fallback}
    </div>
  );
};

const PhotoUploadButton: React.FC<{
  onClick: () => void;
  className?: string;
  iconSize?: number;
}> = ({ onClick, className, iconSize = 16 }) => (
  <button
    onClick={onClick}
    className={`absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/img:opacity-100 transition ${className ?? ''}`}
    title="Carica foto"
    type="button"
  >
    <Camera size={iconSize} />
  </button>
);

const TemplateDrawing: React.FC<{ type: CVTemplate }> = ({ type }) => {
  switch (type) {
    case 'europass':
      return (
        <div className="w-full h-full bg-white p-1 flex flex-col gap-0 border border-slate-200">
          <div className="h-6 bg-[#003399] w-full flex items-center px-1">
            <div className="w-2 h-2 bg-white rounded-full mr-1" />
            <div className="h-1 bg-white/50 w-8" />
          </div>
          <div className="flex flex-1">
            <div className="w-1/3 border-r border-slate-100 p-1 space-y-1">
              <div className="h-0.5 bg-slate-200 w-full" />
              <div className="h-0.5 bg-slate-200 w-3/4" />
              <div className="h-0.5 bg-slate-200 w-full" />
            </div>
            <div className="flex-1 p-1 space-y-1">
              <div className="h-1 bg-[#003399] w-1/2" />
              <div className="h-0.5 bg-slate-100 w-full" />
              <div className="h-0.5 bg-slate-100 w-full" />
            </div>
          </div>
        </div>
      );
    case 'modern':
      return (
        <div className="w-full h-full bg-white p-1 flex flex-col gap-1 border border-slate-200">
          <div className="h-4 bg-slate-100 w-full" />
          <div className="flex flex-1 gap-1">
            <div className="flex-[2] space-y-1">
              <div className="h-1 bg-slate-200 w-full" />
              <div className="h-1 bg-slate-200 w-full" />
              <div className="h-1 bg-slate-200 w-3/4" />
            </div>
            <div className="flex-1 bg-slate-50 border-l border-slate-100 space-y-1 p-0.5">
              <div className="h-0.5 bg-blue-300 w-full" />
              <div className="h-0.5 bg-slate-200 w-full" />
              <div className="h-0.5 bg-slate-200 w-full" />
            </div>
          </div>
        </div>
      );
    case 'classic':
      return (
        <div className="w-full h-full bg-white p-1 flex flex-col gap-1 border border-slate-200">
          <div className="h-2 bg-slate-800 w-1/2 self-center mt-1" />
          <div className="h-0.5 bg-slate-300 w-full my-1" />
          <div className="grid grid-cols-2 gap-1 flex-1">
            <div className="space-y-1"><div className="h-1 bg-slate-100 w-full"/><div className="h-1 bg-slate-100 w-full"/></div>
            <div className="space-y-1"><div className="h-1 bg-slate-100 w-full"/><div className="h-1 bg-slate-100 w-full"/></div>
          </div>
        </div>
      );
    case 'minimal':
      return (
        <div className="w-full h-full bg-white p-1 flex gap-1 border border-slate-200">
          <div className="w-1/3 bg-slate-50 flex flex-col items-center pt-2 gap-1">
            <div className="w-4 h-4 rounded-full bg-slate-200" />
            <div className="h-0.5 bg-slate-300 w-3/4" />
            <div className="h-0.5 bg-slate-300 w-3/4" />
          </div>
          <div className="flex-1 pt-2 space-y-1">
            <div className="h-2 bg-slate-800 w-3/4" />
            <div className="h-1 bg-slate-100 w-full" />
            <div className="h-1 bg-slate-100 w-full" />
          </div>
        </div>
      );
    case 'creative':
      return (
        <div className="w-full h-full bg-white p-1 flex gap-1 border border-slate-200 overflow-hidden">
          <div className="w-2 bg-blue-600 h-full" />
          <div className="flex-1 p-1 space-y-2">
            <div className="flex justify-between">
              <div className="space-y-0.5"><div className="h-3 bg-slate-900 w-10"/><div className="h-1 bg-yellow-400 w-8"/></div>
              <div className="w-4 h-4 bg-slate-900 rounded-sm" />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="h-4 bg-slate-50 w-full"/><div className="h-4 bg-slate-50 w-full"/>
            </div>
          </div>
        </div>
      );
    case 'corporate':
      return (
        <div className="w-full h-full bg-white p-1 flex flex-col gap-1 border border-slate-200">
          <div className="h-5 border-b-2 border-slate-900 flex items-center justify-between px-1">
            <div className="h-2 bg-slate-900 w-12" />
            <div className="h-1 bg-slate-400 w-8" />
          </div>
          <div className="space-y-1 mt-1">
            <div className="h-1 bg-slate-900 w-20" />
            <div className="h-1 bg-slate-100 w-full" />
            <div className="h-1 bg-slate-100 w-full" />
          </div>
        </div>
      );
    case 'elegant':
      return (
        <div className="w-full h-full bg-slate-50 p-2 flex flex-col border border-slate-200">
          <div className="bg-white flex-1 p-1 flex flex-col items-center gap-1 shadow-sm">
            <div className="h-2 bg-slate-900 w-16 mt-1" />
            <div className="h-0.5 bg-slate-200 w-12" />
            <div className="h-0.5 bg-slate-100 w-full mt-2" />
            <div className="h-4 border-t border-slate-100 w-full mt-2" />
          </div>
        </div>
      );
    case 'tech':
      return (
        <div className="w-full h-full bg-slate-900 p-1 flex flex-col gap-1 border border-emerald-900">
          <div className="h-3 border border-emerald-500/30 rounded flex items-center px-1 gap-0.5">
            <div className="w-1 h-1 rounded-full bg-red-500" />
            <div className="w-1 h-1 rounded-full bg-emerald-500" />
            <div className="h-1 bg-emerald-100 w-8 ml-1" />
          </div>
          <div className="flex-1 grid grid-cols-3 gap-1">
            <div className="col-span-2 space-y-1 pt-1">
               <div className="h-1 bg-emerald-500/50 w-full" />
               <div className="h-1 bg-emerald-500/20 w-full" />
            </div>
            <div className="bg-emerald-500/5 rounded h-full" />
          </div>
        </div>
      );
    case 'sidebar':
      return (
        <div className="w-full h-full bg-white p-1 flex gap-1 border border-slate-200">
          <div className="w-1/3 bg-slate-800 h-full p-1 space-y-1">
             <div className="w-4 h-4 bg-white/20 rounded-sm mx-auto" />
             <div className="h-0.5 bg-blue-400 w-full" />
             <div className="h-0.5 bg-white/30 w-full" />
          </div>
          <div className="flex-1 p-1 space-y-1">
             <div className="h-3 bg-slate-900 w-full" />
             <div className="h-1 bg-slate-100 w-full" />
             <div className="h-1 bg-slate-100 w-full" />
          </div>
        </div>
      );
    default:
      return <Layout className="w-8 h-8 text-slate-300" />;
  }
};

const App: React.FC = () => {
  const [data, setData] = useState<CVData>(INITIAL_DATA);
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [mobileToolsTab, setMobileToolsTab] = useState<'add' | 'remove'>('add');
  const [language, setLanguage] = useState<Language>('it');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLDivElement>(null);

  const locale = LOCALES[language];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.data) {
        const nextData = parsed.data as CVData;
        setData({
          ...nextData,
          profileImagePos: typeof nextData.profileImagePos === 'number' ? nextData.profileImagePos : 50
        });
      }
      if (Array.isArray(parsed?.modifiedFields)) {
        setModifiedFields(new Set<string>(parsed.modifiedFields));
      }
      if (parsed?.language && LOCALES[parsed.language as Language]) {
        setLanguage(parsed.language as Language);
      }
    } catch (err) {
      console.error("Load Error:", err);
    }
  }, []);

  useEffect(() => {
    const titles = LOCALES[language].sectionTitles;
    setData(prev => {
      const nextTitles = { ...prev.sectionTitles };
      (Object.keys(titles) as Array<keyof SectionTitles>).forEach(key => {
        if (!modifiedFields.has(`title_${key}`)) {
          nextTitles[key] = titles[key];
        }
      });
      return { ...prev, sectionTitles: nextTitles };
    });
  }, [language, modifiedFields]);

  const handleUpdate = (field: keyof CVData | string, value: any) => {
    setData(prev => ({ ...prev, [field]: value } as any));
    setModifiedFields(prev => new Set(prev).add(String(field)));
  };

  const handleTitleUpdate = (field: keyof SectionTitles, value: string) => {
    setData(prev => ({
      ...prev,
      sectionTitles: { ...prev.sectionTitles, [field]: value }
    }));
    setModifiedFields(prev => new Set(prev).add(`title_${String(field)}`));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({
          ...prev,
          profileImage: reader.result as string,
          profileImagePos: 50
        }));
        setModifiedFields(prev => {
          const next = new Set(prev);
          next.add('profileImage');
          next.add('profileImagePos');
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setData(prev => ({
      ...prev,
      profileImage: undefined,
      profileImagePos: prev.profileImagePos ?? 50
    }));
    setModifiedFields(prev => {
      const next = new Set(prev);
      next.add('profileImage');
      next.add('profileImagePos');
      return next;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const listItemExamples = locale.defaults.listItems;

  const addListItem = (field: 'skills' | 'languages' | 'softSkills') => {
    setData(prev => ({ ...prev, [field]: [...prev[field], listItemExamples[field]] }));
  };

  const updateListItem = (field: 'skills' | 'languages' | 'softSkills', index: number, value: string) => {
    const newList = [...data[field]];
    newList[index] = value;
    setData(prev => ({ ...prev, [field]: newList }));
    setModifiedFields(prev => new Set(prev).add(`${field}_${index}`));
  };

  const removeListItem = (field: 'skills' | 'languages' | 'softSkills', index: number) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
    setModifiedFields(prev => {
      const next = new Set<string>();
      const prefix = `${field}_`;
      prev.forEach(key => {
        if (!key.startsWith(prefix)) {
          next.add(key);
          return;
        }
        const idx = Number(key.slice(prefix.length));
        if (Number.isNaN(idx)) {
          next.add(key);
          return;
        }
        if (idx < index) {
          next.add(key);
        } else if (idx > index) {
          next.add(`${field}_${idx - 1}`);
        }
      });
      return next;
    });
  };

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: locale.defaults.experience.company,
      role: locale.defaults.experience.role,
      period: locale.defaults.experience.period,
      description: locale.defaults.experience.description
    };
    setData(prev => ({ ...prev, experiences: [...prev.experiences, newExp] }));
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
    setModifiedFields(prev => new Set(prev).add(`exp_${id}_${String(field)}`));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(e => e.id !== id)
    }));
    setModifiedFields(prev => {
      const next = new Set<string>();
      const prefix = `exp_${id}_`;
      prev.forEach(key => {
        if (!key.startsWith(prefix)) next.add(key);
      });
      return next;
    });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: locale.defaults.education.school,
      degree: locale.defaults.education.degree,
      year: locale.defaults.education.year
    };
    setData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
    setModifiedFields(prev => new Set(prev).add(`edu_${id}_${String(field)}`));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
    setModifiedFields(prev => {
      const next = new Set<string>();
      const prefix = `edu_${id}_`;
      prev.forEach(key => {
        if (!key.startsWith(prefix)) next.add(key);
      });
      return next;
    });
  };

  const handleOptimizeSummary = async () => {
    setIsOptimizing(true);
    const optimized = await optimizeText(data.summary, "Profilo professionale per un programmatore e marketer");
    handleUpdate('summary', optimized);
    setIsOptimizing(false);
  };

  const handleSaveToBrowser = () => {
    try {
      const payload = {
        data,
        modifiedFields: Array.from(modifiedFields),
        language
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSaveStatus('saved');
      window.setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error("Save Error:", err);
      setSaveStatus('error');
      window.setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleDownloadPDF = () => {
    if (!cvRef.current) return;
    setIsGeneratingPDF(true);
    requestAnimationFrame(() => {
      const element = cvRef.current;
      if (!element) {
        setIsGeneratingPDF(false);
        return;
      }

      const originalRemoveChild = Node.prototype.removeChild;
      let restoreScheduled = false;
      const scheduleRestore = () => {
        if (restoreScheduled) return;
        restoreScheduled = true;
        window.setTimeout(() => {
          Node.prototype.removeChild = originalRemoveChild;
        }, 2000);
      };

      Node.prototype.removeChild = function (child: Node) {
        try {
          return originalRemoveChild.call(this, child);
        } catch (err) {
          return child;
        }
      };

      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-10000px';
      wrapper.style.top = '0';
      wrapper.style.width = '210mm';
      wrapper.style.height = '297mm';
      wrapper.style.zIndex = '-1';

      const clone = element.cloneNode(true) as HTMLElement;
      clone.removeAttribute('id');
      clone.style.width = '210mm';
      clone.style.maxWidth = '210mm';
      clone.style.height = '297mm';
      clone.style.maxHeight = '297mm';
      clone.style.overflow = 'hidden';
      clone.style.margin = '0';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      const filename = `CV_${data.fullName.replace(/\s+/g, '_')}.pdf`;

      const cleanup = () => {
        if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        setIsGeneratingPDF(false);
        scheduleRestore();
      };

      html2canvas(clone, {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0
      })
        .then((canvas: HTMLCanvasElement) => {
          const imgData = canvas.toDataURL('image/jpeg', 0.98);
          const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
          const pdfWidth = 210;
          const pdfHeight = 297;
          const imgWidthPx = canvas.width;
          const imgHeightPx = canvas.height;
          const scale = Math.min(pdfWidth / imgWidthPx, pdfHeight / imgHeightPx);
          const renderWidth = imgWidthPx * scale;
          const renderHeight = imgHeightPx * scale;
          const x = (pdfWidth - renderWidth) / 2;
          const y = (pdfHeight - renderHeight) / 2;
          pdf.addImage(imgData, 'JPEG', x, y, renderWidth, renderHeight);
          pdf.save(filename);
        })
        .catch((err: any) => {
          console.error("PDF Error:", err);
        })
        .finally(() => {
          cleanup();
        });
    });
  };

  const renderSocials = (isDark: boolean = false) => {
    const socials = [
      { id: 'linkedin', value: data.linkedin, icon: <Linkedin className="w-3 h-3" /> },
      { id: 'github', value: data.github, icon: <Github className="w-3 h-3" /> },
      { id: 'portfolio', value: data.portfolio, icon: <ExternalLink className="w-3 h-3" /> },
      { id: 'instagram', value: data.instagram, icon: <Instagram className="w-3 h-3" /> },
      { id: 'twitter', value: data.twitter, icon: <Twitter className="w-3 h-3" /> },
    ].filter(s => s.value && s.value.trim() !== "");

    if (socials.length === 0) return null;

    return (
      <div className={`flex flex-wrap gap-x-6 gap-y-2 ${isDark ? 'text-blue-400' : 'text-slate-500'}`}>
        {socials.map(s => (
          <div key={s.id} className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
            {s.icon}{' '}
            <Editable
              value={s.value}
              onChange={v => handleUpdate(s.id as any, v)}
              isExample={!modifiedFields.has(s.id)}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderTemplate = () => {
    const nameParts = data.fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    switch (data.template) {
      case 'europass':
        return (
          <div className="flex flex-col bg-white min-h-full font-sans text-slate-800 relative">
            <header className="bg-[#003399] text-white p-8 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white p-2 rounded-lg flex items-center justify-center">
                  <div className="bg-[#003399] w-full h-full rounded-sm flex items-center justify-center text-white font-bold text-2xl">e</div>
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-widest uppercase mb-1">{locale.template.curriculumTitle}</h1>
                  <Editable
                    tag="h2"
                    value={data.fullName}
                    onChange={v => handleUpdate('fullName', v)}
                    isExample={!modifiedFields.has('fullName')}
                    className="text-3xl font-black"
                  />
                </div>
              </div>

              <div className="w-24 h-24 bg-white/20 rounded-md overflow-hidden border border-white/30 relative group/img">
                <ProfilePhoto
                  src={data.profileImage}
                  position={data.profileImagePos}
                  onPositionChange={val => handleUpdate('profileImagePos', val)}
                  fallback={<User className="w-full h-full p-4 opacity-50" />}
                />
                {!isGeneratingPDF && (
                  <PhotoUploadButton onClick={() => fileInputRef.current?.click()} iconSize={14} className="w-6 h-6" />
                )}
              </div>
            </header>

            <div className="flex flex-1">
              <aside className="w-1/3 bg-slate-50 p-8 border-r border-slate-200 space-y-10">
                <section>
                  <Editable
                    tag="h3"
                    value={data.sectionTitles.contact}
                    onChange={v => handleTitleUpdate('contact', v)}
                    isExample={!modifiedFields.has('title_contact')}
                    className="text-[#003399] font-bold text-xs uppercase mb-4 border-b border-[#003399]/20 pb-1"
                  />
                  <div className="space-y-4 text-xs font-medium">
                    <div className="flex items-start gap-3">
                      <Mail className="w-3 h-3 text-[#003399] mt-0.5 shrink-0" />
                      <Editable value={data.email} onChange={v => handleUpdate('email', v)} isExample={!modifiedFields.has('email')} className="break-all" />
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-3 h-3 text-[#003399] mt-0.5 shrink-0" />
                      <Editable value={data.phone} onChange={v => handleUpdate('phone', v)} isExample={!modifiedFields.has('phone')} />
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-3 h-3 text-[#003399] mt-0.5 shrink-0" />
                      <Editable value={data.location} onChange={v => handleUpdate('location', v)} isExample={!modifiedFields.has('location')} />
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="w-3 h-3 text-[#003399] mt-0.5 shrink-0" />
                      <Editable value={data.portfolio || locale.defaults.websiteLabel} onChange={v => handleUpdate('portfolio', v)} isExample={!modifiedFields.has('portfolio')} />
                    </div>
                  </div>
                </section>

                <section>
                  <Editable
                    tag="h3"
                    value={data.sectionTitles.languages}
                    onChange={v => handleTitleUpdate('languages', v)}
                    isExample={!modifiedFields.has('title_languages')}
                    className="text-[#003399] font-bold text-xs uppercase mb-4 border-b border-[#003399]/20 pb-1"
                  />
                  <div className="space-y-2">
                    {data.languages.map((l, i) => (
                      <div key={i} className="text-xs font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <Editable value={l} onChange={v => updateListItem('languages', i, v)} isExample={!modifiedFields.has(`languages_${i}`)} />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <Editable
                    tag="h3"
                    value={data.sectionTitles.skills}
                    onChange={v => handleTitleUpdate('skills', v)}
                    isExample={!modifiedFields.has('title_skills')}
                    className="text-[#003399] font-bold text-xs uppercase mb-4 border-b border-[#003399]/20 pb-1"
                  />
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((s, i) => (
                      <Editable
                        key={i}
                        tag="span"
                        value={s}
                        onChange={v => updateListItem('skills', i, v)}
                        isExample={!modifiedFields.has(`skills_${i}`)}
                        className="bg-white border border-slate-200 px-2 py-1 rounded text-[10px] font-bold text-slate-600"
                      />
                    ))}
                  </div>
                </section>
              </aside>

              <main className="flex-1 p-8 space-y-12">
                <section>
                  <Editable
                    tag="h3"
                    value={data.sectionTitles.summary}
                    onChange={v => handleTitleUpdate('summary', v)}
                    isExample={!modifiedFields.has('title_summary')}
                    className="text-[#003399] font-black text-xs uppercase mb-4 border-l-4 border-[#003399] pl-3"
                  />
                  <Editable
                    value={data.summary}
                    onChange={v => handleUpdate('summary', v)}
                    isExample={!modifiedFields.has('summary')}
                    className="text-xs leading-relaxed text-justify text-slate-600"
                  />
                </section>

                <section>
                  <Editable
                    tag="h3"
                    value={data.sectionTitles.experience}
                    onChange={v => handleTitleUpdate('experience', v)}
                    isExample={!modifiedFields.has('title_experience')}
                    className="text-[#003399] font-black text-xs uppercase mb-4 border-l-4 border-[#003399] pl-3"
                  />
                  <div className="space-y-8">
                    {data.experiences.map(exp => (
                      <div key={exp.id} className="relative">
                        <div className="flex justify-between items-baseline mb-1">
                          <Editable tag="h4" value={exp.role} onChange={v => updateExperience(exp.id, 'role', v)} isExample={!modifiedFields.has(`exp_${exp.id}_role`)} className="text-sm font-bold text-slate-800" />
                          <Editable tag="span" value={exp.period} onChange={v => updateExperience(exp.id, 'period', v)} isExample={!modifiedFields.has(`exp_${exp.id}_period`)} className="text-[10px] font-bold text-slate-400" />
                        </div>
                        <Editable tag="p" value={exp.company} onChange={v => updateExperience(exp.id, 'company', v)} isExample={!modifiedFields.has(`exp_${exp.id}_company`)} className="text-[#003399] text-xs font-bold mb-2 uppercase" />
                        <Editable tag="p" value={exp.description} onChange={v => updateExperience(exp.id, 'description', v)} isExample={!modifiedFields.has(`exp_${exp.id}_description`)} className="text-[11px] leading-relaxed text-slate-500 whitespace-pre-line" />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <Editable
                    tag="h3"
                    value={data.sectionTitles.education}
                    onChange={v => handleTitleUpdate('education', v)}
                    isExample={!modifiedFields.has('title_education')}
                    className="text-[#003399] font-black text-xs uppercase mb-4 border-l-4 border-[#003399] pl-3"
                  />
                  <div className="space-y-6">
                    {data.education.map(edu => (
                      <div key={edu.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <Editable tag="h4" value={edu.degree} onChange={v => updateEducation(edu.id, 'degree', v)} isExample={!modifiedFields.has(`edu_${edu.id}_degree`)} className="text-sm font-bold text-slate-800" />
                          <Editable tag="span" value={edu.year} onChange={v => updateEducation(edu.id, 'year', v)} isExample={!modifiedFields.has(`edu_${edu.id}_year`)} className="text-[10px] font-bold text-slate-400" />
                        </div>
                        <Editable tag="p" value={edu.school} onChange={v => updateEducation(edu.id, 'school', v)} isExample={!modifiedFields.has(`edu_${edu.id}_school`)} className="text-xs text-slate-500" />
                      </div>
                    ))}
                  </div>
                </section>
              </main>
            </div>

            <footer className="bg-slate-50 p-6 flex justify-center border-t border-slate-200">
              <div className="flex items-center gap-10">{renderSocials()}</div>
            </footer>
          </div>
        );
      case 'classic':
        return (
          <div className="flex flex-col p-12 bg-white min-h-full font-serif text-slate-900 relative">
            <header className="text-center border-b-2 border-slate-900 pb-8 mb-8">
              <Editable tag="h1" value={data.fullName} onChange={v => handleUpdate('fullName', v)} isExample={!modifiedFields.has('fullName')} className="text-4xl font-bold uppercase mb-2 tracking-widest" />
              <Editable tag="p" value={data.role} onChange={v => handleUpdate('role', v)} isExample={!modifiedFields.has('role')} className="text-xl italic text-slate-600 mb-4" />
              <div className="flex flex-wrap justify-center gap-4 text-xs">
                <Editable tag="span" value={data.email} onChange={v => handleUpdate('email', v)} isExample={!modifiedFields.has('email')} /> • 
                <Editable tag="span" value={data.phone} onChange={v => handleUpdate('phone', v)} isExample={!modifiedFields.has('phone')} /> • 
                <Editable tag="span" value={data.location} onChange={v => handleUpdate('location', v)} isExample={!modifiedFields.has('location')} />
              </div>
            </header>
            <div className="grid grid-cols-3 gap-10">
              <div className="col-span-2 space-y-8">
                <section>
                  <Editable tag="h2" value={data.sectionTitles.experience} onChange={v => handleTitleUpdate('experience', v)} className="text-sm font-bold uppercase border-b border-slate-300 mb-4 tracking-wider" />
                  {data.experiences.map(exp => (
                    <div key={exp.id} className="mb-6">
                      <div className="flex justify-between font-bold text-sm">
                        <Editable tag="span" value={exp.company} onChange={v => updateExperience(exp.id, 'company', v)} />
                        <Editable tag="span" value={exp.period} onChange={v => updateExperience(exp.id, 'period', v)} />
                      </div>
                      <Editable tag="p" value={exp.role} onChange={v => updateExperience(exp.id, 'role', v)} className="italic text-xs mb-2" />
                      <Editable tag="p" value={exp.description} onChange={v => updateExperience(exp.id, 'description', v)} className="text-xs text-slate-700 text-justify whitespace-pre-line" />
                    </div>
                  ))}
                </section>
                <section>
                  <Editable tag="h2" value={data.sectionTitles.education} onChange={v => handleTitleUpdate('education', v)} className="text-sm font-bold uppercase border-b border-slate-300 mb-4 tracking-wider" />
                  {data.education.map(edu => (
                    <div key={edu.id} className="mb-4 text-xs">
                      <div className="flex justify-between font-bold">
                        <Editable tag="span" value={edu.degree} onChange={v => updateEducation(edu.id, 'degree', v)} />
                        <Editable tag="span" value={edu.year} onChange={v => updateEducation(edu.id, 'year', v)} />
                      </div>
                      <Editable tag="p" value={edu.school} onChange={v => updateEducation(edu.id, 'school', v)} />
                    </div>
                  ))}
                </section>
              </div>
              <div className="space-y-8">
                <section>
                  <Editable tag="h2" value={data.sectionTitles.personalInfo} onChange={v => handleTitleUpdate('personalInfo', v)} className="text-sm font-bold uppercase border-b border-slate-300 mb-4 tracking-wider" />
                  <Editable tag="p" value={data.nationality} onChange={v => handleUpdate('nationality', v)} className="text-xs" />
                  <Editable tag="p" value={data.birthDate} onChange={v => handleUpdate('birthDate', v)} className="text-xs" />
                  <div className="mt-4 space-y-2">
                     {renderSocials()}
                  </div>
                </section>
                <section>
                  <Editable tag="h2" value={data.sectionTitles.languages} onChange={v => handleTitleUpdate('languages', v)} className="text-sm font-bold uppercase border-b border-slate-300 mb-4 tracking-wider" />
                  <div className="text-xs space-y-1">
                    {data.languages.map((l, i) => <Editable key={i} tag="p" value={l} onChange={v => updateListItem('languages', i, v)} />)}
                  </div>
                </section>
                <section>
                  <Editable tag="h2" value={data.sectionTitles.skills} onChange={v => handleTitleUpdate('skills', v)} className="text-sm font-bold uppercase border-b border-slate-300 mb-4 tracking-wider" />
                  <div className="flex flex-wrap gap-1">
                    {data.skills.map((s, i) => <Editable key={i} tag="span" value={s} onChange={v => updateListItem('skills', i, v)} className="text-[10px] bg-slate-100 px-2 py-0.5" />)}
                  </div>
                </section>
              </div>
            </div>
          </div>
        );
      case 'minimal':
        return (
          <div className="flex p-10 bg-white min-h-full font-sans text-slate-800 relative">
            <div className="w-1/3 pr-10 border-r border-slate-100 flex flex-col">
              <div className="w-32 h-32 bg-slate-100 rounded-full mb-8 overflow-hidden self-center group/img relative">
                <ProfilePhoto
                  src={data.profileImage}
                  position={data.profileImagePos}
                  onPositionChange={val => handleUpdate('profileImagePos', val)}
                  grayscale
                />
                {!isGeneratingPDF && <PhotoUploadButton onClick={() => fileInputRef.current?.click()} />}
              </div>
              <div className="space-y-8 w-full">
                <section>
                  <Editable tag="h3" value={data.sectionTitles.contact} onChange={v => handleTitleUpdate('contact', v)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3" />
                  <div className="text-[10px] space-y-2 text-slate-700">
                    <Editable value={data.email} onChange={v => handleUpdate('email', v)} isExample={!modifiedFields.has('email')} />
                    <Editable value={data.phone} onChange={v => handleUpdate('phone', v)} isExample={!modifiedFields.has('phone')} />
                    <Editable value={data.location} onChange={v => handleUpdate('location', v)} isExample={!modifiedFields.has('location')} />
                  </div>
                </section>
                <section>
                  <Editable tag="h3" value={data.sectionTitles.social} onChange={v => handleTitleUpdate('social', v)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3" />
                  <div className="space-y-2">
                    {renderSocials()}
                  </div>
                </section>
                <section>
                  <Editable tag="h3" value={data.sectionTitles.languages} onChange={v => handleTitleUpdate('languages', v)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3" />
                  <div className="text-[10px] space-y-1 text-slate-700">
                    {data.languages.map((l, i) => <Editable key={i} value={l} onChange={v => updateListItem('languages', i, v)} />)}
                  </div>
                </section>
                <section>
                  <Editable tag="h3" value={data.sectionTitles.skills} onChange={v => handleTitleUpdate('skills', v)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3" />
                  <div className="text-[10px] space-y-1 text-slate-700">
                    {data.skills.map((s, i) => <Editable key={i} value={s} onChange={v => updateListItem('skills', i, v)} />)}
                  </div>
                </section>
              </div>
            </div>
            <div className="w-2/3 pl-10">
              <Editable tag="h1" value={data.fullName} onChange={v => handleUpdate('fullName', v)} isExample={!modifiedFields.has('fullName')} className="text-3xl font-light text-slate-900 mb-1" />
              <Editable tag="p" value={data.role} onChange={v => handleUpdate('role', v)} isExample={!modifiedFields.has('role')} className="text-slate-500 mb-8 uppercase tracking-widest text-xs" />
              <section className="mb-10">
                <Editable value={data.summary} onChange={v => handleUpdate('summary', v)} isExample={!modifiedFields.has('summary')} className="text-xs leading-relaxed text-slate-600 text-justify" />
              </section>
              <section className="mb-10">
                <Editable tag="h3" value={data.sectionTitles.experience} onChange={v => handleTitleUpdate('experience', v)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2" />
                {data.experiences.map(exp => (
                  <div key={exp.id} className="mb-6">
                    <Editable value={exp.period} onChange={v => updateExperience(exp.id, 'period', v)} className="text-[10px] font-bold text-slate-400 mb-1" />
                    <Editable tag="h4" value={exp.role} onChange={v => updateExperience(exp.id, 'role', v)} className="text-sm font-bold text-slate-900" />
                    <Editable tag="p" value={exp.company} onChange={v => updateExperience(exp.id, 'company', v)} className="text-xs italic text-slate-500 mb-2" />
                    <Editable tag="p" value={exp.description} onChange={v => updateExperience(exp.id, 'description', v)} className="text-xs text-slate-600 whitespace-pre-line" />
                  </div>
                ))}
              </section>
            </div>
          </div>
        );
      case 'creative':
        return (
          <div className="flex flex-col bg-white min-h-full font-sans overflow-hidden relative">
            <div className="flex flex-1">
              <div className="w-16 bg-blue-600 flex flex-col items-center py-10 gap-8">
                 <div className="w-2 h-24 bg-white/30 rounded-full" />
              </div>
              <div className="flex-1 p-12">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h1 className="text-5xl font-black text-slate-900 leading-none">
                      <Editable tag="span" value={firstName} onChange={v => handleUpdate('fullName', `${v} ${lastName}`)} isExample={!modifiedFields.has('fullName')} /><br/>
                      <Editable tag="span" value={lastName} onChange={v => handleUpdate('fullName', `${firstName} ${v}`)} isExample={!modifiedFields.has('fullName')} className="text-blue-600" />
                    </h1>
                    <Editable tag="p" value={data.role} onChange={v => handleUpdate('role', v)} isExample={!modifiedFields.has('role')} className="mt-4 bg-yellow-400 px-3 py-1 text-xs font-black inline-block uppercase italic text-slate-900" />
                  </div>
                  <div className="w-32 h-32 bg-slate-900 rounded-3xl rotate-3 flex items-center justify-center overflow-hidden shrink-0 border-4 border-white shadow-xl relative group/img">
                     <ProfilePhoto
                       src={data.profileImage}
                       position={data.profileImagePos}
                       onPositionChange={val => handleUpdate('profileImagePos', val)}
                       fallback={<User className="text-white" size={48} />}
                     />
                     {!isGeneratingPDF && <PhotoUploadButton onClick={() => fileInputRef.current?.click()} />}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-12">
                  <section>
                    <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-900">
                      <div className="w-4 h-4 bg-blue-600 rounded-full" /> <Editable tag="span" value={data.sectionTitles.summary} onChange={v => handleTitleUpdate('summary', v)} />
                    </h2>
                    <Editable value={data.summary} onChange={v => handleUpdate('summary', v)} isExample={!modifiedFields.has('summary')} className="text-xs leading-relaxed text-slate-700 text-justify" />
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-900">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full" /> <Editable tag="span" value={data.sectionTitles.experience} onChange={v => handleTitleUpdate('experience', v)} />
                    </h2>
                    {data.experiences.map(exp => (
                      <div key={exp.id} className="mb-5">
                        <Editable value={exp.period} onChange={v => updateExperience(exp.id, 'period', v)} className="text-[10px] font-black text-blue-600 uppercase tracking-tighter" />
                        <Editable tag="h4" value={exp.role} onChange={v => updateExperience(exp.id, 'role', v)} className="font-bold text-sm text-slate-900" />
                        <Editable tag="p" value={exp.company} onChange={v => updateExperience(exp.id, 'company', v)} className="text-xs text-slate-500 font-medium mb-1" />
                        <Editable tag="p" value={exp.description} onChange={v => updateExperience(exp.id, 'description', v)} className="text-[11px] text-slate-600 leading-tight line-clamp-3" />
                      </div>
                    ))}
                  </section>

                  <section>
                    <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-900">
                      <div className="w-4 h-4 bg-slate-900 rounded-full" /> <Editable tag="span" value={data.sectionTitles.skills} onChange={v => handleTitleUpdate('skills', v)} />
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((s, i) => (
                        <Editable key={i} tag="span" value={s} onChange={v => updateListItem('skills', i, v)} className="text-[10px] border-2 border-slate-900 px-2 py-1 font-black text-slate-900 uppercase" />
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-900">
                      <div className="w-4 h-4 bg-blue-400 rounded-full" /> <Editable tag="span" value={data.sectionTitles.languages} onChange={v => handleTitleUpdate('languages', v)} />
                    </h2>
                    <div className="flex flex-col gap-2">
                      {data.languages.map((l, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-blue-500" /> <Editable value={l} onChange={v => updateListItem('languages', i, v)} className="flex-1" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
            <footer className="bg-slate-900 text-white p-8 flex flex-col items-center mt-auto gap-4">
               <div className="flex justify-center items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-white">
                  <Mail className="w-3 h-3 text-yellow-400" /> <Editable value={data.email} onChange={v => handleUpdate('email', v)} isExample={!modifiedFields.has('email')} />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-white">
                  <MapPin className="w-3 h-3 text-blue-400" /> <Editable value={data.location} onChange={v => handleUpdate('location', v)} isExample={!modifiedFields.has('location')} />
                </div>
               </div>
               <div className="w-full flex justify-center pt-2">
                  {renderSocials(true)}
               </div>
            </footer>
          </div>
        );
      case 'corporate':
        return (
          <div className="flex flex-col p-12 bg-white min-h-full font-sans text-slate-900 relative">
             <div className="flex justify-between items-center border-b-4 border-slate-900 pb-6 mb-8">
                <div>
                   <Editable tag="h1" value={data.fullName} onChange={v => handleUpdate('fullName', v)} isExample={!modifiedFields.has('fullName')} className="text-4xl font-extrabold tracking-tight uppercase" />
                   <Editable tag="p" value={data.role} onChange={v => handleUpdate('role', v)} isExample={!modifiedFields.has('role')} className="text-lg font-bold text-slate-500 tracking-widest" />
                </div>
                <div className="text-right text-xs space-y-1 font-medium">
                   <Editable value={data.email} onChange={v => handleUpdate('email', v)} isExample={!modifiedFields.has('email')} />
                   <Editable value={data.phone} onChange={v => handleUpdate('phone', v)} isExample={!modifiedFields.has('phone')} />
                   <Editable value={data.location} onChange={v => handleUpdate('location', v)} isExample={!modifiedFields.has('location')} />
                </div>
             </div>
             <div className="space-y-10">
                <section>
                   <Editable tag="h2" value={data.sectionTitles.summary} onChange={v => handleTitleUpdate('summary', v)} className="text-lg font-black uppercase bg-slate-900 text-white px-3 py-1 mb-4 inline-block tracking-tighter italic" />
                   <Editable value={data.summary} onChange={v => handleUpdate('summary', v)} isExample={!modifiedFields.has('summary')} className="text-sm leading-relaxed text-slate-700 text-justify" />
                </section>
                <section>
                   <Editable tag="h2" value={data.sectionTitles.experience} onChange={v => handleTitleUpdate('experience', v)} className="text-lg font-black uppercase border-b-2 border-slate-900 mb-6 inline-block" />
                   <div className="space-y-8">
                      {data.experiences.map(exp => (
                        <div key={exp.id}>
                           <div className="flex justify-between items-baseline mb-1">
                              <h3 className="text-base font-bold text-slate-900">
                                <Editable tag="span" value={exp.role} onChange={v => updateExperience(exp.id, 'role', v)} /> @ <Editable tag="span" value={exp.company} onChange={v => updateExperience(exp.id, 'company', v)} />
                              </h3>
                              <Editable tag="span" value={exp.period} onChange={v => updateExperience(exp.id, 'period', v)} className="text-xs font-black text-slate-500" />
                           </div>
                           <Editable value={exp.description} onChange={v => updateExperience(exp.id, 'description', v)} className="text-xs text-slate-600 text-justify" />
                        </div>
                      ))}
                   </div>
                </section>
                <div className="grid grid-cols-2 gap-10">
                   <section>
                      <Editable tag="h2" value={data.sectionTitles.skills} onChange={v => handleTitleUpdate('skills', v)} className="text-sm font-black uppercase border-b border-slate-200 mb-3" />
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                         {data.skills.map((s, i) => <div key={i} className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-900"></div> <Editable value={s} onChange={v => updateListItem('skills', i, v)} className="flex-1" /></div>)}
                      </div>
                      <div className="mt-6">
                        <Editable tag="h2" value={data.sectionTitles.social} onChange={v => handleTitleUpdate('social', v)} className="text-sm font-black uppercase border-b border-slate-200 mb-3" />
                        <div className="flex flex-col gap-2">
                           {renderSocials()}
                        </div>
                      </div>
                   </section>
                   <section>
                      <Editable tag="h2" value={data.sectionTitles.education} onChange={v => handleTitleUpdate('education', v)} className="text-sm font-black uppercase border-b border-slate-200 mb-3" />
                      {data.education.map(edu => (
                        <div key={edu.id} className="mb-2">
                           <Editable tag="p" value={edu.degree} onChange={v => updateEducation(edu.id, 'degree', v)} className="text-xs font-bold" />
                           <p className="text-[10px] text-slate-500"><Editable tag="span" value={edu.school} onChange={v => updateEducation(edu.id, 'school', v)} /> (<Editable tag="span" value={edu.year} onChange={v => updateEducation(edu.id, 'year', v)} />)</p>
                        </div>
                      ))}
                   </section>
                </div>
             </div>
          </div>
        );
      case 'elegant':
        return (
          <div className="flex flex-col p-14 bg-white min-h-full font-serif text-slate-800 border-[16px] border-slate-50 relative">
             <header className="text-center mb-12">
                <Editable tag="h1" value={data.fullName} onChange={v => handleUpdate('fullName', v)} isExample={!modifiedFields.has('fullName')} className="text-5xl font-light text-slate-900 mb-3 tracking-widest uppercase" />
                <div className="flex justify-center items-center gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
                   <Editable value={data.location} onChange={v => handleUpdate('location', v)} isExample={!modifiedFields.has('location')} />
                   <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                   <Editable value={data.email} onChange={v => handleUpdate('email', v)} isExample={!modifiedFields.has('email')} />
                   <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                   <Editable value={data.phone} onChange={v => handleUpdate('phone', v)} isExample={!modifiedFields.has('phone')} />
                </div>
                <Editable tag="p" value={data.role} onChange={v => handleUpdate('role', v)} isExample={!modifiedFields.has('role')} className="mt-8 text-xl italic font-serif text-slate-500 border-y border-slate-100 py-3" />
             </header>
             <div className="space-y-12 max-w-2xl mx-auto">
                <section className="text-center">
                   <Editable value={data.summary} onChange={v => handleUpdate('summary', v)} isExample={!modifiedFields.has('summary')} className="text-sm leading-relaxed text-slate-600 italic" />
                </section>
                <section>
                   <Editable tag="h2" value={data.sectionTitles.experience} onChange={v => handleTitleUpdate('experience', v)} className="text-xs font-bold uppercase text-center tracking-[0.4em] mb-8 text-slate-900 border-b pb-2" />
                   <div className="space-y-10">
                      {data.experiences.map(exp => (
                        <div key={exp.id} className="text-center">
                           <Editable tag="h3" value={exp.role} onChange={v => updateExperience(exp.id, 'role', v)} className="text-sm font-bold uppercase tracking-widest text-slate-800" />
                           <p className="text-xs italic text-slate-400 mb-3"><Editable tag="span" value={exp.company} onChange={v => updateExperience(exp.id, 'company', v)} /> • <Editable tag="span" value={exp.period} onChange={v => updateExperience(exp.id, 'period', v)} /></p>
                           <Editable value={exp.description} onChange={v => updateExperience(exp.id, 'description', v)} className="text-xs leading-relaxed text-slate-600" />
                        </div>
                      ))}
                   </div>
                </section>
                <div className="flex justify-center py-4">
                   {renderSocials()}
                </div>
                <div className="grid grid-cols-2 gap-10 pt-6">
                   <div className="space-y-6">
                      <Editable tag="h3" value={data.sectionTitles.skills} onChange={v => handleTitleUpdate('skills', v)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900" />
                      <div className="flex flex-wrap gap-2 justify-start">
                         {data.skills.map((s, i) => <Editable key={i} tag="span" value={s} onChange={v => updateListItem('skills', i, v)} className="text-[10px] font-serif italic text-slate-500" />)}
                      </div>
                   </div>
                   <div className="space-y-6">
                      <Editable tag="h3" value={data.sectionTitles.languages} onChange={v => handleTitleUpdate('languages', v)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900" />
                      <div className="text-[10px] font-serif text-slate-500 space-y-1">
                         {data.languages.map((l, i) => <Editable key={i} value={l} onChange={v => updateListItem('languages', i, v)} />)}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );
      case 'tech':
        return (
          <div className="flex flex-col bg-slate-900 text-emerald-400 p-10 min-h-full font-mono relative">
             <div className="border border-emerald-500/30 p-6 rounded-lg mb-8">
                <div className="flex gap-2 mb-2">
                   <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                   <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                   <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
                <h1 className="text-3xl font-bold uppercase text-emerald-100">&gt; <Editable tag="span" value={data.fullName.replace(' ', '_').toLowerCase()} onChange={v => handleUpdate('fullName', v)} isExample={!modifiedFields.has('fullName')} /></h1>
                <p className="text-emerald-500/60 text-sm mt-1">{locale.template.statusLabel}: {locale.template.availableForHire} | {locale.template.roleLabel}: <Editable tag="span" value={data.role} onChange={v => handleUpdate('role', v)} isExample={!modifiedFields.has('role')} /></p>
             </div>
             <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-8">
                   <section>
                      <h2 className="text-emerald-300 font-bold mb-4 flex items-center gap-2"><div className="w-1 h-4 bg-emerald-500"></div> # <Editable tag="span" value={data.sectionTitles.summary} onChange={v => handleTitleUpdate('summary', v)} /></h2>
                      <Editable value={data.summary} onChange={v => handleUpdate('summary', v)} isExample={!modifiedFields.has('summary')} className="text-xs text-emerald-100/70 leading-relaxed text-justify" />
                   </section>
                   <section>
                      <h2 className="text-emerald-300 font-bold mb-4 flex items-center gap-2"><div className="w-1 h-4 bg-emerald-500"></div> # <Editable tag="span" value={data.sectionTitles.experience} onChange={v => handleTitleUpdate('experience', v)} /></h2>
                      {data.experiences.map(exp => (
                        <div key={exp.id} className="mb-6 border-l border-emerald-500/20 pl-4">
                           <Editable tag="h3" value={exp.role} onChange={v => updateExperience(exp.id, 'role', v)} className="text-sm font-bold text-emerald-100" />
                           <p className="text-[10px] text-emerald-500 mb-2"><Editable tag="span" value={exp.company} onChange={v => updateExperience(exp.id, 'company', v)} /> // <Editable tag="span" value={exp.period} onChange={v => updateExperience(exp.id, 'period', v)} /></p>
                           <Editable value={exp.description} onChange={v => updateExperience(exp.id, 'description', v)} className="text-[11px] text-emerald-100/50" />
                        </div>
                      ))}
                   </section>
                </div>
                <div className="space-y-8">
                   <section className="bg-emerald-500/5 p-4 rounded border border-emerald-500/10">
                      <h2 className="text-emerald-300 text-xs font-bold mb-3 uppercase tracking-tighter">{locale.template.stackLabel}</h2>
                      <div className="flex flex-wrap gap-2">
                         {data.skills.map((s, i) => <Editable key={i} tag="span" value={s} onChange={v => updateListItem('skills', i, v)} className="text-[9px] bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded border border-emerald-500/20" />)}
                      </div>
                   </section>
                   <section>
                      <h2 className="text-emerald-300 text-xs font-bold mb-3 uppercase tracking-tighter">{locale.template.networkLabel}</h2>
                      <div className="text-[10px] space-y-2 opacity-60">
                         <p>{locale.template.emailLabel}: <Editable tag="span" value={data.email} onChange={v => handleUpdate('email', v)} isExample={!modifiedFields.has('email')} /></p>
                         <div className="pt-2 flex flex-col gap-1">
                           {renderSocials(true)}
                         </div>
                      </div>
                   </section>
                </div>
             </div>
          </div>
        );
      case 'sidebar':
        return (
          <div className="flex bg-white min-h-full font-sans relative">
             <aside className="w-1/3 bg-slate-800 text-white p-10 flex flex-col">
                <div className="w-32 h-32 rounded-2xl bg-white/10 mb-8 overflow-hidden mx-auto border-2 border-white/20 relative group/img">
                   <ProfilePhoto
                     src={data.profileImage}
                     position={data.profileImagePos}
                     onPositionChange={val => handleUpdate('profileImagePos', val)}
                   />
                   {!isGeneratingPDF && <PhotoUploadButton onClick={() => fileInputRef.current?.click()} />}
                </div>
                <div className="space-y-8 flex-1">
                   <section>
                      <Editable tag="h3" value={data.sectionTitles.contact} onChange={v => handleTitleUpdate('contact', v)} className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4" />
                      <div className="space-y-4 text-[10px] font-medium opacity-80">
                         <div className="flex items-center gap-3"><Mail className="w-3 h-3" /> <Editable value={data.email} onChange={v => handleUpdate('email', v)} isExample={!modifiedFields.has('email')} className="flex-1" /></div>
                         <div className="flex items-center gap-3"><Phone className="w-3 h-3" /> <Editable value={data.phone} onChange={v => handleUpdate('phone', v)} isExample={!modifiedFields.has('phone')} className="flex-1" /></div>
                         <div className="flex items-center gap-3"><MapPin className="w-3 h-3" /> <Editable value={data.location} onChange={v => handleUpdate('location', v)} isExample={!modifiedFields.has('location')} className="flex-1" /></div>
                      </div>
                   </section>
                   <section>
                      <Editable tag="h3" value={data.sectionTitles.skills} onChange={v => handleTitleUpdate('skills', v)} className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4" />
                      <div className="space-y-2">
                         {data.skills.map((s, i) => (
                           <Editable key={i} value={s} onChange={v => updateListItem('skills', i, v)} className="text-[10px] font-bold bg-white/10 px-3 py-1.5 rounded-full" />
                         ))}
                      </div>
                   </section>
                   <section>
                      <Editable tag="h3" value={data.sectionTitles.languages} onChange={v => handleTitleUpdate('languages', v)} className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4" />
                      <div className="space-y-1 text-[10px] opacity-80">
                         {data.languages.map((l, i) => <Editable key={i} value={l} onChange={v => updateListItem('languages', i, v)} />)}
                      </div>
                   </section>
                </div>
             </aside>
             <main className="w-2/3 p-12 flex flex-col">
                <header className="mb-10">
                   <Editable tag="h1" value={data.fullName} onChange={v => handleUpdate('fullName', v)} isExample={!modifiedFields.has('fullName')} className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4" />
                   <Editable tag="p" value={data.role} onChange={v => handleUpdate('role', v)} isExample={!modifiedFields.has('role')} className="text-xl font-bold text-blue-600 tracking-widest uppercase" />
                </header>
                <div className="space-y-12">
                   <section>
                      <Editable value={data.summary} onChange={v => handleUpdate('summary', v)} isExample={!modifiedFields.has('summary')} className="text-sm leading-relaxed text-slate-600 border-l-4 border-slate-100 pl-6 italic" />
                   </section>
                   <section>
                      <Editable tag="h2" value={data.sectionTitles.experience} onChange={v => handleTitleUpdate('experience', v)} className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-2 mb-8 inline-block" />
                      <div className="space-y-10">
                         {data.experiences.map(exp => (
                           <div key={exp.id}>
                              <div className="flex justify-between items-baseline mb-2">
                                 <Editable tag="h3" value={exp.role} onChange={v => updateExperience(exp.id, 'role', v)} className="font-black text-slate-800 uppercase text-xs" />
                                 <Editable tag="span" value={exp.period} onChange={v => updateExperience(exp.id, 'period', v)} className="text-[10px] font-bold text-slate-400" />
                              </div>
                              <Editable tag="p" value={exp.company} onChange={v => updateExperience(exp.id, 'company', v)} className="text-blue-600 text-[10px] font-black uppercase mb-3" />
                              <Editable tag="p" value={exp.description} onChange={v => updateExperience(exp.id, 'description', v)} className="text-[11px] text-slate-600 leading-relaxed text-justify" />
                           </div>
                         ))}
                      </div>
                   </section>
                   <section>
                      <Editable tag="h2" value={data.sectionTitles.social} onChange={v => handleTitleUpdate('social', v)} className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-2 mb-8 inline-block" />
                      <div className="flex gap-4">
                        {renderSocials()}
                      </div>
                   </section>
                </div>
             </main>
          </div>
        );
      default: // Modern
        return (
          <div className="w-full bg-white min-h-full flex flex-col text-slate-800 relative">
            <header className="bg-slate-50 p-10 border-b-2 border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                  <Editable tag="h1" value={data.fullName} onChange={v => handleUpdate('fullName', v)} isExample={!modifiedFields.has('fullName')} className="text-4xl font-black text-slate-900 uppercase tracking-tighter" />
                  <Editable tag="p" value={data.role} onChange={v => handleUpdate('role', v)} isExample={!modifiedFields.has('role')} className="text-2xl text-blue-600 font-bold mt-1" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 mt-8 text-sm text-slate-600">
                    <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-blue-500" /> <Editable tag="span" value={data.email} onChange={v => handleUpdate('email', v)} isExample={!modifiedFields.has('email')} /></div>
                    <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-blue-500" /> <Editable tag="span" value={data.phone} onChange={v => handleUpdate('phone', v)} isExample={!modifiedFields.has('phone')} /></div>
                    <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-blue-500" /> <Editable tag="span" value={data.location} onChange={v => handleUpdate('location', v)} isExample={!modifiedFields.has('location')} /></div>
                    <div className="flex items-center gap-3"><User className="w-4 h-4 text-blue-500" /> <span><Editable tag="span" value={data.nationality} onChange={v => handleUpdate('nationality', v)} /> • <Editable tag="span" value={data.birthDate} onChange={v => handleUpdate('birthDate', v)} /></span></div>
                  </div>
                </div>
                <div className="w-36 h-36 bg-slate-100 rounded-2xl border-4 border-white shadow-xl overflow-hidden shrink-0 relative group/img">
                  <ProfilePhoto
                    src={data.profileImage}
                    position={data.profileImagePos}
                    onPositionChange={val => handleUpdate('profileImagePos', val)}
                    fallback={<div className="w-full h-full flex items-center justify-center text-slate-300"><User size={64} /></div>}
                  />
                  {!isGeneratingPDF && <PhotoUploadButton onClick={() => fileInputRef.current?.click()} />}
                </div>
              </div>
            </header>
            <div className="flex flex-1 flex-col md:flex-row">
              <div className="md:flex-[2] p-10 space-y-12 border-r border-slate-50">
                <section>
                  <Editable tag="h2" value={data.sectionTitles.summary} onChange={v => handleTitleUpdate('summary', v)} className="text-lg font-black uppercase text-slate-900 border-b-2 border-blue-500 inline-block mb-6" />
                  <Editable tag="p" value={data.summary} onChange={v => handleUpdate('summary', v)} isExample={!modifiedFields.has('summary')} className="text-slate-600 text-sm leading-relaxed text-justify" />
                </section>
                <section>
                  <Editable tag="h2" value={data.sectionTitles.experience} onChange={v => handleTitleUpdate('experience', v)} className="text-lg font-black uppercase text-slate-900 border-b-2 border-blue-500 inline-block mb-8" />
                  <div className="space-y-10">
                    {data.experiences.map(exp => (
                      <div key={exp.id} className="relative pl-6 border-l-2 border-blue-100">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7.5px] top-1.5 shadow-sm" />
                        <div className="flex justify-between items-baseline mb-2">
                          <Editable tag="h3" value={exp.role} onChange={v => updateExperience(exp.id, 'role', v)} className="text-base font-black text-slate-900" />
                          <Editable tag="span" value={exp.period} onChange={v => updateExperience(exp.id, 'period', v)} className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded tracking-widest" />
                        </div>
                        <Editable tag="p" value={exp.company} onChange={v => updateExperience(exp.id, 'company', v)} className="text-blue-600 text-sm font-bold mb-3" />
                        <Editable tag="p" value={exp.description} onChange={v => updateExperience(exp.id, 'description', v)} className="text-slate-600 text-xs leading-relaxed whitespace-pre-line" />
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <Editable tag="h2" value={data.sectionTitles.education} onChange={v => handleTitleUpdate('education', v)} className="text-lg font-black uppercase text-slate-900 border-b-2 border-blue-500 inline-block mb-8" />
                  <div className="space-y-6">
                    {data.education.map(edu => (
                      <div key={edu.id} className="flex justify-between items-start">
                        <div>
                          <Editable tag="h3" value={edu.degree} onChange={v => updateEducation(edu.id, 'degree', v)} className="font-bold text-slate-900 text-sm" />
                          <Editable tag="p" value={edu.school} onChange={v => updateEducation(edu.id, 'school', v)} className="text-slate-500 text-xs" />
                        </div>
                        <Editable tag="span" value={edu.year} onChange={v => updateEducation(edu.id, 'year', v)} className="text-xs font-bold text-slate-400" />
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                   <Editable tag="h2" value={data.sectionTitles.social} onChange={v => handleTitleUpdate('social', v)} className="text-lg font-black uppercase text-slate-900 border-b-2 border-blue-500 inline-block mb-8" />
                   <div className="flex flex-col gap-4">
                      {renderSocials()}
                   </div>
                </section>
              </div>
              <aside className="md:flex-1 bg-slate-50/40 p-10 space-y-12">
                <section>
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <Editable tag="span" value={data.sectionTitles.languages} onChange={v => handleTitleUpdate('languages', v)} />
                  </h2>
                  <div className="space-y-3">{data.languages.map((lang, i) => <Editable key={i} value={lang} onChange={v => updateListItem('languages', i, v)} className="text-sm font-medium text-slate-700 bg-white p-2 rounded border border-slate-100 shadow-sm" />)}</div>
                </section>
                <section>
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-500" />
                    <Editable tag="span" value={data.sectionTitles.skills} onChange={v => handleTitleUpdate('skills', v)} />
                  </h2>
                  <div className="flex flex-wrap gap-2">{data.skills.map((skill, i) => <Editable key={i} tag="span" value={skill} onChange={v => updateListItem('skills', i, v)} className="bg-slate-900 text-white px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider" />)}</div>
                </section>
                <section>
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-[0.2em] mb-6 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <Editable tag="span" value={data.sectionTitles.softSkills} onChange={v => handleTitleUpdate('softSkills', v)} />
                  </h2>
                  <div className="space-y-2">{data.softSkills.map((skill, i) => <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-600"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> <Editable tag="span" value={skill} onChange={v => updateListItem('softSkills', i, v)} className="flex-1" /></div>)}</div>
                </section>
                <div className="pt-12"><p className="text-[9px] text-slate-400 leading-tight italic">{locale.ui.privacyNote}</p></div>
              </aside>
            </div>
          </div>
        );
    }
  };

  // Mobile-only resume controls (add/remove) to preserve the desktop layout.
  const renderMobileCvTools = () => {
    if (isGeneratingPDF) return null;

    return (
      <div className="md:hidden fixed bottom-4 right-4 z-20 no-print" data-html2canvas-ignore="true">
        <div className={`mb-3 w-72 max-w-[90vw] rounded-2xl bg-white/95 backdrop-blur border border-slate-200 shadow-xl p-3 transition-all ${isMobileToolsOpen ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'}`}>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setMobileToolsTab('add')}
              className={`flex-1 text-[10px] uppercase tracking-widest font-black rounded-lg px-2 py-1.5 ${mobileToolsTab === 'add' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {locale.ui.addTab}
            </button>
            <button
              onClick={() => setMobileToolsTab('remove')}
              className={`flex-1 text-[10px] uppercase tracking-widest font-black rounded-lg px-2 py-1.5 ${mobileToolsTab === 'remove' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {locale.ui.removeTab}
            </button>
          </div>

          {mobileToolsTab === 'add' ? (
            <div className="grid gap-2">
              <button onClick={addExperience} className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                {locale.ui.addExperience} <Plus className="w-3 h-3" />
              </button>
              <button onClick={addEducation} className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                {locale.ui.addEducation} <Plus className="w-3 h-3" />
              </button>
              <button onClick={() => addListItem('skills')} className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                {locale.ui.addSkills} <Plus className="w-3 h-3" />
              </button>
              <button onClick={() => addListItem('languages')} className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                {locale.ui.addLanguages} <Plus className="w-3 h-3" />
              </button>
              <button onClick={() => addListItem('softSkills')} className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                {locale.ui.addSoftSkills} <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              <div>
                <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1">{locale.ui.experiencesLabel}</p>
                {data.experiences.length === 0 ? (
                  <p className="text-[10px] text-slate-400">{locale.ui.emptyExperience}</p>
                ) : (
                  data.experiences.map(exp => (
                    <button
                      key={exp.id}
                      onClick={() => removeExperience(exp.id)}
                      className="flex items-center justify-between w-full text-[11px] px-2 py-1.5 rounded-md bg-slate-50 text-slate-700 border border-slate-100"
                    >
                      <span className="truncate">{exp.role || exp.company || locale.ui.addExperience}</span>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  ))
                )}
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1">{locale.ui.educationLabel}</p>
                {data.education.length === 0 ? (
                  <p className="text-[10px] text-slate-400">{locale.ui.emptyEducation}</p>
                ) : (
                  data.education.map(edu => (
                    <button
                      key={edu.id}
                      onClick={() => removeEducation(edu.id)}
                      className="flex items-center justify-between w-full text-[11px] px-2 py-1.5 rounded-md bg-slate-50 text-slate-700 border border-slate-100"
                    >
                      <span className="truncate">{edu.degree || edu.school || locale.ui.addEducation}</span>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  ))
                )}
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1">{locale.ui.skillsLabel}</p>
                {data.skills.length === 0 ? (
                  <p className="text-[10px] text-slate-400">{locale.ui.emptySkills}</p>
                ) : (
                  data.skills.map((skill, idx) => (
                    <button
                      key={`skills_${idx}`}
                      onClick={() => removeListItem('skills', idx)}
                      className="flex items-center justify-between w-full text-[11px] px-2 py-1.5 rounded-md bg-slate-50 text-slate-700 border border-slate-100"
                    >
                      <span className="truncate">{skill.trim() || locale.ui.emptySkillFallback}</span>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  ))
                )}
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1">{locale.ui.languagesLabel}</p>
                {data.languages.length === 0 ? (
                  <p className="text-[10px] text-slate-400">{locale.ui.emptyLanguages}</p>
                ) : (
                  data.languages.map((lang, idx) => (
                    <button
                      key={`languages_${idx}`}
                      onClick={() => removeListItem('languages', idx)}
                      className="flex items-center justify-between w-full text-[11px] px-2 py-1.5 rounded-md bg-slate-50 text-slate-700 border border-slate-100"
                    >
                      <span className="truncate">{lang.trim() || locale.ui.emptyLanguageFallback}</span>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  ))
                )}
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1">{locale.ui.softSkillsLabel}</p>
                {data.softSkills.length === 0 ? (
                  <p className="text-[10px] text-slate-400">{locale.ui.emptySoftSkills}</p>
                ) : (
                  data.softSkills.map((skill, idx) => (
                    <button
                      key={`softSkills_${idx}`}
                      onClick={() => removeListItem('softSkills', idx)}
                      className="flex items-center justify-between w-full text-[11px] px-2 py-1.5 rounded-md bg-slate-50 text-slate-700 border border-slate-100"
                    >
                      <span className="truncate">{skill.trim() || locale.ui.emptySoftSkillFallback}</span>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMobileToolsOpen(prev => !prev)}
          className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
        >
          {isMobileToolsOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Template Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-full overflow-y-auto p-6 md:p-10 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Scegli il tuo stile</h2>
              <p className="text-slate-500 font-medium italic">Seleziona o desenho che meglio rappresenta sua carriera</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(['europass', 'modern', 'classic', 'minimal', 'creative', 'corporate', 'elegant', 'tech', 'sidebar'] as CVTemplate[]).map(t => (
                <button 
                  key={t}
                  onClick={() => {
                    handleUpdate('template', t);
                    setIsModalOpen(false);
                  }}
                  className={`group relative aspect-[3/4.2] rounded-2xl overflow-hidden border-4 transition-all duration-300 flex flex-col ${data.template === t ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-2xl scale-105' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="flex-1 bg-slate-100 p-3 overflow-hidden">
                    <TemplateDrawing type={t} />
                  </div>
                  <div className="bg-white p-3 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${data.template === t ? 'text-blue-600' : 'text-slate-500'}`}>{t}</span>
                    {data.template === t && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
                  </div>
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors pointer-events-none" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Sidebar */}
      <aside className="w-full md:w-1/3 bg-slate-900 text-white p-6 overflow-y-auto no-print border-r border-slate-800 scrollbar-hide">
        <div className="flex items-center gap-2 mb-8 sticky top-0 bg-slate-900 z-10 py-2">
          <Sparkles className="text-yellow-400" />
          <h1 className="text-2xl font-bold">CV Editor Italia</h1>
        </div>

        <div className="space-y-8 pb-20">
          {/* Scegli Template Floating Trigger */}
          <section className="space-y-4">
            <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest flex items-center gap-2">
              <Layout className="w-3 h-3" /> Modello di CV
            </h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-slate-800 border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-700/50 p-4 rounded-xl flex items-center justify-between group transition-all shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition p-1">
                  <div className="w-full h-full scale-50">
                    <TemplateDrawing type={data.template} />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Visualizza Disegni</p>
                  <p className="text-sm font-black uppercase tracking-tight text-white">{data.template}</p>
                </div>
              </div>
              <Maximize2 className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />
            </button>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest">Foto Profilo</h3>
            <div className="flex items-center gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-700 transition border-2 border-dashed border-slate-700 overflow-hidden"
              >
                <ProfilePhoto
                  src={data.profileImage}
                  position={data.profileImagePos}
                  fallback={<Camera className="text-slate-500" />}
                />
              </div>
              {data.profileImage && (
                <button onClick={removeImage} className="text-xs text-red-400 font-bold hover:underline">RIMUOVI</button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
            {data.profileImage && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Posizione Foto</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={data.profileImagePos ?? 50}
                  onChange={e => handleUpdate('profileImagePos', Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest">{data.sectionTitles.personalInfo}</h3>
            <input className="w-full bg-slate-800 border-none rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-blue-500" value={data.fullName} onChange={e => handleUpdate('fullName', e.target.value)} placeholder="Nome e Cognome" />
            <input className="w-full bg-slate-800 border-none rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-blue-500" value={data.role} onChange={e => handleUpdate('role', e.target.value)} placeholder="Titolo Professionale" />
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-slate-800 border-none rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-blue-500" value={data.nationality} onChange={e => handleUpdate('nationality', e.target.value)} placeholder="Nazionalità" />
              <input className="bg-slate-800 border-none rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-blue-500" value={data.birthDate} onChange={e => handleUpdate('birthDate', e.target.value)} placeholder="Anno di Nascita" />
            </div>
            <input className="w-full bg-slate-800 border-none rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-blue-500" value={data.location} onChange={e => handleUpdate('location', e.target.value)} placeholder="Località" />
          </section>

          <section className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest">{data.sectionTitles.contact}</h3>
            <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-3">
              <Mail className="w-4 h-4 text-slate-500" />
              <input className="bg-transparent border-none text-sm w-full outline-none text-white" value={data.email} onChange={e => handleUpdate('email', e.target.value)} />
            </div>
            <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-3">
              <Phone className="w-4 h-4 text-slate-500" />
              <input className="bg-transparent border-none text-sm w-full outline-none text-white" value={data.phone} onChange={e => handleUpdate('phone', e.target.value)} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest">{data.sectionTitles.social}</h3>
            <div className="space-y-2">
               <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-3">
                  <Github className="w-4 h-4 text-slate-500" />
                  <input className="bg-transparent border-none text-sm w-full outline-none text-white" value={data.github} onChange={e => handleUpdate('github', e.target.value)} placeholder="Github URL" />
               </div>
               <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-3">
                  <Linkedin className="w-4 h-4 text-slate-500" />
                  <input className="bg-transparent border-none text-sm w-full outline-none text-white" value={data.linkedin} onChange={e => handleUpdate('linkedin', e.target.value)} placeholder="Linkedin URL" />
               </div>
               <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-3">
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                  <input className="bg-transparent border-none text-sm w-full outline-none text-white" value={data.portfolio} onChange={e => handleUpdate('portfolio', e.target.value)} placeholder="Portfolio URL" />
               </div>
               <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-3">
                  <Instagram className="w-4 h-4 text-slate-500" />
                  <input className="bg-transparent border-none text-sm w-full outline-none text-white" value={data.instagram} onChange={e => handleUpdate('instagram', e.target.value)} placeholder="Instagram Handle" />
               </div>
               <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-3">
                  <Twitter className="w-4 h-4 text-slate-500" />
                  <input className="bg-transparent border-none text-sm w-full outline-none text-white" value={data.twitter} onChange={e => handleUpdate('twitter', e.target.value)} placeholder="Twitter/X Handle" />
               </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest">{data.sectionTitles.summary}</h3>
              <button onClick={handleOptimizeSummary} className="text-blue-400 text-[10px] font-bold hover:text-blue-300">
                {isOptimizing ? 'OTTIMIZZAZIONE...' : 'OTTIMIZZA CON AI'}
              </button>
            </div>
            <textarea className="w-full bg-slate-800 border-none rounded-lg p-3 text-sm h-32 resize-none text-white focus:ring-2 focus:ring-blue-500" value={data.summary} onChange={e => handleUpdate('summary', e.target.value)} />
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest">{data.sectionTitles.experience}</h3>
              <button onClick={addExperience} className="p-1 text-blue-400 hover:bg-slate-800 rounded-full"><Plus className="w-4 h-4" /></button>
            </div>
            {data.experiences.map(exp => (
              <div key={exp.id} className="p-4 bg-slate-800 rounded-xl space-y-3 border border-slate-700 text-white">
                <div className="flex justify-between items-center">
                  <input className="bg-transparent border-none text-sm font-bold w-full outline-none text-blue-400" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Azienda" />
                  <button onClick={() => removeExperience(exp.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
                <input className="bg-transparent border-none text-xs w-full outline-none text-white font-medium" value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} placeholder="Ruolo" />
                <input className="bg-transparent border-none text-[10px] w-full outline-none text-slate-400 font-bold" value={exp.period} onChange={e => updateExperience(exp.id, 'period', e.target.value)} placeholder="Periodo" />
                <textarea className="bg-slate-900/50 rounded p-2 border-none text-xs w-full h-20 outline-none resize-none text-slate-300" value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} placeholder="Dettagli..." />
              </div>
            ))}
          </section>

          {[
            { title: data.sectionTitles.skills, field: 'skills' },
            { title: data.sectionTitles.languages, field: 'languages' },
            { title: data.sectionTitles.softSkills, field: 'softSkills' }
          ].map(list => (
            <section key={list.field} className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest">
                  {list.title}
                </h3>
                <button onClick={() => addListItem(list.field as any)} className="text-blue-400"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2">
                {data[list.field as keyof CVData] instanceof Array && (data[list.field as keyof CVData] as string[]).map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      className="flex-1 bg-slate-800 border-none rounded-lg p-2 text-sm text-white"
                      value={item}
                      onChange={e => updateListItem(list.field as any, idx, e.target.value)}
                      placeholder={`Nuovo item...`}
                    />
                    <button onClick={() => removeListItem(list.field as any, idx)} className="text-slate-600 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-bold flex items-center justify-center gap-3 transition shadow-xl shadow-blue-900/20">
            {isGeneratingPDF ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><FileText className="w-5 h-5" /> SCARICA PDF</>}
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-100 p-4 md:p-12 overflow-y-auto print-padding flex flex-col items-center gap-6 relative">
        <div className="absolute top-4 right-4 z-30 no-print flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 bg-white/90 border border-slate-200 rounded-full p-1 shadow-md">
            {(Object.keys(LOCALES) as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition ${
                  language === lang ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={handleSaveToBrowser}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-md border transition ${
              saveStatus === 'saved'
                ? 'bg-emerald-500 text-white border-emerald-400'
                : saveStatus === 'error'
                  ? 'bg-red-500 text-white border-red-400'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {saveStatus === 'saved' ? locale.ui.saved : locale.ui.save}
          </button>
        </div>
        <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-bounce no-print">
          <Edit3 className="w-4 h-4" /> {locale.ui.clickToEdit}
        </div>
        <div className="relative w-full flex justify-center">
          <div 
            ref={cvRef} 
            id="cv-download-container" 
            className="w-full max-w-[210mm] md:w-[210mm] shadow-2xl min-h-[297mm] flex flex-col overflow-hidden bg-white"
            style={isGeneratingPDF ? { width: '210mm', maxWidth: '210mm' } : undefined}
          >
            {renderTemplate()}
          </div>
          {renderMobileCvTools()}
        </div>
      </main>
    </div>
  );
};

export default App;
