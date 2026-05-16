export interface Student {
  id: string; // QR code content
  name: string;
  classId: string;
}

export interface Class {
  id: string;
  name: string;
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  score: number; // For partial credit (e.g. essays)
  studentAnswer: string;
  feedback?: string; // AI generated feedback for essays
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  testsCount: number;
}

export interface Test {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  questionsCount: number;
  createdAt: string;
}

export interface Question {
  id: string;
  testId: string;
  content: string;
  type: "single" | "multiple" | "short" | "true_false" | "essay";
  options?: string[]; // Optional for short/essay
  correctAnswer: string; // For essay, this might be a rubic or keywords
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  points?: number;
  mediaUrl?: string;
  mediaType?: "image" | "video";
}

export interface Session {
  id: string;
  subjectId: string;
  testId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  results: QuestionResult[];
  timeSpent: number; // in seconds
  date: string;
}

export interface Progress {
  totalAttempts: number;
  averageScore: number;
  streakDays: number;
  weakTopics: string[];
}

export interface AppSettings {
  theme: "light" | "dark";
  soundEnabled: boolean;
  autoSave: boolean;
  apiKey?: string;
  selectedModel: string;
}

export interface AppData {
  subjects: Subject[];
  tests: Test[];
  questions: Question[];
  sessions: Session[];
  students: Student[];
  classes: Class[];
  progress: Progress;
  settings: AppSettings;
}
