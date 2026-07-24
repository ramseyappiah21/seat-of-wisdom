export type ClassLevel =
  | "Nursery"
  | "KG 1"
  | "KG 2"
  | "Primary 1"
  | "Primary 2"
  | "Primary 3"
  | "Primary 4"
  | "Primary 5"
  | "Primary 6"
  | "JHS 1"
  | "JHS 2"
  | "JHS 3";

export type ClassSection = "primary" | "jhs" | "early";

export type Gender = "Male" | "Female";

export type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused";

export type FeeStatus = "Paid" | "Partial" | "Unpaid" | "Overdue";

export type Term = "First Term" | "Second Term" | "Third Term";

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  classLevel: ClassLevel;
  guardianName: string;
  guardianPhone: string;
  email: string;
  address: string;
  enrollmentDate: string;
  status: "Active" | "Inactive" | "Graduated";
  /** Issued by the headmaster for the pupil results portal */
  portalPassword?: string;
}

export interface Teacher {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  email: string;
  phone: string;
  subject: string;
  /** Classes this teacher teaches their subject to */
  classes: ClassLevel[];
  /** Class they oversee as class teacher (optional) */
  homeroomClass?: ClassLevel;
  hireDate: string;
  status: "Active" | "On Leave" | "Inactive";
  /** Issued by the headmaster for the teacher results portal */
  portalPassword?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  classLevel: ClassLevel;
  note?: string;
}

export interface ResultRecord {
  id: string;
  studentId: string;
  subject: string;
  term: Term;
  session: string;
  classLevel: ClassLevel;
  caScore: number;
  examScore: number;
  grade: string;
  remark: string;
  /** Subject teacher has sent scores to the class teacher */
  submitted: boolean;
  /** Visible to pupils only after the class teacher publishes ranked results */
  published: boolean;
  /** Overall class position (1 = highest) set when the class teacher ranks */
  classRank?: number;
  teacherId?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  description: string;
  term: Term;
  session: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: FeeStatus;
  lastPaymentDate?: string;
}

export interface SchoolData {
  students: Student[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  results: ResultRecord[];
  fees: FeeRecord[];
}

export const CLASS_LEVELS: ClassLevel[] = [
  "Nursery",
  "KG 1",
  "KG 2",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JHS 1",
  "JHS 2",
  "JHS 3",
];

export const PRIMARY_CLASSES: ClassLevel[] = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
];

export const JHS_CLASSES: ClassLevel[] = ["JHS 1", "JHS 2", "JHS 3"];

export const EARLY_YEARS_CLASSES: ClassLevel[] = ["Nursery", "KG 1", "KG 2"];

export const TERMS: Term[] = ["First Term", "Second Term", "Third Term"];

/** Ghana Education Service–aligned basic school subjects */
export const SUBJECTS = [
  "English Language",
  "Mathematics",
  "Integrated Science",
  "Social Studies",
  "Asante Twi",
  "Religious & Moral Education",
  "Creative Arts",
  "Computing",
  "Our World Our People",
  "French",
  "Physical Education",
  "Career Technology",
];

export const SCHOOL = {
  name: "Seat of Wisdom School",
  shortName: "Seat of Wisdom",
  location: "Afrancho, Kumasi",
  area: "Afrancho",
  district: "Afigya Kwabre South",
  region: "Ashanti Region",
  country: "Ghana",
  type: "Basic School",
  tagline: "Nurturing tomorrow's leaders today",
  academicYear: "2025/2026",
  address: "Afrancho, Kumasi, Ashanti Region, Ghana",
  phone: "+233 XX XXX 4451",
  whatsapp: "+233 XX XXX 4451",
  email: "info@seatofwisdomschool.com",
  admissionsEmail: "admissions@seatofwisdomschool.com",
  website: "https://seatofwisdomschool.com.free/",
  /** Demo headmaster portal login */
  headmasterUser: "headmaster",
  headmasterPassword: "SOW-HEAD-2026",
} as const;

export function classesForSection(section: ClassSection): ClassLevel[] {
  if (section === "primary") return PRIMARY_CLASSES;
  if (section === "jhs") return JHS_CLASSES;
  return EARLY_YEARS_CLASSES;
}

export function sectionForClass(level: ClassLevel): ClassSection {
  if (PRIMARY_CLASSES.includes(level)) return "primary";
  if (JHS_CLASSES.includes(level)) return "jhs";
  return "early";
}

export function classToSlug(level: ClassLevel): string {
  return level.toLowerCase().replace(/\s+/g, "-");
}

export function slugToClass(slug: string): ClassLevel | null {
  const found = CLASS_LEVELS.find((c) => classToSlug(c) === slug.toLowerCase());
  return found ?? null;
}
