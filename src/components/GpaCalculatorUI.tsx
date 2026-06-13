import React, { useState, useMemo, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Course, GradeChar, ProcessedCourse, GRADE_SCALE_MAP, CurriculumCourse, DetailedGradeItem } from '../types/gpa';
import { calculateDTUGPA, calculateGpaSummary, calculateGpaTrend, calculateSemesterGpa, GpaTrendPoint, resolveRetakes } from '../utils/gpaCalculator';
import { 
  Plus, 
  Trash2, 
  GraduationCap, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  BookOpen, 
  Search, 
  Sparkles,
  Info,
  Layers,
  Calendar,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  List,
  FolderKanban,
  Pencil,
  Check,
  X,
  HelpCircle,
  MessageSquare,
  Mail,
  Paperclip,
  Upload,
  Download,
  Database,
  ClipboardList,
  Heart,
  Maximize2,
  Image as ImageIcon,
  Trophy,
  Medal,
  Star,
  Share2
} from 'lucide-react';

const K29_CMU_SE_PRESET: CurriculumCourse[] = [
  // ĐẠI CƯƠNG (56 TC)
  { courseCode: 'PHI 100', courseName: 'Phương Pháp Luận (gồm Nghiên Cứu Khoa Học)', credits: 2 },
  { courseCode: 'COM 141', courseName: 'Nói & Trình Bày (tiếng Việt)', credits: 1 },
  { courseCode: 'COM 142', courseName: 'Viết (tiếng Việt)', credits: 1 },
  { courseCode: 'CS 201', courseName: 'Tin Học Ứng Dụng', credits: 3 },
  { courseCode: 'MTH 204', courseName: 'Toán Cao Cấp A3 (LAB)', credits: 1 },
  { courseCode: 'MTH 103', courseName: 'Toán Cao Cấp A1', credits: 3 },
  { courseCode: 'MTH 104', courseName: 'Toán Cao Cấp A2', credits: 4 },
  { courseCode: 'MTH 203', courseName: 'Toán Cao Cấp A3', credits: 3 },
  { courseCode: 'PHY 101', courseName: 'Vật Lý Đại Cương 1', credits: 3 },
  { courseCode: 'CHE 101', courseName: 'Hóa Học Đại Cương', credits: 3 },
  { courseCode: 'LAW 201', courseName: 'Pháp Luật Đại Cương', credits: 2 },
  { courseCode: 'HIS 221', courseName: 'Lịch Sử Văn Minh Thế Giới 1', credits: 2 },
  { courseCode: 'EVR 205', courseName: 'Sức Khỏe Môi Trường', credits: 2 },
  { courseCode: 'DTE-IS 102', courseName: 'Hướng Nghiệp 1', credits: 1 },
  { courseCode: 'DTE-IS 152', courseName: 'Hướng Nghiệp 2', credits: 1 },
  { courseCode: 'PHI 150', courseName: 'Triết Học Marx - Lenin', credits: 3 },
  { courseCode: 'POS 151', courseName: 'Kinh Tế Chính Trị Marx - Lenin', credits: 2 },
  { courseCode: 'POS 351', courseName: 'Chủ Nghĩa Xã Hội Khoa Học', credits: 2 },
  { courseCode: 'HIS 362', courseName: 'Lịch Sử Đảng Cộng Sản Việt Nam', credits: 2 },
  { courseCode: 'IS-ENG 136', courseName: 'English for International School - Level 1', credits: 3 },
  { courseCode: 'IS-ENG 137', courseName: 'English for International School - Level 2', credits: 3 },
  { courseCode: 'IS-ENG 186', courseName: 'English for International School - Level 3', credits: 3 },
  { courseCode: 'IS-ENG 187', courseName: 'English for International School - Level 4', credits: 3 },
  { courseCode: 'IS-ENG 236', courseName: 'English for International School - Level 5', credits: 3 },

  // ĐẠI CƯƠNG NGÀNH & CHUYÊN NGÀNH (88 TC)
  { courseCode: 'CMU-SE 100', courseName: 'Introduction to Software Engineering', credits: 3 },
  { courseCode: 'CMU-CS 246', courseName: 'Application Development Practices', credits: 3 },
  { courseCode: 'STA 151', courseName: 'Lý Thuyết Xác Suất & Thống Kê Toán', credits: 3 },
  { courseCode: 'MTH 254', courseName: 'Toán Rời Rạc & Ứng Dụng', credits: 3 },
  { courseCode: 'CMU-CS 316', courseName: 'Fundamentals of Computing 2', credits: 3 },
  { courseCode: 'CS 211', courseName: 'Lập Trình Cơ Sở', credits: 4 },
  { courseCode: 'CMU-CS 311', courseName: 'Object-Oriented Programming C++', credits: 4 },
  { courseCode: 'IS 301', courseName: 'Cơ Sở Dữ Liệu', credits: 3 },
  { courseCode: 'CMU-CS 252', courseName: 'Introduction to Network & Telecommunications Technology', credits: 3 },
  { courseCode: 'CMU-CS 303', courseName: 'Fundamentals of Computing 1', credits: 3 },
  { courseCode: 'CMU-SE 214', courseName: 'Requirements Engineering', credits: 3 },
  { courseCode: 'CMU-SE 252', courseName: 'Computer Science for Practicing Engineers', credits: 3 },
  { courseCode: 'CMU-ENG 130', courseName: 'Anh Văn Chuyên Ngành cho Sinh Viên CMU 1', credits: 2 },
  { courseCode: 'CMU-ENG 230', courseName: 'Anh Văn Chuyên Ngành cho Sinh Viên CMU 2', credits: 2 },
  { courseCode: 'DTE-CS 231', courseName: 'Asia Community with IT', credits: 2 },
  { courseCode: 'CMU-CS 297', courseName: 'Đồ Án CDIO (Cơ sở)', credits: 1 },
  { courseCode: 'MTH 291', courseName: 'Toán Ứng Dụng cho Công Nghệ Thông Tin 1', credits: 3 },
  { courseCode: 'MTH 341', courseName: 'Toán Ứng Dụng cho Công Nghệ Thông Tin 2', credits: 3 },
  { courseCode: 'CMU-CS 445', courseName: 'System Integration Practices', credits: 3 },
  { courseCode: 'CMU-SE 445', courseName: 'Software Reuse & Integration', credits: 3 },
  { courseCode: 'CS 466', courseName: 'Perl & Python', credits: 2 },
  { courseCode: 'IS 385', courseName: 'Kỹ Thuật Thương Mại Điện Tử', credits: 3 },
  { courseCode: 'CS 464', courseName: 'Lập Trình Ứng Dụng .NET', credits: 3 },
  { courseCode: 'CMU-IS 401', courseName: 'Information System Applications', credits: 3 },
  { courseCode: 'CMU-SE 403', courseName: 'Software Architecture & Design', credits: 4 },
  { courseCode: 'CMU-IS 432', courseName: 'Software Project Management', credits: 3 },
  { courseCode: 'CMU-SE 433', courseName: 'Software Process & Quality Management', credits: 3 },
  { courseCode: 'CMU-SE 303', courseName: 'Software Testing (Verification & Validation)', credits: 3 },
  { courseCode: 'CMU-CS 462', courseName: 'Software Measurements & Analysis', credits: 3 },
  { courseCode: 'CMU-CS 447', courseName: 'Đồ Án CDIO (Chuyên ngành)', credits: 1 },
  { courseCode: 'CMU-SE 450', courseName: 'Capstone Project for Software Engineering 1', credits: 3 },
  { courseCode: 'CMU-SE 451', courseName: 'Capstone Project for Software Engineering 2', credits: 3 },

  // MÔN ĐIỀU KIỆN (Hiển thị để theo dõi nhưng tự động loại trừ khỏi tổng tích lũy mục tiêu 144 TC)
  { courseCode: 'ES 101', courseName: 'Chạy Ngắn & Bài Thể Dục Tay Không (GDTC 1)', credits: 1 },
  { courseCode: 'ES 226', courseName: 'Cầu Lông Sơ Cấp (GDTC 2)', credits: 1 },
  { courseCode: 'ES 276', courseName: 'Cầu Lông Nâng Cao (GDTC 3)', credits: 1 },
  { courseCode: 'ES 100', courseName: 'Giáo Dục Quốc Phòng & An Ninh', credits: 8 }
];

export function getDTUGradeCharFromScore(score: number): GradeChar {
  if (score >= 9.0) return 'A+';
  if (score >= 8.5) return 'A';
  if (score >= 8.0) return 'A-';
  if (score >= 7.5) return 'B+';
  if (score >= 7.0) return 'B';
  if (score >= 6.5) return 'B-';
  if (score >= 6.0) return 'C+';
  if (score >= 5.5) return 'C';
  if (score >= 5.0) return 'C-';
  if (score >= 4.0) return 'D';
  return 'F';
}

export function calculateDetailedScore(detailedGrades?: DetailedGradeItem[]) {
  if (!detailedGrades || detailedGrades.length === 0) return null;
  let totalWeight = 0;
  let weightedScoreSum = 0;
  let hasMissingScores = false;

  // Quy chế DTU: điểm thi cuối kỳ phải >= 1.0/10 mới được qua môn
  const FINAL_EXAM_KEYWORDS = ['cuối kỳ', 'cuối kì', 'cuoi ky', 'cuoi ki', 'thi cuối', 'thi cuoi', 'final', 'cuối học kỳ'];
  const finalExamItem = detailedGrades.find(item =>
    FINAL_EXAM_KEYWORDS.some(kw => item.name.toLowerCase().includes(kw))
  );

  const finalExamScoreRaw = finalExamItem?.score ?? null;

  // Điểm thi cuối kỳ được làm tròn đến 1 chữ số thập phân trước khi xét điều kiện dưới 1.0
  const finalExamScoreRounded = finalExamItem?.score !== null && finalExamItem?.score !== undefined
    ? Math.round(finalExamItem.score * 10) / 10
    : null;
  const finalExamFailed =
    finalExamScoreRounded !== null &&
    finalExamScoreRounded < 1.0;

  for (const item of detailedGrades) {
    totalWeight += item.weight;
    if (item.score !== null) {
      weightedScoreSum += item.score * (item.weight / 100);
    } else {
      hasMissingScores = true;
    }
  }

  const completedWeights = detailedGrades
    .filter(item => item.score !== null)
    .reduce((sum, item) => sum + item.weight, 0);

  if (completedWeights === 0) {
    return {
      score: 0,
      roundedScore: 0,
      hasMissingScores: true,
      finalExamFailed: false,
      finalExamScoreRaw: null,
      finalExamScore: null,
      totalWeight,
      completedWeights,
      currentWeightedSum: 0
    };
  }

  const currentWeightedSum = detailedGrades
    .filter(item => item.score !== null)
    .reduce((sum, item) => sum + item.score! * (item.weight / 100), 0);

  const overallScore = totalWeight > 0 ? (currentWeightedSum / (totalWeight / 100)) : 0;

  return {
    score: Math.round(overallScore * 100) / 100, // Điểm thực tế chưa làm tròn (2 chữ số thập phân)
    roundedScore: Math.round(overallScore * 10) / 10, // Điểm làm tròn hệ 10 (1 chữ số thập phân) theo quy chế DTU
    hasMissingScores,
    finalExamFailed,
    finalExamScoreRaw,
    finalExamScore: finalExamScoreRounded,
    totalWeight,
    completedWeights,
    currentWeightedSum: Math.round(currentWeightedSum * 100) / 100
  };
}

const SparkleIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
  </svg>
);

interface ShareTheme {
  id: string;
  name: string;
  previewClass: string;
  cardClass: string;
  pattern: React.ReactNode;
}

const SHARE_THEMES: ShareTheme[] = [
  {
    id: 'space',
    name: 'Giao Diện App',
    previewClass: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-pink-950',
    cardClass: 'bg-white border border-white/10 shadow-2xl',
    pattern: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0) 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <SparkleIcon className="absolute top-[18%] left-[20%] w-4 h-4 text-blue-700/40 animate-pulse" />
        <SparkleIcon className="absolute top-[32%] right-[15%] w-3 h-3 text-pink-400/50 animate-pulse" style={{ animationDelay: '300ms', animationDuration: '3s' }} />
        <SparkleIcon className="absolute bottom-[30%] left-[12%] w-5 h-5 text-white/30 animate-pulse" style={{ animationDelay: '600ms', animationDuration: '4s' }} />
        <SparkleIcon className="absolute bottom-[15%] right-[22%] w-3.5 h-3.5 text-indigo-300/40 animate-pulse" style={{ animationDelay: '900ms', animationDuration: '2.5s' }} />
        <svg className="absolute bottom-0 inset-x-0 w-full h-40 opacity-[0.05] text-white" viewBox="0 0 100 100" fill="currentColor">
          <path d="M0,80 C30,90 60,60 100,80 L100,100 L0,100 Z" />
          <path d="M0,60 C40,40 70,80 100,60 L100,100 L0,100 Z" opacity="0.5" />
        </svg>
      </div>
    )
  },
  {
    id: 'sunset',
    name: 'Hoàng Hôn Tím',
    previewClass: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900',
    cardClass: 'bg-[#1A0B1A] border border-white/10 shadow-2xl',
    pattern: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 right-10 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0) 70%)' }} />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0) 70%)' }} />
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }} />
        <svg className="absolute bottom-[-100px] left-1/2 transform -translate-x-1/2 w-80 h-80 opacity-[0.06] text-amber-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="50" cy="50" r="45" />
          <circle cx="50" cy="50" r="35" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="25" />
        </svg>
        <SparkleIcon className="absolute top-[12%] left-[15%] w-4.5 h-4.5 text-amber-300/30 animate-pulse" />
        <SparkleIcon className="absolute top-[28%] right-[18%] w-3 h-3 text-rose-300/40 animate-pulse" style={{ animationDelay: '400ms', animationDuration: '2.5s' }} />
        <SparkleIcon className="absolute bottom-[35%] left-[25%] w-5 h-5 text-amber-400/30 animate-pulse" style={{ animationDelay: '800ms', animationDuration: '3.5s' }} />
        <SparkleIcon className="absolute bottom-[22%] right-[12%] w-4 h-4 text-rose-400/30 animate-pulse" style={{ animationDelay: '1200ms', animationDuration: '4.5s' }} />
        <svg className="absolute bottom-0 inset-x-0 w-full h-48 opacity-[0.08] text-white" viewBox="0 0 100 100" fill="currentColor">
          <path d="M0,50 C30,75 70,25 100,50 L100,100 L0,100 Z" />
          <path d="M0,70 C40,90 60,50 100,70 L100,100 L0,100 Z" opacity="0.4" />
        </svg>
      </div>
    )
  },
  {
    id: 'aurora',
    name: 'Cực Quang',
    previewClass: 'bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-900',
    cardClass: 'bg-[#071915] border border-white/10 shadow-2xl',
    pattern: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0) 70%)' }} />
        <div className="absolute bottom-0 left-20 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0) 70%)' }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1.5px, transparent 1.5px), radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px'
        }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] text-green-700" viewBox="0 0 100 150" fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M-10,30 C30,70 70,10 110,50" />
          <path d="M-10,60 C40,20 60,100 110,60" strokeWidth="0.3" />
          <path d="M-10,90 C30,120 70,70 110,100" strokeWidth="0.2" />
        </svg>
        <SparkleIcon className="absolute top-[15%] left-[25%] w-4 h-4 text-green-700/40 animate-pulse" />
        <SparkleIcon className="absolute top-[8%] right-[20%] w-3.5 h-3.5 text-teal-300/50 animate-pulse" style={{ animationDelay: '500ms', animationDuration: '2s' }} />
        <SparkleIcon className="absolute bottom-[28%] right-[15%] w-5 h-5 text-white/30 animate-pulse" style={{ animationDelay: '1000ms', animationDuration: '3s' }} />
        <SparkleIcon className="absolute bottom-[18%] left-[18%] w-3 h-3 text-emerald-300/40 animate-pulse" style={{ animationDelay: '1500ms', animationDuration: '4s' }} />
      </div>
    )
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    previewClass: 'bg-gradient-to-br from-slate-900 via-purple-950 to-cyan-900',
    cardClass: 'bg-[#0F0C1B] border border-white/10 shadow-2xl',
    pattern: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0) 70%)' }} />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(217, 70, 239, 0.2) 0%, rgba(217, 70, 239, 0) 70%)' }} />
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }} />
        <svg className="absolute inset-4 opacity-15 text-cyan-400" viewBox="0 0 100 150" fill="none" stroke="currentColor" strokeWidth="0.8">
          <path d="M5,15 L5,5 L15,5" />
          <path d="M95,15 L95,5 L85,5" />
          <path d="M5,135 L5,145 L15,145" />
          <path d="M95,135 L95,145 L85,145" />
          <text x="8" y="12" fill="currentColor" fontSize="3" fontWeight="bold" opacity="0.6">SYS_ACT_v3.0</text>
          <text x="73" y="142" fill="currentColor" fontSize="3" fontWeight="bold" opacity="0.6">GRID_504</text>
        </svg>
        <svg className="absolute top-10 right-10 w-32 h-32 opacity-15 text-cyan-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="25" />
          <line x1="50" y1="5" x2="50" y2="95" strokeDasharray="2 2" />
          <line x1="5" y1="50" x2="95" y2="50" strokeDasharray="2 2" />
        </svg>
        <SparkleIcon className="absolute top-[20%] left-[15%] w-4 h-4 text-cyan-400/50 animate-pulse" />
        <SparkleIcon className="absolute top-[35%] right-[12%] w-3 h-3 text-fuchsia-400/60 animate-pulse" style={{ animationDelay: '400ms', animationDuration: '3s' }} />
        <SparkleIcon className="absolute bottom-[25%] left-[20%] w-5 h-5 text-cyan-300/40 animate-pulse" style={{ animationDelay: '800ms', animationDuration: '3.5s' }} />
        <SparkleIcon className="absolute bottom-[16%] right-[25%] w-3.5 h-3.5 text-fuchsia-300/50 animate-pulse" style={{ animationDelay: '1200ms', animationDuration: '2.5s' }} />
      </div>
    )
  },
  {
    id: 'ocean',
    name: 'Đại Dương',
    previewClass: 'bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900',
    cardClass: 'bg-[#050F1A] border border-white/10 shadow-2xl',
    pattern: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 right-0 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.18) 0%, rgba(34, 211, 238, 0) 70%)' }} />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0) 70%)' }} />
        <SparkleIcon className="absolute top-[10%] left-[12%] w-4.5 h-4.5 text-sky-300/40 animate-pulse" />
        <SparkleIcon className="absolute top-[30%] right-[22%] w-3 h-3 text-blue-300/50 animate-pulse" style={{ animationDelay: '300ms', animationDuration: '3.5s' }} />
        <SparkleIcon className="absolute bottom-[32%] left-[28%] w-5 h-5 text-cyan-300/30 animate-pulse" style={{ animationDelay: '700ms', animationDuration: '4s' }} />
        <SparkleIcon className="absolute bottom-[18%] right-[15%] w-4 h-4 text-sky-400/40 animate-pulse" style={{ animationDelay: '1100ms', animationDuration: '2.5s' }} />
        <svg className="absolute bottom-0 inset-x-0 w-full h-56 opacity-[0.09] text-white" viewBox="0 0 100 100" fill="currentColor">
          <path d="M0,30 C30,50 60,20 100,40 L100,100 L0,100 Z" />
          <path d="M0,50 C40,30 70,70 100,50 L100,100 L0,100 Z" opacity="0.6" />
          <path d="M0,70 C30,80 70,60 100,75 L100,100 L0,100 Z" opacity="0.3" />
        </svg>
      </div>
    )
  },
  {
    id: 'luxury',
    name: 'Hoàng Gia',
    previewClass: 'bg-gradient-to-br from-neutral-900 via-amber-950 to-yellow-900',
    cardClass: 'bg-[#14100C] border border-white/10 shadow-2xl',
    pattern: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, rgba(217, 119, 6, 0) 70%)' }} />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(234, 179, 8, 0.08) 0%, rgba(234, 179, 8, 0) 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 12px)'
        }} />
        <svg className="absolute inset-4 opacity-[0.08] text-amber-400" viewBox="0 0 100 150" fill="none" stroke="currentColor" strokeWidth="0.5">
          <rect x="2" y="2" width="96" height="146" rx="6" />
          <rect x="5" y="5" width="90" height="140" rx="4" strokeDasharray="2 2" />
        </svg>
        <svg className="absolute -bottom-20 -right-20 w-64 h-64 opacity-[0.08] text-amber-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
          <circle cx="50" cy="50" r="45" />
          <circle cx="50" cy="50" r="30" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="15" />
        </svg>
        <SparkleIcon className="absolute top-[14%] left-[18%] w-5 h-5 text-amber-500/50 animate-pulse" />
        <SparkleIcon className="absolute top-[28%] right-[24%] w-3.5 h-3.5 text-yellow-300/60 animate-pulse" style={{ animationDelay: '4500ms', animationDuration: '2.5s' }} />
        <SparkleIcon className="absolute bottom-[35%] left-[16%] w-4 h-4 text-amber-600/40 animate-pulse" style={{ animationDelay: '900ms', animationDuration: '3.5s' }} />
        <SparkleIcon className="absolute bottom-[20%] right-[18%] w-5 h-5 text-yellow-400/50 animate-pulse" style={{ animationDelay: '1350ms', animationDuration: '4.5s' }} />
      </div>
    )
  }
];

interface ShareCardContentProps {
  theme: ShareTheme;
  shareStudentName: string;
  hasGrades: boolean;
  cumulativeGpa: number;
  rawCumulativeGpa: number;
  gpaClassification: { name: string; color: string };
  accumulatedCredits: number;
  shareSlogan: string;
  isExport?: boolean;
  customBgImage?: string | null;
}

const ShareCardContent = ({
  theme,
  shareStudentName,
  hasGrades,
  cumulativeGpa,
  rawCumulativeGpa,
  gpaClassification,
  accumulatedCredits,
  shareSlogan,
  isExport = false,
  customBgImage = null
}: ShareCardContentProps) => {
  const nameLength = (shareStudentName.trim() || 'Nguyễn Văn A').length;
  let nameFontSizeClass = '';
  if (isExport) {
    if (nameLength > 20) nameFontSizeClass = 'text-3xl px-7 py-3 max-w-[540px]';
    else if (nameLength > 12) nameFontSizeClass = 'text-4xl px-9 py-4 max-w-[540px]';
    else nameFontSizeClass = 'text-5xl px-10 py-5 max-w-[540px]';
  } else {
    if (nameLength > 20) nameFontSizeClass = 'text-[11px] px-3 py-1.5 max-w-[270px]';
    else if (nameLength > 12) nameFontSizeClass = 'text-xs px-3.5 py-1.5 max-w-[270px]';
    else nameFontSizeClass = 'text-sm px-4 py-2 max-w-[270px]';
  }

  const getShareBadge = () => {
    const gpa = cumulativeGpa;
    if (!hasGrades) {
      return {
        icon: <Star className={isExport ? 'w-6 h-6 text-slate-350' : 'w-3.5 h-3.5 text-slate-350'} />,
        text: 'BẮT ĐẦU CHINH PHỤC',
        badgeClass: 'bg-slate-800/80 border-slate-700 text-slate-350',
        glowClass: ''
      };
    }
    if (gpa >= 3.6) {
      return {
        icon: <Trophy className={isExport ? 'w-6 h-6 text-amber-950 animate-bounce' : 'w-3.5 h-3.5 text-amber-950'} />,
        text: 'DANH HIỆU THỦ KHOA 👑',
        badgeClass: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border-amber-300 text-slate-950 font-black',
        glowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.45)]'
      };
    }
    if (gpa >= 3.2) {
      return {
        icon: <Medal className={isExport ? 'w-6 h-6 text-white' : 'w-3.5 h-3.5 text-white'} />,
        text: 'SINH VIÊN TIÊU BIỂU 🌟',
        badgeClass: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 border-indigo-400 text-white font-extrabold',
        glowClass: 'shadow-[0_0_25px_rgba(99,102,241,0.45)]'
      };
    }
    if (gpa >= 2.5) {
      return {
        icon: <Sparkles className={isExport ? 'w-6 h-6 text-white' : 'w-3.5 h-3.5 text-white'} />,
        text: 'NỖ LỰC VƯỢT TRỘI ⚡',
        badgeClass: 'bg-gradient-to-r from-teal-500 to-emerald-600 border-teal-400 text-white font-extrabold',
        glowClass: 'shadow-[0_0_20px_rgba(20,184,166,0.35)]'
      };
    }
    if (gpa >= 2.0) {
      return {
        icon: <Star className={isExport ? 'w-6 h-6 text-white' : 'w-3.5 h-3.5 text-white'} />,
        text: 'TỰ TIN BỨT PHÁ 🚀',
        badgeClass: 'bg-gradient-to-r from-orange-500 to-amber-600 border-orange-400 text-white font-extrabold',
        glowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.35)]'
      };
    }
    return {
      icon: <Sparkles className={isExport ? 'w-6 h-6 text-white' : 'w-3.5 h-3.5 text-white'} />,
      text: 'QUYẾT TÂM CẢI THIỆN 💪',
      badgeClass: 'bg-gradient-to-r from-rose-500 to-red-650 border-rose-450 text-white font-extrabold',
      glowClass: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]'
    };
  };

  const badge = getShareBadge();
  const cleanedCardClass = isExport ? theme.cardClass.replace('shadow-2xl', '') : theme.cardClass;

  return (
    <div 
      className={`relative select-none flex flex-col justify-between flex-shrink-0 overflow-hidden ${cleanedCardClass} ${
        isExport ? 'w-[640px] h-[1136px] p-12 rounded-[36px]' : 'w-[360px] h-[640px] p-7 rounded-2xl'
      }`}
      style={{ 
        backgroundImage: theme.id === 'custom' && customBgImage ? `url(${customBgImage})` : undefined,
        backgroundSize: theme.id === 'custom' && customBgImage ? 'cover' : undefined,
        backgroundPosition: theme.id === 'custom' && customBgImage ? 'center' : undefined,
        fontFamily: "'Plus Jakarta Sans', sans-serif" 
      }}
    >
      <div className="absolute inset-0 bg-white/5 opacity-40 pointer-events-none z-[3]" />

      {theme.id === 'custom' && (
        <>
          <div className="absolute inset-0 bg-slate-950/35 z-[2] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/80 z-[2] pointer-events-none" />
        </>
      )}

      {theme.id !== 'custom' && theme.pattern}

      <div className={`flex justify-between items-center border-b border-white/10 z-10 ${
        isExport ? 'pb-5' : 'pb-3'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`bg-white/10 rounded-lg text-indigo-300 border border-white/10 flex items-center justify-center ${
            isExport ? 'p-2' : 'p-1'
          }`}>
            <GraduationCap className={isExport ? 'w-6 h-6' : 'w-4 h-4'} />
          </span>
          <span className={`font-black text-white/95 tracking-widest uppercase whitespace-nowrap ${
            isExport ? 'text-sm' : 'text-[9px]'
          }`}>DTU EXCELLENCE CARD</span>
        </div>
        <span className={`rounded-full bg-white/10 text-amber-400 font-extrabold border border-amber-500/25 uppercase whitespace-nowrap ${
          isExport ? 'text-xs px-4 py-1.5' : 'text-[8px] px-2.5 py-0.5'
        }`}>
          🏆 BẢNG VÀNG
        </span>
      </div>

      <div className={`flex-grow flex flex-col justify-center items-center z-10 ${
        isExport ? 'py-8' : 'py-4'
      }`}>
        <div className={`w-full backdrop-blur-lg bg-slate-950/45 border border-white/10 rounded-[24px] shadow-2xl flex flex-col items-center justify-around ${
          isExport ? 'p-10 min-h-[720px] gap-8 rounded-[36px]' : 'p-5 min-h-[400px] gap-4'
        }`}>
          
          <div className="space-y-1.5 w-full flex flex-col items-center">
            <span className={`font-bold text-indigo-300 tracking-widest block uppercase whitespace-nowrap ${
              isExport ? 'text-xs' : 'text-[8px]'
            }`}>BẢNG VÀNG GPA SINH VIÊN</span>
            <h4 className={`font-black text-white tracking-tight bg-gradient-to-r from-white/10 via-white/15 to-white/10 border border-white/15 rounded-2xl inline-block text-center whitespace-nowrap shadow-lg ${nameFontSizeClass}`}>
              {shareStudentName.trim() || 'Nguyễn Văn A'}
            </h4>
          </div>

          <div className={`relative rounded-full flex flex-col justify-center items-center bg-gradient-to-b from-white/5 to-white/0 border border-white/15 shadow-[0_0_35px_rgba(99,102,241,0.2)] ${
            isExport ? 'w-72 h-72' : 'w-36 h-36'
          }`}>
            <div className={`absolute rounded-full border border-dashed border-indigo-400/20 ${
              isExport ? 'inset-4 animate-spin-slow' : 'inset-1.5 animate-spin-slow'
            }`} style={{ animationDuration: '30s' }}></div>
            <div className={`absolute rounded-full border border-indigo-500/10 animate-spin-slow ${
              isExport ? 'w-[320px] h-[320px]' : 'w-[160px] h-[160px]'
            }`} style={{ borderStyle: 'dashed', animationDuration: '45s', animationDirection: 'reverse' }}></div>
            
            <span className={`font-black tracking-tighter leading-none ${
              isExport ? 'text-[84px]' : 'text-[42px]'
            } ${
              hasGrades && cumulativeGpa >= 3.6 
                ? 'bg-clip-text text-transparent bg-gradient-to-r from-yellow-250 via-amber-300 to-yellow-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]'
                : hasGrades && cumulativeGpa >= 3.2
                ? 'bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-400'
                : 'text-white'
            }`}>
              {hasGrades ? cumulativeGpa.toFixed(2) : '--'}
            </span>
            <span className={`text-slate-300 font-bold ${
              isExport ? 'text-sm mt-2' : 'text-[8px] mt-0.5'
            }`}>GPA TÍCH LŨY</span>
            <span className={`text-slate-400/80 ${
              isExport ? 'text-xs' : 'text-[7px]'
            }`}>Thang điểm 4.00</span>
          </div>

          <div className={`w-full grid grid-cols-2 gap-4 ${
            isExport ? 'max-w-[440px] gap-6' : 'max-w-[240px] gap-2.5'
          }`}>
            <div className={`bg-white/5 border border-white/10 rounded-xl text-center flex flex-col justify-center items-center ${
              isExport ? 'p-4 space-y-1 rounded-2xl' : 'p-2 space-y-0.5'
            }`}>
              <span className={`text-slate-400 font-extrabold uppercase tracking-wider block ${
                isExport ? 'text-xs' : 'text-[7px]'
              }`}>
                🏆 Xếp Loại
              </span>
              <span className={`font-extrabold block mt-0.5 ${
                isExport ? 'text-lg' : 'text-xs'
              } ${
                hasGrades && cumulativeGpa >= 3.6 
                  ? 'text-yellow-400'
                  : hasGrades && cumulativeGpa >= 3.2
                  ? 'text-indigo-300'
                  : 'text-white'
              }`}>
                {gpaClassification.name}
              </span>
            </div>

            <div className={`bg-white/5 border border-white/10 rounded-xl text-center flex flex-col justify-center items-center ${
              isExport ? 'p-4 space-y-1 rounded-2xl' : 'p-2 space-y-0.5'
            }`}>
              <span className={`text-slate-400 font-extrabold uppercase tracking-wider block ${
                isExport ? 'text-xs' : 'text-[7px]'
              }`}>
                📚 Tín Chỉ Đạt
              </span>
              <span className={`font-extrabold text-white block mt-0.5 ${
                isExport ? 'text-lg' : 'text-xs'
              }`}>
                {accumulatedCredits} TC
              </span>
            </div>
          </div>

          {hasGrades && (
            <div className={`font-extrabold flex items-center justify-center border rounded-full tracking-wider uppercase transition-all duration-300 hover:scale-105 ${badge.badgeClass} ${badge.glowClass} ${
              isExport ? 'px-8 py-3 gap-2.5 text-sm shadow-lg' : 'px-4.5 py-1.5 gap-1.5 text-[8px]'
            }`}>
              {badge.icon}
              <span>{badge.text}</span>
            </div>
          )}

        </div>
      </div>

      <div className={`border-t border-white/10 flex items-center justify-between gap-2 z-10 w-full ${
        isExport ? 'pt-5' : 'pt-3'
      }`}>
        <div className="text-left space-y-1 flex-grow">
          <p className={`leading-tight text-white/95 font-medium italic whitespace-normal drop-shadow-sm ${
            isExport ? 'text-sm max-w-[420px]' : 'text-[9px] max-w-[180px]'
          }`}>
            "{shareSlogan}"
          </p>
          <span className={`text-slate-400/80 block font-bold ${
            isExport ? 'text-xs' : 'text-[7px]'
          }`}>
            Phát triển bởi levanthang.dev
          </span>
        </div>
        
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <div className={`bg-white rounded shadow-md flex items-center justify-center p-0.5 ${
            isExport ? 'p-1.5 w-[76px] h-[76px]' : 'w-[40px] h-[40px]'
          }`}>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://tinhdiem-dtu-six.vercel.app/&color=0f172a&bgcolor=ffffff" 
              alt="App QR" 
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <span className={`font-black text-indigo-400 tracking-wider uppercase ${
            isExport ? 'text-[7px]' : 'text-[5.5px]'
          }`}>Tính Điểm GPA</span>
        </div>
      </div>
    </div>
  );
};

interface GpaCalculatorUIProps {
  initialCourses: Course[];
  onCoursesChange?: (courses: Course[]) => void;
}

export default function GpaCalculatorUI({ initialCourses, onCoursesChange }: GpaCalculatorUIProps) {
  // 1. State quản lý danh sách môn học (Nạp từ LocalStorage nếu có, tự động chuẩn hóa dữ liệu cũ tránh crash)
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const savedCourses = localStorage.getItem('dtu_gpa_courses');
      if (savedCourses) {
        const parsed = JSON.parse(savedCourses);
        if (Array.isArray(parsed)) {
          // Chuẩn hóa dữ liệu cũ (Data Migration): nếu thiếu year/sem thì bổ sung mặc định
          return parsed.map((course: any) => ({
            ...course,
            academicYear: course.academicYear || '2025-2026',
            semester: course.semester || 'Học kỳ 1'
          }));
        }
      }
    } catch (e) {
      console.error('Lỗi khi nạp dữ liệu môn học từ localStorage:', e);
    }
    return initialCourses;
  });

  // Tạo động danh sách Năm học từ năm hiện tại trở lại 6 năm trước
  const academicYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const options: string[] = [];
    // Phát sinh các năm học từ currentYear + 1 trở về trước
    for (let year = currentYear + 1; year >= currentYear - 5; year--) {
      options.push(`${year - 1}-${year}`);
    }
    return options;
  }, []);

  // State quản lý danh sách năm học tùy chỉnh do người dùng thêm vào
  const [customYears, setCustomYears] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dtu_gpa_custom_years');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [];
  });

  // Lưu trữ năm học tùy chỉnh vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dtu_gpa_custom_years', JSON.stringify(customYears));
    } catch (e) {}
  }, [customYears]);

  // Hợp nhất năm học mặc định và năm học tự thêm
  const yearOptions = useMemo(() => {
    const combined = [...academicYearOptions, ...customYears];
    return Array.from(new Set(combined)).sort((a, b) => b.localeCompare(a));
  }, [academicYearOptions, customYears]);

  // 2. State quản lý Form nhập liệu
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('dtu_gpa_form_credits');
      if (saved) {
        const parsed = parseInt(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch (e) {}
    return 3;
  });
  const [gradeChar, setGradeChar] = useState<GradeChar>(() => {
    try {
      const saved = localStorage.getItem('dtu_gpa_form_grade');
      if (saved) return saved as GradeChar;
    } catch (e) {}
    return 'B';
  });
  const [isConditionCourse, setIsConditionCourse] = useState(false);
  const [isRetake, setIsRetake] = useState(false);
  const [replacesCourseId, setReplacesCourseId] = useState<string | null>(null);
  
  // State quản lý Smart Paste
  const [addMode, setAddMode] = useState<'manual' | 'smart_paste'>('manual');
  const [smartPasteText, setSmartPasteText] = useState('');
  const [smartPasteStatus, setSmartPasteStatus] = useState<{message: string; type: 'idle' | 'success' | 'error'}>({message: '', type: 'idle'});
  
  // Mặc định chọn năm học và học kỳ hiện hành
  const [academicYear, setAcademicYear] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('dtu_gpa_form_year');
      if (saved) return saved;
    } catch (e) {}
    return academicYearOptions[1] || '2025-2026';
  });
  const [semester, setSemester] = useState<'Học kỳ 1' | 'Học kỳ 2' | 'Học kỳ Hè'>(() => {
    try {
      const saved = localStorage.getItem('dtu_gpa_form_semester');
      if (saved) return saved as 'Học kỳ 1' | 'Học kỳ 2' | 'Học kỳ Hè';
    } catch (e) {}
    return 'Học kỳ 1';
  });

  // State điều khiển tổng tín chỉ tốt nghiệp mục tiêu (Nạp từ LocalStorage nếu có)
  const [targetCredits, setTargetCredits] = useState<number>(() => {
    try {
      const savedTarget = localStorage.getItem('dtu_gpa_target_credits');
      if (savedTarget) {
        const parsed = parseInt(savedTarget);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi nạp targetCredits từ localStorage:', e);
    }
    return 144;
  });

  const [isEditingTargetCredits, setIsEditingTargetCredits] = useState(false);
  const [tempTargetCredits, setTempTargetCredits] = useState<number | ''>(targetCredits);

  // Đồng bộ Form State vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dtu_gpa_form_year', academicYear);
    } catch (e) {}
  }, [academicYear]);

  useEffect(() => {
    try {
      localStorage.setItem('dtu_gpa_form_semester', semester);
    } catch (e) {}
  }, [semester]);

  useEffect(() => {
    try {
      localStorage.setItem('dtu_gpa_form_credits', credits.toString());
    } catch (e) {}
  }, [credits]);

  useEffect(() => {
    try {
      localStorage.setItem('dtu_gpa_form_grade', gradeChar);
    } catch (e) {}
  }, [gradeChar]);

  useEffect(() => {
    setTempTargetCredits(targetCredits);
  }, [targetCredits]);

  // State điều khiển chế độ hiển thị danh sách: 'grouped' (Phân nhóm học kỳ), 'flat' (Tất cả phẳng) hoặc 'curriculum' (Đối chiếu Tiến độ Khung)
  const [viewMode, setViewMode] = useState<'grouped' | 'flat' | 'curriculum'>('grouped');
  
  // State điều khiển trạng thái đóng/mở của các thẻ Học kỳ (Accordion)
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({});

  // State điều khiển thanh tìm kiếm/lọc môn học
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'accumulated' | 'condition' | 'replaced'>('all');

  // State quản lý bộ giả lập GPA mục tiêu
  const [simulatorTargetGpa, setSimulatorTargetGpa] = useState<number>(3.20);
  const [simulatorRemainingCredits, setSimulatorRemainingCredits] = useState<number | ''>(30);
  const [isCustomTarget, setIsCustomTarget] = useState(false);
  const [customTargetGpa, setCustomTargetGpa] = useState('3.50');
  const [isRemainingCreditsEdited, setIsRemainingCreditsEdited] = useState(false);

  // State quản lý Modal Cảnh báo (Xóa toàn bộ/Xóa học kỳ)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận xóa',
    onConfirm: () => {}
  });

  // State quản lý Khung chương trình (Curriculum)
  const [curriculumCourses, setCurriculumCourses] = useState<CurriculumCourse[]>(() => {
    try {
      const saved = localStorage.getItem('dtu_gpa_curriculum');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Lỗi khi nạp khung chương trình từ localStorage:', e);
    }
    return [];
  });
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [showCurriculumGuide, setShowCurriculumGuide] = useState(false);
  const [curriculumInputText, setCurriculumInputText] = useState('');
  
  useEffect(() => {
    if (!isCurriculumModalOpen) {
      setShowCurriculumGuide(false);
    }
  }, [isCurriculumModalOpen]);

  const [isCurriculumMerge, setIsCurriculumMerge] = useState(() => {
    try {
      return localStorage.getItem('dtu_gpa_curriculum_merge') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dtu_gpa_curriculum_merge', isCurriculumMerge.toString());
    } catch (e) {}
  }, [isCurriculumMerge]);

  // State quản lý sửa môn học trong bảng điểm (Transcript Edit Inline)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseName, setEditCourseName] = useState('');
  const [editCredits, setEditCredits] = useState<number | ''>(3);

  // State quản lý Modal Hướng dẫn (Help Modal)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // State quản lý Modal Giải thích GPA chi tiết
  const [isGpaDetailModalOpen, setIsGpaDetailModalOpen] = useState(false);

  // State quản lý Modal Đồng hành cùng dự án (Support Modal)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // State quản lý Modal Khoe Kết Quả (Share Card Modal)
  const [isShareCardModalOpen, setIsShareCardModalOpen] = useState(false);
  const [shareStudentName, setShareStudentName] = useState('Nguyễn Văn A');
  const [selectedThemeId, setSelectedThemeId] = useState('space');
  const [isCardZoomed, setIsCardZoomed] = useState(false);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  // State hỗ trợ lưu ảnh cho các thiết bị di động
  const [downloadedImageUrl, setDownloadedImageUrl] = useState<string | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);

  // State quản lý Điểm Rèn Luyện (ĐRL) để đánh giá học bổng
  const [trainingScore, setTrainingScore] = useState<number | ''>(() => {
    try {
      const saved = localStorage.getItem('dtu_gpa_training_score');
      return saved ? parseInt(saved) || 80 : 80;
    } catch (e) {
      return 80;
    }
  });
  const [scholarshipScope, setScholarshipScope] = useState<string>(() => {
    try {
      const savedCourses = localStorage.getItem('dtu_gpa_courses');
      let parsed: any[] = [];
      if (savedCourses) {
        parsed = JSON.parse(savedCourses);
      }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        parsed = initialCourses || [];
      }
      if (parsed.length > 0) {
        const years = Array.from(new Set(parsed.map((c: any) => c.academicYear).filter(Boolean)))
          .sort((a, b) => b.localeCompare(a));
        if (years.length > 0) {
          return `year:${years[0]}`;
        }
      }
    } catch (e) {
      console.error('Lỗi thiết lập năm học mặc định cho học bổng:', e);
    }
    return 'cumulative';
  });

  // Lưu ĐRL vào localStorage khi thay đổi
  useEffect(() => {
    try {
      if (trainingScore !== '') {
        localStorage.setItem('dtu_gpa_training_score', trainingScore.toString());
      }
    } catch (e) {}
  }, [trainingScore]);

  // Phân loại điểm rèn luyện (ĐRL)
  const getTrainingClassification = (score: number) => {
    if (score >= 90) return { name: 'Xuất sắc', color: 'text-green-700 bg-green-50 border-green-100' };
    if (score >= 80) return { name: 'Tốt', color: 'text-blue-700 bg-blue-50 border-blue-100' };
    if (score >= 70) return { name: 'Khá', color: 'text-teal-700 bg-teal-50 border-teal-100' };
    if (score >= 50) return { name: 'Trung bình', color: 'text-amber-700 bg-amber-50 border-amber-100' };
    if (score >= 30) return { name: 'Yếu', color: 'text-rose-700 bg-rose-50 border-rose-100' };
    return { name: 'Kém', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  };

  // Tính mức học bổng xét duyệt dự kiến
  const getScholarshipStatus = (gpa: number, drl: number, hasGradesData: boolean, hasFailedCourse: boolean = false, isCumulative: boolean = false) => {
    if (!hasGradesData) {
      return { 
        status: 'Chưa có điểm', 
        desc: 'Nhập điểm học tập để bắt đầu xét học bổng.', 
        color: 'from-slate-50 to-slate-100 border-slate-200 text-slate-500 shadow-sm' 
      };
    }
    if (hasFailedCourse) {
      return {
        status: 'Không đạt học bổng',
        desc: 'Có môn học bị điểm F (Trượt môn) trong phạm vi xét duyệt nên không đủ điều kiện nhận học bổng.',
        color: 'from-rose-50 to-rose-100 border-rose-200 text-rose-700 shadow-sm shadow-rose-100/50'
      };
    }

    // Xác định ngưỡng điểm theo phạm vi (Tích lũy toàn khóa dùng mốc tốt nghiệp, Năm học dùng mốc học lực năm của DTU)
    const minGpa = isCumulative ? 2.50 : 2.68;
    const gioiGpa = isCumulative ? 3.20 : 3.34;
    const xuatsacGpa = isCumulative ? 3.60 : 3.68;

    if (gpa < minGpa || drl < 70) {
      let desc = '';
      if (gpa < minGpa && drl < 70) desc = `GPA học lực dưới ${minGpa} và ĐRL dưới 70 không đủ tiêu chí xét học bổng.`;
      else if (gpa < minGpa) desc = `GPA học lực của bạn dưới ${minGpa} không đạt yêu cầu học lực (tối thiểu ${minGpa}).`;
      else desc = 'Điểm rèn luyện của bạn dưới 70 không đạt yêu cầu hạnh kiểm (tối thiểu 70).';
      return { 
        status: 'Không đạt học bổng', 
        desc, 
        color: 'from-rose-50 to-rose-100 border-rose-200 text-rose-700 shadow-sm shadow-rose-100/50' 
      };
    }

    // Xác định mức đạt của từng phần
    let gpaTier = 'Khá';
    if (gpa >= xuatsacGpa) gpaTier = 'Xuất sắc';
    else if (gpa >= gioiGpa) gpaTier = 'Giỏi';

    let drlTier = 'Khá';
    if (drl >= 90) drlTier = 'Xuất sắc';
    else if (drl >= 80) drlTier = 'Giỏi';

    if (gpaTier === 'Xuất sắc' && drlTier === 'Xuất sắc') {
      return {
        status: 'Học bổng loại Xuất sắc 🏆',
        desc: `Tuyệt vời! Cả GPA (Xuất sắc ≥ ${xuatsacGpa}) và ĐRL (Xuất sắc ≥ 90) đều đạt tiêu chuẩn học bổng cao nhất.`,
        color: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800 shadow-sm shadow-emerald-100/50'
      };
    }

    if (gpaTier === 'Xuất sắc' && drlTier === 'Giỏi') {
      return {
        status: 'Học bổng loại Giỏi 🥈',
        desc: `GPA học lực đạt Xuất sắc (≥ ${xuatsacGpa}), nhưng ĐRL xếp loại Tốt (80-89) nên chỉ đạt mức Học bổng loại Giỏi.`,
        color: 'from-blue-50 to-blue-100 border-blue-200 text-blue-800 shadow-sm shadow-blue-100/50'
      };
    }

    if (gpaTier === 'Giỏi' && drlTier === 'Xuất sắc') {
      return {
        status: 'Học bổng loại Giỏi 🥈',
        desc: `ĐRL rèn luyện đạt Xuất sắc, nhưng GPA xếp loại Giỏi (${gioiGpa.toFixed(2)}-${(xuatsacGpa - 0.01).toFixed(2)}) nên chỉ đạt mức Học bổng loại Giỏi.`,
        color: 'from-blue-50 to-blue-100 border-blue-200 text-blue-800 shadow-sm shadow-blue-100/50'
      };
    }

    if (gpaTier === 'Giỏi' && drlTier === 'Giỏi') {
      return {
        status: 'Học bổng loại Giỏi 🥈',
        desc: `Tốt! Cả GPA (Giỏi ≥ ${gioiGpa}) và ĐRL (Tốt ≥ 80) đều đạt điều kiện xét Học bổng loại Giỏi.`,
        color: 'from-blue-50 to-blue-100 border-blue-200 text-blue-800 shadow-sm shadow-blue-100/50'
      };
    }

    // Học bổng Khá
    let limitDesc = 'Đạt điều kiện xét Học bổng loại Khá.';
    if (gpaTier !== 'Khá' || drlTier !== 'Khá') {
      if (gpaTier === 'Khá') {
        limitDesc = `ĐRL đạt mức ${drlTier}, nhưng GPA đạt Khá (${minGpa.toFixed(2)}-${(gioiGpa - 0.01).toFixed(2)}) nên bị giới hạn xét Học bổng loại Khá.`;
      } else {
        limitDesc = `GPA đạt mức ${gpaTier}, nhưng ĐRL chỉ đạt Khá (70-79) nên bị giới hạn xét Học bổng loại Khá.`;
      }
    }
    return {
      status: 'Học bổng loại Khá 🥉',
      desc: limitDesc,
      color: 'from-teal-50 to-teal-100 border-teal-200 text-teal-800 shadow-sm shadow-teal-100/50'
    };
  };

  const activeShareTheme = useMemo(() => {
    if (selectedThemeId === 'custom') {
      return {
        id: 'custom',
        name: 'Nền Tự Chọn',
        previewClass: '',
        cardClass: 'bg-slate-900 border border-white/10 shadow-2xl',
        pattern: (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
          </div>
        )
      };
    }
    return SHARE_THEMES.find(t => t.id === selectedThemeId) || SHARE_THEMES[0];
  }, [selectedThemeId]);

  // Responsive scaling states and refs for preview and lightbox card scaling
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.55);
  const lightboxContainerRef = useRef<HTMLDivElement>(null);
  const [lightboxScale, setLightboxScale] = useState(0.8);

  // ResizeObserver to dynamically scale the preview card to fit its container height
  useEffect(() => {
    if (!isShareCardModalOpen) return;
    const handleResize = () => {
      if (previewContainerRef.current) {
        const rect = previewContainerRef.current.getBoundingClientRect();
        const scale = Math.min(rect.width / 360, rect.height / 640);
        setPreviewScale(scale > 0 ? scale : 0.55);
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (previewContainerRef.current) {
      observer.observe(previewContainerRef.current);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isShareCardModalOpen]);

  // ResizeObserver to dynamically scale the lightbox card to fit its container height
  useEffect(() => {
    if (!isCardZoomed) return;
    const handleResize = () => {
      if (lightboxContainerRef.current) {
        const rect = lightboxContainerRef.current.getBoundingClientRect();
        const scale = Math.min(rect.width / 360, rect.height / 640);
        setLightboxScale(scale > 0 ? scale : 0.8);
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (lightboxContainerRef.current) {
      observer.observe(lightboxContainerRef.current);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isCardZoomed]);

  // State quản lý gợi ý nhập tín chỉ lần đầu tiên
  const [showCreditsHint, setShowCreditsHint] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dtu_gpa_dismissed_credits_hint');
      return saved !== 'true';
    } catch (e) {
      return true;
    }
  });

  // State quản lý Bottom Sheet Drawer trên Mobile
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [mobileDrawerTab, setMobileDrawerTab] = useState<'add' | 'simulator' | 'detailed'>('add');

  // State quản lý xem dữ liệu hiện tại có phải là dữ liệu ví dụ mẫu hay không
  const [isMockDataLoaded, setIsMockDataLoaded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dtu_gpa_is_mock') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Đồng bộ trạng thái isMockDataLoaded vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dtu_gpa_is_mock', isMockDataLoaded.toString());
    } catch (e) {}
  }, [isMockDataLoaded]);

  // State quản lý tính điểm chi tiết môn học (Sidebar)
  const [selectedDetailedCourse, setSelectedDetailedCourse] = useState<Course | null>(null);
  const [tempDetailedGrades, setTempDetailedGrades] = useState<DetailedGradeItem[]>([]);
  const [sandboxDetailedGrades, setSandboxDetailedGrades] = useState<DetailedGradeItem[]>([
    { id: 'sb-1', name: 'Điểm danh / Chuyên cần', weight: 10, score: 10 },
    { id: 'sb-2', name: 'Kiểm tra giữa kỳ', weight: 20, score: 7 },
    { id: 'sb-3', name: 'Bài tập lớn / Đồ án', weight: 20, score: 8 },
    { id: 'sb-4', name: 'Thi cuối kỳ', weight: 50, score: null }
  ]);
  const [detailedPasteText, setDetailedPasteText] = useState('');
  const [detailedPasteError, setDetailedPasteError] = useState('');
  const [isPasteSectionExpanded, setIsPasteSectionExpanded] = useState(false);

  // State quản lý Hỗ trợ & Đóng góp ý kiến (Feedback Modal)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTab, setFeedbackTab] = useState<'bug' | 'suggestion' | 'contact'>('bug');
  const [bugText, setBugText] = useState('');
  const [suggestionText, setSuggestionText] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // State quản lý ảnh đính kèm (Lưu trữ cả File và Blob đã convert sẵn PNG)
  const [bugImage, setBugImage] = useState<File | null>(null);
  const [bugPngBlob, setBugPngBlob] = useState<Blob | null>(null);
  const [suggestionImage, setSuggestionImage] = useState<File | null>(null);
  const [suggestionPngBlob, setSuggestionPngBlob] = useState<Blob | null>(null);

  // Trạng thái tải ảnh / gửi thư
  const [isSendingBug, setIsSendingBug] = useState(false);
  const [isSendingSuggestion, setIsSendingSuggestion] = useState(false);

  // State quản lý Hover vẽ Tooltip biểu đồ
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    ySem: number;
    label: string;
    semesterGpa: number;
    academicYear: string;
    semester: string;
    diffGpa?: number;
  } | null>(null);

  // State quản lý Chọn điểm mốc trên biểu đồ (click để khóa/hiển thị chi tiết)
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Helper chuyển đổi ảnh thành PNG blob để copy vào clipboard (Luôn đi qua canvas để chuẩn hóa định dạng)
  const convertToPngBlob = (file: File): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                resolve(blob);
              }, 'image/png');
            } else {
              resolve(null);
            }
          } catch (err) {
            console.error('Lỗi canvas convert:', err);
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // Helper copy blob vào clipboard và chờ đợi kết quả (được gọi từ sự kiện click để giữ quyền user gesture)
  const copyBlobToClipboard = async (blob: Blob): Promise<boolean> => {
    try {
      const item = new ClipboardItem({
        'image/png': blob
      });
      await navigator.clipboard.write([item]);
      return true;
    } catch (err) {
      console.error('Lỗi sao chép ảnh vào clipboard:', err);
      return false;
    }
  };

  // Helper tải ảnh lên Telegraph (Anonymous, No Key, CORS Enabled, Vĩnh viễn)
  const uploadImageToTelegraph = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://telegra.ph/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.src) {
          return `https://telegra.ph${data[0].src}`;
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên Telegraph:', err);
    }
    return null;
  };

  // Helper tải ảnh lên file.io làm phương án dự phòng (Xóa sau khi xem 1 lần)
  const uploadImageToFileIo = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://file.io', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.link) {
          return data.link;
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên file.io:', err);
    }
    return null;
  };

  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setBugText('');
    setSuggestionText('');
    setBugImage(null);
    setBugPngBlob(null);
    setSuggestionImage(null);
    setSuggestionPngBlob(null);
    setIsSendingBug(false);
    setIsSendingSuggestion(false);
  };


  // State quản lý sửa tín chỉ môn học trong Khung chương trình
  const [editingCurriculumCode, setEditingCurriculumCode] = useState<string | null>(null);
  const [editCurriculumCredits, setEditCurriculumCredits] = useState<number | ''>(3);

  // Đồng bộ Khung chương trình vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dtu_gpa_curriculum', JSON.stringify(curriculumCourses));
    } catch (e) {
      console.error('Lỗi khi lưu khung chương trình vào localStorage:', e);
    }
  }, [curriculumCourses]);

  // Bộ bóc tách dữ liệu Khung chương trình từ myDTU
  const handleParseCurriculum = () => {
    if (!curriculumInputText.trim()) {
      showToast('Vui lòng dán khung chương trình dự kiến!', 'error');
      return;
    }

    try {
      const cells = curriculumInputText
        .split(/[\n\t]/)
        .map(c => c.trim())
        .filter(c => c !== '');

      const parsedCourses: CurriculumCourse[] = [];
      
      // Nhận diện định dạng: Nếu có cụm từ "Chọn X trong Y", đây là định dạng Cây chương trình học đầy đủ nhóm môn tự chọn
      const isTreeFormat = /chọn \d+ trong/i.test(curriculumInputText);
      let isMandatory = true;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];

        // Nhận diện phân khu Bắt buộc hay Tự chọn
        if (/Bắt buộc/i.test(cell)) {
          isMandatory = true;
        } else if (/Chọn \d+ trong|Tự chọn/i.test(cell)) {
          isMandatory = false;
        }
        
        // Nhận diện Mã môn học (Ví dụ: CS 201, CMU-SE 100, MTH 103, DTE-IS 102)
        if (/^[a-zA-Z]{2,6}(\-[a-zA-Z]{1,4})?\s*\d{1,4}$/.test(cell)) {
          if (i + 1 < cells.length) {
            const courseCode = cell.toUpperCase();
            const courseName = cells[i + 1];
            
            let credits = 3;
            let hasStatus = false;
            let foundCredits = false;
            let nextCourseIndex = cells.length; // Mặc định nhảy tới cuối nếu đây là môn cuối cùng

            const currentCourseMandatory = isMandatory; // Lưu giữ trạng thái trước khi quét tiếp để tránh sai lệch

            // Tìm kiếm tín chỉ và trạng thái ở các ô tiếp theo trước khi gặp mã môn khác
            for (let j = i + 2; j < cells.length; j++) {
              const cellVal = cells[j];
              
              // Nếu gặp mã môn tiếp theo thì dừng tìm kiếm ở đây
              if (/^[a-zA-Z]{2,6}(\-[a-zA-Z]{1,4})?\s*\d{1,4}$/.test(cellVal)) {
                nextCourseIndex = j - 1;
                break;
              }

              // Nhận diện số tín chỉ
              const parsedNum = parseInt(cellVal.replace(/[^0-9]/g, ''), 10);
              if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum <= 15 && !foundCredits) {
                credits = parsedNum;
                foundCredits = true;
              }

              // Nhận diện trạng thái hoạt động
              if (/hoàn tất|chưa học|đang học|đăng ký|hoàn thành|miễn|đạt|chưa đạt/i.test(cellVal)) {
                hasStatus = true;
              }

              // Nhận diện phân khu Bắt buộc hay Tự chọn nằm xen kẽ giữa các môn trong phần quét
              if (/Bắt buộc/i.test(cellVal)) {
                isMandatory = true;
              } else if (/Chọn \d+ trong|Tự chọn/i.test(cellVal)) {
                isMandatory = false;
              }
            }

            let shouldAdd = true;
            if (isTreeFormat) {
              if (currentCourseMandatory) {
                shouldAdd = true;
              } else {
                shouldAdd = hasStatus;
              }
            }

            if (shouldAdd) {
              if (!parsedCourses.some(c => c.courseCode === courseCode)) {
                parsedCourses.push({
                  courseCode,
                  courseName,
                  credits
                });
              }
            }
            
            // Nhảy tới vị trí cuối phần thông tin của môn hiện tại để tiếp tục
            i = nextCourseIndex;
          }
        }
      }

      if (parsedCourses.length > 0) {
        let finalCourses = [...parsedCourses];
        if (isCurriculumMerge) {
          // Gộp các môn học cũ vào, ưu tiên các môn mới dán nếu trùng mã môn
          const existingMap = new Map<string, CurriculumCourse>();
          curriculumCourses.forEach(c => existingMap.set(c.courseCode, c));
          parsedCourses.forEach(c => existingMap.set(c.courseCode, c));
          finalCourses = Array.from(existingMap.values());
        }

        setCurriculumCourses(finalCourses);
        
        // Loại trừ môn điều kiện khỏi tổng số tín chỉ mục tiêu của Khung
        const totalCredits = finalCourses.reduce((sum, c) => {
          const isCondition = c.courseCode.toLowerCase().startsWith('es') ||
                              c.courseName.toLowerCase().includes('thể chất') ||
                              c.courseName.toLowerCase().includes('quốc phòng') ||
                              c.courseName.toLowerCase().includes('chạy ngắn') ||
                              c.courseName.toLowerCase().includes('bơi lội');
          return isCondition ? sum : sum + c.credits;
        }, 0);
        setTargetCredits(totalCredits);
        setIsCurriculumModalOpen(false);
        setCurriculumInputText('');
        
        const formatMsg = isTreeFormat 
          ? 'Đã phát hiện cây chương trình cá nhân - Hệ thống tự động lọc bỏ các môn tự chọn bạn không đăng ký học.'
          : 'Đã phát hiện bảng danh sách khung dự kiến - Hệ thống đã nạp toàn bộ các môn.';
        const modeMsg = isCurriculumMerge ? ' (Đã cộng dồn vào khung hiện tại)' : '';
        
        showToast(`Thành công! Đã nhận diện ${parsedCourses.length} môn học. Tổng số tín chỉ: ${totalCredits} TC. ${formatMsg}${modeMsg}`, 'success');
      } else {
        showToast('Không nhận diện được môn học nào hợp lệ. Vui lòng copy đúng bảng khung chương trình.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Đã xảy ra lỗi khi phân tích khung chương trình.', 'error');
    }
  };

  const handleStartEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setEditCourseCode(course.courseCode);
    setEditCourseName(course.courseName);
    setEditCredits(course.credits);
  };

  const handleSaveEditCourse = (courseId: string) => {
    const finalCredits = Math.max(1, Number(editCredits) || 1);
    if (!editCourseCode.trim() || !editCourseName.trim() || finalCredits <= 0) {
      showToast('Vui lòng nhập đầy đủ thông tin hợp lệ!', 'error');
      return;
    }
    const updated = courses.map(c => 
      c.id === courseId 
        ? { ...c, courseCode: editCourseCode.trim(), courseName: editCourseName.trim(), credits: finalCredits } 
        : c
    );
    updateCoursesState(updated);
    setEditingCourseId(null);
  };

  const handleCancelEditCourse = () => {
    setEditingCourseId(null);
  };

  const handleUpdateCurriculumCredits = (courseCode: string, newCredits: number | '') => {
    const finalCredits = Math.max(1, Number(newCredits) || 1);
    const updated = curriculumCourses.map(cc => 
      cc.courseCode === courseCode ? { ...cc, credits: finalCredits } : cc
    );
    setCurriculumCourses(updated);
    const newTotal = updated.reduce((sum, c) => sum + c.credits, 0);
    setTargetCredits(newTotal);
  };

  // Cập nhật trạng thái môn học và đồng bộ lên cấp cha App (nếu có)
  const updateCoursesState = (newCourses: Course[]) => {
    setCourses(newCourses);
    if (onCoursesChange) {
      onCoursesChange(newCourses);
    }
  };

  // Cập nhật điểm số của một môn học (Edit Inline)
  const handleUpdateGrade = (courseId: string, newGrade: GradeChar) => {
    const updatedCourses = courses.map(c => 
      c.id === courseId ? { ...c, gradeChar: newGrade } : c
    );
    updateCoursesState(updatedCourses);
  };

  // Tự động đồng bộ hóa danh sách môn học vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dtu_gpa_courses', JSON.stringify(courses));
    } catch (e) {
      console.error('Lỗi khi ghi dữ liệu môn học vào localStorage:', e);
    }
  }, [courses]);

  // Tự động đồng bộ hóa tín chỉ mục tiêu vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dtu_gpa_target_credits', targetCredits.toString());
    } catch (e) {
      console.error('Lỗi khi ghi targetCredits vào localStorage:', e);
    }
  }, [targetCredits]);

  // 3. Tính toán các chỉ số lớn dựa trên logic của DTU
  const dtuResult = useMemo(() => calculateDTUGPA(courses), [courses]);
  const summaryResult = useMemo(() => calculateGpaSummary(courses), [courses]);

  // Tự động đồng bộ số tín chỉ còn lại theo chương trình đào tạo
  useEffect(() => {
    if (!isRemainingCreditsEdited) {
      const remaining = targetCredits - dtuResult.accumulatedCredits;
      setSimulatorRemainingCredits(remaining > 0 ? remaining : 30);
    }
  }, [targetCredits, dtuResult.accumulatedCredits, isRemainingCreditsEdited]);
  
  // Tính toán danh sách nợ môn (F) chưa được học lại/thay thế
  const { failedCourses, totalFailedCredits } = useMemo(() => {
    const activeFailed = summaryResult.processedCourses.filter(c => c.gradeChar === 'F' && !c.isReplaced);
    const totalCredits = activeFailed.reduce((sum, c) => sum + c.credits, 0);

    return {
      failedCourses: activeFailed,
      totalFailedCredits: totalCredits
    };
  }, [summaryResult.processedCourses]);

  // Tính toán xu hướng GPA (Trend Points) phục vụ vẽ biểu đồ
  const gpaTrend = useMemo(() => calculateGpaTrend(courses), [courses]);

  // Vị trí/Học kỳ đang được chọn trên biểu đồ (mặc định học kỳ cuối cùng nếu có)
  const activePointIndex = useMemo(() => {
    if (gpaTrend.length === 0) return null;
    if (selectedPointIndex !== null && selectedPointIndex >= 0 && selectedPointIndex < gpaTrend.length) {
      return selectedPointIndex;
    }
    return gpaTrend.length - 1;
  }, [gpaTrend, selectedPointIndex]);

  const activeTrendPoint = useMemo(() => {
    if (activePointIndex === null) return null;
    return gpaTrend[activePointIndex];
  }, [gpaTrend, activePointIndex]);

  // Danh sách môn học thuộc học kỳ đang được chọn
  const activeSemesterCourses = useMemo(() => {
    if (!activeTrendPoint) return [];
    return summaryResult.processedCourses.filter(c => 
      c.academicYear === activeTrendPoint.academicYear && 
      c.semester === activeTrendPoint.semester
    );
  }, [activeTrendPoint, summaryResult.processedCourses]);

  // Đối chiếu tiến độ với Khung chương trình dự kiến
  const curriculumProgress = useMemo(() => {
    if (curriculumCourses.length === 0) return null;

    const courseStatusMap = new Map<string, { gradeChar: string; isPassed: boolean; isReplaced: boolean }>();
    summaryResult.processedCourses.forEach(c => {
      const code = c.courseCode.toUpperCase();
      const existing = courseStatusMap.get(code);
      if (!existing || (!existing.isPassed && c.isPassed) || (existing.isReplaced && !c.isReplaced)) {
        courseStatusMap.set(code, {
          gradeChar: c.gradeChar,
          isPassed: c.isPassed,
          isReplaced: c.isReplaced
        });
      }
    });

    const completed: CurriculumCourse[] = [];
    const learning: CurriculumCourse[] = [];
    const failed: CurriculumCourse[] = [];
    const missing: CurriculumCourse[] = [];

    curriculumCourses.forEach(cc => {
      const code = cc.courseCode.toUpperCase();
      const transcript = courseStatusMap.get(code);

      if (!transcript) {
        missing.push(cc);
      } else if (transcript.gradeChar === '') {
        learning.push(cc);
      } else if (!transcript.isPassed && !transcript.isReplaced) {
        failed.push(cc);
      } else if (transcript.isPassed) {
        completed.push(cc);
      } else {
        missing.push(cc);
      }
    });

    return {
      completed,
      learning,
      failed,
      missing,
      totalCredits: curriculumCourses.reduce((sum, c) => {
        const isCondition = c.courseCode.toLowerCase().startsWith('es') ||
                            c.courseName.toLowerCase().includes('thể chất') ||
                            c.courseName.toLowerCase().includes('quốc phòng') ||
                            c.courseName.toLowerCase().includes('chạy ngắn') ||
                            c.courseName.toLowerCase().includes('bơi lội');
        return isCondition ? sum : sum + c.credits;
      }, 0),
      completedCredits: completed.reduce((sum, c) => {
        const isCondition = c.courseCode.toLowerCase().startsWith('es') ||
                            c.courseName.toLowerCase().includes('thể chất') ||
                            c.courseName.toLowerCase().includes('quốc phòng') ||
                            c.courseName.toLowerCase().includes('chạy ngắn') ||
                            c.courseName.toLowerCase().includes('bơi lội');
        return isCondition ? sum : sum + c.credits;
      }, 0),
      learningCredits: learning.reduce((sum, c) => {
        const isCondition = c.courseCode.toLowerCase().startsWith('es') ||
                            c.courseName.toLowerCase().includes('thể chất') ||
                            c.courseName.toLowerCase().includes('quốc phòng') ||
                            c.courseName.toLowerCase().includes('chạy ngắn') ||
                            c.courseName.toLowerCase().includes('bơi lội');
        return isCondition ? sum : sum + c.credits;
      }, 0),
      failedCredits: failed.reduce((sum, c) => {
        const isCondition = c.courseCode.toLowerCase().startsWith('es') ||
                            c.courseName.toLowerCase().includes('thể chất') ||
                            c.courseName.toLowerCase().includes('quốc phòng') ||
                            c.courseName.toLowerCase().includes('chạy ngắn') ||
                            c.courseName.toLowerCase().includes('bơi lội');
        return isCondition ? sum : sum + c.credits;
      }, 0),
      missingCredits: missing.reduce((sum, c) => {
        const isCondition = c.courseCode.toLowerCase().startsWith('es') ||
                            c.courseName.toLowerCase().includes('thể chất') ||
                            c.courseName.toLowerCase().includes('quốc phòng') ||
                            c.courseName.toLowerCase().includes('chạy ngắn') ||
                            c.courseName.toLowerCase().includes('bơi lội');
        return isCondition ? sum : sum + c.credits;
      }, 0),
    };
  }, [curriculumCourses, summaryResult.processedCourses]);

  // Tính toán kết quả giả lập GPA mục tiêu
  const simulationResult = useMemo(() => {
    const currentCredits = dtuResult.accumulatedCredits;
    const currentGPA = dtuResult.cumulativeGpa;
    const remainingCredits = Number(simulatorRemainingCredits) || 0;
    const target = isCustomTarget ? parseFloat(customTargetGpa) || 0.0 : simulatorTargetGpa;

    if (remainingCredits <= 0) {
      return { status: 'invalid', message: 'Vui lòng nhập số tín chỉ còn lại lớn hơn 0.' };
    }

    if (target < 0 || target > 4.0) {
      return { status: 'invalid', message: 'GPA mục tiêu phải nằm trong khoảng 0.0 đến 4.0.' };
    }

    const totalCredits = currentCredits + remainingCredits;
    const requiredGradePoints = (target * totalCredits) - (currentGPA * currentCredits);
    const requiredGPA = requiredGradePoints / remainingCredits;

    if (requiredGPA <= 0) {
      return { 
        status: 'achieved', 
        requiredGPA: 0.00,
        message: 'Bạn đã đạt được mục tiêu! Chỉ cần duy trì phong độ hiện tại và đỗ các môn còn lại.' 
      };
    }

    if (requiredGPA > 4.0) {
      return { 
        status: 'impossible', 
        requiredGPA, 
        message: `Không khả thi (Yêu cầu GPA: ${requiredGPA.toFixed(2)} > 4.00). Bạn cần tăng số tín chỉ còn lại hoặc đăng ký học cải thiện thêm môn cũ để thay thế điểm F/D.` 
      };
    }

    let advice = '';
    if (requiredGPA >= 3.65) {
      advice = 'Yêu cầu cực cao! Bạn cần đạt điểm A/A+ cho hầu hết các môn còn lại.';
    } else if (requiredGPA >= 3.20) {
      advice = 'Khá cao! Bạn cần đạt trung bình điểm B+/A- cho các môn còn lại.';
    } else if (requiredGPA >= 2.50) {
      advice = 'Hợp lý! Bạn cần đạt trung bình điểm B-/B cho các môn còn lại.';
    } else {
      advice = 'Khá dễ! Bạn chỉ cần đạt trung bình điểm C/C+ cho các môn còn lại.';
    }

    return {
      status: 'feasible',
      requiredGPA,
      message: advice
    };
  }, [dtuResult.accumulatedCredits, dtuResult.cumulativeGpa, simulatorRemainingCredits, simulatorTargetGpa, isCustomTarget, customTargetGpa]);

  // Tính toán mức GPA được cộng thêm khi học lại các môn bị điểm F
  const failedCoursesBoosts = useMemo(() => {
    const totalCredits = dtuResult.accumulatedCredits; // Mẫu số GPA tích lũy
    if (totalCredits === 0) return [];

    return failedCourses.map(c => {
      // Công thức: Mức tăng = (Điểm mới * Số tín chỉ môn học lại) / Tổng số tín chỉ tính GPA
      const boostA = (c.credits * 4.00) / totalCredits;
      const boostAMinus = (c.credits * 3.65) / totalCredits;
      const boostBPlus = (c.credits * 3.33) / totalCredits;

      return {
        courseCode: c.courseCode,
        courseName: c.courseName,
        credits: c.credits,
        boostA,
        boostAMinus,
        boostBPlus,
      };
    });
  }, [failedCourses, dtuResult.accumulatedCredits]);

  // Tính toán các tổ hợp điểm số gợi ý cho số tín chỉ còn lại
  const gradeRecipes = useMemo(() => {
    if (simulationResult.status !== 'feasible' || !simulationResult.requiredGPA) return [];
    const req = simulationResult.requiredGPA;
    const rem = Number(simulatorRemainingCredits) || 0;
    
    const recipes: { type: string; details: string; icon: string }[] = [];

    // 1. Tổ hợp A và A- (Nếu req <= 4.0)
    if (req <= 4.0) {
      const minReqForA = Math.max(0, req - 3.65);
      const creditsA = Math.ceil((minReqForA * rem) / 0.35);
      const finalA = Math.max(0, Math.min(rem, creditsA));
      const finalAMinus = rem - finalA;
      recipes.push({
        type: 'Tổ hợp Xuất sắc (A & A-)',
        details: `Cần đạt ${finalA} TC điểm A/A+ và ${finalAMinus} TC điểm A-`,
        icon: '🥇'
      });
    }

    // 2. Tổ hợp A và B+ (Nếu req <= 4.0 và req >= 3.33)
    if (req <= 4.0 && req >= 3.33) {
      const creditsA = Math.ceil(((req - 3.33) * rem) / 0.67);
      const finalA = Math.max(0, Math.min(rem, creditsA));
      const finalBPlus = rem - finalA;
      recipes.push({
        type: 'Tổ hợp Giỏi kết hợp (A & B+)',
        details: `Cần đạt ${finalA} TC điểm A/A+ và ${finalBPlus} TC điểm B+`,
        icon: '🥈'
      });
    }

    // 3. Tổ hợp A- và B (Nếu req <= 3.65 và req >= 3.0)
    if (req <= 3.65 && req >= 3.00) {
      const creditsAMinus = Math.ceil(((req - 3.00) * rem) / 0.65);
      const finalAMinus = Math.max(0, Math.min(rem, creditsAMinus));
      const finalB = rem - finalAMinus;
      recipes.push({
        type: 'Tổ hợp Khá an toàn (A- & B)',
        details: `Cần đạt ${finalAMinus} TC điểm A- và ${finalB} TC điểm B`,
        icon: '🥉'
      });
    }

    // 4. Tổ hợp B+ và B- (Nếu req <= 3.33 và req >= 2.65)
    if (req <= 3.33 && req >= 2.65) {
      const creditsBPlus = Math.ceil(((req - 2.65) * rem) / 0.68);
      const finalBPlus = Math.max(0, Math.min(rem, creditsBPlus));
      const finalBMinus = rem - finalBPlus;
      recipes.push({
        type: 'Tổ hợp Trung bình khá (B+ & B-)',
        details: `Cần đạt ${finalBPlus} TC điểm B+ và ${finalBMinus} TC điểm B-`,
        icon: '🎓'
      });
    }

    return recipes;
  }, [simulationResult, simulatorRemainingCredits]);

  const hasGrades = useMemo(() => {
    return courses.some(c => !c.isConditionCourse && c.gradeChar !== '');
  }, [courses]);

  // Phân loại học lực theo GPA tích lũy hệ 4
  const gpaClassification = useMemo(() => {
    if (!hasGrades) {
      return { name: 'Chưa xếp loại', color: 'text-gray-500 bg-gray-100 border-gray-200' };
    }
    const gpa = dtuResult.cumulativeGpa;
    if (gpa >= 3.6) return { name: 'Xuất sắc', color: 'text-violet-700 bg-violet-50 border-violet-200 shadow-sm' };
    if (gpa >= 3.2) return { name: 'Giỏi', color: 'text-green-700 bg-green-50 border-green-100' };
    if (gpa >= 2.5) return { name: 'Khá', color: 'text-blue-700 bg-blue-50 border-blue-100' };
    if (gpa >= 2.0) return { name: 'Trung bình', color: 'text-amber-700 bg-amber-50 border-amber-100' };
    return { name: 'Yêu / Kém', color: 'text-rose-700 bg-rose-50 border-rose-100' };
  }, [dtuResult.cumulativeGpa, hasGrades]);

  // Slogan Khoe Điểm phù hợp với học lực
  const shareSlogan = useMemo(() => {
    if (!hasGrades) return 'Hãy nhập điểm để bắt đầu hành trình chinh phục GPA của bạn!';
    const gpa = dtuResult.cumulativeGpa;
    if (gpa >= 3.6) return 'Thành tích vượt trội, tương lai ngời sáng! Chúc mừng thủ khoa!';
    if (gpa >= 3.2) return 'Nỗ lực phi thường, gặt hái vinh quang! Cứ thế phát huy nhé!';
    if (gpa >= 2.5) return 'Kết quả rất tốt! Chỉ còn một chút nỗ lực nữa để vươn tới Giỏi!';
    if (gpa >= 2.0) return 'Mọi nỗ lực đều quý giá. Hãy kiên trì học hỏi và bứt phá kỳ tới!';
    return 'Thất bại là mẹ thành công. Đăng ký cải thiện ngay để lội ngược dòng nhé!';
  }, [dtuResult.cumulativeGpa, hasGrades]);

  // Tính tỷ lệ % tín chỉ học lại
  const retakeRatio = useMemo(() => {
    if (targetCredits === 0) return 0;
    return (dtuResult.totalRetakeCredits / targetCredits) * 100;
  }, [dtuResult.totalRetakeCredits, targetCredits]);

  // Cảnh báo nếu tín chỉ học lại vượt quá 5% tổng tín chỉ chương trình
  const isRetakeExceeded = retakeRatio > 5.0;

  // Lấy danh sách các môn có thể bị thay thế (các môn có điểm chữ thấp từ B- trở xuống, không phải môn điều kiện và chưa bị thay thế)
  const replaceableCourses = useMemo(() => {
    return summaryResult.processedCourses.filter(c => {
      if (c.isConditionCourse) return false;
      if (c.isReplaced) return false;
      
      const point = GRADE_SCALE_MAP[c.gradeChar];
      return point !== null && point < 3.0; // B- (2.65), C+ (2.33), C (2.0), C- (1.65), D (1.0), F (0.0)
    });
  }, [summaryResult.processedCourses]);

  // Bộ gợi ý tối ưu hóa cải thiện điểm số (GPA Booster)
  const gpaBoosterRecommendations = useMemo(() => {
    if (!courses || courses.length === 0 || dtuResult.accumulatedCredits === 0) {
      return [];
    }

    const { replacedIds } = resolveRetakes(courses);

    // Lọc ra các môn học đang tính vào GPA tích lũy và có điểm quy đổi hệ 4 < 3.0 (từ B- trở xuống)
    const candidates = courses.filter(c => {
      if (c.isConditionCourse) return false;
      if (replacedIds.has(c.id)) return false;
      const pt = GRADE_SCALE_MAP[c.gradeChar];
      return pt !== null && pt !== undefined && pt < 3.0;
    });

    const totalCredits = dtuResult.accumulatedCredits;
    const currentGpa = dtuResult.rawCumulativeGpa;

    // Nhóm các môn học theo mã môn học (courseCode)
    const grouped = new Map<string, Course[]>();
    candidates.forEach(c => {
      const code = c.courseCode.toUpperCase().trim();
      if (!grouped.has(code)) {
        grouped.set(code, []);
      }
      grouped.get(code)!.push(c);
    });

    const list = Array.from(grouped.entries()).map(([code, groupCourses]) => {
      let groupCredits = 0;
      let totalWeightedPtDiff = 0;
      
      const sortedGroup = [...groupCourses].sort((a, b) => b.credits - a.credits);
      
      const components = sortedGroup.map(c => {
        const pt = GRADE_SCALE_MAP[c.gradeChar] || 0;
        const diff = 4.0 - pt;
        groupCredits += c.credits;
        totalWeightedPtDiff += diff * c.credits;
        return {
          id: c.id,
          credits: c.credits,
          gradeChar: c.gradeChar,
          courseName: c.courseName,
          gradePoint: pt,
        };
      });

      const gpaBoost = totalWeightedPtDiff / totalCredits;
      const newGpa = currentGpa + gpaBoost;

      // Đánh giá mức độ ưu tiên: Ưu tiên cao nếu tăng GPA nhiều (>= 0.08) hoặc có bất kỳ phần nào bị điểm F (phải học lại bắt buộc)
      const hasFailedComponent = components.some(comp => comp.gradeChar === 'F');
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (gpaBoost >= 0.08 || hasFailedComponent) {
        priority = 'high';
      } else if (gpaBoost >= 0.03) {
        priority = 'medium';
      }

      const mainCourse = sortedGroup[0];
      const gradeCharStr = components.length > 1 
        ? components.map(comp => `${comp.gradeChar} (${comp.credits} TC)`).join(' & ')
        : mainCourse.gradeChar;

      return {
        id: `grouped-${code}`,
        courseCode: mainCourse.courseCode,
        courseName: mainCourse.courseName,
        credits: groupCredits,
        gradeChar: gradeCharStr,
        gpaBoost,
        newGpa,
        priority,
        components
      };
    });

    // Sắp xếp theo gpaBoost giảm dần (tăng nhiều nhất lên đầu)
    return list.sort((a, b) => b.gpaBoost - a.gpaBoost);
  }, [courses, dtuResult]);

  // Hàm helper tính toán xếp loại thay đổi khi tăng GPA
  const getGpaClassificationDiffText = (oldGpa: number, newGpa: number) => {
    const oldRounded = Math.round(oldGpa * 100) / 100;
    const newRounded = Math.round(newGpa * 100) / 100;
    
    if (oldRounded < 2.0 && newRounded >= 2.0 && newRounded < 2.5) return 'lên bằng Trung bình 🎓';
    if (oldRounded < 2.5 && newRounded >= 2.5 && newRounded < 3.2) return 'lên bằng Khá 🥉';
    if (oldRounded < 3.2 && newRounded >= 3.2 && newRounded < 3.6) return 'lên bằng Giỏi 🥈';
    if (oldRounded < 3.6 && newRounded >= 3.6) return 'lên bằng Xuất sắc 🏆';
    
    return `tăng +${(newRounded - oldRounded).toFixed(2)} GPA`;
  };

  // 4. Xử lý thêm môn học mới
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) {
      showToast('Vui lòng điền đầy đủ Mã môn học và Tên môn học!', 'error');
      return;
    }
    if (credits <= 0 || isNaN(credits)) {
      showToast('Số tín chỉ phải lớn hơn 0!', 'error');
      return;
    }

    const newCourse: Course = {
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      credits,
      gradeChar,
      isConditionCourse: isConditionCourse,
      isRetake: isConditionCourse ? false : isRetake,
      replacesCourseId: (isRetake && !isConditionCourse) ? replacesCourseId : null,
      academicYear,
      semester,
    };

    updateCoursesState([...courses, newCourse]);
    setIsMockDataLoaded(false);
    setIsMobileDrawerOpen(false);

    // Reset Form (giữ lại năm học và học kỳ để tiện nhập tiếp)
    setCourseCode('');
    setCourseName('');
    setIsRetake(false);
    setReplacesCourseId(null);
  };

  // Xử lý tự động bóc tách từ copy-paste bảng điểm myDTU
  const handleSmartPaste = () => {
    if (!smartPasteText.trim()) {
      setSmartPasteStatus({ message: 'Vui lòng dán nội dung bảng điểm vào ô.', type: 'error' });
      return;
    }

    try {
      // Tách văn bản thành các ô (cells), hỗ trợ cả dấu Tab (nếu copy bảng chuẩn) và Newline (nếu copy dạng div dọc)
      const cells = smartPasteText
        .split(/[\n\t]/)
        .map(c => c.trim())
        .filter(c => c !== '');

      let currentYear = academicYear;
      let currentSemester = semester;
      
      const newCourses: Course[] = [];
      
      // Theo dõi lần xuất hiện của môn học để auto-retake
      // Cần lưu thêm năm học và học kỳ để phân biệt môn học lại vs môn Lý thuyết/Thực hành học cùng 1 kỳ
      const codeToCourseMap = new Map<string, { id: string, academicYear: string, semester: string }>(); 

      // Khởi tạo map bằng các môn học hiện có
      courses.forEach(c => {
        codeToCourseMap.set(c.courseCode.toUpperCase(), { 
          id: c.id, 
          academicYear: c.academicYear, 
          semester: c.semester 
        });
      });

      let importedCount = 0;
      let duplicateCount = 0;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        
        // 1. Nhận diện học kỳ (Ví dụ: "Học Kỳ I - Năm Học 2023-2024")
        const semMatch = cell.match(/Học Kỳ (I{1,3}|Hè)\s*-\s*Năm Học (\d{4}-\d{4})/i);
        if (semMatch) {
          const sem = semMatch[1].toUpperCase();
          currentSemester = sem === 'I' ? 'Học kỳ 1' : sem === 'II' ? 'Học kỳ 2' : 'Học kỳ Hè';
          currentYear = semMatch[2];
          continue;
        }
        
        // 2. Nhận diện Mã môn học
        // Sinh viên DTU có mã môn dạng: CS 201, CMU-SE 100, IS-ENG 136, LAW 201, v.v.
        if (/^[a-zA-Z]{2,6}(\-[a-zA-Z]{1,4})?\s*\d{1,4}$/.test(cell)) {
          // Kiểm tra xem các ô tiếp theo có khớp cấu trúc của một môn học không (Tối thiểu 6 ô cho môn chưa có điểm)
          if (i + 5 < cells.length) {
            const courseCodeExtract = cell.toUpperCase();
            const courseNameExtract = cells[i + 3];
            const creditsExtract = parseInt(cells[i + 4], 10);
            
            // Nếu số tín chỉ không hợp lệ, đây có thể không phải là hàng môn học
            if (isNaN(creditsExtract) || creditsExtract <= 0 || creditsExtract > 15) {
              continue;
            }

            // Kiểm tra xem môn này đã có điểm chưa
            let gradeCharExtract: GradeChar = ''; // Mặc định để trống nếu chưa có điểm
            let cellsToSkip = 5; 
            
            const nextCell = cells[i + 6] || '';
            const isNextCellCourseCode = /^[a-zA-Z]{2,6}(\-[a-zA-Z]{1,4})?\s*\d{1,4}$/.test(nextCell);
            const isNextCellSemester = /Học Kỳ/i.test(nextCell);
            const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'P'];

            // Nếu ô thứ 6 không phải là mã môn/học kỳ, ta giả định nó có điểm chữ ở ô thứ 7
            if (!isNextCellCourseCode && !isNextCellSemester && (i + 7 < cells.length)) {
              const possibleGradeStr = (cells[i + 7] || '').split(' ')[0].toUpperCase() as GradeChar;
              if (validGrades.includes(possibleGradeStr)) {
                gradeCharExtract = possibleGradeStr;
                cellsToSkip = 7;
              }
            }
            
            // Nhận diện tự động môn điều kiện (Thể chất, Quốc phòng)
            const nameLower = courseNameExtract.toLowerCase();
            const isConditionExtract = gradeCharExtract === 'P' || 
                                       nameLower.includes('thể chất') || 
                                       nameLower.includes('quốc phòng') || 
                                       nameLower.includes('chạy ngắn') || 
                                       nameLower.includes('bơi lội');

            // Chống trùng lặp môn học giống hệt trong cùng 1 kỳ
            // Bổ sung c.credits để phân biệt môn Lý thuyết (vd: 2 tín) và Thực hành (vd: 1 tín) chung mã môn
            const isDuplicate = [...courses, ...newCourses].some(
              c => c.courseCode === courseCodeExtract && 
                   c.academicYear === currentYear && 
                   c.semester === currentSemester &&
                   c.credits === creditsExtract
            );
            
            if (!isDuplicate) {
              // Tự động nhận diện Học lại / Cải thiện
              let isRetakeExtract = false;
              let replacesCourseIdExtract: string | null = null;

              if (!isConditionExtract) {
                const prevCourse = codeToCourseMap.get(courseCodeExtract);
                if (prevCourse) {
                  // CHỈ CÓ THỂ LÀ HỌC LẠI nếu môn cũ nằm ở MỘT KỲ KHÁC (trước đó)
                  // Nếu học cùng kỳ, cùng năm (VD: CS 201 Lý thuyết và CS 201 Thực hành), thì KHÔNG phải học lại
                  if (prevCourse.academicYear !== currentYear || prevCourse.semester !== currentSemester) {
                    isRetakeExtract = true;
                    replacesCourseIdExtract = prevCourse.id;
                  }
                }
              }

              const newId = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              
              if (!isConditionExtract) {
                codeToCourseMap.set(courseCodeExtract, { 
                  id: newId, 
                  academicYear: currentYear, 
                  semester: currentSemester 
                });
              }

              newCourses.push({
                id: newId,
                courseCode: courseCodeExtract,
                courseName: courseNameExtract,
                credits: creditsExtract,
                gradeChar: gradeCharExtract,
                isConditionCourse: isConditionExtract,
                isRetake: isRetakeExtract,
                replacesCourseId: replacesCourseIdExtract,
                academicYear: currentYear,
                semester: currentSemester,
              });
              
              importedCount++;
            } else {
              duplicateCount++;
            }
            
            // Nhảy index qua các ô thuộc môn này (5 ô nếu chưa có điểm, 7 ô nếu đã có)
            i += cellsToSkip;
          }
        }
      }

      if (importedCount > 0) {
        updateCoursesState([...courses, ...newCourses]);
        setIsMockDataLoaded(false);
        setSmartPasteText('');
        const dupMsg = duplicateCount > 0 ? ` (Đã bỏ qua ${duplicateCount} môn trùng lặp)` : '';
        setSmartPasteStatus({ message: `Hoàn tất! Đã thêm ${importedCount} môn học.${dupMsg}`, type: 'success' });
        setIsMobileDrawerOpen(false);
        
        setTimeout(() => setSmartPasteStatus({ message: '', type: 'idle' }), 5000);
      } else if (duplicateCount > 0) {
        setSmartPasteStatus({ message: `Đã bỏ qua ${duplicateCount} môn học do bị trùng lặp trong bảng.`, type: 'error' });
      } else {
        setSmartPasteStatus({ message: 'Không tìm thấy dữ liệu! Hãy đảm bảo copy đúng bảng điểm.', type: 'error' });
      }

    } catch (e) {
      console.error(e);
      setSmartPasteStatus({ message: 'Lỗi trong quá trình xử lý văn bản.', type: 'error' });
    }
  };

  // Mở máy tính điểm chi tiết cho một môn
  const handleOpenDetailedGradeModal = (course: Course) => {
    setSelectedDetailedCourse(course);
    setTempDetailedGrades(course.detailedGrades || []);
    setDetailedPasteText('');
    setDetailedPasteError('');
    setIsPasteSectionExpanded(false);

    // Hỗ trợ hiển thị mượt mà trên từng loại thiết bị
    if (window.innerWidth < 640) {
      // Mobile: Mở drawer và chuyển qua tab Điểm Chi Tiết
      setMobileDrawerTab('detailed');
      setIsMobileDrawerOpen(true);
    } else {
      // Desktop: Cuộn mượt về cột bên trái nơi đặt máy tính chi tiết
      setTimeout(() => {
        const panel = document.getElementById('detailed-grade-calculator-panel');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
          panel.classList.add('animate-widgetGlow');
          setTimeout(() => {
            panel.classList.remove('animate-widgetGlow');
          }, 1500);
        }
      }, 100);
    }
    showToast(`Đã nạp điểm chi tiết môn: ${course.courseCode}`, 'info');
  };

  // Render ô hiển thị Điểm Chi Tiết
  const renderDetailedGradeCell = (pc: Course) => {
    const result = calculateDetailedScore(pc.detailedGrades);
    if (!result) {
      return (
        <button
          onClick={() => handleOpenDetailedGradeModal(pc)}
          className="px-2 py-1 bg-gray-150 hover:bg-indigo-600 hover:text-white text-[10px] text-gray-700 rounded-md border border-gray-300 hover:border-indigo-600 transition-all font-bold cursor-pointer"
        >
          + Chi tiết
        </button>
      );
    }

    const { score, roundedScore, hasMissingScores, currentWeightedSum, finalExamFailed } = result;
    
    if (hasMissingScores) {
      return (
        <button
          onClick={() => handleOpenDetailedGradeModal(pc)}
          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-[10px] text-amber-700 rounded-md border border-amber-200 hover:border-amber-400 transition-all font-bold cursor-pointer"
          title="Nhấp để nhập điểm còn thiếu"
        >
          {currentWeightedSum.toFixed(2)} (--)
        </button>
      );
    }

    const calculatedGrade = finalExamFailed ? 'F' : getDTUGradeCharFromScore(roundedScore!);
    const isFailed = roundedScore! < 4.0 || finalExamFailed;
    
    return (
      <button
        onClick={() => handleOpenDetailedGradeModal(pc)}
        className={`px-2 py-1 text-[10px] rounded-md border transition-all font-bold cursor-pointer ${
          isFailed 
            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-350' 
            : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-350'
        }`}
        title={`Điểm chi tiết thực tế: ${score.toFixed(2)} (Làm tròn: ${roundedScore!.toFixed(1)} - ${calculatedGrade}) - Nhấp để sửa`}
      >
        {score.toFixed(2)} ({calculatedGrade})
      </button>
    );
  };

  const handleSaveDetailedGrades = () => {
    if (!selectedDetailedCourse) return;

    // Tính tổng tỉ lệ % để validate
    const totalWeight = tempDetailedGrades.reduce((sum, item) => sum + item.weight, 0);
    if (tempDetailedGrades.length > 0 && Math.abs(totalWeight - 100) > 0.01) {
      showToast(`Tổng tỷ lệ phần trăm các đầu điểm phải bằng 100% (Hiện tại: ${totalWeight.toFixed(1)}%)`, 'error');
      return;
    }

    const calculated = calculateDetailedScore(tempDetailedGrades);
    let finalGradeChar: GradeChar = selectedDetailedCourse.gradeChar;

    if (calculated) {
      if (!calculated.hasMissingScores && Math.abs(calculated.totalWeight - 100) < 0.01) {
        finalGradeChar = calculated.finalExamFailed ? 'F' : getDTUGradeCharFromScore(calculated.roundedScore);
      } else {
        finalGradeChar = '';
      }
    }

    // Cập nhật môn học chính
    const updatedCourses = courses.map(c => {
      if (c.id === selectedDetailedCourse.id) {
        return {
          ...c,
          gradeChar: finalGradeChar,
          detailedGrades: tempDetailedGrades
        };
      }
      return c;
    });

    updateCoursesState(updatedCourses);
    setSelectedDetailedCourse(null);
    if (window.innerWidth < 640) {
      setIsMobileDrawerOpen(false);
    }
    showToast('Đã lưu điểm chi tiết môn học thành công!', 'success');
  };

  const handleParseDetailedPaste = () => {
    if (!detailedPasteText.trim()) {
      setDetailedPasteError('Vui lòng dán nội dung bảng điểm chi tiết.');
      return;
    }

    try {
      const lines = detailedPasteText.split('\n');
      const parsedItems: DetailedGradeItem[] = [];
      let totalParsedWeight = 0;

      for (let line of lines) {
        line = line.trim();
        if (!line || /tổng|bài giao|điểm lần/i.test(line)) continue;

        // Thử split bằng tab
        let parts = line.split('\t').map(p => p.trim());
        if (parts.length >= 4) {
          const name = parts[1] || parts[0];
          // Lấy cột chứa % cuối cùng (là % Điểm tối đa) để làm Tỷ lệ %
          let weightStr = parts.filter(p => p.includes('%')).pop() || parts[parts.length - 1];
          if (!weightStr) weightStr = parts[parts.length - 1];
          const weight = parseFloat(weightStr.replace('%', '')) || 0;
          
          // Lấy Điểm lần 1 hoặc Điểm lần 2 (nếu Điểm lần 1 trống)
          const score1Str = parts[2];
          const score2Str = parts[3];
          const score1 = score1Str && score1Str.trim() !== '' ? parseFloat(score1Str) : null;
          const score2 = score2Str && score2Str.trim() !== '' ? parseFloat(score2Str) : null;
          const score = (score2 !== null && !isNaN(score2)) ? score2 : score1;

          if (name && weight > 0) {
            parsedItems.push({
              id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name,
              weight,
              score: isNaN(score as number) || score === null ? null : score
            });
            totalParsedWeight += weight;
            continue;
          }
        }

        // Regex fallback cho copy-paste space-separated
        const percentMatches = [...line.matchAll(/(\d+(\.\d+)?)\s*%/g)];
        if (percentMatches.length > 0) {
          const lastPercentMatch = percentMatches[percentMatches.length - 1];
          const weight = parseFloat(lastPercentMatch[1]) || 0;

          let lineWithoutPercents = line;
          percentMatches.forEach(m => {
            lineWithoutPercents = lineWithoutPercents.replace(m[0], '');
          });

          const numbers = [...lineWithoutPercents.matchAll(/(\d+(\.\d+)?)/g)];
          let score: number | null = null;
          let nameLine = lineWithoutPercents;

          if (numbers.length >= 2) {
            const lastNumIdx = numbers.length - 1;
            const possibleThangDiem = parseFloat(numbers[lastNumIdx][1]);
            if (possibleThangDiem === 10 || possibleThangDiem === 100) {
              if (numbers.length >= 3) {
                score = parseFloat(numbers[lastNumIdx - 1][1]);
                nameLine = nameLine.substring(0, numbers[lastNumIdx - 1].index).trim();
              } else {
                score = null;
                nameLine = nameLine.substring(0, numbers[lastNumIdx].index).trim();
              }
            }
          }

          let name = nameLine.replace(/^\d+\s+/, '').trim();
          name = name.replace(/^[|#\s]+|[|#\s]+$/g, '').trim();

          if (name && weight > 0) {
            parsedItems.push({
              id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name,
              weight,
              score: isNaN(score as number) || score === null ? null : score
            });
            totalParsedWeight += weight;
          }
        }
      }

      if (parsedItems.length > 0) {
        if (selectedDetailedCourse) {
          setTempDetailedGrades(parsedItems);
        } else {
          setSandboxDetailedGrades(parsedItems);
        }
        setDetailedPasteText('');
        setDetailedPasteError('');
        showToast(`Thành công! Nhận diện được ${parsedItems.length} cột điểm chi tiết.`, 'success');
      } else {
        setDetailedPasteError('Không tìm thấy dữ liệu cột điểm hợp lệ. Hãy đảm bảo copy đúng bảng điểm chi tiết.');
      }
    } catch (e) {
      console.error(e);
      setDetailedPasteError('Lỗi trong quá trình phân tích văn bản dán.');
    }
  };

  // 5. Xóa môn học
  const handleDeleteCourse = (id: string) => {
    let newCourses = courses.filter(c => c.id !== id);

    // Gỡ liên kết cũ khi môn thay thế bị xóa
    newCourses = newCourses.map(c => {
      if (c.replacesCourseId === id) {
        return { ...c, replacesCourseId: null, isRetake: false };
      }
      return c;
    });

    updateCoursesState(newCourses);
  };

  // 6. Tải Dữ liệu Mẫu (Để vẽ biểu đồ 3 học kỳ trực quan)
  const loadMockScenario = () => {
    const action = () => {
      const mockData: Course[] = [
        // NĂM HỌC 2024-2025 - HỌC KỲ 1
        {
          id: 'sem1-law',
          courseCode: 'LAW 201',
          courseName: 'Pháp luật đại cương',
          credits: 2,
          gradeChar: 'F',
          isConditionCourse: false,
          isRetake: false,
          replacesCourseId: null,
          academicYear: '2024-2025',
          semester: 'Học kỳ 1',
        },
        {
          id: 'sem1-eng',
          courseCode: 'ENG 101',
          courseName: 'Tiếng Anh 1',
          credits: 3,
          gradeChar: 'B',
          isConditionCourse: false,
          isRetake: false,
          replacesCourseId: null,
          academicYear: '2024-2025',
          semester: 'Học kỳ 1',
        },
        {
          id: 'sem1-pe',
          courseCode: 'PE 101',
          courseName: 'Giáo dục Thể chất 1',
          credits: 1,
          gradeChar: 'F',
          isConditionCourse: true,
          isRetake: false,
          replacesCourseId: null,
          academicYear: '2024-2025',
          semester: 'Học kỳ 1',
        },
        // NĂM HỌC 2024-2025 - HỌC KỲ 2
        {
          id: 'sem2-law-retake',
          courseCode: 'LAW 201',
          courseName: 'Pháp luật đại cương',
          credits: 2,
          gradeChar: 'A',
          isConditionCourse: false,
          isRetake: true,
          replacesCourseId: 'sem1-law',
          academicYear: '2024-2025',
          semester: 'Học kỳ 2',
        },
        {
          id: 'sem2-cs',
          courseCode: 'CS 101',
          courseName: 'Tin học cơ sở',
          credits: 3,
          gradeChar: 'B+',
          isConditionCourse: false,
          isRetake: false,
          replacesCourseId: null,
          academicYear: '2024-2025',
          semester: 'Học kỳ 2',
        },
        {
          id: 'sem2-pe-retake',
          courseCode: 'PE 101',
          courseName: 'Giáo dục Thể chất 1',
          credits: 1,
          gradeChar: 'P',
          isConditionCourse: true,
          isRetake: true,
          replacesCourseId: 'sem1-pe',
          academicYear: '2024-2025',
          semester: 'Học kỳ 2',
        },
        // NĂM HỌC 2025-2026 - HỌC KỲ 1
        {
          id: 'sem3-mat',
          courseCode: 'MAT 101',
          courseName: 'Toán cao cấp',
          credits: 3,
          gradeChar: 'A',
          isConditionCourse: false,
          isRetake: false,
          replacesCourseId: null,
          academicYear: '2025-2026',
          semester: 'Học kỳ 1',
        },
        {
          id: 'sem3-phy',
          courseCode: 'PHY 101',
          courseName: 'Vật lý đại cương',
          credits: 3,
          gradeChar: 'B-',
          isConditionCourse: false,
          isRetake: false,
          replacesCourseId: null,
          academicYear: '2025-2026',
          semester: 'Học kỳ 1',
        },
        {
          id: 'sem3-eng2',
          courseCode: 'ENG 102',
          courseName: 'Tiếng Anh 2',
          credits: 3,
          gradeChar: 'A',
          isConditionCourse: false,
          isRetake: false,
          replacesCourseId: null,
          academicYear: '2025-2026',
          semester: 'Học kỳ 1',
        }
      ];
      updateCoursesState(mockData);
      setCurriculumCourses([]); // Xóa khung cũ để tránh hiển thị lệch ở Demo
      setTargetCredits(144);    // Đưa tín chỉ mục tiêu về 144 chuẩn
      setIsMockDataLoaded(true);
      setIsMobileDrawerOpen(false);
      
      // Mở tất cả các nhóm học kỳ mặc định
      setExpandedSemesters({
        '2024-2025-Học kỳ 1': true,
        '2024-2025-Học kỳ 2': true,
        '2025-2026-Học kỳ 1': true
      });
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    if (courses.length > 0) {
      setConfirmModal({
        isOpen: true,
        title: 'Tải Dữ Liệu Mẫu (Demo)',
        message: 'Hệ thống phát hiện bạn đã có sẵn môn học trong bảng. Việc tải dữ liệu mẫu sẽ GHI ĐÈ và XÓA TOÀN BỘ môn học hiện tại của bạn. Bạn có chắc chắn muốn tiếp tục?',
        confirmText: 'Vâng, tải dữ liệu mẫu',
        onConfirm: action
      });
    } else {
      action();
    }
  };

  // Làm sạch localStorage và đưa danh sách môn về rỗng
  const handleResetApp = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Toàn Bộ Dữ Liệu App',
      message: 'Bạn có thực sự muốn xóa sạch mọi dữ liệu môn học hiện tại không? Toàn bộ công sức nhập liệu sẽ biến mất và KHÔNG THỂ hoàn tác!',
      confirmText: 'Vâng, Xóa tất cả',
      onConfirm: () => {
        try {
          localStorage.removeItem('dtu_gpa_courses');
          localStorage.removeItem('dtu_gpa_target_credits');
          localStorage.removeItem('dtu_gpa_curriculum');
        } catch (e) {
          console.error('Lỗi khi làm sạch localStorage:', e);
        }
        updateCoursesState([]);
        setCurriculumCourses([]);
        setTargetCredits(144);
        setIsMockDataLoaded(false);
        setIsRemainingCreditsEdited(false);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Ref cho thẻ input file nhập dữ liệu ẩn
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Hàm Xuất dữ liệu bảng điểm dưới dạng file HTML tự chứa dữ liệu JSON
  const handleExportData = () => {
    try {
      const dataToExport = {
        courses,
        targetCredits,
        curriculumCourses
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);

      // Nhóm môn học theo học kỳ và năm học để vẽ bảng điểm HTML
      const coursesBySemesters: { [key: string]: Course[] } = {};
      courses.forEach(c => {
        const key = `${c.academicYear} | ${c.semester}`;
        if (!coursesBySemesters[key]) {
          coursesBySemesters[key] = [];
        }
        coursesBySemesters[key].push(c);
      });

      const exportHasGrades = courses.some(c => !c.isConditionCourse && c.gradeChar !== '');
      const displayGpa = exportHasGrades ? dtuResult.cumulativeGpa.toFixed(2) : '--';
      const displayClassification = exportHasGrades ? gpaClassification.name : 'Chưa xếp loại';

      // Sắp xếp các kỳ học từ cũ đến mới
      const sortedSemesterKeys = Object.keys(coursesBySemesters).sort((a, b) => {
        const [yearA, semA] = a.split(' | ');
        const [yearB, semB] = b.split(' | ');
        if (yearA !== yearB) {
          return yearA.localeCompare(yearB);
        }
        return semA.localeCompare(semB);
      });

      // Tạo chuỗi HTML các bảng điểm
      let semestersHtml = '';
      sortedSemesterKeys.forEach(semKey => {
        const semCourses = coursesBySemesters[semKey];
        const [year, sem] = semKey.split(' | ');
        
        let rowsHtml = semCourses.map((c, i) => {
          const gradeValue = GRADE_SCALE_MAP[c.gradeChar];
          const gradePoints = gradeValue !== null ? gradeValue.toFixed(2) : '-';
          return `
            <tr>
              <td style="text-align: center;">${i + 1}</td>
              <td style="font-weight: bold; color: #4f46e5;">${c.courseCode}</td>
              <td>${c.courseName}</td>
              <td style="text-align: center; font-weight: bold;">${c.credits}</td>
              <td style="text-align: center;" class="grade-${c.gradeChar}">${c.gradeChar}</td>
              <td style="text-align: center; font-weight: bold;">${gradePoints}</td>
              <td style="text-align: center; color: #64748b;">${c.isConditionCourse ? 'Có' : 'Không'}</td>
              <td style="text-align: center; color: #ef4444;">${c.isRetake ? 'Có' : 'Không'}</td>
            </tr>
          `;
        }).join('');

        semestersHtml += `
          <div class="semester-section">
            <h3 class="semester-title">${sem} - Năm học ${year}</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">STT</th>
                  <th style="width: 120px;">Mã Môn</th>
                  <th>Tên Môn Học</th>
                  <th style="width: 80px; text-align: center;">Số TC</th>
                  <th style="width: 80px; text-align: center;">Điểm Chữ</th>
                  <th style="width: 80px; text-align: center;">Hệ 4</th>
                  <th style="width: 100px; text-align: center;">Môn Điều Kiện</th>
                  <th style="width: 80px; text-align: center;">Học Lại</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        `;
      });

      const exportDate = new Date().toLocaleString('vi-VN');

      const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bảng Điểm Học Tập Cá Nhân - Đại Học Duy Tân</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.5;
      color: #e2e8f0;
      background-color: #f8fafc;
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      border-bottom: 2px solid #e2e8f0;
    }
    .header-table td {
      border: none;
      vertical-align: middle;
      padding: 12px 0;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      font-weight: 550;
    }
    .doc-title {
      text-align: center;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 16px;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-subtitle {
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 32px;
    }
    .summary-grid {
      display: grid;
      grid-template-cols: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
    }
    .summary-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .summary-value {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
    }
    .semester-section {
      margin-bottom: 32px;
    }
    .semester-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      border-left: 4px solid #4f46e5;
      padding-left: 12px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 12px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: #94a3b8;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .grade-A, .grade-A_PLUS { color: #10b981; font-weight: bold; }
    .grade-B, .grade-B_PLUS { color: #3b82f6; font-weight: bold; }
    .grade-C, .grade-C_PLUS { color: #f59e0b; font-weight: bold; }
    .grade-D { color: #64748b; font-weight: bold; }
    .grade-F { color: #ef4444; font-weight: bold; }
    
    .btn-print {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff;
      padding: 10px 20px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 8px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
      transition: all 0.2s;
    }
    .btn-print:hover {
      background-color: #4338ca;
    }
    .footer-note {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 40px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 16px;
    }
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .container {
        box-shadow: none;
        border: none;
        padding: 0;
        max-width: 100%;
      }
      .btn-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <table class="header-table">
      <tr>
        <td style="width: 50%;">
          <div class="brand-title">Đại Học Duy Tân</div>
          <div class="brand-sub">Duy Tan University (DTU) - Công Cụ Tính GPA</div>
        </td>
        <td style="text-align: right; width: 50%; font-size: 11px; color: #64748b;">
          Xuất ngày: ${exportDate}
        </td>
      </tr>
    </table>

    <div style="text-align: center;">
      <button class="btn-print" onclick="window.print()">🖨️ In Bảng Điểm / Lưu PDF</button>
    </div>

    <h2 class="doc-title">Bảng Điểm Học Tập Cá Nhân</h2>
    <div class="doc-subtitle">Dữ liệu kết quả học tập tạm tính được lưu từ ứng dụng tính GPA DTU</div>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-label">GPA Tích Lũy</div>
        <div class="summary-value">
          ${displayGpa}
          ${exportHasGrades && dtuResult.rawCumulativeGpa > 0 ? `
            <span style="font-size: 11px; font-weight: normal; color: #64748b; display: block; margin-top: 3px;" title="Chỉ số thực chưa làm tròn: ${dtuResult.rawCumulativeGpa.toFixed(6)}">
              (${dtuResult.rawCumulativeGpa.toFixed(4)})
            </span>
          ` : ''}
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Xếp Loại Tốt Nghiệp</div>
        <div class="summary-value" style="font-size: 15px; padding-top: 4px; font-weight: 800;">${displayClassification}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Tín Chỉ Đạt</div>
        <div class="summary-value">${dtuResult.accumulatedCredits} / ${targetCredits}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Học Lại / Cải Thiện</div>
        <div class="summary-value">${dtuResult.totalRetakeCredits} TC (${retakeRatio.toFixed(1)}%)</div>
      </div>
    </div>

    ${semestersHtml.length > 0 ? semestersHtml : '<p style="text-align: center; color: #64748b;">Chưa có dữ liệu môn học.</p>'}

    <div class="footer-note">
      Bảng điểm này được sinh ra từ Công cụ tính điểm GPA Đại học Duy Tân (DTU).<br>
      Dữ liệu cấu trúc gốc được đính kèm bảo mật bên trong tệp tin này và có thể được nhập trở lại ứng dụng bất cứ lúc nào.
    </div>
  </div>

  <!-- DỮ LIỆU CẤU TRÚC ĐỂ IMPORT TRỞ LẠI APP (KHÔNG ĐƯỢC XÓA DÒNG NÀY) -->
  <script id="dtu-gpa-data" type="application/json">${jsonString}</script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bang_diem_dtu_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Đã xuất file bảng điểm HTML thành công!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Lỗi khi xuất tệp dữ liệu!', 'error');
    }
  };

  // Hàm Tải ảnh Khoe Kết Quả chất lượng cao với cơ chế tương thích kép cho Safari/iOS
  const handleDownloadShareCard = async () => {
    if (!shareCardRef.current) {
      showToast('Không tìm thấy dữ liệu thẻ chia sẻ.', 'error');
      return;
    }

    showToast('Đang tạo ảnh chất lượng cao để chia sẻ...', 'info');

    const renderOptions = {
      quality: 0.95,
      pixelRatio: 2, // Đảm bảo độ sắc nét cao (Retina) khi tải lên Facebook/Story
      cacheBust: true, // Tránh các vấn đề cache ảnh từ nguồn ngoài
      width: 640,
      height: 1136,
    };

    try {
      // Gọi lần 1 để kích hoạt nạp tài nguyên / render trong Safari/iOS
      await toPng(shareCardRef.current, renderOptions);
      
      // Chờ 150ms để Safari cập nhật bộ nhớ đệm canvas
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      // Gọi lần 2 để lấy dữ liệu ảnh thực tế
      const dataUrl = await toPng(shareCardRef.current, renderOptions);

      const link = document.createElement('a');
      const formattedName = shareStudentName.trim()
        ? shareStudentName.trim().replace(/\s+/g, '_')
        : 'Sinh_Vien_DTU';
      link.download = `GPA_DTU_${formattedName}_${dtuResult.cumulativeGpa.toFixed(2)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Đã tạo ảnh chia sẻ thành công!', 'success');

      // Lưu ảnh đã tạo và mở modal hướng dẫn tải trên di động
      setDownloadedImageUrl(dataUrl);
      setIsDownloadModalOpen(true);
    } catch (err) {
      console.error('Lỗi khi tạo ảnh chia sẻ:', err);
      showToast('Có lỗi xảy ra khi tạo ảnh. Vui lòng thử lại!', 'error');
    }
  };

  // Hàm chia sẻ ảnh trực tiếp lên hệ thống di động hoặc qua link dự phòng
  const handleShareNative = async () => {
    if (!downloadedImageUrl) return;
    setIsSharingImage(true);
    try {
      const response = await fetch(downloadedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], `GPA_DTU_Story.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'GPA DTU Story Card',
          text: 'Khoe kết quả học tập GPA Duy Tân của tôi!'
        });
        showToast('Đã mở màn hình chia sẻ hệ thống!', 'success');
      } else {
        // Fallback: Tải ảnh lên Telegraph để lấy link chia sẻ
        showToast('Đang tải ảnh lên máy chủ để lấy liên kết chia sẻ...', 'info');
        const url = await uploadImageToTelegraph(file);
        if (url) {
          if (navigator.share) {
            await navigator.share({
              title: 'GPA DTU Story Card',
              text: 'Khoe kết quả học tập GPA Duy Tân của tôi!',
              url: url
            });
          } else {
            // Sao chép link vào Clipboard
            await navigator.clipboard.writeText(url);
            showToast('Đã sao chép liên kết ảnh trực tuyến! Hãy dán để chia sẻ.', 'success');
            window.open(url, '_blank');
          }
        } else {
          showToast('Thiết bị không hỗ trợ chia sẻ trực tiếp. Hãy chụp màn hình nhé!', 'info');
        }
      }
    } catch (err) {
      console.error('Lỗi khi chia sẻ:', err);
      showToast('Không thể chia sẻ ảnh tự động. Vui lòng chụp ảnh màn hình!', 'error');
    } finally {
      setIsSharingImage(false);
    }
  };

  // Hàm Xử lý Tải ảnh nền tùy chỉnh từ thiết bị
  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước ảnh nền phải dưới 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomBgImage(result);
      setSelectedThemeId('custom');
      showToast('Đã tải ảnh nền của bạn thành công!', 'success');
    };
    reader.onerror = () => {
      showToast('Lỗi khi đọc file ảnh nền.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Hàm Nhập dữ liệu bảng điểm từ file JSON hoặc HTML
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let jsonData: any = null;

        if (text.includes('<!DOCTYPE html>') || text.includes('id="dtu-gpa-data"')) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const scriptTag = doc.getElementById('dtu-gpa-data');
          if (scriptTag && scriptTag.textContent) {
            jsonData = JSON.parse(scriptTag.textContent);
          } else {
            throw new Error('Không tìm thấy dữ liệu cấu trúc trong file HTML!');
          }
        } else {
          jsonData = JSON.parse(text);
        }

        if (jsonData && typeof jsonData === 'object') {
          // Validate và làm sạch courses
          if (Array.isArray(jsonData.courses)) {
            const validatedCourses = jsonData.courses.map((c: any) => ({
              id: c.id || `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              courseCode: String(c.courseCode || '').trim().toUpperCase(),
              courseName: String(c.courseName || '').trim(),
              credits: Math.max(1, Number(c.credits) || 3),
              gradeChar: String(c.gradeChar || '') as GradeChar,
              isConditionCourse: !!c.isConditionCourse,
              isRetake: !!c.isRetake,
              replacesCourseId: c.replacesCourseId || null,
              academicYear: String(c.academicYear || '2025-2026'),
              semester: String(c.semester || 'Học kỳ 1') as any
            }));
            updateCoursesState(validatedCourses);
          }

          // Validate targetCredits
          if (typeof jsonData.targetCredits === 'number' && jsonData.targetCredits > 0) {
            setTargetCredits(jsonData.targetCredits);
          }

          // Validate curriculumCourses
          if (Array.isArray(jsonData.curriculumCourses)) {
            const validatedCurriculum = jsonData.curriculumCourses.map((cc: any) => ({
              courseCode: String(cc.courseCode || '').trim().toUpperCase(),
              courseName: String(cc.courseName || '').trim(),
              credits: Math.max(1, Number(cc.credits) || 3)
            }));
            setCurriculumCourses(validatedCurriculum);
          }

          showToast('Đã nhập và khôi phục dữ liệu bảng điểm thành công!', 'success');
          setIsMockDataLoaded(false);
        } else {
          showToast('Tệp dữ liệu không đúng định dạng!', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Lỗi đọc tệp tin! Hãy đảm bảo đây là file dữ liệu được xuất từ app.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const handleTriggerImport = () => {
    importFileInputRef.current?.click();
  };

  // Xóa tất cả môn học trong 1 học kỳ cụ thể
  const handleDeleteSemester = (year: string, sem: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click mở rộng/thu gọn header
    setConfirmModal({
      isOpen: true,
      title: `Xóa toàn bộ ${sem}`,
      message: `Bạn sắp xóa tất cả môn học trong ${sem} (${year}). Hành động này KHÔNG THỂ hoàn tác!`,
      confirmText: 'Xóa Học kỳ',
      onConfirm: () => {
        const updatedCourses = courses.filter(c => !(c.academicYear === year && c.semester === sem));
        updateCoursesState(updatedCourses);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Gom nhóm môn học theo Năm học -> Học kỳ phục vụ chế độ xem 'grouped'
  const groupedCourses = useMemo(() => {
    const groups: Record<string, Record<string, ProcessedCourse[]>> = {};
    
    summaryResult.processedCourses.forEach(pc => {
      // Áp dụng bộ lọc tìm kiếm
      const matchesSearch = 
        pc.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pc.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return;

      // Áp dụng bộ lọc danh mục
      if (filterType === 'accumulated' && (pc.isConditionCourse || pc.isReplaced)) return;
      if (filterType === 'condition' && !pc.isConditionCourse) return;
      if (filterType === 'replaced' && !pc.isReplaced) return;

      const year = pc.academicYear;
      const sem = pc.semester;
      
      if (!groups[year]) {
        groups[year] = {};
      }
      if (!groups[year][sem]) {
        groups[year][sem] = [];
      }
      groups[year][sem].push(pc);
    });

    return groups;
  }, [summaryResult.processedCourses, searchTerm, filterType]);

  // Sắp xếp thứ tự Năm học (Giảm dần) và Học kỳ (Tăng dần)
  const sortedAcademicYears = useMemo(() => {
    return Object.keys(groupedCourses).sort((a, b) => b.localeCompare(a));
  }, [groupedCourses]);

  const sortedSemestersInYear = (year: string) => {
    const semOrder = ['Học kỳ 1', 'Học kỳ 2', 'Học kỳ Hè'];
    return Object.keys(groupedCourses[year]).sort((a, b) => semOrder.indexOf(a) - semOrder.indexOf(b));
  };

  const scholarshipScopeOptions = useMemo(() => {
    const options = [{ value: 'cumulative', label: 'Tích lũy (Toàn khóa)' }];
    
    sortedAcademicYears.forEach(year => {
      options.push({ value: `year:${year}`, label: `Năm học ${year} (Kỳ 1 + Kỳ 2)` });
    });
    
    return options;
  }, [sortedAcademicYears]);

  const scholarshipTargetData = useMemo(() => {
    const { replacedIds } = resolveRetakes(courses);

    if (scholarshipScope === 'cumulative') {
      // Học bổng toàn khóa: không được đang nợ môn F nào (F chưa được học cải thiện/học lại thay thế)
      const hasFailedCourse = courses.some(c => c.gradeChar === 'F' && !c.isConditionCourse && !replacedIds.has(c.id));
      return {
        gpa: dtuResult.cumulativeGpa,
        credits: dtuResult.accumulatedCredits,
        hasGrades,
        hasFailedCourse
      };
    }
    
    if (scholarshipScope.startsWith('year:')) {
      const targetYear = scholarshipScope.substring(5);
      // Quy chế xét học bổng cả năm học: chỉ tính HK1 + HK2 chính khóa, KHÔNG tính Học kỳ Hè
      const yearCourses = courses.filter(c => c.academicYear === targetYear && c.semester !== 'Học kỳ Hè');
      const yearResult = calculateDTUGPA(yearCourses);
      const gradedCount = yearCourses.filter(c => !c.isConditionCourse && c.gradeChar !== '').length;
      const hasFailedCourse = yearCourses.some(c => c.gradeChar === 'F' && !c.isConditionCourse);
      return {
        gpa: yearResult.cumulativeGpa,
        credits: yearResult.accumulatedCredits,
        hasGrades: gradedCount > 0,
        hasFailedCourse
      };
    }
    
    return { gpa: 0, credits: 0, hasGrades: false, hasFailedCourse: false };
  }, [scholarshipScope, courses, dtuResult, hasGrades]);

  // Lọc phẳng phục vụ chế độ xem 'flat'
  const flatFilteredCourses = useMemo(() => {
    return summaryResult.processedCourses.filter(pc => {
      const matchesSearch = 
        pc.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pc.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (filterType === 'accumulated') return !pc.isConditionCourse && !pc.isReplaced;
      if (filterType === 'condition') return pc.isConditionCourse;
      if (filterType === 'replaced') return pc.isReplaced;
      return true;
    });
  }, [summaryResult.processedCourses, searchTerm, filterType]);

  // Toggle thu gọn/mở rộng nhóm học kỳ
  const toggleSemester = (semKey: string) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [semKey]: prev[semKey] === undefined ? false : !prev[semKey]
    }));
  };

  // Cấu hình tọa độ cho biểu đồ Combo Chart SVG xu hướng GPA (Cột và Đường)
  const chartSvgPath = useMemo(() => {
    if (gpaTrend.length === 0) return { lineCum: '', areaCum: '', lineSem: '', areaSem: '', points: [], yBase: 145 };
    
    const n = gpaTrend.length;
    const svgWidth = n <= 7 ? 560 : n * 70;
    const svgHeight = 180;
    const paddingLeft = 40;
    const paddingRight = 30;
    const paddingTop = 35;
    const paddingBottom = 25;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;
    const yBase = paddingTop + chartHeight; // 155

    const points = gpaTrend.map((point, index) => {
      const x = gpaTrend.length > 1
        ? paddingLeft + (index / (gpaTrend.length - 1)) * chartWidth
        : paddingLeft + chartWidth / 2;
        
      // Trục Y: GPA chạy từ 0.00 đến 4.00
      const yCum = yBase - (point.cumulativeGpa / 4.0) * chartHeight;
      const ySem = yBase - (point.semesterGpa / 4.0) * chartHeight;
      return { x, yCum, ySem, point };
    });

    const getBezierPath = (coords: {x: number, y: number}[]) => {
      if (coords.length === 0) return '';
      if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
      
      let d = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[i];
        const p1 = coords[i + 1];
        const cp1x = p0.x + (p1.x - p0.x) / 3;
        const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
        
        let cp1y = p0.y;
        let cp2y = p1.y;
        
        if (i > 0) {
          const pPrev = coords[i - 1];
          const slope = (p1.y - pPrev.y) / (p1.x - pPrev.x);
          cp1y = p0.y + slope * (p0.x - pPrev.x) / 3;
        }
        
        if (i < coords.length - 2) {
          const pNext = coords[i + 2];
          const slope = (pNext.y - p0.y) / (pNext.x - p0.x);
          cp2y = p1.y - slope * (pNext.x - p1.x) / 3;
        }
        
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      }
      return d;
    };

    const ptsCum = points.map(p => ({ x: p.x, y: p.yCum }));
    const ptsSem = points.map(p => ({ x: p.x, y: p.ySem }));

    const lineCum = getBezierPath(ptsCum);
    const areaCum = ptsCum.length > 0 
      ? `${lineCum} L ${ptsCum[ptsCum.length - 1].x} ${yBase} L ${ptsCum[0].x} ${yBase} Z`
      : '';

    const lineSem = getBezierPath(ptsSem);
    const areaSem = ptsSem.length > 0 
      ? `${lineSem} L ${ptsSem[ptsSem.length - 1].x} ${yBase} L ${ptsSem[0].x} ${yBase} Z`
      : '';

    return { lineCum, areaCum, lineSem, areaSem, points, yBase };
  }, [gpaTrend]);

  // 7. Xử lý Gửi Báo cáo Lỗi qua Gmail (mailto hoặc Web Gmail)
  const handleSendBugReport = async (type: 'web' | 'app') => {
    if (!bugText.trim()) {
      showToast('Vui lòng nhập mô tả lỗi!', 'error');
      return;
    }

    setIsSendingBug(true);
    let uploadedUrl: string | null = null;
    let imageCopied = false;

    if (bugImage) {
      showToast('Đang xử lý và tải ảnh báo cáo lên máy chủ...', 'info');
      // Thử tải lên Telegraph trước
      uploadedUrl = await uploadImageToTelegraph(bugImage);
      
      // Nếu lỗi, thử tải lên file.io làm dự phòng
      if (!uploadedUrl) {
        uploadedUrl = await uploadImageToFileIo(bugImage);
      }
      
      // Nếu tất cả server đều lỗi, chuyển về copy clipboard
      if (!uploadedUrl && bugPngBlob) {
        imageCopied = await copyBlobToClipboard(bugPngBlob);
      }
    }

    const email = 'levanthang0166@gmail.com';
    const rawSubject = '[Báo cáo lỗi] Công cụ tính điểm GPA DTU';
    
    // Mẫu mail chuyên nghiệp
    let rawBody = `Kính gửi Admin Lê Văn Thắng,\n\n` +
      `Tôi xin báo cáo một lỗi gặp phải khi sử dụng ứng dụng "Công cụ tính điểm GPA DTU":\n\n` +
      `MÔ TẢ CHI TIẾT LỖI:\n` +
      `"${bugText}"\n\n` +
      `--------------------------------------------------\n`;

    if (uploadedUrl) {
      rawBody += `ẢNH CHỤP MÀN HÌNH ĐÍNH KÈM (Đã tải lên máy chủ):\n` +
        `👉 Link xem ảnh: ${uploadedUrl}\n\n` +
        `--------------------------------------------------\n`;
    } else if (bugImage && imageCopied) {
      rawBody += `ẢNH CHỤP MÀN HÌNH ĐÍNH KÈM (Đã lưu clipboard):\n` +
        `-> [Bạn hãy nhấn Ctrl+V tại ô soạn thư này để chèn hình ảnh lỗi đã copy!]\n\n` +
        `--------------------------------------------------\n`;
    }

    rawBody += `THÔNG TIN HỆ THỐNG:\n` +
      `- Số môn học hiện tại: ${courses.length} môn\n` +
      `- Điểm GPA tích lũy: ${dtuResult.cumulativeGpa.toFixed(2)}\n` +
      `- Số tín chỉ tích lũy: ${dtuResult.accumulatedCredits} TC\n` +
      `- Trình duyệt sử dụng: ${navigator.userAgent}\n` +
      `- Thời gian báo cáo: ${new Date().toLocaleString()}\n` +
      `--------------------------------------------------\n\n` +
      `Trân trọng cảm ơn bạn đã hỗ trợ và phát triển công cụ này!`;

    const subject = encodeURIComponent(rawSubject);
    const body = encodeURIComponent(rawBody);

    // Nếu không có ảnh thì copy văn bản báo cáo vào clipboard dự phòng
    if (!bugImage) {
      try {
        await navigator.clipboard.writeText(rawBody);
      } catch (e) {}
    }

    if (type === 'web') {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
    } else {
      window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    }

    setIsSendingBug(false);

    if (bugImage) {
      if (uploadedUrl) {
        showToast('Đã tải ảnh lên máy chủ thành công! Link ảnh đã được chèn tự động vào thư.', 'success');
      } else if (imageCopied) {
        showToast('Không thể tải ảnh lên. Đã copy ảnh, vui lòng nhấn Ctrl+V trong Gmail để dán.', 'success');
      } else {
        showToast('Không thể copy ảnh. Vui lòng chụp màn hình và dán thủ công.', 'error');
      }
    } else {
      showToast('Đang chuyển hướng bạn tới Gmail soạn thư!', 'success');
    }
  };

  // 8. Xử lý Gửi Ý kiến Đóng góp qua Gmail (mailto hoặc Web Gmail)
  const handleSendSuggestion = async (type: 'web' | 'app') => {
    if (!suggestionText.trim()) {
      showToast('Vui lòng nhập ý kiến đóng góp!', 'error');
      return;
    }

    setIsSendingSuggestion(true);
    let uploadedUrl: string | null = null;
    let imageCopied = false;

    if (suggestionImage) {
      showToast('Đang xử lý và tải ảnh ý tưởng lên máy chủ...', 'info');
      uploadedUrl = await uploadImageToTelegraph(suggestionImage);
      
      if (!uploadedUrl) {
        uploadedUrl = await uploadImageToFileIo(suggestionImage);
      }
      
      if (!uploadedUrl && suggestionPngBlob) {
        imageCopied = await copyBlobToClipboard(suggestionPngBlob);
      }
    }

    const email = 'levanthang0166@gmail.com';
    const rawSubject = '[Góp ý cải tiến] Công cụ tính điểm GPA DTU';
    
    // Mẫu mail chuyên nghiệp
    let rawBody = `Kính gửi Admin Lê Văn Thắng,\n\n` +
      `Tôi xin gửi ý kiến đóng góp nhằm cải thiện ứng dụng "Công cụ tính điểm GPA DTU":\n\n` +
      `NỘI DUNG ĐÓNG GÓP:\n` +
      `"${suggestionText}"\n\n` +
      `--------------------------------------------------\n`;

    if (uploadedUrl) {
      rawBody += `ẢNH MINH HỌA ĐÍNH KÈM (Đã tải lên máy chủ):\n` +
        `👉 Link xem ảnh: ${uploadedUrl}\n\n` +
        `--------------------------------------------------\n`;
    } else if (suggestionImage && imageCopied) {
      rawBody += `ẢNH MINH HỌA ĐÍNH KÈM (Đã lưu clipboard):\n` +
        `-> [Bạn hãy nhấn Ctrl+V tại ô soạn thư này để chèn hình ảnh ý tưởng đã copy!]\n\n` +
        `--------------------------------------------------\n`;
    }

    rawBody += `THÔNG TIN HỆ THỐNG:\n` +
      `- Trình duyệt sử dụng: ${navigator.userAgent}\n` +
      `- Thời gian báo cáo: ${new Date().toLocaleString()}\n` +
      `--------------------------------------------------\n\n` +
      `Trân trọng cảm ơn bạn đã đóng góp xây dựng ứng dụng!`;

    const subject = encodeURIComponent(rawSubject);
    const body = encodeURIComponent(rawBody);

    if (!suggestionImage) {
      try {
        await navigator.clipboard.writeText(rawBody);
      } catch (e) {}
    }

    if (type === 'web') {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
    } else {
      window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    }

    setIsSendingSuggestion(false);

    if (suggestionImage) {
      if (uploadedUrl) {
        showToast('Đã tải ảnh lên máy chủ thành công! Link ảnh đã được chèn tự động vào thư.', 'success');
      } else if (imageCopied) {
        showToast('Không thể tải ảnh lên. Đã copy ảnh, vui lòng nhấn Ctrl+V trong Gmail để dán.', 'success');
      } else {
        showToast('Không thể copy ảnh. Vui lòng chụp màn hình và dán thủ công.', 'error');
      }
    } else {
      showToast('Đang chuyển hướng bạn tới Gmail soạn thư!', 'success');
    }
  };

  // 9. Sao chép nhanh Email của tác giả
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('levanthang0166@gmail.com');
    setCopiedEmail(true);
    showToast('Đã sao chép địa chỉ email levanthang0166@gmail.com!', 'success');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const activeGrades = selectedDetailedCourse ? tempDetailedGrades : sandboxDetailedGrades;
  const setActiveGrades = selectedDetailedCourse ? setTempDetailedGrades : setSandboxDetailedGrades;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 text-gray-800">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-5 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 bg-indigo-500/10 rounded-xl text-blue-700 border border-indigo-500/20 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
              Ứng Dụng Tính Điểm GPA Duy Tân (DTU)
              <button 
                onClick={() => setIsHelpModalOpen(true)}
                className="text-gray-450 hover:text-blue-700 hover:scale-110 active:scale-95 transition-all cursor-pointer p-1"
                title="Hướng dẫn sử dụng & Nhập điểm từ myDTU"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </h1>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">
            Tính toán GPA tích lũy, quản lý phân nhóm học kỳ và theo dõi tỉ lệ tín chỉ học cải thiện.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {courses.length === 0 && (
            <button
              onClick={loadMockScenario}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm text-white font-medium cursor-pointer"
              id="btn-load-mock"
            >
              <Database className="w-3.5 h-3.5" />
              Tải Dữ Liệu Mẫu (Nhiều Kỳ)
            </button>
          )}

          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer shadow-sm"
            title="Tải xuống bản điểm dạng file HTML tuyệt đẹp để xem hoặc in ấn"
            id="btn-export"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Bản Điểm</span>
          </button>
          
          <button
            onClick={() => {
              setShareStudentName('');
              setIsShareCardModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg bg-purple-50 border border-purple-100 text-purple-700 hover:bg-purple-100 active:scale-95 transition-all cursor-pointer shadow-sm"
            title="Tạo ảnh thẻ khoe điểm GPA siêu đẹp chia sẻ lên Facebook/Story"
            id="btn-share-card"
          >
            <Award className="w-3.5 h-3.5 text-violet-600" />
            <span>Khoe Kết Quả</span>
          </button>
          
          <button
            onClick={handleTriggerImport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-blue-700 hover:bg-indigo-500/20 active:scale-95 transition-all cursor-pointer shadow-sm shadow-indigo-500/5"
            title="Tải lên tệp HTML hoặc JSON đã xuất để khôi phục dữ liệu"
            id="btn-import"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập File</span>
          </button>
          
          <input 
            type="file" 
            ref={importFileInputRef} 
            onChange={handleImportFileChange} 
            accept=".json,.html" 
            className="hidden" 
            id="input-import-file"
          />
          
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg bg-pink-50 border border-pink-100 text-pink-700 hover:bg-pink-100 active:scale-95 transition-all cursor-pointer shadow-sm"
            title="Đồng hành cùng tác giả duy trì và phát triển ứng dụng"
            id="btn-support"
          >
            <Heart className="w-3.5 h-3.5 fill-pink-500/20" />
            Đồng Hành Cùng Dự Án
          </button>

          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-blue-700 hover:bg-indigo-500/20 active:scale-95 transition-all cursor-pointer shadow-sm shadow-indigo-500/5"
            title="Liên hệ Admin, báo lỗi hoặc góp ý kiến"
            id="btn-feedback"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Hỗ Trợ & Góp Ý
          </button>
          
          <button
            onClick={handleResetApp}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 active:scale-95 transition-all cursor-pointer shadow-sm"
            id="btn-reset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset App (Xóa Sạch)
          </button>
        </div>
      </header>

      {/* CẢNH BÁO DỮ LIỆU MẪU */}
      {isMockDataLoaded && courses.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-indigo-500/20 rounded-xl text-blue-700 mt-0.5">
              <Database className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">💡 Bạn đang xem dữ liệu ví dụ mẫu (Demo)</h4>
              <p className="text-xs text-gray-600">
                Toàn bộ dữ liệu hiển thị bên dưới chỉ là dữ liệu ví dụ mẫu để bạn chạy thử tính năng.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              try {
                localStorage.removeItem('dtu_gpa_courses');
              } catch (e) {}
              updateCoursesState([]);
              setIsMockDataLoaded(false);
              setIsRemainingCreditsEdited(false);
            }}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-500 hover:bg-rose-600 text-white shadow-md active:scale-95 transition-all cursor-pointer border-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa dữ liệu mẫu này
          </button>
        </div>
      )}

      {/* DASHBOARD METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        
        {/* GPA CARD */}
        <div className="relative group overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm transition-all">
          <div className=""></div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-gray-500 tracking-wider font-semibold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-700" />
              GPA TÍCH LŨY HỆ 4.0
            </span>
            <span 
              onClick={() => setIsHelpModalOpen(true)}
              className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${gpaClassification.color} cursor-pointer hover:bg-gray-100 hover:shadow-sm transition-all flex items-center gap-1`}
              title="Nhấp để xem Quy chế xếp loại tốt nghiệp DTU"
            >
              {gpaClassification.name}
              <HelpCircle className="w-3 h-3 opacity-85" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950" id="dashboard-gpa">
              {hasGrades ? dtuResult.cumulativeGpa.toFixed(2) : '--'}
            </span>
            <span className="text-gray-400 text-xs">/ 4.00</span>
          </div>
          {hasGrades && dtuResult.rawCumulativeGpa > 0 && (
            <div 
              onClick={() => setIsGpaDetailModalOpen(true)}
              className="mt-2 flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-500/10 border border-indigo-500/20 text-blue-700 hover:bg-indigo-550/20 hover:text-indigo-300 active:scale-95 transition-all select-none w-fit cursor-pointer shadow-sm"
              title="Nhấp để xem chi tiết cách tính điểm GPA"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-700 animate-pulse" />
              <span>Chỉ số thực: {dtuResult.rawCumulativeGpa.toFixed(4)}</span>
            </div>
          )}
          <p 
            onClick={() => setIsGpaDetailModalOpen(true)}
            className="text-[11px] text-gray-500 mt-2.5 flex items-center gap-1.5 cursor-pointer hover:text-blue-700 transition-colors select-none"
            title="Nhấp để xem chi tiết cách tính điểm và cơ chế học cải thiện"
          >
            <span className="underline decoration-dotted decoration-gray-300 hover:decoration-blue-600">
              Đã trừ điểm gốc của các môn bị học cải thiện.
            </span>
          </p>
        </div>

        {/* CREDITS CARD */}
        <div className="relative group overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm transition-all">
          <div className=""></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 tracking-wider font-semibold flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-green-700" />
              TÍN CHỈ TÍCH LŨY ĐẠT
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-450">Mục tiêu:</span>
              <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-green-700 text-[11px] font-bold rounded">
                {targetCredits} TC
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950" id="dashboard-credits">
              {dtuResult.accumulatedCredits}
            </span>
            <span className="text-gray-400 text-xs">/</span>
            {isEditingTargetCredits ? (
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={tempTargetCredits}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTempTargetCredits(val === '' ? '' : parseInt(val) || 0);
                  }}
                  className="w-16 bg-white border border-emerald-500 rounded px-1.5 py-0.5 text-center text-xs font-semibold text-emerald-700 focus:outline-none focus:border-emerald-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const finalVal = Math.max(1, Number(tempTargetCredits) || 1);
                      setTargetCredits(finalVal);
                      setTempTargetCredits(finalVal);
                      setIsEditingTargetCredits(false);
                    } else if (e.key === 'Escape') {
                      setTempTargetCredits(targetCredits);
                      setIsEditingTargetCredits(false);
                    }
                  }}
                  id="input-target-credits"
                />
                <button 
                  onClick={() => {
                    const finalVal = Math.max(1, Number(tempTargetCredits) || 1);
                    setTargetCredits(finalVal);
                    setTempTargetCredits(finalVal);
                    setIsEditingTargetCredits(false);
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center justify-center"
                  title="Lưu"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setTempTargetCredits(targetCredits);
                    setIsEditingTargetCredits(false);
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-rose-600 hover:text-rose-650 cursor-pointer flex items-center justify-center"
                  title="Hủy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                className="flex items-center gap-1 group/credits cursor-pointer bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 hover:border-emerald-500/50 transition-all" 
                onClick={() => {
                  setTempTargetCredits(targetCredits);
                  setIsEditingTargetCredits(true);
                }}
                title="Nhấp để thay đổi tổng số tín chỉ tốt nghiệp của ngành bạn"
              >
                <span className="text-gray-650 text-[11px] hover:text-green-700 font-bold transition">
                  {targetCredits} TC (Nhấp để sửa)
                </span>
                <Pencil className="w-2.5 h-2.5 text-gray-450 group-hover/credits:text-green-700 transition opacity-80" />
              </div>
            )}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (dtuResult.accumulatedCredits / targetCredits) * 100)}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-[10px] text-gray-450">Đã hoàn thành {targetCredits > 0 ? Math.round((dtuResult.accumulatedCredits / targetCredits) * 100) : 0}%</span>
            <button 
              onClick={() => setIsCurriculumModalOpen(true)}
              className="text-[10px] text-blue-700 hover:text-indigo-300 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
              id="btn-curriculum-modal"
            >
              <Sparkles className="w-3 h-3" />
              Khung chương trình
            </button>
          </div>

          {showCreditsHint && courses.length === 0 && curriculumCourses.length === 0 && (
            <div className="mt-3 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl relative animate-fadeIn">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreditsHint(false);
                  try {
                    localStorage.setItem('dtu_gpa_dismissed_credits_hint', 'true');
                  } catch (err) {}
                }}
                className="absolute top-1 right-1 text-gray-450 hover:text-blue-700 transition cursor-pointer p-0.5"
                title="Đóng thông báo"
              >
                <X className="w-2.5 h-2.5" />
              </button>
              <div className="flex gap-1.5 items-start pr-3">
                <Sparkles className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[10px] leading-normal text-gray-650">
                  👋 <strong>Mẹo:</strong> Nhấp vào <strong>Khung chương trình</strong> ở dưới để dán khung từ myDTU hoặc nhập trực tiếp tổng tín chỉ ngành của bạn để app tự động thiết lập nhanh chóng nhé!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RETAKES CARD */}
        <div className="relative group overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm transition-all">
          <div className=""></div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-gray-500 tracking-wider font-semibold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-400" />
              TÍN CHỈ HỌC LẠI / CẢI THIỆN
            </span>
            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              isRetakeExceeded 
                ? 'text-rose-700 bg-rose-50 border-rose-100' 
                : 'text-green-700 bg-green-50 border-green-100'
            }`} id="retake-badge">
              {isRetakeExceeded ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  Vượt ngưỡng 5%
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-green-700" />
                  An toàn (&le; 5%)
                </>
              )}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950" id="dashboard-retakes">
              {dtuResult.totalRetakeCredits}
            </span>
            <span className="text-gray-400 text-xs">TC ({retakeRatio.toFixed(1)}%)</span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isRetakeExceeded ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(100, (retakeRatio / 5.0) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            {isRetakeExceeded 
              ? '⚠️ Tỷ lệ học lại vượt quá 5% (Ảnh hưởng xét bằng tốt nghiệp Giỏi)' 
              : `Hạn mức tốt nghiệp: tối đa ${(targetCredits * 0.05).toFixed(1)} TC.`}
          </p>
        </div>

        {/* FAILED CREDITS CARD */}
        <div className="relative group overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm transition-all">
          <div className=""></div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-gray-500 tracking-wider font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              NỢ MÔN / CHƯA ĐẠT (F)
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              totalFailedCredits > 0 
                ? 'text-rose-700 bg-rose-50 border-rose-100 animate-pulse' 
                : 'text-green-700 bg-green-50 border-green-100'
            }`} id="dashboard-failed-badge">
              {totalFailedCredits > 0 ? 'Cần trả nợ' : 'Sạch điểm F'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950" id="dashboard-failed-credits">
              {totalFailedCredits}
            </span>
            <span className="text-gray-400 text-xs">TC ({failedCourses.length} môn)</span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${totalFailedCredits > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}
              style={{ width: `${totalFailedCredits > 0 ? 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 truncate" title={totalFailedCredits > 0 ? `Môn nợ: ${failedCourses.map(c => c.courseCode).join(', ')}` : ''}>
            {totalFailedCredits > 0 
              ? `⚠️ Môn nợ: ${failedCourses.map(c => c.courseCode).join(', ')}`
              : 'Tuyệt vời! Bạn không có môn học nào bị điểm F.'}
          </p>
        </div>

      </section>

      {/* GRAPH & CHART PANEL & SCHOLARSHIP EVALUATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 lg:items-start">
        
        {/* LEFT PANEL: GPA CHART */}
        <section className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col">
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-700" />
              BIỂU ĐỒ XU HƯỚNG GPA HỌC KỲ
            </h2>
            <p className="text-[11px] text-gray-450 mb-4 font-medium">
              Nhấp vào các điểm mốc trên biểu đồ để xem điểm chi tiết của từng kỳ.
            </p>
            
            {gpaTrend.length >= 2 ? (
              <div className="w-full">
                <div 
                  ref={chartContainerRef}
                  className="w-full h-[185px] relative"
                >
                  <svg width="100%" height="180" viewBox="0 0 560 180" className="overflow-visible">
                      <defs>
                        {/* Gradient cho đường line GPA Học kỳ */}
                        <linearGradient id="line-gradient-sem" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                        {/* Gradient cho vùng area GPA Học kỳ */}
                        <linearGradient id="area-gradient-sem" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
                        </linearGradient>
                      </defs>

                      {/* Các đường Grid ngang chỉ thị mức GPA */}
                      {[1.0, 2.0, 3.0, 4.0].map((level) => {
                          const y = 35 + 120 - (level / 4.0) * 120;
                          return (
                            <g key={level}>
                              <line 
                                x1="40" 
                                y1={y} 
                                x2="530" 
                                y2={y} 
                                stroke="#e2e8f0" 
                                strokeWidth="1" 
                                strokeDasharray="4 4" 
                              />
                              <text x="32" y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="bold">
                                {level.toFixed(2)}
                              </text>
                            </g>
                          );
                        })}

                      {/* Vùng diện tích Gradient phía dưới GPA Học kỳ */}
                      <path d={chartSvgPath.areaSem} fill="url(#area-gradient-sem)" style={{ pointerEvents: 'none' }} />

                      {/* GPA Học kỳ smooth line & glow */}
                      <path 
                        d={chartSvgPath.lineSem} 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="6" 
                        opacity="0.15"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ pointerEvents: 'none' }}
                      />
                      <path 
                        d={chartSvgPath.lineSem} 
                        fill="none" 
                        stroke="url(#line-gradient-sem)" 
                        strokeWidth="3.2" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ pointerEvents: 'none' }}
                      />

                      {/* Vẽ chấm nút (Nodes) của GPA Học Kỳ */}
                      {chartSvgPath.points.map((p, idx) => {
                        const isSelected = activePointIndex === idx;
                        const isHovered = hoveredPoint && hoveredPoint.x === p.x;
                        return (
                          <g key={`node-group-${p.point.semesterId}`}>
                            {isSelected && (
                              <circle 
                                cx={p.x} 
                                cy={p.ySem} 
                                r="9" 
                                fill="#3b82f6" 
                                opacity="0.2" 
                                className="animate-ping" 
                              />
                            )}
                            <circle 
                              cx={p.x} 
                              cy={p.ySem} 
                              r={isSelected ? "5.5" : isHovered ? "5" : "4"} 
                              fill={isSelected ? "#10b981" : "#3b82f6"} 
                              stroke="#ffffff" 
                              strokeWidth={isSelected ? "2.2" : "1.8"} 
                              className="transition-all duration-200"
                              style={{ pointerEvents: 'none' }}
                            />
                          </g>
                        );
                      })}

                      {/* Các nhãn học kỳ ở trục X */}
                      {chartSvgPath.points.map((p) => {
                        const isActive = (hoveredPoint && hoveredPoint.x === p.x) || (activeTrendPoint && activeTrendPoint.semesterId === p.point.semesterId);
                        return (
                          <text 
                            key={`label-${p.point.semesterId}`}
                            x={p.x} 
                            y="172" 
                            textAnchor="middle" 
                            fill={isActive ? '#1d4ed8' : '#94a3b8'} 
                            fontSize="9" 
                            fontWeight={isActive ? '800' : '600'}
                            className="transition-all duration-150"
                            style={{ pointerEvents: 'none' }}
                          >
                            {p.point.label}
                          </text>
                        );
                      })}

                      {/* Đường kẻ đứng chỉ thị và hiệu ứng pulse khi hover */}
                      {hoveredPoint && (
                        <g style={{ pointerEvents: 'none' }}>
                          <line 
                            x1={hoveredPoint.x} 
                            y1="30" 
                            x2={hoveredPoint.x} 
                            y2={chartSvgPath.yBase} 
                            stroke="#1d4ed8" 
                            strokeWidth="1.2" 
                            strokeDasharray="3 3" 
                            opacity="0.8"
                          />
                          {/* Pulse ring */}
                          <circle 
                            cx={hoveredPoint.x} 
                            cy={hoveredPoint.ySem} 
                            r="9" 
                            fill="#1d4ed8" 
                            opacity="0.4" 
                            className="animate-ping" 
                          />
                          <circle 
                            cx={hoveredPoint.x} 
                            cy={hoveredPoint.ySem} 
                            r="6.5" 
                            fill="#1d4ed8" 
                            stroke="#ffffff" 
                            strokeWidth="2.5" 
                          />
                        </g>
                      )}

                      {/* Các vùng tương tác trong suốt */}
                      {chartSvgPath.points.map((p, idx) => {
                        const prevPoint = idx > 0 ? chartSvgPath.points[idx - 1].point : null;
                        const diffGpa = prevPoint ? p.point.semesterGpa - prevPoint.semesterGpa : undefined;

                        const w = gpaTrend.length > 1 
                          ? 490 / (gpaTrend.length - 1)
                          : 490;
                        const xStart = p.x - w / 2;

                        return (
                          <rect
                            key={`hover-rect-${p.point.semesterId}`}
                            x={xStart}
                            y="30"
                            width={w}
                            height="130"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => {
                              setHoveredPoint({
                                x: p.x,
                                ySem: p.ySem,
                                label: p.point.label,
                                semesterGpa: p.point.semesterGpa,
                                academicYear: p.point.academicYear,
                                semester: p.point.semester,
                                diffGpa
                              });
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                            onClick={() => {
                              setSelectedPointIndex(idx);
                            }}
                          />
                        );
                      })}
                    </svg>

                    {/* Anchored Tooltip Card */}
                    {hoveredPoint && (() => {
                      const containerW = chartContainerRef.current?.offsetWidth || 560;
                      const scale = containerW / 560;
                      const actualX = hoveredPoint.x * scale;
                      const halfTip = 88;
                      const safeLeft = Math.max(halfTip + 4, Math.min(containerW - halfTip - 4, actualX));
                      return (
                      <div 
                        className="absolute bg-white border border-gray-200 rounded-xl p-2.5 shadow-lg text-[11px] pointer-events-none z-50 w-44 text-left transition-all duration-200 text-gray-800"
                        style={{ 
                          left: safeLeft,
                          top: hoveredPoint.ySem < 80 ? hoveredPoint.ySem + 20 : hoveredPoint.ySem - 65,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        {/* Tooltip Arrow */}
                        <div className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-gray-200 rotate-45 ${
                          hoveredPoint.ySem < 80 ? '-top-[5px] border-l border-t' : '-bottom-[5px] border-r border-b'
                        }`} />
                        
                        <span className="font-extrabold text-blue-700 block mb-1 text-center border-b border-gray-100 pb-1">
                          {hoveredPoint.semester}
                        </span>
                        <span className="text-[10px] text-gray-450 block text-center mb-1.5 font-bold">
                          Năm học {hoveredPoint.academicYear}
                        </span>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-semibold">GPA Học kỳ:</span>
                            <span className="font-extrabold text-green-700">{hoveredPoint.semesterGpa.toFixed(2)}</span>
                          </div>
                          {hoveredPoint.diffGpa !== undefined && (
                            <div className="pt-1.5 mt-1 border-t border-gray-200 flex items-center justify-between font-bold">
                              <span className="text-gray-500 font-semibold">So với kỳ trước:</span>
                              {hoveredPoint.diffGpa > 0 ? (
                                <span className="text-green-700 font-extrabold">↑ +{hoveredPoint.diffGpa.toFixed(2)}</span>
                              ) : hoveredPoint.diffGpa < 0 ? (
                                <span className="text-rose-400 font-extrabold">↓ {hoveredPoint.diffGpa.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-500">→ 0.00</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      );
                    })()}
                </div>

                {/* INTERACTIVE SELECTED SEMESTER DETAIL CARD */}
                {activeTrendPoint && (
                  <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-250 shadow-inner transition-all duration-300">
                    <div className="flex flex-row items-center justify-between gap-2 border-b border-gray-200 pb-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[8px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
                          Chi tiết kỳ
                        </span>
                        <h3 className="text-xs font-extrabold text-gray-900 truncate">
                          {activeTrendPoint.semester} — {activeTrendPoint.academicYear}
                        </h3>
                      </div>
                      
                      {/* Nút hành động nhanh */}
                      <button
                        onClick={() => {
                          const year = activeTrendPoint.academicYear;
                          const sem = activeTrendPoint.semester;
                          const targetId = `sem-group-${year}-${sem}`;
                          const element = document.getElementById(targetId);
                          if (element) {
                            setExpandedSemesters(prev => ({
                              ...prev,
                              [`${year}-${sem}`]: true
                            }));
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.classList.add('ring-2', 'ring-indigo-500/50', 'transition-all');
                            setTimeout(() => {
                              element.classList.remove('ring-2', 'ring-indigo-500/50');
                            }, 1500);
                          }
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                      >
                        <List className="w-3.5 h-3.5 text-blue-700" />
                        Cuộn tới bảng nhập điểm
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      {/* Cột trái: GPA & Học Lực */}
                      <div className="col-span-4 flex flex-col justify-center items-center bg-white border border-gray-200 rounded-xl p-2 text-center">
                        <span className="text-[8px] text-gray-450 font-bold uppercase tracking-wider block mb-0.5">GPA HỌC KỲ</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-extrabold text-green-600">
                            {activeTrendPoint.semesterGpa.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-gray-450 font-bold">/4</span>
                        </div>
                        
                        {(() => {
                          const hasGrades = activeSemesterCourses.some(c => !c.isConditionCourse && !!c.gradeChar);
                          if (!hasGrades) return (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border mt-1.5 text-gray-500 bg-gray-100 border-gray-200">
                              Chưa có điểm
                            </span>
                          );
                          return (
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border mt-1.5 ${
                              activeTrendPoint.semesterGpa >= 3.68 ? 'text-violet-700 bg-violet-50 border-violet-200' :
                              activeTrendPoint.semesterGpa >= 3.34 ? 'text-green-700 bg-green-50 border-green-100' :
                              activeTrendPoint.semesterGpa >= 2.68 ? 'text-blue-700 bg-blue-50 border-blue-100' :
                              activeTrendPoint.semesterGpa >= 2.0 ? 'text-amber-700 bg-amber-50 border-amber-100' :
                              'text-rose-700 bg-rose-50 border-rose-100'
                            }`}>
                              {activeTrendPoint.semesterGpa >= 3.68 ? 'Xuất Sắc 🏆' :
                               activeTrendPoint.semesterGpa >= 3.34 ? 'Giỏi 🥈' :
                               activeTrendPoint.semesterGpa >= 2.68 ? 'Khá 🥉' :
                               activeTrendPoint.semesterGpa >= 2.0 ? 'Trung bình 🎓' :
                               'Yếu/Kém ⚠️'}
                            </span>
                          );
                        })()}

                        <div className="w-full grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-gray-200 text-[9px]">
                          <div>
                            <span className="text-gray-450 block">Tín chỉ</span>
                            <span className="font-bold text-gray-950 text-[10px]">{activeTrendPoint.semesterCredits} TC</span>
                          </div>
                          <div>
                            <span className="text-gray-450 block">So kỳ trước</span>
                            {activePointIndex !== null && activePointIndex > 0 ? (
                              (() => {
                                const diff = activeTrendPoint.semesterGpa - gpaTrend[activePointIndex - 1].semesterGpa;
                                if (diff > 0) return <span className="font-extrabold text-green-700 text-[10px]">↑ +{diff.toFixed(2)}</span>;
                                if (diff < 0) return <span className="font-extrabold text-rose-400 text-[10px]">↓ {diff.toFixed(2)}</span>;
                                return <span className="text-gray-500 text-[10px]">→ 0.00</span>;
                              })()
                            ) : (
                              <span className="text-gray-450">-</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cột phải: Danh sách môn học */}
                      <div className="col-span-8 flex flex-col">
                        <span className="text-[9px] text-gray-450 font-bold uppercase tracking-wider block mb-1.5">MÔN HỌC ({activeSemesterCourses.length})</span>
                        
                        <div className="space-y-1 max-h-[112px] overflow-y-auto scrollbar-thin pr-1">
                          {activeSemesterCourses.length > 0 ? (
                            activeSemesterCourses.map((c) => {
                              const isReplaced = c.isReplaced;
                              return (
                                <div 
                                  key={c.id} 
                                  className={`flex items-center justify-between p-1.5 rounded bg-white border border-gray-200 text-[10.5px] gap-2 ${
                                    isReplaced ? 'opacity-40 line-through' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0 flex-grow">
                                    <span className="font-extrabold text-gray-500 bg-gray-50 border border-gray-200 px-1 py-0.5 rounded text-[9px] flex-shrink-0">
                                      {c.courseCode}
                                    </span>
                                    <span className="text-gray-700 font-medium truncate" title={c.courseName}>
                                      {c.courseName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className="text-[9px] text-gray-450 font-bold">{c.credits} TC</span>
                                    {c.gradeChar ? (
                                      <span className={`w-8 text-center font-bold px-1 py-0.5 rounded border text-[9px] ${
                                        c.gradeChar === 'A+' || c.gradeChar === 'A' ? 'text-green-700 bg-green-50 border-green-100' :
                                        c.gradeChar === 'A-' || c.gradeChar === 'B+' || c.gradeChar === 'B' ? 'text-blue-700 bg-blue-50 border-blue-100' :
                                        c.gradeChar === 'B-' || c.gradeChar === 'C+' || c.gradeChar === 'C' ? 'text-amber-700 bg-amber-50 border-amber-100' :
                                        c.gradeChar === 'C-' || c.gradeChar === 'D' ? 'text-orange-700 bg-orange-50 border-orange-200' :
                                        c.gradeChar === 'F' ? 'text-rose-700 bg-rose-50 border-rose-100' :
                                        'text-teal-700 bg-teal-50 border-teal-100'
                                      }`}>
                                        {c.gradeChar}
                                      </span>
                                    ) : (
                                      <span className="w-8 text-center font-bold px-1 py-0.5 rounded border text-[9px] text-gray-400 bg-gray-50 border-gray-200">
                                        --
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-6 text-gray-500 italic">
                              Học kỳ này không có môn học nào.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PREMIUM SUMMARY BANNER BELOW THE CHART */}
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-450 font-bold uppercase tracking-wider block">GPA Tích Lũy</span>
                    <span className="text-lg sm:text-xl font-extrabold text-blue-700">
                      {dtuResult.cumulativeGpa.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-gray-500 block">Hệ 4.00</span>
                  </div>
                  
                  <div className="space-y-1 border-x border-gray-200 px-2">
                    <span className="text-[10px] text-gray-450 font-bold uppercase tracking-wider block">Tín Chỉ Tích Lũy</span>
                    <span className="text-lg sm:text-xl font-extrabold text-gray-950">
                      {dtuResult.accumulatedCredits} <span className="text-xs text-gray-500 font-normal">TC</span>
                    </span>
                    <span className="text-[9px] text-gray-500 block">Đã hoàn thành</span>
                  </div>
                  
                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-450 font-bold uppercase tracking-wider block">Xếp Loại Học Lực</span>
                    <span className={`text-[10.5px] px-2.5 py-0.5 rounded-full font-bold border ${gpaClassification.color}`}>
                      {gpaClassification.name}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 h-[185px]">
                <TrendingUp className="w-8 h-8 mb-1.5 text-blue-700" />
                <p className="text-xs text-center px-4">
                  Chưa đủ dữ liệu để vẽ biểu đồ. Cần nhập tối thiểu môn học của **2 học kỳ** trở lên.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL: SCHOLARSHIP EVALUATOR */}
        <section className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              ĐIỂM RÈN LUYỆN & XÉT HỌC BỔNG
            </h2>

            {/* Bộ chọn phạm vi xét học bổng */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-650 flex items-center gap-1">
                Phạm vi xét học bổng:
              </label>
              <select
                value={scholarshipScope}
                onChange={(e) => setScholarshipScope(e.target.value)}
                className="w-full px-2 py-1.5 text-xs font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none cursor-pointer"
              >
                {scholarshipScopeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Slider & Input ĐRL */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-650 flex items-center gap-1">
                  Điểm Rèn Luyện (ĐRL)
                  <span className="text-[10px] text-gray-450 font-normal">(0 - 100)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={trainingScore}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      setTrainingScore(val);
                    }}
                    className="w-14 px-1.5 py-0.5 text-xs text-center font-bold text-gray-900 bg-white border border-gray-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                  {trainingScore !== '' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getTrainingClassification(trainingScore).color}`}>
                      {getTrainingClassification(trainingScore).name}
                    </span>
                  )}
                </div>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={trainingScore === '' ? 80 : trainingScore}
                onChange={(e) => setTrainingScore(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              {/* Tích điểm ĐRL nhanh và vạch thước đo */}
              <div className="relative w-full h-6 mt-1.5 text-[9px] text-gray-450 select-none">
                {/* Đường nằm ngang của thước đo */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gray-200" />
                
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => {
                  const isSpecial = [50, 70, 80, 90, 100].includes(tick);
                  return (
                    <div
                      key={tick}
                      className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
                      style={{ left: `${tick}%` }}
                      onClick={() => setTrainingScore(tick)}
                    >
                      {/* Vạch kẻ đứng */}
                      <div className={`w-[1px] h-1.5 ${isSpecial ? 'bg-blue-600 h-2' : 'bg-gray-300'} mb-1`} />
                      {/* Nhãn điểm số */}
                      <span className={`transition-colors hover:text-blue-700 leading-none ${
                        trainingScore === tick ? 'text-blue-700 font-extrabold scale-110' : ''
                      } ${isSpecial ? 'text-indigo-300 font-bold' : 'text-slate-600 font-normal'}`}>
                        {tick}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kết quả xếp loại học bổng dự kiến */}
            {(() => {
              const currentGpa = scholarshipTargetData.gpa;
              const currentDrl = Number(trainingScore) || 0;
              const result = getScholarshipStatus(
                currentGpa, 
                currentDrl, 
                scholarshipTargetData.hasGrades, 
                scholarshipTargetData.hasFailedCourse,
                scholarshipScope === 'cumulative'
              );

              return (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block">Kết Quả Đánh Giá Dự Kiến</span>
                  <div className={`rounded-xl p-3 bg-gradient-to-br border flex flex-col gap-1.5 ${result.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs uppercase tracking-wide">
                        {result.status}
                      </span>
                      {scholarshipTargetData.hasGrades && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/80 border border-current/25 font-bold">
                          GPA: {currentGpa.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {result.desc}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Bảng tiêu chuẩn tham chiếu */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                {scholarshipScope === 'cumulative' 
                  ? 'Tiêu Chuẩn Xếp Loại Tốt Nghiệp Toàn Khóa' 
                  : 'Tiêu Chuẩn Xét Học Bổng Năm Học (Quy Chế DTU)'}
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-medium text-gray-600">
                <div className="bg-white p-1.5 rounded border border-green-200 ring-1 ring-green-100">
                  <span className="text-green-700 font-bold block">🏆 Xuất Sắc</span>
                  <span className="text-[9px] block mt-0.5 font-semibold">
                    GPA ≥ {scholarshipScope === 'cumulative' ? '3.60' : '3.68'}
                  </span>
                  <span className="text-[9px] block font-semibold">ĐRL ≥ 90</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-blue-200">
                  <span className="text-blue-700 font-bold block">🥈 Giỏi</span>
                  <span className="text-[9px] block mt-0.5 font-semibold">
                    GPA ≥ {scholarshipScope === 'cumulative' ? '3.20' : '3.34'}
                  </span>
                  <span className="text-[9px] block font-semibold">ĐRL ≥ 80</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-teal-200">
                  <span className="text-teal-600 font-bold block">🥉 Khá</span>
                  <span className="text-[9px] block mt-0.5 font-semibold">
                    GPA ≥ {scholarshipScope === 'cumulative' ? '2.50' : '2.68'}
                  </span>
                  <span className="text-[9px] block font-semibold">ĐRL ≥ 70</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-450 leading-normal italic pt-1 border-t border-gray-200">
                {scholarshipScope === 'cumulative' 
                  ? '* Áp dụng mốc xếp loại tốt nghiệp toàn khóa của Đại học Duy Tân.' 
                  : '* Áp dụng quy chế khen thưởng học lực năm học của Đại học Duy Tân. Học bổng được xét từ cao xuống thấp theo chỉ tiêu phân bổ.'}
              </p>
            </div>
          </div>
        </section>
        
      </div>

      {/* MAIN LAYOUT - 12 columns on desktop, active tab takes 100% on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6">
        
        {/* LEFT COLUMN: FORM & SIMULATOR */}
        {/* On desktop: static left column. On mobile: absolute bottom sheet drawer when open, hidden otherwise */}
        <div className={`
          sm:col-span-4 space-y-3 sm:space-y-6 min-w-0
          ${isMobileDrawerOpen 
            ? 'fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 rounded-t-3xl p-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp block' 
            : 'hidden sm:block'
          }
        `}>
          {/* Header of Drawer (Only visible on mobile when drawer is open) */}
          {isMobileDrawerOpen && (
            <div className="sm:hidden flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
              <div className="flex gap-1 p-0.5 bg-gray-100 rounded-xl border border-gray-200 overflow-x-auto scrollbar-none flex-nowrap max-w-[calc(100%-40px)] shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileDrawerTab('add')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all shrink-0 whitespace-nowrap ${
                    mobileDrawerTab === 'add' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30' : 'text-gray-650'
                  }`}
                >
                  Nhập điểm
                </button>
                <button
                  type="button"
                  onClick={() => setMobileDrawerTab('detailed')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all shrink-0 whitespace-nowrap ${
                    mobileDrawerTab === 'detailed' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30' : 'text-gray-650'
                  }`}
                >
                  Tính điểm chi tiết
                </button>
                <button
                  type="button"
                  onClick={() => setMobileDrawerTab('simulator')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all shrink-0 whitespace-nowrap ${
                    mobileDrawerTab === 'simulator' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30' : 'text-gray-650'
                  }`}
                >
                  Giả lập GPA
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-900 transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* QUICK ADD FORM */}
          <div className={`bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm ${
            isMobileDrawerOpen 
              ? (mobileDrawerTab === 'add' ? 'block' : 'hidden')
              : 'block'
          }`}>
          {/* Form Header: luôn 2 dòng - title trên, mode tabs dưới */}
          <div className="flex flex-col gap-2.5 mb-3 pb-3 border-b border-gray-200">
            {/* Dòng 1: Title + Help */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                Thêm Môn Học
              </h2>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="text-gray-450 hover:text-blue-700 transition-all p-1 rounded-lg hover:bg-indigo-500/10 cursor-pointer"
                title="Hướng dẫn nhập điểm từ myDTU"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dòng 2: Mode tabs - 2 nút to, full width, rõ ràng */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAddMode('manual')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                  addMode === 'manual'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-300 hover:text-gray-900 hover:border-blue-600'
                }`}
              >
                <Pencil className="w-3 h-3 shrink-0" />
                Nhập thủ công
              </button>
              <button
                type="button"
                onClick={() => setAddMode('smart_paste')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                  addMode === 'smart_paste'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-300 hover:text-gray-900 hover:border-emerald-600'
                }`}
              >
                <ClipboardList className="w-3 h-3 shrink-0" />
                Dán từ myDTU
              </button>
            </div>
          </div>

          {addMode === 'manual' ? (
            <form onSubmit={handleAddCourse} className="space-y-2 sm:space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-bold text-gray-500 tracking-wider font-semibold mb-1">NĂM HỌC</label>
                  <select
                    value={academicYear}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'ADD_CUSTOM_YEAR') {
                        const inputYear = window.prompt('Nhập năm học mới (ví dụ: 2027-2028 hoặc 2028-2029):');
                        if (inputYear) {
                          if (/^\d{4}-\d{4}$/.test(inputYear.trim())) {
                            const formatted = inputYear.trim();
                            if (!customYears.includes(formatted)) {
                              setCustomYears(prev => [...prev, formatted]);
                            }
                            setAcademicYear(formatted);
                          } else {
                            showToast('Sai định dạng! Năm học phải có định dạng YYYY-YYYY (ví dụ: 2027-2028).', 'error');
                          }
                        }
                      } else {
                        setAcademicYear(val);
                      }
                    }}
                    className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    id="form-year-select"
                  >
                    {yearOptions.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                    <option value="ADD_CUSTOM_YEAR" className="text-blue-700 font-bold">+ Thêm năm học khác...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] sm:text-[10px] font-bold text-gray-500 tracking-wider font-semibold mb-1">HỌC KỲ</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as 'Học kỳ 1' | 'Học kỳ 2' | 'Học kỳ Hè')}
                    className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    id="form-semester-select"
                  >
                    <option value="Học kỳ 1">Học kỳ 1</option>
                    <option value="Học kỳ 2">Học kỳ 2</option>
                    <option value="Học kỳ Hè">Kỳ Hè (Summer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] sm:text-[10px] font-bold text-gray-500 tracking-wider font-semibold mb-1">MÃ MÔN HỌC</label>
                <input
                  type="text"
                  placeholder="VD: LAW 201"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                  id="form-course-code"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 tracking-wider font-semibold mb-1">TÊN MÔN HỌC</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Pháp luật đại cương"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                  id="form-course-name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-bold text-gray-500 tracking-wider font-semibold mb-1">SỐ TÍN CHỈ</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={credits || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setCredits(isNaN(val) ? 0 : val);
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    id="form-credits"
                    required
                  />
                  {credits > 0 && (
                    <span className="block text-[9px] text-rose-500 font-semibold mt-1">
                      {(() => {
                        const words = ['', 'Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười một', 'Mười hai', 'Mười ba', 'Mười bốn', 'Mười lăm'];
                        return `(${words[credits] || credits} TC)`;
                      })()}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] sm:text-[10px] font-bold text-gray-500 tracking-wider font-semibold mb-1">ĐIỂM CHỮ</label>
                  <select
                    value={gradeChar}
                    onChange={(e) => setGradeChar(e.target.value as GradeChar)}
                    className="w-full bg-white border border-gray-300 rounded-lg sm:rounded-xl px-2 sm:px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    id="form-grade"
                  >
                    <option value="">-- Chưa có --</option>
                    <optgroup label="Tính GPA">
                      <option value="A+">A+ (4.00)</option>
                      <option value="A">A (4.00)</option>
                      <option value="A-">A- (3.65)</option>
                      <option value="B+">B+ (3.33)</option>
                      <option value="B">B (3.00)</option>
                      <option value="B-">B- (2.65)</option>
                      <option value="C+">C+ (2.33)</option>
                      <option value="C">C (2.00)</option>
                      <option value="C-">C- (1.65)</option>
                      <option value="D">D (1.00)</option>
                      <option value="F">F (0.00)</option>
                    </optgroup>
                    <optgroup label="Điều kiện">
                      <option value="P">P (Đạt)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* CHECKBOXES */}
              <div className="space-y-1.5 sm:space-y-2 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isConditionCourse}
                    onChange={(e) => {
                      setIsConditionCourse(e.target.checked);
                      if (e.target.checked) {
                        setGradeChar('P');
                        setIsRetake(false);
                      } else {
                        setGradeChar('B');
                      }
                    }}
                    className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-600 focus:ring-offset-0 focus:ring-0 w-3 h-3 sm:w-3.5 sm:h-3.5"
                    id="form-is-condition"
                  />
                  <span className="text-[10px] sm:text-xs text-gray-700 font-semibold">Môn điều kiện (PE, Quốc phòng)</span>
                </label>

                {!isConditionCourse && (
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRetake}
                      onChange={(e) => {
                        setIsRetake(e.target.checked);
                        if (!e.target.checked) {
                          setReplacesCourseId(null);
                        }
                      }}
                      className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-600 focus:ring-offset-0 focus:ring-0 w-3 h-3 sm:w-3.5 sm:h-3.5"
                      id="form-is-retake"
                    />
                    <span className="text-[10px] sm:text-xs text-gray-700 font-semibold">Môn học lại / cải thiện điểm</span>
                  </label>
                )}
              </div>

              {/* DROP-DOWN CHỌN MÔN THAY THẾ */}
              {isRetake && !isConditionCourse && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1.5 animate-fadeIn">
                  <label className="block text-[9px] font-bold text-blue-700 tracking-wider">MÔN HỌC CŨ CẦN THAY THẾ</label>
                  {replaceableCourses.length > 0 ? (
                    <select
                      value={replacesCourseId || ''}
                      onChange={(e) => setReplacesCourseId(e.target.value || null)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                      required
                      id="form-replaces-select"
                    >
                      <option value="">-- Chọn môn học bị điểm thấp --</option>
                      {replaceableCourses.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.courseCode} - {c.courseName} (Điểm: {c.gradeChar} | {c.academicYear} - {c.semester})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[10px] text-amber-400 leading-normal">
                      Hệ thống chưa ghi nhận môn học điểm thấp nào khác để cải thiện điểm.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all active:scale-98 shadow-lg shadow-indigo-600/15 cursor-pointer border border-indigo-400/20"
                id="form-submit"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="sm:hidden">Thêm Môn</span>
                <span className="hidden sm:inline">Thêm Môn Vào Bảng</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-green-700 tracking-wider">TỰ ĐỘNG THÊM MÔN NHANH</span>
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="flex items-center gap-1.5 text-[10px] text-gray-650 hover:text-gray-900 bg-gray-50 border border-gray-200 hover:border-gray-350 px-2 py-1 rounded-lg transition-all cursor-pointer font-bold"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
                  Hướng dẫn copy-paste
                </button>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed border-l-2 border-emerald-500/50 pl-2">
                Hãy vào trang <b>Bảng điểm Sinh viên</b> trên myDTU, <b className="text-gray-900 font-extrabold">bôi đen toàn bộ bảng từ trên xuống</b>, copy (Ctrl+C) và dán (Ctrl+V) vào ô dưới đây.
              </p>
              
              <textarea
                value={smartPasteText}
                onChange={(e) => setSmartPasteText(e.target.value)}
                placeholder="Dán toàn bộ bảng điểm copy từ myDTU vào đây..."
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-32 resize-none font-mono"
              />

              {smartPasteStatus.message && (
                <div className={`p-2.5 rounded-lg text-[11px] font-semibold flex items-start gap-1.5 ${
                  smartPasteStatus.type === 'error' 
                    ? 'bg-rose-50 border border-rose-200 text-rose-700 shadow-sm' 
                    : smartPasteStatus.type === 'success'
                    ? 'bg-green-50 border border-green-250 text-green-700 shadow-sm'
                    : 'bg-gray-100 border border-gray-200 text-gray-750 shadow-sm'
                }`}>
                  {smartPasteStatus.type === 'error' ? <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                  <span>{smartPasteStatus.message}</span>
                </div>
              )}

              <button
                onClick={handleSmartPaste}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all active:scale-98 shadow-lg shadow-emerald-600/15 cursor-pointer border border-emerald-400/20"
              >
                <Sparkles className="w-4 h-4" />
                Phân tích & Tự Động Thêm
              </button>
            </div>
          )}
          </div>

          {/* TARGET GPA SIMULATOR PANEL */}
          <div className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm ${
            isMobileDrawerOpen 
              ? (mobileDrawerTab === 'simulator' ? 'block' : 'hidden')
              : 'block'
          }`}>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 pb-2.5 border-b border-gray-200">
            <TrendingUp className="w-4.5 h-4.5 text-green-700" />
            Giả Lập GPA Mục Tiêu
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 tracking-wider font-semibold mb-1">GPA MỤC TIÊU</label>
                <select
                  value={isCustomTarget ? 'custom' : simulatorTargetGpa.toString()}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomTarget(true);
                    } else {
                      setIsCustomTarget(false);
                      setSimulatorTargetGpa(parseFloat(e.target.value));
                    }
                  }}
                  className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  id="simulator-target-select"
                >
                  <option value="3.6">Xuất sắc (3.60)</option>
                  <option value="3.2">Giỏi (3.20)</option>
                  <option value="2.5">Khá (2.50)</option>
                  <option value="custom">Tùy chỉnh...</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 tracking-wider font-semibold mb-1">TÍN CHỈ CÒN LẠI</label>
                <input
                  type="number"
                  min="1"
                  value={simulatorRemainingCredits || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSimulatorRemainingCredits(isNaN(val) ? 0 : val);
                    setIsRemainingCreditsEdited(true);
                  }}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  id="simulator-remaining-credits"
                />
              </div>
            </div>

            {isCustomTarget && (
              <div className="animate-fadeIn">
                <label className="block text-[10px] font-bold text-gray-500 tracking-wider font-semibold mb-1">GPA TÙY CHỈNH (HỆ 4.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  max="4.00"
                  value={customTargetGpa}
                  onChange={(e) => setCustomTargetGpa(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  id="simulator-custom-gpa"
                />
              </div>
            )}

            {/* Simulation Result Panel */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              simulationResult.status === 'invalid'
                ? 'bg-gray-100 border-gray-250 text-gray-650'
                : simulationResult.status === 'achieved'
                ? 'bg-green-50 border-green-200 text-green-700'
                : simulationResult.status === 'impossible'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`} id="simulator-result-box">
              {simulationResult.status === 'invalid' && (
                <p className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-gray-450 flex-shrink-0" />
                  <span>{simulationResult.message}</span>
                </p>
              )}

              {simulationResult.status === 'achieved' && (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
                    Mục tiêu đã đạt!
                  </p>
                  <p className="text-gray-600 text-[11px]">{simulationResult.message}</p>
                </div>
              )}

              {simulationResult.status === 'impossible' && (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    Cảnh báo: Không khả thi!
                  </p>
                  <p className="text-[11px] text-gray-650 font-semibold">{simulationResult.message}</p>
                </div>
              )}

              {simulationResult.status === 'feasible' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-600">GPA cần đạt trong {simulatorRemainingCredits || 0} TC tới:</span>
                    <span className="text-sm font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-150" id="simulator-required-gpa">
                      {simulationResult.requiredGPA?.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-px bg-gray-200 w-full my-1"></div>
                  <p className="text-[11px] text-gray-600 font-semibold flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-700 flex-shrink-0 mt-0.5" />
                    <span>{simulationResult.message}</span>
                  </p>

                  {/* LỘ TRÌNH ĐIỂM GỢI Ý */}
                  {gradeRecipes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <span className="block text-[10px] font-bold text-blue-700 tracking-wider">
                        GỢI Ý TỔ HỢP ĐIỂM (THEO TÍN CHỈ):
                      </span>
                      <div className="space-y-1.5">
                        {gradeRecipes.map((r, i) => (
                          <div key={i} className="flex items-start gap-1.5 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-sm flex-shrink-0">{r.icon}</span>
                            <div>
                              <span className="font-bold text-[10px] text-gray-650 block">{r.type}</span>
                              <span className="text-[10px] text-gray-500 leading-normal">{r.details}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LỢI ÍCH HỌC LẠI MÔN NỢ (F) */}
            {failedCoursesBoosts.length > 0 && (
              <div className="pt-3.5 border-t border-gray-200 space-y-2">
                <span className="block text-[10px] font-bold text-gray-650 tracking-wider font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  HIỆU QUẢ TRẢ NỢ MÔN F:
                </span>
                <p className="text-[10.5px] text-gray-600 leading-normal">
                  Học lại các môn trượt sẽ xóa điểm F cũ. Dưới đây là mức GPA tích lũy tăng thêm tương ứng:
                </p>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {failedCoursesBoosts.map((b, idx) => (
                    <div key={idx} className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-rose-600">{b.courseCode}</span>
                        <span className="text-gray-600 font-bold">{b.courseName} ({b.credits} TC)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 pt-1 text-[9px] font-bold text-center">
                        <div className="bg-white border border-gray-250 rounded py-1 px-0.5">
                          <span className="text-gray-450 block">Đạt A (4.0)</span>
                          <span className="text-green-700">+{b.boostA.toFixed(2)} GPA</span>
                        </div>
                        <div className="bg-white border border-gray-250 rounded py-1 px-0.5">
                          <span className="text-gray-450 block">Đạt A- (3.65)</span>
                          <span className="text-green-700">+{b.boostAMinus.toFixed(2)} GPA</span>
                        </div>
                        <div className="bg-white border border-gray-250 rounded py-1 px-0.5">
                          <span className="text-gray-450 block">Đạt B+ (3.33)</span>
                          <span className="text-green-700">+{b.boostBPlus.toFixed(2)} GPA</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* GPA BOOSTER / RETAKE OPTIMIZER PANEL */}
          <div className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm ${
            isMobileDrawerOpen 
              ? (mobileDrawerTab === 'simulator' ? 'block animate-fadeIn' : 'hidden')
              : 'block'
          }`}>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 pb-2.5 border-b border-gray-200">
              <Sparkles className="w-4 h-4 text-blue-700" />
              Tối Ưu Hóa Điểm Học Cải Thiện (GPA Booster)
            </h2>
            
            {gpaBoosterRecommendations.length === 0 ? (
              <p className="text-xs text-gray-450 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 px-4">
                ✨ Không có môn học nào cần cải thiện điểm! Tất cả các môn tính GPA của bạn đều đã đạt A/A+ hoặc chưa nhập điểm số.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Tóm tắt phương án tối ưu nhất */}
                {(() => {
                  const topRec = gpaBoosterRecommendations[0];
                  const diffText = getGpaClassificationDiffText(dtuResult.rawCumulativeGpa, topRec.newGpa);
                  return (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
                      <span className="block text-[10px] font-bold text-blue-700 tracking-wider uppercase">💡 Gợi ý tối ưu nhất:</span>
                      <p className="text-[11px] text-gray-650 leading-relaxed font-medium">
                        Nếu học cải thiện môn <strong className="text-gray-900">{topRec.courseCode}</strong> ({topRec.credits} TC, hiện là <strong className="text-rose-700">{topRec.gradeChar}</strong>) lên điểm <strong className="text-green-700">A/A+</strong>, GPA tích lũy của bạn sẽ tăng từ <strong className="text-gray-700">{dtuResult.cumulativeGpa.toFixed(2)}</strong> lên <strong className="text-green-700">{topRec.newGpa.toFixed(2)}</strong> ({diffText}). Đây là phương án hiệu quả nhất vì tín chỉ lớn và điểm cũ thấp.
                      </p>
                    </div>
                  );
                })()}

                {/* Danh sách các môn cần cải thiện */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-gray-500 tracking-wider font-semibold uppercase">
                    Thứ tự ưu tiên cải thiện điểm:
                  </span>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {gpaBoosterRecommendations.map((rec) => {
                      const priorityColor = rec.priority === 'high' 
                        ? 'text-rose-700 bg-rose-50 border-rose-100' 
                        : rec.priority === 'medium'
                        ? 'text-blue-700 bg-blue-50 border-blue-100'
                        : 'text-gray-600 bg-gray-100 border-gray-200';
                        
                      const priorityName = rec.priority === 'high' 
                        ? 'Ưu tiên cao' 
                        : rec.priority === 'medium'
                        ? 'Ưu tiên vừa'
                        : 'Ưu tiên thấp';

                      return (
                        <div key={rec.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2 hover:border-gray-300 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-gray-900">{rec.courseCode}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${priorityColor}`}>
                                  {priorityName}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-450 block truncate max-w-[170px]" title={rec.courseName}>
                                {rec.courseName}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-[10px] text-gray-600 block font-extrabold">{rec.credits} Tín Chỉ</span>
                              {(!rec.components || rec.components.length <= 1) && (
                                <span className="text-[9.5px] text-gray-500 block font-semibold">
                                  Hiện tại: <strong className="text-rose-700 font-bold">{rec.gradeChar}</strong>
                                </span>
                              )}
                            </div>
                          </div>

                          {rec.components && rec.components.length > 1 && (
                            <div className="mt-1.5 pt-1.5 border-t border-gray-100 space-y-1.5">
                              <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">Chi tiết các phần:</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {rec.components.map((comp) => (
                                  <div key={comp.id} className="bg-white p-1.5 rounded border border-gray-200 flex justify-between items-center text-[9.5px]">
                                    <span className="text-gray-600 font-semibold">{comp.credits} TC</span>
                                    <span className="text-gray-500">Hiện tại: <strong className="text-rose-700 font-bold">{comp.gradeChar}</strong></span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="pt-1.5 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-600">
                            <span>GPA mới nếu cải thiện lên A/A+:</span>
                            <span className="font-extrabold text-green-700">
                              {rec.newGpa.toFixed(2)} (+{(rec.gpaBoost).toFixed(2)})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cảnh báo hạn mức 5% học lại */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-[10px] text-amber-800 leading-normal">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Hạn mức 5% học cải thiện & học lại</span>
                  </div>
                  <p>
                    <strong>Lưu ý:</strong> Tổng số tín chỉ học lại/cải thiện <strong>không vượt quá 5%</strong> tổng số tín chỉ tích lũy (khoảng ~7-8 TC). Nếu vượt quá hạn mức này, bạn sẽ <strong>bị hạ một bậc bằng tốt nghiệp</strong> khi xét tốt nghiệp loại Giỏi/Xuất sắc.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DETAILED GRADE CALCULATOR & PREDICTOR WIDGET */}
        <div 
          id="detailed-grade-calculator-panel"
          className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm transition-all duration-300 ${
            isMobileDrawerOpen 
              ? (mobileDrawerTab === 'detailed' ? 'block animate-fadeIn' : 'hidden')
              : 'block'
          }`}
        >
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between pb-2.5 border-b border-gray-200">
            <span className="flex items-center gap-2">
              <ClipboardList className="w-4.5 h-4.5 text-blue-700" />
              {selectedDetailedCourse ? `Điểm chi tiết: ${selectedDetailedCourse.courseCode} (điểm cụ thể mydtu)` : 'Máy Tính Điểm Chi Tiết (điểm cụ thể mydtu)'}
            </span>
            {selectedDetailedCourse && (
              <button
                type="button"
                onClick={() => setSelectedDetailedCourse(null)}
                className="flex items-center gap-1 text-[10px] text-gray-650 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition cursor-pointer font-bold animate-fadeIn border border-gray-200"
                title="Quay lại máy tính thử"
              >
                <X className="w-3 h-3" />
                Thoát sửa
              </button>
            )}
          </h2>

          {/* INFO BANNER — khác nhau tùy chế độ */}
          {selectedDetailedCourse ? (
            <div className="flex items-start gap-2.5 p-2.5 bg-blue-50 border border-blue-100 rounded-xl mb-3.5 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0 mt-1"></span>
              <div className="min-w-0">
                <div className="text-[10.5px] text-blue-800 font-black">ĐANG SỬA MÔN: {selectedDetailedCourse.courseCode}</div>
                <div className="text-[10px] text-gray-600 font-semibold mt-0.5">{selectedDetailedCourse.courseName} ({selectedDetailedCourse.credits} TC)</div>
                <div className="text-[9.5px] text-gray-450 mt-1">Nhập đúng tỷ lệ % và điểm → nhấn <b className="text-blue-700">Lưu điểm</b> để cập nhật bảng điểm.</div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3.5">
              <p className="text-[10px] text-amber-800 font-bold flex items-start gap-1.5 leading-relaxed">
                <span className="text-lg leading-none shrink-0">💡</span>
                <span>
                  <b>Bảng dưới đây là dữ liệu mẫu phổ biến</b> — Hãy sửa trực tiếp <b>tên, tỷ lệ %</b> và <b>điểm số</b> cho đúng môn của bạn. Nhấn <b>"+ Thêm đầu điểm"</b> để thêm cột mới, hoặc nhấn <b>"+ Chi tiết"</b> trên bất kỳ môn nào trong bảng điểm để tính và lưu điểm môn đó ngay.
                </span>
              </p>
            </div>
          )}

          {/* COLLAPSIBLE SMART PASTE SECTION */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl mb-3.5 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsPasteSectionExpanded(!isPasteSectionExpanded)}
              className="w-full flex items-center justify-between p-2.5 text-left text-[10.5px] font-bold text-emerald-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-green-700" />
                Dán nhanh từ myDTU 📋
              </span>
              <span className="text-[9.5px] text-gray-450 font-bold">
                {isPasteSectionExpanded ? 'Thu gọn ▲' : 'Mở rộng ▼'}
              </span>
            </button>
            
            {isPasteSectionExpanded && (
              <div className="p-3 border-t border-gray-200 space-y-2.5 animate-fadeIn bg-white">
                <p className="text-[9.5px] text-gray-600 leading-normal font-semibold">
                  Cách dùng: Copy bảng điểm chi tiết môn học trên myDTU và dán vào đây để tự động điền các cột điểm:
                </p>
                <textarea
                  value={detailedPasteText}
                  onChange={(e) => setDetailedPasteText(e.target.value)}
                  placeholder="Dán toàn bộ bảng điểm chi tiết của môn học..."
                  className="w-full bg-white border border-gray-250 rounded-lg p-2 text-[10.5px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 h-16 resize-none font-mono"
                />
                {detailedPasteError && (
                  <p className="text-[9px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {detailedPasteError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    handleParseDetailedPaste();
                    setIsPasteSectionExpanded(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all active:scale-98 cursor-pointer shadow shadow-emerald-950/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Phân tích điểm myDTU
                </button>
              </div>
            )}
          </div>

          {/* GRADE COMPONENT TABLE — đẹp như bảng thật */}
          <div className="rounded-xl border border-gray-200 overflow-hidden mb-2.5">
            {/* Header */}
            <div className="grid bg-gray-50 border-b border-gray-200" style={{gridTemplateColumns: '1fr 58px 62px 36px'}}>
              <div className="px-3 py-2.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest">Tên đầu điểm / bài giao</div>
              <div className="px-1 py-2.5 text-[9px] font-bold text-blue-700 uppercase tracking-widest text-center border-l border-gray-200">Tỷ lệ %</div>
              <div className="px-1 py-2.5 text-[9px] font-bold text-green-700 uppercase tracking-widest text-center border-l border-gray-200">Điểm /10</div>
              <div className="px-1 py-2.5 text-[9px] font-bold text-gray-450 uppercase tracking-widest text-center border-l border-gray-200"></div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-800/40 max-h-52 overflow-y-auto custom-scrollbar">
              {activeGrades.length > 0 ? (
                activeGrades.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid items-start bg-white hover:bg-gray-50 border-b border-gray-150 transition-colors group"
                    style={{gridTemplateColumns: '1fr 58px 62px 36px'}}
                  >
                    {/* Tên — textarea tự mở rộng khi chữ dài, kể cả lúc load */}
                    <div className="px-1.5 py-1.5 flex items-start gap-1 min-w-0">
                      <button
                        type="button"
                        title="Nhấp để chỉnh sửa tên"
                        onClick={() => document.getElementById(`grade-name-${item.id}`)?.focus()}
                        className="shrink-0 mt-0.5 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-700 transition-all cursor-pointer"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                      <textarea
                        id={`grade-name-${item.id}`}
                        rows={1}
                        value={item.name}
                        ref={(el) => {
                          if (el) {
                            el.style.height = 'auto';
                            el.style.height = el.scrollHeight + 'px';
                          }
                        }}
                        onChange={(e) => {
                          const updated = activeGrades.map((g, idx) =>
                            idx === index ? { ...g, name: e.target.value } : g
                          );
                          setActiveGrades(updated);
                        }}
                        onInput={(e) => {
                          const t = e.target as HTMLTextAreaElement;
                          t.style.height = 'auto';
                          t.style.height = t.scrollHeight + 'px';
                        }}
                        className="min-w-0 flex-1 bg-transparent text-[11px] text-gray-800 font-medium focus:outline-none focus:bg-gray-100 px-1 py-0.5 rounded transition-colors placeholder-gray-400 resize-none overflow-hidden leading-normal"
                        placeholder="Nhập tên…"
                      />
                    </div>

                    {/* Tỷ lệ % */}
                    <div className="border-l border-gray-200 px-1.5 py-1.5 flex items-center justify-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.weight || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const updated = activeGrades.map((g, idx) =>
                            idx === index ? { ...g, weight: val } : g
                          );
                          setActiveGrades(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg text-center text-[11px] font-semibold text-gray-800 focus:outline-none focus:border-blue-600 focus:bg-white py-1.5 transition-all"
                        placeholder="0"
                      />
                    </div>

                    {/* Điểm số */}
                    <div className="border-l border-gray-200 px-1.5 py-1.5 flex items-center justify-center">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={item.score !== null ? item.score : ''}
                        placeholder="--"
                        onChange={(e) => {
                          const val = e.target.value;
                          const scoreVal = val === '' ? null : Math.max(0, Math.min(10, parseFloat(val) || 0));
                          const updated = activeGrades.map((g, idx) =>
                            idx === index ? { ...g, score: scoreVal } : g
                          );
                          setActiveGrades(updated);
                        }}
                        className={`w-full rounded-lg text-center text-[11px] font-black focus:outline-none py-1.5 border transition-all ${
                          item.score !== null
                            ? 'bg-green-50 border-green-200 text-green-700 focus:border-green-500 focus:bg-white font-bold'
                            : 'bg-gray-50 border-gray-300 text-gray-750 focus:border-blue-600 focus:text-gray-900 placeholder-gray-400 font-bold'
                        }`}
                      />
                    </div>

                    {/* Xóa — luôn hiện, xám nhạt bình thường, đỏ khi hover */}
                    <div className="border-l border-gray-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = activeGrades.filter((_, idx) => idx !== index);
                          setActiveGrades(updated);
                        }}
                        className="p-1.5 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Xóa cột điểm này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Chưa có đầu điểm nào.<br />
                    <span className="text-slate-700">Dán dữ liệu myDTU hoặc bấm "+ Thêm".</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-3.5">
            <button
              type="button"
              onClick={() => {
                const newItem = {
                  id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: '',
                  weight: 10,
                  score: null
                };
                setActiveGrades([...activeGrades, newItem]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-[10.5px] text-blue-700 rounded-lg border border-blue-200 hover:border-blue-600 transition-all font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm đầu điểm
            </button>
            <button
              type="button"
              onClick={() => setActiveGrades([])}
              className="text-[10px] text-gray-500 hover:text-rose-600 transition cursor-pointer font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Xóa sạch
            </button>
          </div>

          {/* RESULTS AND STATS BLOCK */}
          {activeGrades.length > 0 && (() => {
            const totalWeight = activeGrades.reduce((sum, item) => sum + item.weight, 0);
            const isWeightValid = Math.abs(totalWeight - 100) < 0.01;
            const calc = calculateDetailedScore(activeGrades);

            return (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-250 rounded-2xl space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-1.5 bg-white border border-gray-200 rounded-xl">
                    <span className="text-[9px] font-black text-gray-450 uppercase tracking-wider block">Tổng tỷ lệ %</span>
                    <span className={`text-xs font-black block mt-0.5 ${isWeightValid ? 'text-green-700' : 'text-rose-400'}`}>
                      {totalWeight.toFixed(1)}%
                    </span>
                    {!isWeightValid && (
                      <span className="text-[8px] text-rose-500 block leading-tight mt-0.5 font-bold">Cần bằng 100% để lưu</span>
                    )}
                  </div>
                  <div className="p-1.5 bg-white border border-gray-200 rounded-xl">
                    <span className="text-[9px] font-black text-gray-450 uppercase tracking-wider block">Tỷ lệ đã học</span>
                    <span className="text-xs font-black text-blue-700 block mt-0.5">
                      {calc ? calc.completedWeights : 0}%
                    </span>
                  </div>
                  <div className="p-1.5 bg-white border border-gray-200 rounded-xl">
                    <span className="text-[9px] font-black text-gray-450 uppercase tracking-wider block">Tổng điểm hệ 10</span>
                    <span className="text-xs font-black text-gray-900 block mt-0.5">
                      {calc ? `${calc.score.toFixed(2)} (${(calc.score * 10).toFixed(1)}%)` : '--'}
                    </span>
                    {calc && calc.hasMissingScores && (
                      <span className="text-[8px] text-amber-500 block leading-tight font-bold">Tạm tính</span>
                    )}
                  </div>
                  <div className="p-1.5 bg-white border border-gray-200 rounded-xl">
                    <span className="text-[9px] font-black text-gray-450 uppercase tracking-wider block">Hạng điểm quy đổi</span>
                    {calc ? (
                      (() => {
                        if (calc.hasMissingScores) {
                          return <span className="text-xs font-black text-slate-400 block mt-0.5">--</span>;
                        }
                        const grade = calc.finalExamFailed ? 'F' : getDTUGradeCharFromScore(calc.roundedScore);
                        const isF = grade === 'F';
                        return (
                          <span className={`text-xs font-black block mt-0.5 ${isF ? 'text-rose-400' : 'text-green-700'}`}>
                            {grade}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-xs font-black text-slate-400 block mt-0.5">--</span>
                    )}
                  </div>
                </div>

                {calc && (
                  <div className="pt-2 border-t border-gray-200 text-[10px] leading-normal font-semibold">
                    {calc.hasMissingScores ? (
                      <div className="space-y-3">
                        <div className="flex gap-1.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                          <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                          <div>
                            Đã có điểm cho <b>{calc.completedWeights}%</b> trọng số. Xem dự báo điểm thi còn lại cần đạt bên dưới để lập kế hoạch ôn thi:
                          </div>
                        </div>

                        {/* FINAL EXAM PREDICTOR TABLE */}
                        <div className="space-y-1.5">
                          <span className="block text-[9px] font-black text-blue-700 tracking-wider">
                            🎯 ĐIỂM CẦN ĐẠT CỦA CÁC ĐẦU ĐIỂM CÒN LẠI ({100 - calc.completedWeights}%):
                          </span>
                          
                          <div className="space-y-1.5">
                            {[
                              { label: 'Qua môn (Điểm D >= 4.0)', score: 4.0 },
                              { label: 'Khá (Điểm B- >= 6.5)', score: 6.5 },
                              { label: 'Giỏi (Điểm A- >= 8.0)', score: 8.0 },
                              { label: 'Xuất sắc (Điểm A >= 8.5)', score: 8.5 },
                              { label: 'Tối đa (Điểm A+ >= 9.0)', score: 9.0 }
                            ].map((target) => {
                              const completedSum = activeGrades
                                .filter(item => item.score !== null)
                                .reduce((sum, item) => sum + item.score! * (item.weight / 100), 0);
                              const missingWeight = Math.max(0, 100 - calc.completedWeights);
                              
                              let requiredScore = 0;
                              if (missingWeight > 0) {
                                  requiredScore = (target.score - completedSum) / (missingWeight / 100);
                              }

                              let statusText = '';
                              let badgeClass = '';

                              if (requiredScore <= 0) {
                                statusText = 'Chắc chắn đạt';
                                badgeClass = 'bg-green-50 text-green-700 border-green-150';
                              } else if (requiredScore <= 10.0) {
                                statusText = `Cần >= ${requiredScore.toFixed(1)}`;
                                badgeClass = 'bg-blue-50 text-blue-700 border-blue-150';
                              } else {
                                statusText = 'Không thể đạt';
                                badgeClass = 'bg-gray-100 text-gray-500 border-gray-200';
                              }

                              return (
                                <div key={target.label} className="flex justify-between items-center text-[10.5px] py-1 border-b border-gray-200 last:border-b-0">
                                  <span className="text-gray-650">{target.label}</span>
                                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${badgeClass} shrink-0`}>
                                    {statusText}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // All grades completed — kiểm tra quy chế cuối kỳ
                      (() => {
                        const grade = calc.finalExamFailed ? 'F' : getDTUGradeCharFromScore(calc.roundedScore);
                        const isF = grade === 'F';

                        const renderRoundingInfo = () => {
                          const isDifferent = Math.abs(calc.score - calc.roundedScore) > 0.001;
                          const isFinalDiff = calc.finalExamScoreRaw !== null && calc.finalExamScore !== null && Math.abs(calc.finalExamScoreRaw - calc.finalExamScore) > 0.001;
                          return (
                            <div className="mt-2.5 p-2 bg-gray-100 border border-gray-200 rounded-xl space-y-1 text-gray-650 text-[9.5px] leading-relaxed font-semibold">
                              <div className="flex items-center gap-1.5 font-black text-gray-600 uppercase tracking-wider text-[8px]">
                                <Info className="w-3.5 h-3.5 text-indigo-450 shrink-0" />
                                <span>Quy chế làm tròn DTU</span>
                              </div>
                              <p className="text-[9px]">Điểm các bài đánh giá bộ phận và điểm học phần hệ 10 được làm tròn đến <b>1 chữ số thập phân</b>.</p>
                              {isDifferent && (
                                <p className="text-indigo-700 font-semibold">
                                  👉 Tổng điểm thực tế là <b className="text-indigo-950 font-extrabold">{calc.score.toFixed(2)}</b>, được làm tròn thành <b className="text-indigo-950 font-extrabold">{calc.roundedScore.toFixed(1)}</b>.
                                </p>
                              )}
                              {isFinalDiff && (
                                <p className="text-amber-700 font-semibold">
                                  👉 Điểm thi cuối kỳ thực tế là <b className="text-amber-950 font-extrabold">{calc.finalExamScoreRaw!.toFixed(2)}</b>, được làm tròn thành <b className="text-amber-950 font-extrabold">{calc.finalExamScore!.toFixed(1)}</b>.
                                </p>
                              )}
                              {!isDifferent && !isFinalDiff && (
                                <p className="text-gray-700">
                                  👉 Điểm thực tế của bạn trùng khớp với điểm làm tròn: <b className="text-gray-900 font-bold">{calc.score.toFixed(1)}</b>.
                                </p>
                              )}
                            </div>
                          );
                        };

                        // QUY CHẾ DTU: điểm thi cuối kỳ < 1.0 → tự động F dù tổng điểm cao
                        if (calc.finalExamFailed) {
                          return (
                            <div className="space-y-2">
                              <div className="flex gap-1.5 p-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-850">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-orange-400 mt-px" />
                                <div className="text-[10px] leading-relaxed">
                                  <b className="text-orange-950">Tạch vì điểm cuối kỳ dưới 1.0!</b><br />
                                  Điểm thi cuối kỳ thực tế: <b className="text-rose-700">{calc.finalExamScoreRaw?.toFixed(2)}/10</b>
                                  {calc.finalExamScoreRaw !== null && calc.finalExamScore !== null && Math.abs(calc.finalExamScoreRaw! - calc.finalExamScore!) > 0.001 && (
                                    <> (làm tròn thành <b className="text-rose-700">{calc.finalExamScore!.toFixed(1)}</b>)</>
                                  )}
                                  . Theo quy chế DTU, điểm thi cuối kỳ bắt buộc phải <b>≥ 1.0/10</b> mới được tính qua môn, 
                                  dù tổng điểm có đạt 4.0 hay không.
                                </div>
                              </div>
                              {renderRoundingInfo()}
                            </div>
                          );
                        } else if (isF) {
                          return (
                            <div className="space-y-2">
                              <div className="flex gap-1.5 p-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-455" />
                                <div>
                                  Môn này bị điểm <b>F (Tổng điểm dưới 4.0)</b>. Bạn không đủ điều kiện qua môn và bắt buộc phải học lại / thi lại học phần này.
                                </div>
                              </div>
                              {renderRoundingInfo()}
                            </div>
                          );
                        } else {
                          return (
                            <div className="space-y-2">
                              <div className="flex gap-1.5 p-2 bg-green-50 border border-green-100 rounded-xl text-green-700">
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" />
                                <div>
                                  Môn học đủ điều kiện qua môn với điểm chữ <b>{grade}</b> (Quy đổi hệ 4: <b>{GRADE_SCALE_MAP[grade]?.toFixed(2)}</b>).
                                </div>
                              </div>
                              {renderRoundingInfo()}
                            </div>
                          );
                        }
                      })()
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* BUTTONS ACTIONS FOR THE CALCULATOR */}
          {selectedDetailedCourse ? (
            <div className="mt-4 pt-3.5 border-t border-gray-200 flex items-center justify-between gap-3">
              <span className="text-[9px] text-gray-450 font-medium leading-none">
                * Điểm chữ chính sẽ tự động cập nhật.
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedDetailedCourse(null)}
                  className="px-2.5 py-1.5 text-[10.5px] font-bold text-gray-650 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveDetailedGrades}
                  className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-[10.5px] font-bold transition shadow-md shadow-indigo-900/30 cursor-pointer border border-indigo-400/20"
                >
                  Lưu môn học
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 pt-3.5 border-t border-gray-200 space-y-2 text-[10px] text-gray-450 leading-relaxed font-semibold">
              <p className="flex items-start gap-1">
                <Info className="w-3.5 h-3.5 shrink-0 text-gray-450 mt-0.5" />
                <span>
                  Chế độ Máy tính nháp (Sandbox). Nhập nhanh trọng số & điểm quá trình để dự báo điểm thi cần đạt.
                </span>
              </p>
              <p className="flex items-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-indigo-500 mt-0.5" />
                <span>
                  Để sửa điểm cho môn học chính thức, hãy bấm nút <b>"+ Chi tiết"</b> hoặc ô điểm của môn đó.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

        {/* RIGHT COLUMN: TABLE */}
        <div className="sm:col-span-8 space-y-4 min-w-0 overflow-hidden">
          
          {/* SEARCH, CATEGORIES, AND VIEW MODES */}
          <div className="flex flex-col gap-3 justify-between items-start bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-xl shadow-inner">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-450" />
              <input
                type="text"
                placeholder="Tìm môn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-3 py-1 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                id="search-input"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full justify-between">
              {/* Thẻ lọc điểm */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    filterType === 'all' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  id="filter-all"
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterType('accumulated')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    filterType === 'accumulated' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  id="filter-accumulated"
                >
                  Tích lũy
                </button>
                <button
                  onClick={() => setFilterType('condition')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    filterType === 'condition' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  id="filter-condition"
                >
                  Điều kiện
                </button>
              </div>

              {/* Chế độ xem: Phân học kỳ vs Phẳng vs Tiến độ Khung */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    viewMode === 'grouped' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Hiển thị theo từng học kỳ"
                  id="view-mode-grouped"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Theo kỳ</span>
                </button>
                <button
                  onClick={() => setViewMode('flat')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    viewMode === 'flat' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Hiển thị bảng tất cả môn học phẳng"
                  id="view-mode-flat"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Bảng phẳng</span>
                </button>
                <button
                  onClick={() => setViewMode('curriculum')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    viewMode === 'curriculum' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Đối chiếu tiến độ theo Khung chương trình"
                  id="view-mode-curriculum"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Tiến độ Khung</span>
                </button>
              </div>
            </div>
          </div>

          {/* VIEW: GROUPED BY ACADEMIC YEAR & SEMESTER */}
          {viewMode === 'grouped' && (
            <div className="space-y-4">
              {sortedAcademicYears.length > 0 ? (
                sortedAcademicYears.map(year => (
                  <div key={year} className="space-y-3">
                    {/* Label Năm Học */}
                    <div className="flex items-center gap-2 px-1 pt-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span className="text-[10px] sm:text-xs font-extrabold text-blue-700 tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 shadow-inner whitespace-nowrap">
                          NĂM HỌC {year}
                        </span>
                      </div>
                      
                      {(() => {
                        const yearCourses = courses.filter(c => c.academicYear === year);
                        const yearResult = calculateDTUGPA(yearCourses);
                        const gradedCount = yearCourses.filter(c => !c.isConditionCourse && c.gradeChar !== '').length;
                        return (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded bg-white font-bold border border-gray-200 ${gradedCount > 0 ? 'text-green-700' : 'text-gray-500'} whitespace-nowrap`}>
                              GPA Năm: {gradedCount > 0 ? yearResult.cumulativeGpa.toFixed(2) : '--'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white font-semibold border border-gray-200 text-gray-500 whitespace-nowrap">
                              {yearResult.accumulatedCredits} TC Tích Lũy
                            </span>
                          </div>
                        );
                      })()}
                      <div className="h-[2px] bg-gradient-to-r from-blue-300/40 to-transparent flex-grow ml-1 hidden xs:block"></div>
                    </div>

                    {/* Accordion từng học kỳ trong năm học */}
                    {sortedSemestersInYear(year).map(sem => {
                      const semKey = `${year}-${sem}`;
                      const isExpanded = expandedSemesters[semKey] !== false; // Mặc định là mở rộng (true)
                      const semCourses = groupedCourses[year][sem];
                      
                      // Tính toán điểm số riêng biệt cho từng kỳ
                      const semGPA = calculateSemesterGpa(semCourses);
                      const semCredits = semCourses.reduce((sum, c) => c.isConditionCourse ? sum : sum + c.credits, 0);
                      const gradedSemCoursesCount = semCourses.filter(c => !c.isConditionCourse && c.gradeChar !== '').length;

                      return (
                        <div 
                          key={sem} 
                          id={`sem-group-${year}-${sem}`}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm scroll-mt-20 transition-all duration-300"
                        >
                          {/* Accordion Header */}
                      <div 
                            onClick={() => toggleSemester(semKey)}
                            className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer select-none border-b border-gray-200"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 shadow-sm whitespace-nowrap">
                                {sem} (Năm học {year})
                              </span>
                              
                              {/* Điểm GPA Học kỳ */}
                              <span className={`text-[10px] px-1.5 py-0.5 rounded bg-white font-bold border border-gray-200 ${gradedSemCoursesCount > 0 ? 'text-green-700' : 'text-gray-500'} whitespace-nowrap`}>
                                GPA: {gradedSemCoursesCount > 0 ? semGPA.toFixed(2) : '--'}
                              </span>

                              {/* Tổng số tín chỉ kỳ này */}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white font-semibold border border-gray-200 text-gray-500 whitespace-nowrap hidden sm:inline">
                                {semCredits} TC
                              </span>

                              {/* Đánh giá học lực riêng cho kỳ */}
                              {(() => {
                                if (gradedSemCoursesCount === 0) {
                                  return (
                                    <span className="text-[9px] px-2 py-0.5 rounded-full border border-gray-205 bg-gray-100 text-gray-500 font-bold">
                                      Chưa xếp loại
                                    </span>
                                  );
                                }
                                const getSemClass = (gpa: number) => {
                                  if (gpa >= 3.6) return { name: 'Xuất sắc', color: 'text-violet-700 bg-violet-50 border-violet-200' };
                                  if (gpa >= 3.2) return { name: 'Giỏi', color: 'text-green-700 bg-green-50 border-green-100' };
                                  if (gpa >= 2.5) return { name: 'Khá', color: 'text-blue-700 bg-blue-50 border-blue-100' };
                                  if (gpa >= 2.0) return { name: 'Trung bình', color: 'text-amber-700 bg-amber-50 border-amber-100' };
                                  return { name: 'Yêu / Kém', color: 'text-rose-700 bg-rose-50 border-rose-100' };
                                };
                                const semClass = getSemClass(semGPA);
                                return (
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${semClass.color}`}>
                                    {semClass.name}
                                  </span>
                                );
                              })()}

                              {/* Huy hiệu xét Học bổng khuyến khích học tập */}
                              {semGPA >= 3.2 && semCredits >= 5 && semCourses.every(c => c.gradeChar !== 'F') && (
                                <span 
                                  className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-green-700 font-extrabold flex items-center gap-0.5 animate-pulse"
                                  title="Đủ điều kiện xét học bổng (GPA kỳ ≥ 3.2, đăng ký ≥ 5 TC và không trượt môn F nào)"
                                >
                                  🎁 Xét học bổng
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => handleDeleteSemester(year, sem, e)}
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title={`Xóa toàn bộ ${sem}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="text-gray-400">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>

                          {/* Accordion Content (Table list) */}
                          {isExpanded && (
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5">Mã Môn</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5">Tên Môn Học</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5 text-center">TC</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5 text-center">Điểm</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5 text-center hidden sm:table-cell">Hệ 4.0</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5 hidden sm:table-cell">TT</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5 text-right">Xóa</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-transparent">
                                  {semCourses.map(pc => {
                                    const replacedCourse = pc.replacesCourseId 
                                      ? summaryResult.processedCourses.find(c => c.id === pc.replacesCourseId) 
                                      : null;
                                    const replacementCourse = pc.isReplaced
                                      ? summaryResult.processedCourses.find(c => c.isRetake && c.replacesCourseId === pc.id)
                                      : null;

                                    const isEditing = editingCourseId === pc.id;

                                    return (
                                      <tr 
                                        key={pc.id} 
                                        className={`hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                                          pc.isReplaced ? 'opacity-40 line-through bg-gray-100/30' : ''
                                        }`}
                                      >
                                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 font-semibold text-gray-500 whitespace-nowrap">
                                          {isEditing ? (
                                            <input 
                                              type="text"
                                              value={editCourseCode}
                                              onChange={(e) => setEditCourseCode(e.target.value)}
                                              className="w-16 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                            />
                                          ) : (
                                            pc.courseCode
                                          )}
                                        </td>
                                        <td className="px-2 sm:px-4 py-2 sm:py-2.5">
                                          {isEditing ? (
                                            <input 
                                              type="text"
                                              value={editCourseName}
                                              onChange={(e) => setEditCourseName(e.target.value)}
                                              className="w-full bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                            />
                                          ) : (
                                            <div className="min-w-0">
                                              <span className="font-semibold text-gray-800 text-xs leading-tight line-clamp-2">{pc.courseName}</span>
                                              {replacedCourse && (
                                                <div className="text-[9px] text-blue-700 mt-0.5 flex items-center gap-1 font-semibold">
                                                  <RefreshCw className="w-2.5 h-2.5" />
                                                  Thay thế môn: {replacedCourse.courseCode} (Điểm cũ: {replacedCourse.gradeChar} | {replacedCourse.academicYear} - {replacedCourse.semester})
                                                </div>
                                              )}
                                              {replacementCourse && (
                                                <div className="text-[9px] text-rose-700 mt-0.5 flex items-center gap-1 font-semibold">
                                                  <AlertTriangle className="w-2.5 h-2.5" />
                                                  Cải thiện tại: {replacementCourse.academicYear} - {replacementCourse.semester}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-center font-semibold text-gray-700 whitespace-nowrap">
                                          {isEditing ? (
                                            <input 
                                              type="number"
                                              min="1"
                                              value={editCredits}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setEditCredits(val === '' ? '' : parseInt(val) || 0);
                                              }}
                                              className="w-12 bg-white border border-gray-300 rounded px-1 py-0.5 text-xs text-gray-900 text-center font-bold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                            />
                                          ) : (
                                            pc.credits
                                          )}
                                        </td>
                                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-center">
                                          <select
                                            disabled={isEditing}
                                            value={pc.gradeChar}
                                            onChange={(e) => handleUpdateGrade(pc.id, e.target.value as GradeChar)}
                                            className="font-bold text-[11px] px-2 py-1 rounded bg-white border border-gray-300 text-gray-900 cursor-pointer hover:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none text-center outline-none disabled:opacity-50"
                                          >
                                            <option value="">--</option>
                                            {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'P'].map(grade => (
                                              <option key={grade} value={grade}>{grade}</option>
                                            ))}
                                          </select>
                                        </td>
                                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-center font-medium text-gray-500 hidden sm:table-cell">
                                          {pc.gradePoint !== null ? pc.gradePoint.toFixed(2) : '-'}
                                        </td>
                                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 hidden sm:table-cell">
                                          <div className="flex flex-wrap gap-1">
                                            {pc.isConditionCourse ? (
                                              <span className="bg-amber-50 text-amber-700 text-[8px] font-bold px-1 rounded border border-amber-200">Đ.Kiện</span>
                                            ) : pc.isReplaced ? (
                                              <span className="bg-rose-50 text-rose-700 text-[8px] font-bold px-1 rounded border border-rose-200">Bị Thay</span>
                                            ) : (
                                              <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1 rounded border border-emerald-200">T.Lũy</span>
                                            )}
                                            {pc.isRetake && (
                                              <span className="bg-indigo-500/10 text-blue-700 text-[8px] font-bold px-1 rounded border border-indigo-500/10">Học Lại</span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right">
                                          {isEditing ? (
                                            <div className="flex gap-1 justify-end">
                                              <button
                                                onClick={() => handleSaveEditCourse(pc.id)}
                                                className="text-green-700 hover:text-emerald-300 p-1 rounded hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center justify-center"
                                                title="Lưu thay đổi"
                                              >
                                                <Check className="w-3.5 h-3.5 text-green-700" />
                                              </button>
                                              <button
                                                onClick={handleCancelEditCourse}
                                                className="text-rose-400 hover:text-rose-350 p-1 rounded hover:bg-rose-500/10 transition-all cursor-pointer flex items-center justify-center"
                                                title="Hủy bỏ"
                                              >
                                                <X className="w-3.5 h-3.5 text-rose-400" />
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="flex gap-1 justify-end">
                                              <button
                                                onClick={() => handleStartEditCourse(pc)}
                                                className="text-gray-450 hover:text-blue-700 p-1 rounded hover:bg-indigo-500/10 transition-all cursor-pointer flex items-center justify-center"
                                                title="Sửa môn học"
                                              >
                                                <Pencil className="w-3.5 h-3.5 text-blue-700" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteCourse(pc.id)}
                                                className="text-gray-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-all cursor-pointer"
                                                title="Xóa môn học"
                                              >
                                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                              </button>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-50 border border-gray-200 rounded-xl">
                  Chưa có môn học nào được đăng ký trong hệ thống.
                </div>
              )}
            </div>
          )}

          {/* VIEW: FLAT TABLE VIEW */}
          {viewMode === 'flat' && (
            <div className="bg-white border border-gray-250 rounded-2xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100/80 text-gray-500 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">
                      <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">Năm học & Kỳ</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3">Mã Môn</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3">Tên Môn Học</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">TC</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Điểm</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell">Hệ 4.0</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">TT</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-transparent" id="course-table-body">
                    {flatFilteredCourses.length > 0 ? (
                      flatFilteredCourses.map((pc) => {
                        const replacedCourse = pc.replacesCourseId 
                          ? summaryResult.processedCourses.find(c => c.id === pc.replacesCourseId) 
                          : null;
                        const replacementCourse = pc.isReplaced
                          ? summaryResult.processedCourses.find(c => c.isRetake && c.replacesCourseId === pc.id)
                          : null;

                        const isEditing = editingCourseId === pc.id;

                        return (
                          <tr 
                            key={pc.id} 
                            className={`hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                              pc.isReplaced ? 'opacity-40 line-through bg-gray-100' : ''
                            }`}
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 font-medium whitespace-nowrap hidden sm:table-cell">
                              {pc.academicYear} - <span className="text-[10px] font-semibold">{pc.semester.replace('Học kỳ ', 'HK')}</span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 whitespace-nowrap">
                              {isEditing ? (
                                <input 
                                  type="text"
                                  value={editCourseCode}
                                  onChange={(e) => setEditCourseCode(e.target.value)}
                                  className="w-16 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                              ) : (
                                pc.courseCode
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              {isEditing ? (
                                <input 
                                  type="text"
                                  value={editCourseName}
                                  onChange={(e) => setEditCourseName(e.target.value)}
                                  className="w-full bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                              ) : (
                                <div>
                                  <span className="font-semibold text-white">{pc.courseName}</span>
                                  {replacedCourse && (
                                    <div className="text-[9px] text-blue-700 mt-0.5 flex items-center gap-1 font-semibold">
                                      <RefreshCw className="w-2.5 h-2.5" />
                                      Thay thế môn: {replacedCourse.courseCode} (Điểm cũ: {replacedCourse.gradeChar})
                                    </div>
                                  )}
                                  {replacementCourse && (
                                    <div className="text-[9px] text-rose-700 mt-0.5 flex items-center gap-1 font-semibold">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      Bị phủ quyết bởi môn cải thiện
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-medium text-gray-650 whitespace-nowrap">
                              {isEditing ? (
                                <input 
                                  type="number"
                                  min="1"
                                  value={editCredits}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditCredits(val === '' ? '' : parseInt(val) || 0);
                                  }}
                                  className="w-12 bg-white border border-gray-300 rounded px-1 py-0.5 text-xs text-gray-900 text-center font-bold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                              ) : (
                                pc.credits
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                              <select
                                disabled={isEditing}
                                value={pc.gradeChar}
                                onChange={(e) => handleUpdateGrade(pc.id, e.target.value as GradeChar)}
                                className="font-bold text-[11px] px-2 py-1 rounded bg-white border border-gray-300 text-gray-900 cursor-pointer hover:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none text-center outline-none disabled:opacity-50"
                              >
                                <option value="">--</option>
                                {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'P'].map(grade => (
                                  <option key={grade} value={grade}>{grade}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-medium text-gray-500 hidden sm:table-cell">
                              {pc.gradePoint !== null ? pc.gradePoint.toFixed(2) : '-'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {pc.isConditionCourse ? (
                                  <span className="bg-amber-500/10 text-amber-400 text-[8px] font-bold px-1 rounded border border-amber-500/15">Điều Kiện</span>
                                ) : pc.isReplaced ? (
                                  <span className="bg-rose-500/10 text-rose-400 text-[8px] font-bold px-1 rounded border border-rose-500/15">Bị Thay</span>
                                ) : (
                                  <span className="bg-emerald-500/10 text-green-700 text-[8px] font-bold px-1 rounded border border-emerald-500/15">Tích Lũy</span>
                                )}
                                {pc.isRetake && (
                                  <span className="bg-indigo-500/10 text-blue-700 text-[8px] font-bold px-1 rounded border border-indigo-500/15">Học Lại</span>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                              {isEditing ? (
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={() => handleSaveEditCourse(pc.id)}
                                    className="text-green-700 hover:text-emerald-300 p-1 rounded hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center justify-center"
                                    title="Lưu thay đổi"
                                  >
                                    <Check className="w-3.5 h-3.5 text-green-700" />
                                  </button>
                                  <button
                                    onClick={handleCancelEditCourse}
                                    className="text-rose-400 hover:text-rose-350 p-1 rounded hover:bg-rose-500/10 transition-all cursor-pointer flex items-center justify-center"
                                    title="Hủy bỏ"
                                  >
                                    <X className="w-3.5 h-3.5 text-rose-400" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={() => handleStartEditCourse(pc)}
                                    className="text-gray-450 hover:text-blue-700 p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors cursor-pointer flex items-center justify-center"
                                    title="Sửa môn học"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-blue-700" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCourse(pc.id)}
                                    className="text-gray-450 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center justify-center"
                                    title="Xóa môn học"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-450">
                          Không tìm thấy môn học nào khớp với bộ lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-gray-50 border-t border-gray-250 px-4 py-3 flex justify-between items-center text-gray-500 font-bold">
                <span>Đang hiển thị {flatFilteredCourses.length} môn học</span>
                <span>Tổng số môn trong hệ thống: {courses.length}</span>
              </div>
            </div>
          )}

          {/* VIEW: CURRICULUM PROGRESS CHECKLIST */}
          {viewMode === 'curriculum' && (
            <div className="space-y-6 animate-fadeIn">
              {curriculumProgress ? (
                <>
                  {/* Curriculum Progress Statistics Panel */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm text-center">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block">Tổng Khung</span>
                      <span className="text-lg font-extrabold text-gray-900">{curriculumProgress.totalCredits} TC</span>
                      <span className="text-[9px] text-gray-450 block">({curriculumCourses.length} môn)</span>
                    </div>
                    <div className="space-y-1 border-l border-gray-200">
                      <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block">Đã Xong</span>
                      <span className="text-lg font-extrabold text-green-700">{curriculumProgress.completedCredits} TC</span>
                      <span className="text-[9px] text-emerald-500/80 block">({curriculumProgress.completed.length} môn)</span>
                    </div>
                    <div className="space-y-1 border-l border-gray-200">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Đang Học</span>
                      <span className="text-lg font-extrabold text-blue-700">{curriculumProgress.learningCredits} TC</span>
                      <span className="text-[9px] text-indigo-500/80 block">({curriculumProgress.learning.length} môn)</span>
                    </div>
                    <div className="space-y-1 border-l border-gray-200">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Nợ Môn</span>
                      <span className="text-lg font-extrabold text-rose-400">{curriculumProgress.failedCredits} TC</span>
                      <span className="text-[9px] text-rose-500/80 block">({curriculumProgress.failed.length} môn)</span>
                    </div>
                    <div className="space-y-1 border-l border-gray-200">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Còn Thiếu</span>
                      <span className="text-lg font-extrabold text-gray-900">{curriculumProgress.missingCredits} TC</span>
                      <span className="text-[9px] text-gray-450 block">({curriculumProgress.missing.length} môn)</span>
                    </div>
                  </div>

                  {/* Checklist Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* COLUMN 1: CÒN THIẾU (Chưa Đăng Ký) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col h-[500px]" >
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-650 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          CÒN THIẾU ({curriculumProgress.missing.length})
                        </span>
                        <span className="text-[10px] font-bold text-gray-450 bg-gray-200/50 px-2 py-0.5 rounded border border-gray-300 text-gray-650 font-bold">{curriculumProgress.missingCredits} TC</span>
                      </div>
                      <div className="space-y-2.5 overflow-y-auto flex-grow pr-1.5 custom-scrollbar bg-transparent">
                        {curriculumProgress.missing.map(c => (
                          <div key={c.courseCode} className="p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all flex justify-between items-start gap-2 group">
                            <div className="space-y-1">
                              <div className="font-bold text-[11px] text-gray-650">{c.courseCode}</div>
                              <div className="text-[10px] text-gray-450 leading-snug">{c.courseName}</div>
                            </div>
                            
                            {/* Interactive Edit Credits */}
                            <div className="flex items-center gap-1">
                              {editingCurriculumCode === c.courseCode ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={editCurriculumCredits}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditCurriculumCredits(val === '' ? '' : parseInt(val) || 0);
                                  }}
                                  className="w-10 bg-white border border-gray-300 rounded text-center text-xs text-gray-900 p-0.5 font-bold"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateCurriculumCredits(c.courseCode, editCurriculumCredits);
                                      setEditingCurriculumCode(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCurriculumCode(null);
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-gray-650 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-250">{c.credits} TC</span>
                              )}
                              <button
                                onClick={() => {
                                  if (editingCurriculumCode === c.courseCode) {
                                    handleUpdateCurriculumCredits(c.courseCode, editCurriculumCredits);
                                    setEditingCurriculumCode(null);
                                  } else {
                                    setEditingCurriculumCode(c.courseCode);
                                    setEditCurriculumCredits(c.credits);
                                  }
                                }}
                                className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                title="Sửa tín chỉ môn này"
                              >
                                {editingCurriculumCode === c.courseCode ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        {curriculumProgress.missing.length === 0 && (
                          <div className="text-center py-10 text-[11px] text-gray-400">Tuyệt vời! Bạn không thiếu môn nào.</div>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 2: NỢ MÔN (F) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col h-[500px]">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          NỢ MÔN / F ({curriculumProgress.failed.length})
                        </span>
                        <span className="text-[10px] font-bold text-rose-450 bg-rose-100 px-2 py-0.5 rounded border border-rose-200 text-rose-700 font-bold">{curriculumProgress.failedCredits} TC</span>
                      </div>
                      <div className="space-y-2.5 overflow-y-auto flex-grow pr-1.5 custom-scrollbar bg-transparent">
                        {curriculumProgress.failed.map(c => (
                          <div key={c.courseCode} className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl flex justify-between items-start gap-2 group">
                            <div className="space-y-1">
                              <div className="font-bold text-[11px] text-rose-455">{c.courseCode}</div>
                              <div className="text-[10px] text-gray-450 leading-snug">{c.courseName}</div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {editingCurriculumCode === c.courseCode ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={editCurriculumCredits}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditCurriculumCredits(val === '' ? '' : parseInt(val) || 0);
                                  }}
                                  className="w-10 bg-white border border-gray-300 rounded text-center text-xs text-gray-900 p-0.5 font-bold"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateCurriculumCredits(c.courseCode, editCurriculumCredits);
                                      setEditingCurriculumCode(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCurriculumCode(null);
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{c.credits} TC</span>
                              )}
                              <button
                                onClick={() => {
                                  if (editingCurriculumCode === c.courseCode) {
                                    handleUpdateCurriculumCredits(c.courseCode, editCurriculumCredits);
                                    setEditingCurriculumCode(null);
                                  } else {
                                    setEditingCurriculumCode(c.courseCode);
                                    setEditCurriculumCredits(c.credits);
                                  }
                                }}
                                className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                title="Sửa tín chỉ môn này"
                              >
                                {editingCurriculumCode === c.courseCode ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        {curriculumProgress.failed.length === 0 && (
                          <div className="text-center py-10 text-[11px] text-gray-400">Sạch điểm F! Không có môn nợ.</div>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 3: ĐANG HỌC (Chờ Điểm) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col h-[500px]">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          ĐANG HỌC ({curriculumProgress.learning.length})
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-blue-700 font-bold">{curriculumProgress.learningCredits} TC</span>
                      </div>
                      <div className="space-y-2.5 overflow-y-auto flex-grow pr-1.5 custom-scrollbar bg-transparent">
                        {curriculumProgress.learning.map(c => (
                          <div key={c.courseCode} className="p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all flex justify-between items-start gap-2 group">
                            <div className="space-y-1">
                              <div className="font-bold text-[11px] text-blue-700">{c.courseCode}</div>
                              <div className="text-[10px] text-gray-450 leading-snug">{c.courseName}</div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {editingCurriculumCode === c.courseCode ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={editCurriculumCredits}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditCurriculumCredits(val === '' ? '' : parseInt(val) || 0);
                                  }}
                                  className="w-10 bg-white border border-gray-300 rounded text-center text-xs text-gray-900 p-0.5 font-bold"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateCurriculumCredits(c.courseCode, editCurriculumCredits);
                                      setEditingCurriculumCode(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCurriculumCode(null);
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-150">{c.credits} TC</span>
                              )}
                              <button
                                onClick={() => {
                                  if (editingCurriculumCode === c.courseCode) {
                                    handleUpdateCurriculumCredits(c.courseCode, editCurriculumCredits);
                                    setEditingCurriculumCode(null);
                                  } else {
                                    setEditingCurriculumCode(c.courseCode);
                                    setEditCurriculumCredits(c.credits);
                                  }
                                }}
                                className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                title="Sửa tín chỉ môn này"
                              >
                                {editingCurriculumCode === c.courseCode ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        {curriculumProgress.learning.length === 0 && (
                          <div className="text-center py-10 text-[11px] text-gray-400">Không có môn nào đang học.</div>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 4: ĐÃ HOÀN THÀNH */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col h-[500px]">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-green-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          ĐÃ ĐẠT ({curriculumProgress.completed.length})
                        </span>
                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-200 text-green-700 font-bold">{curriculumProgress.completedCredits} TC</span>
                      </div>
                      <div className="space-y-2.5 overflow-y-auto flex-grow pr-1.5 custom-scrollbar bg-transparent">
                        {curriculumProgress.completed.map(c => (
                          <div key={c.courseCode} className="p-3 bg-green-50/50 border border-green-250 rounded-xl flex justify-between items-start gap-2 group">
                            <div className="space-y-1">
                              <div className="font-bold text-[11px] text-green-700">{c.courseCode}</div>
                              <div className="text-[10px] text-gray-450 leading-snug">{c.courseName}</div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {editingCurriculumCode === c.courseCode ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={editCurriculumCredits}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditCurriculumCredits(val === '' ? '' : parseInt(val) || 0);
                                  }}
                                  className="w-10 bg-white border border-gray-300 rounded text-center text-xs text-gray-900 p-0.5 font-bold"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateCurriculumCredits(c.courseCode, editCurriculumCredits);
                                      setEditingCurriculumCode(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCurriculumCode(null);
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-150">{c.credits} TC</span>
                              )}
                              <button
                                onClick={() => {
                                  if (editingCurriculumCode === c.courseCode) {
                                    handleUpdateCurriculumCredits(c.courseCode, editCurriculumCredits);
                                    setEditingCurriculumCode(null);
                                  } else {
                                    setEditingCurriculumCode(c.courseCode);
                                    setEditCurriculumCredits(c.credits);
                                  }
                                }}
                                className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                title="Sửa tín chỉ môn này"
                              >
                                {editingCurriculumCode === c.courseCode ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        {curriculumProgress.completed.length === 0 && (
                          <div className="text-center py-10 text-[11px] text-gray-400">Chưa hoàn thành môn nào.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center space-y-4 shadow-md max-w-md mx-auto my-10 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mx-auto">
                    <BookOpen className="w-6 h-6 text-blue-700" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Chưa Cài Đặt Khung Chương Trình</h3>
                    <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                      Hãy dán khung chương trình dự kiến từ myDTU để hệ thống tự động bóc tách và tạo lộ trình đối chiếu môn học cho bạn.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCurriculumModalOpen(true)}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/15 cursor-pointer border border-indigo-400/20"
                  >
                    Cài đặt Khung ngay
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* MODAL CẢNH BÁO XÓA (Custom Confirm Dialog) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          ></div>
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1 space-y-2 pt-1">
                <h3 className="text-lg font-bold text-gray-900 leading-none">{confirmModal.title}</h3>
                <p className="text-sm text-gray-650 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 transition-colors cursor-pointer bg-transparent"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CÀI ĐẶT KHUNG CHƯƠNG TRÌNH */}
      {isCurriculumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsCurriculumModalOpen(false)}
          ></div>
          <div className="relative bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <h3 className="text-base font-bold text-gray-900 mb-2.5 uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
              Cài Đặt Khung Chương Trình Đào Tạo
            </h3>
            
            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto pr-1 flex-grow mb-4 space-y-4 custom-scrollbar">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Thiết lập danh sách môn học khung của ngành học giúp bạn theo dõi tiến độ tích lũy và xem các môn còn lại chưa học để giả lập điểm.
              </p>

              {/* Nút toggle Hướng dẫn sử dụng */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 gap-2">
                <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
                  Bạn chưa biết cách lấy khung môn học?
                </span>
                <button
                  type="button"
                  onClick={() => setShowCurriculumGuide(!showCurriculumGuide)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 border border-blue-100 transition-all cursor-pointer select-none whitespace-nowrap"
                >
                  {showCurriculumGuide ? 'Ẩn Hướng dẫn' : 'Xem Hướng dẫn'}
                </button>
              </div>

              {/* Hướng dẫn lấy khung chương trình */}
              {showCurriculumGuide && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="text-[10px] font-extrabold text-green-700 tracking-wider uppercase block">
                    💡 Hướng Dẫn Từng Bước (Nhanh):
                  </span>
                  <ol className="list-decimal list-inside text-[11px] text-gray-750 space-y-1.5 pl-0.5 leading-relaxed">
                    <li>Truy cập myDTU &rarr; chọn mục <strong>Chương Trình Học</strong>.</li>
                    <li>Bôi đen (quét khối) từ <strong>Mã Môn / Tên Môn đầu tiên</strong> kéo xuống hết toàn bộ danh sách (như ảnh bên dưới).</li>
                    <li>Nhấn <strong>Ctrl + C</strong> để sao chép.</li>
                    <li>Dán (<strong>Ctrl + V</strong>) vào ô nhập bên dưới và nhấn phân tích.</li>
                  </ol>
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-[9px] text-gray-650 font-bold block mb-1.5 uppercase">Ảnh minh họa bôi đen:</span>
                    <img 
                      src="/guide_curriculum.png" 
                      alt="Ảnh minh họa bôi đen khung chương trình myDTU" 
                      className="rounded-lg border border-gray-200 w-full object-contain max-h-[180px] shadow-md"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-650 leading-normal block">
                  Dán nội dung vào đây để tính tổng tín chỉ chuyên ngành của bạn cho nhanh:
                </label>
                <textarea
                  value={curriculumInputText}
                  onChange={(e) => setCurriculumInputText(e.target.value)}
                  placeholder="Nhấp vào đây và nhấn Ctrl+V..."
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-gray-950 placeholder-gray-400 focus:outline-none focus:border-blue-600 h-28 resize-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="curriculum-merge-checkbox"
                  checked={isCurriculumMerge}
                  onChange={(e) => setIsCurriculumMerge(e.target.checked)}
                  className="w-4 h-4 rounded bg-white border border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none cursor-pointer"
                />
                <label 
                  htmlFor="curriculum-merge-checkbox" 
                  className="text-xs text-gray-600 hover:text-gray-900 transition-colors cursor-pointer select-none font-semibold"
                >
                  Cộng dồn vào khung hiện tại (không xóa môn học cũ)
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-gray-200">
              <button 
                onClick={() => {
                  setIsCurriculumModalOpen(false);
                  setCurriculumInputText('');
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleParseCurriculum}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow shadow-blue-600/10 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Phân tích & Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GIẢI THÍCH CHI TIẾT GPA (GPA Detail Explanation Modal) */}
      {isGpaDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsGpaDetailModalOpen(false)}
          ></div>
          <div className="relative bg-white border border-gray-200 rounded-2xl p-5 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-700" />
                Chi Tiết Tính Điểm GPA Tích Lũy
              </h3>
              <button 
                onClick={() => setIsGpaDetailModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-grow text-xs leading-relaxed text-gray-650">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span>GPA Tích lũy (Làm tròn):</span>
                  <span className="text-base font-black text-green-700">
                    {hasGrades ? dtuResult.cumulativeGpa.toFixed(2) : '--'} / 4.00
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>GPA Chỉ số thực (Chưa làm tròn):</span>
                  <span className="text-sm font-bold text-blue-700">
                    {hasGrades ? dtuResult.rawCumulativeGpa.toFixed(6) : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
                  <span>Xếp loại tốt nghiệp hiện tại:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${gpaClassification.color}`}>
                    {gpaClassification.name}
                  </span>
                </div>
              </div>

              {hasGrades && (
                <div className="space-y-2">
                  <span className="font-extrabold text-gray-900 block uppercase tracking-wider text-[10px]">
                    🧮 Cấu Trúc Phép Tính GPA Tích Lũy:
                  </span>
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2">
                    <div className="flex justify-between">
                      <span>Tử số (Tổng điểm hệ 4 nhân tín chỉ):</span>
                      <span className="font-bold text-gray-800">{dtuResult.totalGradePoints.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mẫu số (Tổng tín chỉ tích lũy tính GPA):</span>
                      <span className="font-bold text-gray-800">{dtuResult.accumulatedCredits} tín chỉ</span>
                    </div>
                    <div className="border-t border-indigo-500/10 my-2"></div>
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 text-[10px]">Phép toán chia thực tế:</span>
                      <code className="text-blue-700 font-bold bg-blue-50 border border-blue-100 px-2 py-1 rounded text-center block text-xs tracking-wide">
                        {dtuResult.totalGradePoints.toFixed(2)} / {dtuResult.accumulatedCredits} = {dtuResult.rawCumulativeGpa.toFixed(8)}
                      </code>
                      <span className="text-[10px] text-gray-450 text-center italic mt-1">
                        (Làm tròn 2 chữ số thập phân chuẩn cổng myDTU: {dtuResult.cumulativeGpa.toFixed(2)})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <span className="font-extrabold text-gray-900 block uppercase tracking-wider text-[10px]">
                  ⚙️ Quy Chế Học Lại & Cải Thiện (Cơ chế "Trừ cũ - Cộng mới"):
                </span>
                <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <p>
                    🔹 <strong>Môn học điều kiện:</strong> Điểm của các môn Giáo dục Thể chất, Giáo dục Quốc phòng (đánh giá bằng P/F) <strong>bị loại hoàn toàn</strong> khỏi công thức tính GPA tích lũy.
                  </p>
                  <p>
                    🔹 <strong>Trừ điểm gốc môn học lại:</strong> Khi bạn đăng ký học cải thiện hoặc học lại một môn đã học trước đó, điểm của lượt học cũ sẽ bị loại ra khỏi tổng điểm và tổng số tín chỉ tích lũy (không tính vào GPA).
                  </p>
                  <p>
                    🔹 <strong>Cộng điểm lượt mới nhất:</strong> Điểm số và số tín chỉ của lượt học mới nhất sẽ được sử dụng để tính vào GPA tích lũy, giúp cải thiện điểm trung bình của bạn.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-gray-200">
              <button 
                onClick={() => setIsGpaDetailModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow shadow-blue-600/10 transition-all active:scale-95 cursor-pointer border-0"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ĐỒNG HÀNH CÙNG DỰ ÁN (Support Development Modal) */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsSupportModalOpen(false)}
          ></div>
          <div className="relative bg-white border border-gray-200 rounded-2xl p-5 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500/20 animate-pulse" />
                Đồng Hành Cùng Dự Án
              </h3>
              <button 
                onClick={() => setIsSupportModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3 pr-1 text-xs text-gray-600">
              <p className="text-center text-gray-650 text-[11px] leading-normal px-1">
                Cảm ơn bạn đã đồng hành cùng <strong>Thắng (Lê Văn Thắng dev)</strong> duy trì hosting và tiếp thêm động lực phát triển ứng dụng tính GPA DTU phi lợi nhuận này!
              </p>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center gap-3">
                {/* QR Code Image */}
                <div className="bg-white p-1.5 rounded-lg shadow-md w-[125px] h-[125px] flex-shrink-0 flex items-center justify-center hover:scale-105 transition-transform duration-200">
                  <img 
                    src="https://img.vietqr.io/image/970449-0333792162-qr_only.png?addInfo=Dong%20hanh%20cung%20GPA%20DTU&accountName=LE%20VAN%20THANG" 
                    alt="VietQR Lê Văn Thắng LPBank" 
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Account Details */}
                <div className="w-full space-y-1.5 border-t sm:border-t-0 sm:border-l border-gray-200 pt-2 sm:pt-0 sm:pl-3">
                  <div className="flex justify-between sm:flex-col sm:items-start text-[11px]">
                    <span className="text-gray-500 text-[9px] uppercase tracking-wider">Ngân hàng</span>
                    <span className="font-bold text-gray-800 text-[11px]">LPBank (Ngân hàng Lộc Phát)</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-start text-[11px]">
                    <span className="text-gray-500 text-[9px] uppercase tracking-wider">Số tài khoản</span>
                    <span className="font-black text-green-700 select-all font-mono text-xs">0333792162</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-start text-[11px]">
                    <span className="text-gray-500 text-[9px] uppercase tracking-wider">Chủ tài khoản</span>
                    <span className="font-bold text-gray-800 text-[11px]">LÊ VĂN THẮNG</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-start text-[11px]">
                    <span className="text-gray-500 text-[9px] uppercase tracking-wider">Nội dung chuyển</span>
                    <span className="font-bold text-blue-700 select-all text-[11px]">Dong hanh cung GPA DTU</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-gray-450 italic text-center leading-normal">
                ❤️ Mọi sự ủng hộ đều là động lực to lớn giúp mình duy trì dự án. Cảm ơn bạn rất nhiều!
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-gray-200">
              <button 
                onClick={() => setIsSupportModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow shadow-blue-600/10 transition-all active:scale-95 cursor-pointer border-0"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KHOE KẾT QUẢ (Share Card Modal) */}
      {isShareCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsShareCardModalOpen(false)}
          ></div>
          <div className="relative bg-white border border-gray-200 rounded-2xl p-4 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] gap-3 overflow-y-auto scrollbar-thin">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-700 animate-bounce" />
                Thẻ Khoe Kết Quả Story 9:16
              </h3>
              <button 
                onClick={() => setIsShareCardModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Name field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 tracking-wider font-semibold uppercase">Nhập tên của bạn:</label>
              <input 
                type="text" 
                maxLength={25}
                value={shareStudentName}
                onChange={(e) => setShareStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <p className="text-[9px] text-gray-450 font-semibold leading-normal mt-0.5">
                ✨ Tên này sẽ được hiển thị trên Thẻ Story và Bảng Vàng vinh danh của bạn.
              </p>
            </div>

            {/* Theme Selector Bubble Row */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1.5">Chọn mẫu thiết kế có sẵn:</label>
                <div className="flex gap-2 pb-1 overflow-x-auto justify-start scrollbar-thin">
                  {SHARE_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`relative flex-shrink-0 w-8 h-8 rounded-full cursor-pointer transition-all duration-200 border-2 ${
                        selectedThemeId === theme.id 
                          ? 'border-blue-600 scale-110 shadow-md shadow-blue-500/10' 
                          : 'border-gray-200 hover:border-gray-400 bg-gray-50'
                      }`}
                      title={theme.name}
                    >
                      <span className={`absolute inset-0.5 rounded-full ${theme.previewClass}`} />
                      {selectedThemeId === theme.id && (
                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1.5">Hoặc tải ảnh nền riêng của bạn:</label>
                <button
                  type="button"
                  onClick={() => bgImageInputRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-dashed cursor-pointer ${
                    selectedThemeId === 'custom'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 shadow-sm'
                  }`}
                  title="Bấm vào đây để tải ảnh nền riêng của bạn từ thiết bị (.png, .jpg)"
                >
                  {customBgImage ? (
                    <>
                      <span className="w-5 h-5 rounded-full bg-cover bg-center border border-blue-500/20 flex-shrink-0" style={{ backgroundImage: `url(${customBgImage})` }} />
                      <span className="truncate">Đã chọn ảnh riêng (Nhấp để đổi ảnh khác)</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>📁 Bấm để chọn ảnh từ điện thoại / máy tính...</span>
                    </>
                  )}
                </button>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={bgImageInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleBgImageChange}
              />
            </div>

            {/* Card Preview Area */}
            <div className="flex justify-center items-center py-1 flex-grow overflow-hidden bg-gray-50 rounded-xl border border-gray-200 p-2 min-h-[180px] max-h-[280px] w-full">
              <div 
                ref={previewContainerRef}
                onClick={() => setIsCardZoomed(true)}
                className="h-[200px] sm:h-[220px] aspect-[9/16] max-w-full overflow-hidden rounded-2xl border border-gray-200 flex items-center justify-center bg-gray-100 shadow-inner relative cursor-zoom-in group transition-all duration-300 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
              >
                <div 
                  style={{ transform: `scale(${previewScale})`, transformOrigin: 'center' }}
                  className="absolute pointer-events-none transition-transform duration-300 group-hover:scale-[1.01]"
                >
                  <ShareCardContent
                    theme={activeShareTheme}
                    shareStudentName={shareStudentName}
                    hasGrades={hasGrades}
                    cumulativeGpa={dtuResult.cumulativeGpa}
                    rawCumulativeGpa={dtuResult.rawCumulativeGpa}
                    gpaClassification={gpaClassification}
                    accumulatedCredits={dtuResult.accumulatedCredits}
                    shareSlogan={shareSlogan}
                    isExport={false}
                    customBgImage={customBgImage}
                  />
                </div>
                
                {/* Hover Overlay Hint */}
                <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5">
                  <div className="p-2 bg-indigo-600/90 text-white rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-wider uppercase drop-shadow bg-slate-900/80 px-2 py-0.5 rounded-full">
                    Click để phóng to
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-200">
              <button 
                onClick={() => setIsShareCardModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-300 bg-transparent"
              >
                Đóng
              </button>
              <button 
                onClick={handleDownloadShareCard}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer border-0"
              >
                <Download className="w-3.5 h-3.5" />
                Tải Ảnh (Story 9:16)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX PHÓNG TO THẺ STORY (9:16) */}
      {isCardZoomed && (
        <div 
          onClick={() => setIsCardZoomed(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-full max-h-[95vh] flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-200 z-10 w-full h-full pointer-events-none">
            {/* Card Container wrapper to constrain aspect ratio and support dynamic scaling */}
            <div className="flex-grow w-full max-h-[75vh] flex items-center justify-center overflow-hidden">
              <div 
                ref={lightboxContainerRef}
                onClick={(e) => e.stopPropagation()}
                className="w-[360px] h-[640px] max-w-full max-h-full aspect-[9/16] shadow-2xl rounded-2xl overflow-hidden border border-gray-200 relative flex items-center justify-center pointer-events-auto cursor-default"
              >
                <div 
                  style={{ transform: `scale(${lightboxScale})`, transformOrigin: 'center' }}
                  className="absolute flex-shrink-0"
                >
                  <ShareCardContent
                    theme={activeShareTheme}
                    shareStudentName={shareStudentName}
                    hasGrades={hasGrades}
                    cumulativeGpa={dtuResult.cumulativeGpa}
                    rawCumulativeGpa={dtuResult.rawCumulativeGpa}
                    gpaClassification={gpaClassification}
                    accumulatedCredits={dtuResult.accumulatedCredits}
                    shareSlogan={shareSlogan}
                    isExport={false}
                    customBgImage={customBgImage}
                  />
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex gap-3 items-center pointer-events-auto"
            >
              <button
                onClick={handleDownloadShareCard}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow shadow-blue-600/10 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border-0"
              >
                <Download className="w-3.5 h-3.5" />
                Tải Ảnh Story
              </button>
              <button
                onClick={() => setIsCardZoomed(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer border border-gray-300"
              >
                Đóng Xem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HƯỚNG DẪN LƯU ẢNH TRÊN DI ĐỘNG (Download Success Modal) */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => setIsDownloadModalOpen(false)}
          ></div>
          <div className="relative bg-white border border-gray-200 rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] gap-3">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-700" />
                Lưu Ảnh Thẻ Story
              </h3>
              <button 
                onClick={() => setIsDownloadModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-left">
              <p className="text-xs text-blue-800 font-bold leading-relaxed">
                👉 **Cách lưu ảnh về máy của bạn:**
              </p>
              <ul className="list-disc pl-4 mt-1 text-[11px] text-blue-700/90 space-y-1 font-medium">
                <li><strong>Trên điện thoại:</strong> Nhấn nút <strong>"Chia sẻ / Lưu điện thoại"</strong> màu xanh ở góc dưới để lưu trực tiếp vào Thư viện ảnh (Photos) hoặc gửi qua Zalo/Messenger.</li>
                <li>Bạn cũng có thể thử nhấn giữ trực tiếp vào ảnh để chọn <strong>"Lưu hình ảnh"</strong> (nếu trình duyệt của bạn hỗ trợ).</li>
              </ul>
            </div>

            {/* Generated Image Container */}
            <div className="flex-grow overflow-y-auto flex justify-center items-center py-2 bg-gray-50 rounded-xl border border-gray-200 p-2 min-h-[260px] max-h-[400px]">
              {downloadedImageUrl ? (
                <img 
                  src={downloadedImageUrl} 
                  alt="GPA DTU Share Card" 
                  className="max-h-full aspect-[9/16] rounded-xl object-contain shadow-lg pointer-events-auto"
                />
              ) : (
                <div className="text-xs text-gray-450 font-medium animate-pulse">Đang nạp ảnh...</div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between pt-2 border-t border-gray-200 w-full">
              {/* Left/Top: PC/Secondary Actions */}
              <div className="flex gap-2 justify-start w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (downloadedImageUrl) {
                      const link = document.createElement('a');
                      const formattedName = shareStudentName.trim()
                        ? shareStudentName.trim().replace(/\s+/g, '_')
                        : 'Sinh_Vien_DTU';
                      link.download = `GPA_DTU_${formattedName}_${dtuResult.cumulativeGpa.toFixed(2)}.png`;
                      link.href = downloadedImageUrl;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-1 cursor-pointer border border-gray-300 flex-1 sm:flex-none justify-center"
                  title="Tải trực tiếp về máy tính (Downloads)"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải về PC
                </button>
                <button 
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent flex-1 sm:flex-none justify-center"
                >
                  Đóng
                </button>
              </div>
              
              {/* Right/Bottom: Primary Phone Action */}
              <button
                onClick={handleShareNative}
                disabled={isSharingImage}
                className="px-4.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow shadow-blue-600/10 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border-0 disabled:opacity-50 w-full sm:w-auto"
              >
                <Share2 className="w-3.5 h-3.5" />
                {isSharingImage ? 'Đang mở chia sẻ...' : 'Chia sẻ / Lưu điện thoại'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL HƯỚNG DẪN SỬ DỤNG (Help Modal) */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsHelpModalOpen(false)}
          ></div>
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-700" />
                Hướng Dẫn Sử Dụng & Nhập Điểm Từ myDTU
              </h3>
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-6 overflow-y-auto pr-2 flex-grow text-xs leading-relaxed text-gray-650">
              
              <div className="space-y-2">
                <span className="text-[13px] font-extrabold text-gray-900 block">
                  CÁC BƯỚC NHẬP ĐIỂM TỰ ĐỘNG BẰNG COPY - PASTE:
                </span>
                <ol className="list-decimal list-inside space-y-3 pl-1">
                  <li>
                    Đăng nhập vào cổng thông tin đào tạo <a href="https://mydtu.duytan.edu.vn" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">myDTU của bạn</a>.
                  </li>
                  <li>
                    Vào trang <strong>Bảng điểm học tập cá nhân</strong> (Bảng điểm hiển thị tất cả các học kỳ có điểm số của bạn).
                  </li>
                  <li>
                    Bắt đầu bôi đen (quét khối) từ <strong>Mã Môn / Tên Môn đầu tiên</strong> kéo dài xuống đến hết bảng điểm (như ảnh minh họa bên dưới).
                  </li>
                </ol>
              </div>

              {/* Ảnh bôi đen bảng điểm myDTU */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-gray-500 tracking-wider font-semibold block">
                  HÌNH 1: QUÉT KHỐI BẢNG ĐIỂM TRÊN MYDTU (VÍ DỤ CẢ NĂM 1 VÀ NĂM 2)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 p-3 rounded-xl border border-gray-200">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-450 font-bold block text-center uppercase">1. Phần đầu bảng điểm (Bắt đầu quét)</span>
                    <img 
                      src="/guide_step1.png" 
                      alt="Quét bảng điểm myDTU đầu" 
                      className="rounded-lg border border-gray-250 w-full object-contain shadow-md" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-450 font-bold block text-center uppercase">2. Phần cuối bảng điểm (Quét hết bảng)</span>
                    <img 
                      src="/guide_step2.png" 
                      alt="Quét bảng điểm myDTU cuối" 
                      className="rounded-lg border border-gray-250 w-full object-contain shadow-md" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <ol className="list-decimal list-inside space-y-3 pl-1" start={4}>
                  <li>
                    Nhấn tổ hợp phím <strong>Ctrl + C</strong> (hoặc nhấn chuột phải và chọn <strong>Sao chép</strong>).
                  </li>
                  <li>
                    Quay lại ứng dụng này, ở khung <strong>Thêm Môn Học</strong>, nhấp chọn thẻ <strong>"Dán từ myDTU"</strong>.
                  </li>
                  <li>
                    Click chuột vào ô nhập và nhấn <strong>Ctrl + V</strong> (hoặc nhấn chuột phải và chọn <strong>Dán</strong>) (như hình minh họa bên dưới).
                  </li>
                </ol>
              </div>

              {/* Ảnh dán vào ứng dụng */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-gray-500 tracking-wider font-semibold block">
                  HÌNH 2: DÂN VÀO ỨNG DỤNG VÀ NHẤN "PHÂN TÍCH & TỰ ĐỘNG THÊM"
                </span>
                <div className="bg-gray-100 p-3 rounded-xl border border-gray-200 max-w-lg mx-auto">
                  <img 
                    src="/guide_step3.png" 
                    alt="Dán dữ liệu và phân tích" 
                    className="rounded-lg border border-gray-250 w-full object-contain shadow-md" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <ol className="list-decimal list-inside space-y-3 pl-1" start={7}>
                  <li>
                    Nhấn nút <strong>"Phân tích & Tự Động Thêm"</strong>. Ứng dụng sẽ tự động nhận diện tất cả môn học, số tín chỉ, điểm chữ và phân bổ chính xác theo từng Năm học & Học kỳ hoàn toàn tự động!
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-[11px] space-y-1">
                <span className="font-bold text-blue-800 block">💡 LƯU Ý HỮU ÍCH:</span>
                <ul className="list-disc list-inside space-y-1 text-gray-600 pl-1">
                  <li>Ứng dụng hỗ trợ tự động phát hiện và gộp các môn học cải thiện / học lại dựa trên mã môn và số tín chỉ.</li>
                  <li>Bạn có thể nhấp chọn biểu tượng <Pencil className="w-3.5 h-3.5 inline text-blue-700 mx-0.5" /> ngay bên cạnh điểm chữ trong bảng điểm hoặc tên môn học để sửa thông tin trực tiếp bất cứ lúc nào.</li>
                </ul>
              </div>

              {/* Quy chế xếp loại tốt nghiệp DTU */}
              <div className="space-y-3 pt-4 border-t border-gray-200" id="graduation-rules">
                <span className="text-[13px] font-extrabold text-gray-900 block uppercase tracking-wider">
                  🎓 Quy Chế Xếp Loại Tốt Nghiệp Đại Học Duy Tân (DTU):
                </span>
                
                <div className="overflow-x-auto rounded-xl border border-gray-250 bg-gray-100/50">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-250 text-gray-600 font-bold">
                        <th className="p-2.5">Xếp Loại Tốt Nghiệp</th>
                        <th className="p-2.5">Yêu Cầu GPA Tích Lũy</th>
                        <th className="p-2.5">Điều Kiện Khống Chế (Tín Chỉ Học Lại / Cải Thiện)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-650">
                      <tr>
                        <td className="p-2.5 font-bold text-purple-700">Xuất Sắc</td>
                        <td className="p-2.5 font-bold text-gray-800">3.60 – 4.00</td>
                        <td className="p-2.5 text-xs" rowSpan={2}>
                          Tổng số tín chỉ thi lại, học lại hoặc cải thiện <strong className="text-rose-600">không vượt quá 5%</strong> tổng số tín chỉ của toàn khóa học (ví dụ: tối đa 7.2 tín chỉ trên tổng 144 tín chỉ).
                          <div className="text-[10px] text-gray-500 mt-1 italic">
                            * Nếu vượt quá 5%, thứ hạng tốt nghiệp sẽ bị hạ xuống 1 bậc.
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-green-700">Giỏi</td>
                        <td className="p-2.5 font-bold text-gray-800">3.20 – 3.59</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-blue-700">Khá</td>
                        <td className="p-2.5 font-bold text-gray-800">2.50 – 3.19</td>
                        <td className="p-2.5 text-gray-500 italic">Không áp dụng điều kiện khống chế học lại.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-amber-700">Trung Bình</td>
                        <td className="p-2.5 font-bold text-gray-800">2.00 – 2.49</td>
                        <td className="p-2.5 text-gray-500 italic">Không áp dụng điều kiện khống chế học lại.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-[11px] space-y-1">
                  <span className="font-bold text-rose-700 block">⚠️ CẢNH BÁO TỐT NGHIỆP:</span>
                  <p className="text-rose-800 leading-normal">
                    Ứng dụng sẽ tự động phân tích tỷ lệ phần trắng số tín chỉ học lại của bạn dựa trên tổng số tín chỉ mục tiêu của chương trình học (mặc định là 144 tín chỉ, bạn có thể chỉnh sửa). Hãy theo dõi cảnh báo học lại ở màn hình chính để tránh bị hạ bậc tốt nghiệp đáng tiếc!
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 transition-all active:scale-95 cursor-pointer"
              >
                Đã hiểu, đóng hướng dẫn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HỖ TRỢ & GÓP Ý (Feedback Modal) */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={handleCloseFeedbackModal}
          ></div>
          <div className="relative bg-white border border-gray-200 rounded-2xl p-5 w-full max-w-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-2.5 border-b border-gray-200 mb-3.5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-blue-700" />
                Hỗ Trợ & Đóng Góp Ý Kiến
              </h3>
              <button 
                onClick={handleCloseFeedbackModal}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Author Credit Banner */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/15 rounded-xl p-3 mb-3.5 text-[11px] leading-relaxed text-gray-600 flex items-start gap-2.5">
              <span className="p-1 bg-indigo-500/10 text-blue-700 rounded-md font-bold text-xs shrink-0">👨‍💻</span>
              <div>
                <span className="font-bold text-gray-900 block">Lê Văn Thắng dev</span>
                <span>Mọi đóng góp, báo cáo lỗi từ bạn là động lực to lớn giúp tôi tối ưu hóa ứng dụng này. Cảm ơn bạn!</span>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border border-gray-200 mb-3.5 p-0.5 bg-gray-100 rounded-xl">
              <button
                onClick={() => setFeedbackTab('bug')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  feedbackTab === 'bug' 
                    ? 'bg-white text-rose-700 border border-rose-200 shadow-sm font-bold' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                🐞 Báo cáo lỗi
              </button>
              <button
                onClick={() => setFeedbackTab('suggestion')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  feedbackTab === 'suggestion' 
                    ? 'bg-white text-emerald-700 border border-emerald-200 shadow-sm font-bold' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                💡 Góp ý cải tiến
              </button>
              <button
                onClick={() => setFeedbackTab('contact')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  feedbackTab === 'contact' 
                    ? 'bg-white text-blue-700 border border-blue-200 shadow-sm font-bold' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                📞 Liên hệ tác giả
              </button>
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto pr-1 flex-grow space-y-3.5">
              
              {feedbackTab === 'bug' && (
                <div className="space-y-3 animate-fadeIn">
                  <p className="text-[11px] text-gray-600 leading-relaxed pl-1">
                    Mô tả lỗi hiển thị hoặc tính toán sai dưới đây. Bạn có thể đính kèm ảnh chụp màn hình (ảnh sẽ được tự động copy, bạn chỉ cần nhấn <strong>Ctrl + V</strong> để dán vào Gmail).
                  </p>
                  
                  <textarea
                    value={bugText}
                    onChange={(e) => setBugText(e.target.value)}
                    placeholder="Mô tả chi tiết lỗi bạn gặp phải..."
                    className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 h-20 resize-none leading-relaxed"
                  />

                  {/* Nút gửi kèm ảnh lỗi */}
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer border border-gray-300 transition-colors shrink-0">
                      <Paperclip className="w-3.5 h-3.5 text-rose-400" />
                      Đính kèm ảnh lỗi
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBugImage(file);
                            const png = await convertToPngBlob(file);
                            setBugPngBlob(png);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {bugImage ? (
                      <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1.5 flex-grow min-w-0">
                        <img
                          src={URL.createObjectURL(bugImage)}
                          alt="preview"
                          className="w-6 h-6 rounded object-cover border border-rose-500/20 shrink-0"
                        />
                        <span className="text-[11px] text-gray-650 truncate flex-grow font-mono">{bugImage.name}</span>
                        
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (bugPngBlob) {
                              const ok = await copyBlobToClipboard(bugPngBlob);
                              if (ok) {
                                showToast('Đã sao chép ảnh! Hãy nhấn Ctrl+V ở Gmail để dán.', 'success');
                              } else {
                                showToast('Không thể sao chép hình ảnh. Trình duyệt của bạn có thể đang chặn quyền Clipboard.', 'error');
                              }
                            } else {
                              showToast('Đang xử lý ảnh, vui lòng thử lại sau 1 giây...', 'info');
                            }
                          }}
                          className="px-2 py-0.5 bg-gray-150 hover:bg-gray-200 hover:text-gray-900 text-gray-700 text-[10px] rounded font-semibold cursor-pointer transition-colors shrink-0"
                          title="Sao chép hình ảnh này vào bộ nhớ tạm"
                        >
                          Sao chép ảnh
                        </button>

                        <button
                          onClick={() => {
                            setBugImage(null);
                            setBugPngBlob(null);
                          }}
                          className="text-gray-400 hover:text-rose-600 p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-450 italic pl-1 flex-grow align-middle flex items-center h-8">
                        Chưa chọn ảnh chụp lỗi
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => handleSendBugReport('web')}
                      disabled={isSendingBug}
                      className={`flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all active:scale-98 shadow-md shadow-rose-900/10 cursor-pointer border border-rose-500/20 ${isSendingBug ? 'opacity-65 cursor-not-allowed' : ''}`}
                      title="Mở trình soạn thảo Gmail trên trình duyệt Web (khuyên dùng)"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isSendingBug ? 'Đang xử lý & gửi...' : 'Gửi qua Web Gmail (Nhanh nhất)'}
                    </button>
                    <button
                      onClick={() => handleSendBugReport('app')}
                      disabled={isSendingBug}
                      className={`flex items-center justify-center gap-1.5 py-2 bg-gray-150 hover:bg-gray-200 text-gray-750 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer border border-gray-300 ${isSendingBug ? 'opacity-65 cursor-not-allowed' : ''}`}
                      title="Kích hoạt ứng dụng email cài đặt trên thiết bị (Outlook, Mail...)"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {isSendingBug ? 'Đang xử lý & gửi...' : 'Gửi bằng App Mail (Outlook...)'}
                    </button>
                  </div>
                </div>
              )}

              {feedbackTab === 'suggestion' && (
                <div className="space-y-3 animate-fadeIn">
                  <p className="text-[11px] text-gray-600 leading-relaxed pl-1">
                    Đóng góp ý tưởng cải tiến ứng dụng. Bạn có thể đính kèm ảnh mô tả (ví dụ: ảnh vẽ phác họa hoặc screenshot minh họa).
                  </p>
                  
                  <textarea
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder="Mô tả ý tưởng cải tiến của bạn..."
                    className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-20 resize-none leading-relaxed"
                  />

                  {/* Nút gửi kèm ảnh góp ý */}
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer border border-gray-300 transition-colors shrink-0">
                      <Paperclip className="w-3.5 h-3.5 text-green-700" />
                      Đính kèm ảnh góp ý
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSuggestionImage(file);
                            const png = await convertToPngBlob(file);
                            setSuggestionPngBlob(png);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {suggestionImage ? (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-2.5 py-1.5 flex-grow min-w-0">
                        <img
                          src={URL.createObjectURL(suggestionImage)}
                          alt="preview"
                          className="w-6 h-6 rounded object-cover border border-emerald-500/20 shrink-0"
                        />
                        <span className="text-[11px] text-gray-650 truncate flex-grow font-mono">{suggestionImage.name}</span>
                        
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (suggestionPngBlob) {
                              const ok = await copyBlobToClipboard(suggestionPngBlob);
                              if (ok) {
                                showToast('Đã sao chép ảnh! Hãy nhấn Ctrl+V ở Gmail để dán.', 'success');
                              } else {
                                showToast('Không thể sao chép hình ảnh. Trình duyệt của bạn có thể đang chặn quyền Clipboard.', 'error');
                              }
                            } else {
                              showToast('Đang xử lý ảnh, vui lòng thử lại sau 1 giây...', 'info');
                            }
                          }}
                          className="px-2 py-0.5 bg-gray-150 hover:bg-gray-200 hover:text-gray-900 text-gray-700 text-[10px] rounded font-semibold cursor-pointer transition-colors shrink-0"
                          title="Sao chép hình ảnh này vào bộ nhớ tạm"
                        >
                          Sao chép ảnh
                        </button>

                        <button
                          onClick={() => {
                            setSuggestionImage(null);
                            setSuggestionPngBlob(null);
                          }}
                          className="text-gray-450 hover:text-green-700 p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-450 italic pl-1 flex-grow align-middle flex items-center h-8">
                        Chưa chọn ảnh góp ý
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => handleSendSuggestion('web')}
                      disabled={isSendingSuggestion}
                      className={`flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all active:scale-98 shadow-md shadow-emerald-900/10 cursor-pointer border border-emerald-500/20 ${isSendingSuggestion ? 'opacity-65 cursor-not-allowed' : ''}`}
                      title="Mở trình soạn thảo Gmail trên trình duyệt Web (khuyên dùng)"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isSendingSuggestion ? 'Đang xử lý & gửi...' : 'Gửi qua Web Gmail (Nhanh nhất)'}
                    </button>
                    <button
                      onClick={() => handleSendSuggestion('app')}
                      disabled={isSendingSuggestion}
                      className={`flex items-center justify-center gap-1.5 py-2 bg-gray-150 hover:bg-gray-200 text-gray-750 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer border border-gray-300 ${isSendingSuggestion ? 'opacity-65 cursor-not-allowed' : ''}`}
                      title="Kích hoạt ứng dụng email cài đặt trên thiết bị (Outlook, Mail...)"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {isSendingSuggestion ? 'Đang xử lý & gửi...' : 'Gửi bằng App Mail (Outlook...)'}
                    </button>
                  </div>
                </div>
              )}

              {feedbackTab === 'contact' && (
                <div className="space-y-3 animate-fadeIn">
                  <p className="text-xs text-gray-600 leading-relaxed pl-1">
                    Nếu bạn muốn trao đổi trực tiếp, báo cáo các lỗi nghiêm trọng hoặc hợp tác phát triển ứng dụng, hãy liên hệ trực tiếp với tôi qua hòm thư:
                  </p>

                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                        <Mail className="w-5 h-5" />
                      </span>
                      <div>
                        <span className="text-[10px] text-gray-450 font-bold block uppercase tracking-wider">Hòm thư hỗ trợ</span>
                        <span className="text-xs font-bold text-gray-900 select-all">levanthang0166@gmail.com</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleCopyEmail}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                      {copiedEmail ? 'Đã sao chép!' : 'Sao chép Email'}
                    </button>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                    <span className="text-[10px] text-gray-600 block font-semibold">CẢM ƠN BẠN ĐÃ ĐỒNG HÀNH & ỦNG HỘ!</span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">Chúc các bạn sinh viên Duy Tân (DTU) học tốt và đạt điểm GPA như mong đợi!</span>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-gray-200 mt-3.5">
              <button 
                onClick={handleCloseFeedbackModal}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95 cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl animate-in slide-in-from-top-4 duration-300 min-w-[320px] max-w-[90vw]">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-700 shrink-0" />}
          <p className="text-[11px] font-semibold leading-relaxed flex-grow text-gray-700">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-0.5 rounded transition-colors shrink-0 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Backdrop for Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div 
          className="sm:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Floating Action Button (FAB) on Mobile */}
      <div className="sm:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-30 animate-bounce-subtle">
        <button
          onClick={() => {
            setMobileDrawerTab('add');
            setIsMobileDrawerOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/35 hover:scale-105 active:scale-95 transition-all border border-indigo-400/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nhập Điểm & Giả Lập
        </button>
      </div>

      {/* Hidden container for rendering high-quality share image */}
      <div 
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: '-9999px', 
          width: '640px', 
          height: '1136px', 
          overflow: 'hidden', 
          pointerEvents: 'none',
          zIndex: -100
        }}
      >
        <div ref={shareCardRef} style={{ width: '640px', height: '1136px' }}>
          <ShareCardContent
            theme={activeShareTheme}
            shareStudentName={shareStudentName}
            hasGrades={hasGrades}
            cumulativeGpa={dtuResult.cumulativeGpa}
            rawCumulativeGpa={dtuResult.rawCumulativeGpa}
            gpaClassification={gpaClassification}
            accumulatedCredits={dtuResult.accumulatedCredits}
            shareSlogan={shareSlogan}
            isExport={true}
            customBgImage={customBgImage}
          />
        </div>
      </div>

    </div>
  );
}
