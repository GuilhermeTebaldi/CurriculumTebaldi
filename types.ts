
export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export interface LanguageSkill {
  id: string;
  language: string;
  comprehension: string;
  speaking: string;
  writing: string;
}

export type CVTemplate = 'modern' | 'classic' | 'minimal' | 'creative' | 'corporate' | 'elegant' | 'tech' | 'sidebar' | 'europass' | 'blueclassic' | 'executivepro' | 'neoclassic' | 'architectural' | 'softui';

export interface SectionTitles {
  experience: string;
  education: string;
  skills: string;
  languages: string;
  softSkills: string;
  summary: string;
  contact: string;
  social: string;
  personalInfo: string;
}

export interface CVData {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  nationality: string;
  birthDate: string;
  summary: string;
  profileImage?: string;
  profileImagePos?: number;
  github: string;
  linkedin: string;
  portfolio: string;
  instagram: string;
  twitter: string;
  template: CVTemplate;
  experiences: WorkExperience[];
  education: Education[];
  skills: string[];
  languages: string[];
  softSkills: string[];
  languageSkills: LanguageSkill[];
  digitalSkills: string[];
  organizationalSkills: string[];
  professionalSkills: string[];
  additionalInfo: string[];
  sectionTitles: SectionTitles;
}
