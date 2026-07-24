"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ensureSamplePrimary5, seedData } from "./seed";
import { looksLikePersonName } from "./spreadsheet";
import type {
  AttendanceRecord,
  ClassLevel,
  FeeRecord,
  ResultRecord,
  SchoolData,
  Student,
  Teacher,
  Term,
} from "./types";
import {
  computeGrade,
  createId,
  computeClassRanks,
  deriveFeeStatus,
  fullName,
  generatePortalPassword,
  needsPasswordMigration,
  normalizeName,
  parseFullName,
} from "./utils";

const STORAGE_KEY = "seat-of-wisdom-afrancho-data-v8";
const PREV_STORAGE_KEYS = [
  "seat-of-wisdom-afrancho-data-v7",
  "seat-of-wisdom-afrancho-data-v6",
  "seat-of-wisdom-afrancho-data-v5",
  "seat-of-wisdom-afrancho-data-v4",
];

export type ResultInput = Omit<ResultRecord, "id" | "grade" | "remark"> & {
  id?: string;
};

type SchoolStore = SchoolData & {
  ready: boolean;
  resetData: () => void;
  addStudent: (student: Omit<Student, "id">) => Student;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  clearAllPupils: () => number;
  clearClassPupils: (classLevel: ClassLevel) => number;
  addTeacher: (teacher: Omit<Teacher, "id">) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  upsertAttendance: (
    records: Array<Omit<AttendanceRecord, "id"> & { id?: string }>
  ) => void;
  deleteAttendance: (id: string) => void;
  addResult: (result: Omit<ResultRecord, "id" | "grade" | "remark">) => void;
  updateResult: (
    id: string,
    result: Partial<Omit<ResultRecord, "id" | "grade" | "remark">>
  ) => void;
  deleteResult: (id: string) => void;
  addFee: (fee: Omit<FeeRecord, "id" | "status">) => void;
  updateFee: (id: string, fee: Partial<Omit<FeeRecord, "id" | "status">>) => void;
  recordPayment: (id: string, amount: number) => void;
  deleteFee: (id: string) => void;
  issueStudentPassword: (id: string) => string;
  issueTeacherPassword: (id: string) => string;
  issueClassPasswords: (classLevel: ClassLevel) => Array<{ id: string; name: string; password: string }>;
  importClassNames: (
    classLevel: ClassLevel,
    names:
      | string[]
      | Array<{
          fullName: string;
          firstName: string;
          lastName: string;
          gender?: "Male" | "Female";
        }>
  ) => number;
  importClassResults: (
    classLevel: ClassLevel,
    rows: Array<{
      fullName: string;
      subject: string;
      caScore: number;
      examScore: number;
      term?: Term;
      session?: string;
    }>,
    teacherId?: string,
    publish?: boolean
  ) => { studentsCreated: number; resultsSaved: number };
  saveTeacherResults: (results: ResultInput[]) => void;
  rankClassResults: (
    classLevel: ClassLevel,
    term: Term,
    session: string
  ) => number;
  publishClassResults: (
    classLevel: ClassLevel,
    term: Term,
    session: string
  ) => number;
  publishSubjectResults: (
    classLevel: ClassLevel,
    subject: string,
    term: Term,
    session: string
  ) => number;
  authenticateStudent: (
    classLevel: ClassLevel,
    name: string,
    password: string
  ) => Student | null;
  authenticateTeacher: (name: string, password: string) => Teacher | null;
};

const SchoolContext = createContext<SchoolStore | null>(null);

function withResultMeta(result: ResultInput): ResultRecord {
  const { grade, remark } = computeGrade(result.caScore + result.examScore);
  return {
    ...result,
    id: result.id ?? createId("res"),
    grade,
    remark,
    submitted: result.submitted ?? false,
    published: result.published ?? false,
  };
}

function withFeeMeta(fee: Omit<FeeRecord, "id" | "status"> & { id?: string }): FeeRecord {
  return {
    ...fee,
    id: fee.id ?? createId("fee"),
    status: deriveFeeStatus(fee.amount, fee.amountPaid, fee.dueDate),
  };
}

function migrateData(raw: SchoolData): SchoolData {
  const used: string[] = [];
  for (const s of raw.students ?? []) {
    if (s.portalPassword && !needsPasswordMigration(s.portalPassword)) {
      used.push(s.portalPassword);
    }
  }
  for (const t of raw.teachers ?? []) {
    if (t.portalPassword && !needsPasswordMigration(t.portalPassword)) {
      used.push(t.portalPassword);
    }
  }

  const students = (raw.students ?? []).map((s) => {
    if (!needsPasswordMigration(s.portalPassword)) return s;
    const portalPassword = generatePortalPassword(used);
    used.push(portalPassword);
    return { ...s, portalPassword };
  });
  const teachers = (raw.teachers ?? []).map((t) => {
    if (!needsPasswordMigration(t.portalPassword)) return t;
    const portalPassword = generatePortalPassword(used);
    used.push(portalPassword);
    return { ...t, portalPassword };
  });

  return {
    ...raw,
    students,
    teachers,
    results: (raw.results ?? []).map((r) => {
      const published = r.published ?? true;
      return {
        ...r,
        published,
        // Legacy published rows were already released; treat as submitted.
        submitted: r.submitted ?? published,
        classRank: r.classRank,
      };
    }),
  };
}

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SchoolData>(seedData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const wipeKey = "sow-wipe-junk-title-pupils-v1";
      const raw = localStorage.getItem(STORAGE_KEY);
      let next: SchoolData;

      if (raw) {
        const parsed = migrateData(JSON.parse(raw) as SchoolData);
        const before = parsed.students.length;
        const keep = parsed.students.filter((s) =>
          looksLikePersonName(fullName(s.firstName, s.lastName))
        );
        const removeIds = new Set(
          parsed.students.filter((s) => !keep.includes(s)).map((s) => s.id)
        );
        next = {
          ...parsed,
          students: keep,
          attendance: parsed.attendance.filter(
            (a) => !removeIds.has(a.studentId)
          ),
          results: parsed.results.filter((r) => !removeIds.has(r.studentId)),
          fees: parsed.fees.filter((f) => !removeIds.has(f.studentId)),
        };
        localStorage.setItem(wipeKey, "1");
        if (before > keep.length) {
          console.info(
            `[Seat of Wisdom] Removed ${before - keep.length} non-person import row(s).`
          );
        }
      } else {
        for (const key of PREV_STORAGE_KEYS) {
          localStorage.removeItem(key);
        }
        next = seedData;
        localStorage.setItem(wipeKey, "1");
      }

      // Keep a sample Primary 5 class available for demos / first visit.
      next = ensureSamplePrimary5(next);

      setData(next);
    } catch {
      setData(seedData);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  const resetData = useCallback(() => {
    setData(seedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  }, []);

  const addStudent = useCallback((student: Omit<Student, "id">) => {
    let created!: Student;
    setData((prev) => {
      const used = [
        ...prev.students.map((s) => s.portalPassword),
        ...prev.teachers.map((t) => t.portalPassword),
      ];
      created = {
        ...student,
        id: createId("stu"),
        portalPassword:
          student.portalPassword || generatePortalPassword(used),
      };
      return {
        ...prev,
        students: [created, ...prev.students],
      };
    });
    return created;
  }, []);

  const updateStudent = useCallback((id: string, student: Partial<Student>) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === id ? { ...s, ...student } : s)),
    }));
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
      attendance: prev.attendance.filter((a) => a.studentId !== id),
      results: prev.results.filter((r) => r.studentId !== id),
      fees: prev.fees.filter((f) => f.studentId !== id),
    }));
  }, []);

  const clearAllPupils = useCallback(() => {
    let removed = 0;
    setData((prev) => {
      removed = prev.students.length;
      return {
        ...prev,
        students: [],
        attendance: [],
        results: [],
        fees: [],
      };
    });
    return removed;
  }, []);

  const clearClassPupils = useCallback((classLevel: ClassLevel) => {
    let removed = 0;
    setData((prev) => {
      const keep = prev.students.filter((s) => s.classLevel !== classLevel);
      const removeIds = new Set(
        prev.students
          .filter((s) => s.classLevel === classLevel)
          .map((s) => s.id)
      );
      removed = removeIds.size;
      return {
        ...prev,
        students: keep,
        attendance: prev.attendance.filter((a) => !removeIds.has(a.studentId)),
        results: prev.results.filter((r) => !removeIds.has(r.studentId)),
        fees: prev.fees.filter((f) => !removeIds.has(f.studentId)),
      };
    });
    return removed;
  }, []);

  const addTeacher = useCallback((teacher: Omit<Teacher, "id">) => {
    setData((prev) => {
      const used = [
        ...prev.students.map((s) => s.portalPassword),
        ...prev.teachers.map((t) => t.portalPassword),
      ];
      return {
        ...prev,
        teachers: [
          {
            ...teacher,
            id: createId("tch"),
            portalPassword:
              teacher.portalPassword || generatePortalPassword(used),
          },
          ...prev.teachers,
        ],
      };
    });
  }, []);

  const updateTeacher = useCallback((id: string, teacher: Partial<Teacher>) => {
    setData((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) => (t.id === id ? { ...t, ...teacher } : t)),
    }));
  }, []);

  const deleteTeacher = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== id),
    }));
  }, []);

  const upsertAttendance = useCallback(
    (records: Array<Omit<AttendanceRecord, "id"> & { id?: string }>) => {
      setData((prev) => {
        const next = [...prev.attendance];
        for (const record of records) {
          const existingIndex = next.findIndex(
            (a) =>
              a.studentId === record.studentId &&
              a.date === record.date &&
              a.classLevel === record.classLevel
          );
          if (existingIndex >= 0) {
            next[existingIndex] = {
              ...next[existingIndex],
              ...record,
              id: next[existingIndex].id,
            };
          } else {
            next.unshift({ ...record, id: record.id ?? createId("att") });
          }
        }
        return { ...prev, attendance: next };
      });
    },
    []
  );

  const deleteAttendance = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      attendance: prev.attendance.filter((a) => a.id !== id),
    }));
  }, []);

  const addResult = useCallback(
    (result: Omit<ResultRecord, "id" | "grade" | "remark">) => {
      setData((prev) => ({
        ...prev,
        results: [withResultMeta(result), ...prev.results],
      }));
    },
    []
  );

  const updateResult = useCallback(
    (
      id: string,
      result: Partial<Omit<ResultRecord, "id" | "grade" | "remark">>
    ) => {
      setData((prev) => ({
        ...prev,
        results: prev.results.map((r) => {
          if (r.id !== id) return r;
          return withResultMeta({ ...r, ...result, id: r.id });
        }),
      }));
    },
    []
  );

  const deleteResult = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      results: prev.results.filter((r) => r.id !== id),
    }));
  }, []);

  const addFee = useCallback((fee: Omit<FeeRecord, "id" | "status">) => {
    setData((prev) => ({
      ...prev,
      fees: [withFeeMeta(fee), ...prev.fees],
    }));
  }, []);

  const updateFee = useCallback(
    (id: string, fee: Partial<Omit<FeeRecord, "id" | "status">>) => {
      setData((prev) => ({
        ...prev,
        fees: prev.fees.map((f) => {
          if (f.id !== id) return f;
          return withFeeMeta({ ...f, ...fee, id: f.id });
        }),
      }));
    },
    []
  );

  const recordPayment = useCallback((id: string, amount: number) => {
    setData((prev) => ({
      ...prev,
      fees: prev.fees.map((f) => {
        if (f.id !== id) return f;
        const amountPaid = Math.min(f.amount, f.amountPaid + amount);
        return withFeeMeta({
          ...f,
          amountPaid,
          lastPaymentDate: new Date().toISOString().slice(0, 10),
          id: f.id,
        });
      }),
    }));
  }, []);

  const deleteFee = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      fees: prev.fees.filter((f) => f.id !== id),
    }));
  }, []);

  const issueStudentPassword = useCallback((id: string) => {
    let password = "";
    setData((prev) => {
      const used = [
        ...prev.students.map((s) => s.portalPassword),
        ...prev.teachers.map((t) => t.portalPassword),
      ];
      password = generatePortalPassword(used);
      return {
        ...prev,
        students: prev.students.map((s) =>
          s.id === id ? { ...s, portalPassword: password } : s
        ),
      };
    });
    return password;
  }, []);

  const issueTeacherPassword = useCallback((id: string) => {
    let password = "";
    setData((prev) => {
      const used = [
        ...prev.students.map((s) => s.portalPassword),
        ...prev.teachers.map((t) => t.portalPassword),
      ];
      password = generatePortalPassword(used);
      return {
        ...prev,
        teachers: prev.teachers.map((t) =>
          t.id === id ? { ...t, portalPassword: password } : t
        ),
      };
    });
    return password;
  }, []);

  const issueClassPasswords = useCallback(
    (classLevel: ClassLevel) => {
      let issued: Array<{ id: string; name: string; password: string }> = [];
      setData((prev) => {
        const used = [
          ...prev.students.map((s) => s.portalPassword),
          ...prev.teachers.map((t) => t.portalPassword),
        ];
        const nextUsed = [...used];
        issued = prev.students
          .filter((s) => s.classLevel === classLevel && s.status === "Active")
          .map((s) => {
            const password = generatePortalPassword(nextUsed);
            nextUsed.push(password);
            return {
              id: s.id,
              name: fullName(s.firstName, s.lastName),
              password,
            };
          });
        const byId = Object.fromEntries(issued.map((i) => [i.id, i.password]));
        return {
          ...prev,
          students: prev.students.map((s) =>
            byId[s.id] ? { ...s, portalPassword: byId[s.id] } : s
          ),
        };
      });
      return issued;
    },
    []
  );

  const importClassNames = useCallback(
    (
      classLevel: ClassLevel,
      names:
        | string[]
        | Array<{
            fullName: string;
            firstName: string;
            lastName: string;
            gender?: "Male" | "Female";
          }>
    ) => {
      let created = 0;
      setData((prev) => {
        const nextStudents = [...prev.students];
        const used = [
          ...prev.students.map((s) => s.portalPassword),
          ...prev.teachers.map((t) => t.portalPassword),
        ];
        const nextUsed = [...used];
        let added = 0;
        for (const raw of names) {
          const isObj = typeof raw === "object" && raw !== null;
          const display = isObj ? raw.fullName.trim() : String(raw).trim();
          if (!display || !looksLikePersonName(display)) continue;

          const exists = nextStudents.some(
            (s) =>
              s.classLevel === classLevel &&
              normalizeName(fullName(s.firstName, s.lastName)) ===
                normalizeName(display)
          );
          if (exists) continue;

          const firstName = isObj
            ? raw.firstName.trim() || display
            : parseFullName(display).firstName;
          const lastName = isObj
            ? raw.lastName.trim()
            : parseFullName(display).lastName;
          const gender = isObj && raw.gender ? raw.gender : "Female";
          const portalPassword = generatePortalPassword(nextUsed);
          nextUsed.push(portalPassword);

          nextStudents.unshift({
            id: createId("stu"),
            admissionNo: `SOW/${new Date().getFullYear()}/${String(nextStudents.length + 1).padStart(3, "0")}`,
            firstName,
            lastName: lastName || firstName,
            gender,
            dateOfBirth: "",
            classLevel,
            guardianName: "",
            guardianPhone: "",
            email: "",
            address: "Afrancho, Kumasi",
            enrollmentDate: new Date().toISOString().slice(0, 10),
            status: "Active",
            portalPassword,
          });
          added += 1;
        }
        created = added;
        return { ...prev, students: nextStudents };
      });
      return created;
    },
    []
  );

  const importClassResults = useCallback(
    (
      classLevel: ClassLevel,
      rows: Array<{
        fullName: string;
        subject: string;
        caScore: number;
        examScore: number;
        term?: Term;
        session?: string;
      }>,
      teacherId?: string,
      publish = false
    ) => {
      let studentsCreated = 0;
      let resultsSaved = 0;
      setData((prev) => {
        let students = [...prev.students];
        let results = [...prev.results];
        const used = [
          ...prev.students.map((s) => s.portalPassword),
          ...prev.teachers.map((t) => t.portalPassword),
        ];
        const nextUsed = [...used];

        for (const row of rows) {
          if (!row.fullName?.trim() || !row.subject?.trim()) continue;
          let student = students.find(
            (s) =>
              s.classLevel === classLevel &&
              normalizeName(fullName(s.firstName, s.lastName)) ===
                normalizeName(row.fullName)
          );
          if (!student) {
            const { firstName, lastName } = parseFullName(row.fullName);
            const portalPassword = generatePortalPassword(nextUsed);
            nextUsed.push(portalPassword);
            student = {
              id: createId("stu"),
              admissionNo: `SOW/${new Date().getFullYear()}/${String(students.length + 1).padStart(3, "0")}`,
              firstName,
              lastName: lastName || firstName,
              gender: "Female",
              dateOfBirth: "",
              classLevel,
              guardianName: "",
              guardianPhone: "",
              email: "",
              address: "Afrancho, Kumasi",
              enrollmentDate: new Date().toISOString().slice(0, 10),
              status: "Active",
              portalPassword,
            };
            students = [student, ...students];
            studentsCreated += 1;
          }

          const term = row.term ?? "First Term";
          const session = row.session ?? "2025/2026";
          const existingIndex = results.findIndex(
            (r) =>
              r.studentId === student!.id &&
              r.subject === row.subject &&
              r.term === term &&
              r.session === session
          );
          const payload = withResultMeta({
            id: existingIndex >= 0 ? results[existingIndex].id : undefined,
            studentId: student.id,
            subject: row.subject,
            term,
            session,
            classLevel,
            caScore: Number(row.caScore) || 0,
            examScore: Number(row.examScore) || 0,
            submitted: publish,
            published: false,
            teacherId,
          });
          if (existingIndex >= 0) results[existingIndex] = payload;
          else results.unshift(payload);
          resultsSaved += 1;
        }

        return { ...prev, students, results };
      });
      return { studentsCreated, resultsSaved };
    },
    []
  );

  const saveTeacherResults = useCallback((results: ResultInput[]) => {
    setData((prev) => {
      const next = [...prev.results];
      for (const result of results) {
        const idx = next.findIndex(
          (r) =>
            r.studentId === result.studentId &&
            r.subject === result.subject &&
            r.term === result.term &&
            r.session === result.session
        );
        const payload = withResultMeta({
          ...result,
          id: idx >= 0 ? next[idx].id : result.id,
        });
        if (idx >= 0) next[idx] = payload;
        else next.unshift(payload);
      }
      return { ...prev, results: next };
    });
  }, []);

  const rankClassResults = useCallback(
    (classLevel: ClassLevel, term: Term, session: string) => {
      let count = 0;
      setData((prev) => {
        const eligible = prev.results.filter(
          (r) =>
            r.classLevel === classLevel &&
            r.term === term &&
            r.session === session &&
            (r.submitted || r.published)
        );
        const ranks = computeClassRanks(eligible);
        return {
          ...prev,
          results: prev.results.map((r) => {
            if (
              r.classLevel === classLevel &&
              r.term === term &&
              r.session === session &&
              (r.submitted || r.published)
            ) {
              count += 1;
              return {
                ...r,
                submitted: true,
                classRank: ranks.get(r.studentId),
              };
            }
            return r;
          }),
        };
      });
      return count;
    },
    []
  );

  const publishClassResults = useCallback(
    (classLevel: ClassLevel, term: Term, session: string) => {
      let count = 0;
      setData((prev) => {
        const eligible = prev.results.filter(
          (r) =>
            r.classLevel === classLevel &&
            r.term === term &&
            r.session === session &&
            r.submitted
        );
        const needsRank = eligible.some((r) => r.classRank == null);
        const ranks = needsRank ? computeClassRanks(eligible) : null;
        return {
          ...prev,
          results: prev.results.map((r) => {
            if (
              r.classLevel === classLevel &&
              r.term === term &&
              r.session === session &&
              r.submitted
            ) {
              count += 1;
              return {
                ...r,
                published: true,
                classRank: ranks?.get(r.studentId) ?? r.classRank,
              };
            }
            return r;
          }),
        };
      });
      return count;
    },
    []
  );

  const publishSubjectResults = useCallback(
    (
      classLevel: ClassLevel,
      subject: string,
      term: Term,
      session: string
    ) => {
      let count = 0;
      setData((prev) => {
        const eligible = prev.results.filter(
          (r) =>
            r.classLevel === classLevel &&
            r.term === term &&
            r.session === session &&
            r.submitted
        );
        const needsRank = eligible.some((r) => r.classRank == null);
        const ranks = needsRank ? computeClassRanks(eligible) : null;
        return {
          ...prev,
          results: prev.results.map((r) => {
            if (
              r.classLevel === classLevel &&
              r.subject === subject &&
              r.term === term &&
              r.session === session &&
              r.submitted
            ) {
              count += 1;
              return {
                ...r,
                published: true,
                classRank: ranks?.get(r.studentId) ?? r.classRank,
              };
            }
            return r;
          }),
        };
      });
      return count;
    },
    []
  );

  const authenticateStudent = useCallback(
    (classLevel: ClassLevel, name: string, password: string) => {
      const match = data.students.find(
        (s) =>
          s.classLevel === classLevel &&
          s.status === "Active" &&
          normalizeName(fullName(s.firstName, s.lastName)) === normalizeName(name) &&
          (s.portalPassword ?? "").toUpperCase() === password.trim().toUpperCase()
      );
      return match ?? null;
    },
    [data.students]
  );

  const authenticateTeacher = useCallback(
    (name: string, password: string) => {
      const match = data.teachers.find(
        (t) =>
          t.status === "Active" &&
          normalizeName(fullName(t.firstName, t.lastName)) === normalizeName(name) &&
          (t.portalPassword ?? "").toUpperCase() === password.trim().toUpperCase()
      );
      return match ?? null;
    },
    [data.teachers]
  );

  const value = useMemo<SchoolStore>(
    () => ({
      ...data,
      ready,
      resetData,
      addStudent,
      updateStudent,
      deleteStudent,
      clearAllPupils,
      clearClassPupils,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      upsertAttendance,
      deleteAttendance,
      addResult,
      updateResult,
      deleteResult,
      addFee,
      updateFee,
      recordPayment,
      deleteFee,
      issueStudentPassword,
      issueTeacherPassword,
      issueClassPasswords,
      importClassNames,
      importClassResults,
      saveTeacherResults,
      rankClassResults,
      publishClassResults,
      publishSubjectResults,
      authenticateStudent,
      authenticateTeacher,
    }),
    [
      data,
      ready,
      resetData,
      addStudent,
      updateStudent,
      deleteStudent,
      clearAllPupils,
      clearClassPupils,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      upsertAttendance,
      deleteAttendance,
      addResult,
      updateResult,
      deleteResult,
      addFee,
      updateFee,
      recordPayment,
      deleteFee,
      issueStudentPassword,
      issueTeacherPassword,
      issueClassPasswords,
      importClassNames,
      importClassResults,
      saveTeacherResults,
      rankClassResults,
      publishClassResults,
      publishSubjectResults,
      authenticateStudent,
      authenticateTeacher,
    ]
  );

  return (
    <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
  );
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) {
    throw new Error("useSchool must be used within SchoolProvider");
  }
  return ctx;
}
