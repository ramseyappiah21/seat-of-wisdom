import type {
  AttendanceRecord,
  FeeRecord,
  ResultRecord,
  SchoolData,
  Student,
  Teacher,
} from "./types";
import { computeGrade } from "./utils";

function uid(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(3, "0")}`;
}

const SAMPLE_TERM = "First Term";
const SAMPLE_SESSION = "2025/2026";
const SAMPLE_CLASS = "Primary 5" as const;

/** Sample Primary 5 class — passwords are random codes (changeable by pupils). */
export const seedStudents: Student[] = [
  {
    id: uid("stu", 1),
    admissionNo: "SOW-P5-001",
    firstName: "Ama",
    lastName: "Mensah",
    gender: "Female",
    dateOfBirth: "2014-03-12",
    classLevel: SAMPLE_CLASS,
    guardianName: "Kwame Mensah",
    guardianPhone: "+233 24 111 2200",
    email: "",
    address: "Afrancho, Kumasi",
    enrollmentDate: "2020-09-07",
    status: "Active",
    portalPassword: "A3K9MP",
  },
  {
    id: uid("stu", 2),
    admissionNo: "SOW-P5-002",
    firstName: "Kofi",
    lastName: "Asante",
    gender: "Male",
    dateOfBirth: "2014-07-21",
    classLevel: SAMPLE_CLASS,
    guardianName: "Abena Asante",
    guardianPhone: "+233 20 333 4411",
    email: "",
    address: "Afrancho, Kumasi",
    enrollmentDate: "2020-09-07",
    status: "Active",
    portalPassword: "B7N2QW",
  },
  {
    id: uid("stu", 3),
    admissionNo: "SOW-P5-003",
    firstName: "Akosua",
    lastName: "Boateng",
    gender: "Female",
    dateOfBirth: "2013-11-05",
    classLevel: SAMPLE_CLASS,
    guardianName: "Yaw Boateng",
    guardianPhone: "+233 54 555 6622",
    email: "",
    address: "Afrancho, Kumasi",
    enrollmentDate: "2019-09-02",
    status: "Active",
    portalPassword: "C4R8TY",
  },
  {
    id: uid("stu", 4),
    admissionNo: "SOW-P5-004",
    firstName: "Yaw",
    lastName: "Osei",
    gender: "Male",
    dateOfBirth: "2014-01-30",
    classLevel: SAMPLE_CLASS,
    guardianName: "Efua Osei",
    guardianPhone: "+233 27 777 8833",
    email: "",
    address: "Afrancho, Kumasi",
    enrollmentDate: "2020-09-07",
    status: "Active",
    portalPassword: "D6H3VX",
  },
  {
    id: uid("stu", 5),
    admissionNo: "SOW-P5-005",
    firstName: "Efua",
    lastName: "Adjei",
    gender: "Female",
    dateOfBirth: "2014-05-18",
    classLevel: SAMPLE_CLASS,
    guardianName: "Kojo Adjei",
    guardianPhone: "+233 55 999 0044",
    email: "",
    address: "Afrancho, Kumasi",
    enrollmentDate: "2021-01-11",
    status: "Active",
    portalPassword: "E9P5ZL",
  },
  {
    id: uid("stu", 6),
    admissionNo: "SOW-P5-006",
    firstName: "Kwame",
    lastName: "Darko",
    gender: "Male",
    dateOfBirth: "2013-09-09",
    classLevel: SAMPLE_CLASS,
    guardianName: "Ama Darko",
    guardianPhone: "+233 24 222 1155",
    email: "",
    address: "Afrancho, Kumasi",
    enrollmentDate: "2019-09-02",
    status: "Active",
    portalPassword: "F2W7JN",
  },
];

export const seedTeachers: Teacher[] = [
  {
    id: uid("tch", 1),
    staffId: "SOW-T-101",
    firstName: "Mary",
    lastName: "Addo",
    gender: "Female",
    email: "m.addo@seatofwisdom.edu.gh",
    phone: "+233 24 900 1100",
    subject: "Mathematics",
    classes: ["Primary 4", "Primary 5", "Primary 6"],
    homeroomClass: "Primary 5",
    hireDate: "2018-01-15",
    status: "Active",
    portalPassword: "K7M2XP",
  },
  {
    id: uid("tch", 2),
    staffId: "SOW-T-102",
    firstName: "Samuel",
    lastName: "Agyei",
    gender: "Male",
    email: "s.agyei@seatofwisdom.edu.gh",
    phone: "+233 20 771 3344",
    subject: "English Language",
    classes: ["Primary 5", "JHS 1", "JHS 2", "JHS 3"],
    homeroomClass: "JHS 1",
    hireDate: "2019-09-02",
    status: "Active",
    portalPassword: "H4N9QW",
  },
  {
    id: uid("tch", 3),
    staffId: "SOW-T-103",
    firstName: "Comfort",
    lastName: "Amponsah",
    gender: "Female",
    email: "c.amponsah@seatofwisdom.edu.gh",
    phone: "+233 54 155 6677",
    subject: "Integrated Science",
    classes: ["Primary 5", "JHS 1", "JHS 2", "JHS 3"],
    homeroomClass: "JHS 2",
    hireDate: "2020-03-10",
    status: "Active",
    portalPassword: "R8T3YB",
  },
  {
    id: uid("tch", 4),
    staffId: "SOW-T-104",
    firstName: "Isaac",
    lastName: "Boadu",
    gender: "Male",
    email: "i.boadu@seatofwisdom.edu.gh",
    phone: "+233 27 220 4488",
    subject: "Asante Twi",
    classes: ["Primary 1", "Primary 2", "Primary 3", "Primary 5"],
    homeroomClass: "Primary 2",
    hireDate: "2017-08-21",
    status: "Active",
    portalPassword: "P6V2CD",
  },
  {
    id: uid("tch", 5),
    staffId: "SOW-T-105",
    firstName: "Grace",
    lastName: "Sarpong",
    gender: "Female",
    email: "g.sarpong@seatofwisdom.edu.gh",
    phone: "+233 55 883 9921",
    subject: "Creative Arts",
    classes: ["Nursery", "KG 1", "KG 2", "Primary 5"],
    homeroomClass: "KG 1",
    hireDate: "2022-09-05",
    status: "Active",
    portalPassword: "M5G8ZK",
  },
  {
    id: uid("tch", 6),
    staffId: "SOW-T-106",
    firstName: "Daniel",
    lastName: "Owusu",
    gender: "Male",
    email: "d.owusu@seatofwisdom.edu.gh",
    phone: "+233 24 664 0077",
    subject: "Computing",
    classes: ["Primary 5", "Primary 6", "JHS 1"],
    homeroomClass: "Primary 6",
    hireDate: "2021-01-18",
    status: "Active",
    portalPassword: "W3J7FL",
  },
];

/**
 * Scores sent by each Primary 5 subject teacher to the class teacher (Mary Addo),
 * then ranked and published to pupils.
 * Order of pupils: Ama, Kofi, Akosua, Yaw, Efua, Kwame.
 */
const SAMPLE_SUBJECT_SCORES: Array<{
  subject: string;
  teacherId: string;
  /** [ca, exam] per pupil index */
  scores: Array<[number, number]>;
}> = [
  {
    subject: "Mathematics",
    teacherId: uid("tch", 1),
    scores: [
      [32, 48],
      [28, 42],
      [35, 52],
      [24, 38],
      [30, 45],
      [26, 40],
    ],
  },
  {
    subject: "English Language",
    teacherId: uid("tch", 2),
    scores: [
      [30, 50],
      [27, 44],
      [34, 54],
      [22, 36],
      [29, 46],
      [25, 41],
    ],
  },
  {
    subject: "Integrated Science",
    teacherId: uid("tch", 3),
    scores: [
      [31, 47],
      [29, 43],
      [33, 51],
      [23, 37],
      [28, 44],
      [27, 42],
    ],
  },
  {
    subject: "Asante Twi",
    teacherId: uid("tch", 4),
    scores: [
      [34, 51],
      [30, 46],
      [36, 55],
      [25, 40],
      [32, 48],
      [28, 43],
    ],
  },
  {
    subject: "Creative Arts",
    teacherId: uid("tch", 5),
    scores: [
      [33, 49],
      [31, 45],
      [35, 53],
      [26, 39],
      [30, 47],
      [29, 44],
    ],
  },
  {
    subject: "Computing",
    teacherId: uid("tch", 6),
    scores: [
      [29, 46],
      [26, 41],
      [32, 50],
      [21, 35],
      [28, 43],
      [24, 39],
    ],
  },
];

function buildSampleResults(): ResultRecord[] {
  const drafts: ResultRecord[] = [];
  let n = 1;

  for (const block of SAMPLE_SUBJECT_SCORES) {
    seedStudents.forEach((pupil, index) => {
      const [caScore, examScore] = block.scores[index];
      const { grade, remark } = computeGrade(caScore + examScore);
      drafts.push({
        id: uid("res", n),
        studentId: pupil.id,
        subject: block.subject,
        term: SAMPLE_TERM,
        session: SAMPLE_SESSION,
        classLevel: SAMPLE_CLASS,
        caScore,
        examScore,
        grade,
        remark,
        submitted: true,
        published: false,
        teacherId: block.teacherId,
      });
      n += 1;
    });
  }

  // Ranked only after the class teacher sends to pupils — preview ranks in UI.
  return drafts;
}

export const seedAttendance: AttendanceRecord[] = [];
export const seedResults: ResultRecord[] = buildSampleResults();
export const seedFees: FeeRecord[] = [];

export const seedData: SchoolData = {
  students: seedStudents,
  teachers: seedTeachers,
  attendance: seedAttendance,
  results: seedResults,
  fees: seedFees,
};

/** Merge sample Primary 5 pupils + subject marks (not yet sent to pupils). */
export function ensureSamplePrimary5(data: SchoolData): SchoolData {
  const hasPrimary5 = data.students.some(
    (s) => s.classLevel === SAMPLE_CLASS && s.status === "Active"
  );
  if (hasPrimary5) return data;

  const sampleIds = new Set(seedStudents.map((s) => s.id));
  const teachersByStaff = new Map(seedTeachers.map((t) => [t.staffId, t]));
  const teachers = data.teachers.map((t) => {
    const seed = teachersByStaff.get(t.staffId);
    if (!seed) return t;
    const classes = [...new Set([...t.classes, ...seed.classes])];
    return {
      ...t,
      classes,
      homeroomClass: t.homeroomClass ?? seed.homeroomClass,
      status: t.status === "On Leave" && seed.status === "Active" ? "Active" : t.status,
    };
  });
  const knownStaff = new Set(data.teachers.map((t) => t.staffId));
  for (const t of seedTeachers) {
    if (!knownStaff.has(t.staffId)) teachers.push(t);
  }

  return {
    ...data,
    teachers,
    students: [
      ...seedStudents,
      ...data.students.filter((s) => !sampleIds.has(s.id)),
    ],
    results: [
      ...seedResults,
      ...data.results.filter(
        (r) => r.classLevel !== SAMPLE_CLASS && !sampleIds.has(r.studentId)
      ),
    ],
  };
}
