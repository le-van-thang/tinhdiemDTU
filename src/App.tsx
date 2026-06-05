import React from 'react';
import GpaCalculatorUI from './components/GpaCalculatorUI';
import { Course } from './types/gpa';

// Dữ liệu mẫu ban đầu để giao diện hiển thị ngay lập tức khi khởi chạy
const initialMockCourses: Course[] = [
  // NĂM HỌC 2024-2025 - HỌC KỲ 1
  {
    id: 'sem1-law',
    courseCode: 'LAW 201',
    courseName: 'Pháp luật đại cương',
    credits: 2,
    gradeChar: 'F', // Môn bị trượt
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
    gradeChar: 'B', // 3.00
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
    gradeChar: 'A', // Học lại đạt điểm A (4.00)
    isConditionCourse: false,
    isRetake: true,
    replacesCourseId: 'sem1-law', // Thay thế môn cũ kì 1
    academicYear: '2024-2025',
    semester: 'Học kỳ 2',
  },
  {
    id: 'sem2-cs',
    courseCode: 'CS 101',
    courseName: 'Tin học cơ sở',
    credits: 3,
    gradeChar: 'B+', // 3.33
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
    gradeChar: 'P', // Đạt môn điều kiện
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
    gradeChar: 'A', // 4.00
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
    gradeChar: 'B-', // 2.65
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
    gradeChar: 'A', // 4.00
    isConditionCourse: false,
    isRetake: false,
    replacesCourseId: null,
    academicYear: '2025-2026',
    semester: 'Học kỳ 1',
  }
];

export default function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* MAIN CONTENT AREA */}
      <main className="flex-grow">
        <GpaCalculatorUI initialCourses={initialMockCourses} />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>
            &copy; 2026 Quy chế đào tạo Đại học Duy Tân (DTU).
          </p>
          <p className="flex items-center gap-1.5 justify-center">
            <span>Thiết kế bởi</span>
            <span className="font-semibold text-slate-400">Antigravity Coding Assistant</span>
            <span>&bull;</span>
            <span className="text-indigo-400/80">Tailwind CSS v4 + React</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
