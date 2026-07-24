"use client";

import type { ClassLevel } from "./types";

const STUDENT_KEY = "sow-student-session";
const TEACHER_KEY = "sow-teacher-session";
const HEAD_KEY = "sow-head-session";

export type StudentSession = {
  studentId: string;
  classLevel: ClassLevel;
  name: string;
};

export type TeacherSession = {
  teacherId: string;
  name: string;
};

export function saveStudentSession(session: StudentSession) {
  sessionStorage.setItem(STUDENT_KEY, JSON.stringify(session));
}

export function getStudentSession(): StudentSession | null {
  try {
    const raw = sessionStorage.getItem(STUDENT_KEY);
    return raw ? (JSON.parse(raw) as StudentSession) : null;
  } catch {
    return null;
  }
}

export function clearStudentSession() {
  sessionStorage.removeItem(STUDENT_KEY);
}

export function saveTeacherSession(session: TeacherSession) {
  sessionStorage.setItem(TEACHER_KEY, JSON.stringify(session));
}

export function getTeacherSession(): TeacherSession | null {
  try {
    const raw = sessionStorage.getItem(TEACHER_KEY);
    return raw ? (JSON.parse(raw) as TeacherSession) : null;
  } catch {
    return null;
  }
}

export function clearTeacherSession() {
  sessionStorage.removeItem(TEACHER_KEY);
}

export function saveHeadSession() {
  sessionStorage.setItem(HEAD_KEY, "1");
}

export function hasHeadSession() {
  return sessionStorage.getItem(HEAD_KEY) === "1";
}

export function clearHeadSession() {
  sessionStorage.removeItem(HEAD_KEY);
}
