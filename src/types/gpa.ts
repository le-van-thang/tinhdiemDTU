/**
 * Danh sách các điểm chữ hợp lệ theo quy định của Đại học Duy Tân (DTU).
 * Bao gồm các điểm số thông thường và điểm điều kiện 'P' (Pass).
 */
export type GradeChar = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F' | 'P' | '';

/**
 * Bảng quy đổi điểm chữ sang hệ số 4.00 (Grade Scale Mapping) chính xác theo quy định của DTU:
 * - A+ hoặc A  -> 4.00
 * - A-         -> 3.65
 * - B+         -> 3.33
 * - B          -> 3.00
 * - B-         -> 2.65
 * - C+         -> 2.33
 * - C          -> 2.00
 * - C-         -> 1.65
 * - D          -> 1.00
 * - F          -> 0.00
 * - P          -> null (Dành cho môn điều kiện không tính GPA)
 * - ''         -> null (Dành cho môn chưa có điểm không tính GPA)
 */
export const GRADE_SCALE_MAP: Record<GradeChar, number | null> = {
  'A+': 4.00,
  'A': 4.00,
  'A-': 3.65,
  'B+': 3.33,
  'B': 3.00,
  'B-': 2.65,
  'C+': 2.33,
  'C': 2.00,
  'C-': 1.65,
  'D': 1.00,
  'F': 0.00,
  'P': null, // Môn điều kiện đạt (Pass) không tính GPA
  '': null,  // Môn chưa có điểm không tính GPA
};

export interface DetailedGradeItem {
  id: string;
  name: string;
  weight: number;      // Tỷ lệ phần trăm (ví dụ: 10 đại diện cho 10%)
  score: number | null; // Điểm số hệ 10 (ví dụ: 9.7, null nếu chưa có)
}

/**
 * Interface đại diện cho một môn học (Course) tại DTU.
 */
export interface Course {
  /** Mã định danh duy nhất của môn học (UUID hoặc chuỗi ngẫu nhiên) */
  id: string;

  /** Mã môn học (ví dụ: 'LAW 201', 'HIS 101', 'CS 311') */
  courseCode: string;

  /** Tên môn học (ví dụ: 'Pháp luật đại cương') */
  courseName: string;

  /** Số tín chỉ của môn học (ví dụ: 2, 3, 4) */
  credits: number;

  /** Điểm chữ nhập vào (ví dụ: 'A', 'A-', 'B+',..., 'P') */
  gradeChar: GradeChar;

  /** Đánh dấu nếu đây là môn điều kiện không tính GPA (như Giáo dục Thể chất, Giáo dục Quốc phòng) */
  isConditionCourse: boolean;

  /** Đánh dấu nếu đây là môn học lại hoặc học cải thiện */
  isRetake: boolean;

  /** ID của môn học cũ (bị điểm thấp hoặc điểm F) mà môn này sẽ thay thế (null nếu không thay thế môn nào) */
  replacesCourseId: string | null;

  /** Năm học của môn học (ví dụ: '2025-2026') */
  academicYear: string;

  /** Học kỳ của môn học ('Học kỳ 1' | 'Học kỳ 2' | 'Học kỳ Hè') */
  semester: 'Học kỳ 1' | 'Học kỳ 2' | 'Học kỳ Hè';

  /** Điểm chi tiết thành phần môn học */
  detailedGrades?: DetailedGradeItem[];
}

/**
 * Interface đại diện cho một môn học sau khi được tính toán và xử lý trạng thái
 */
export interface ProcessedCourse extends Course {
  /** Giá trị quy đổi điểm số hệ 4 (0.00 - 4.00 hoặc null nếu là môn điều kiện) */
  gradePoint: number | null;

  /** Trạng thái qua môn (true nếu qua môn, false nếu trượt) */
  isPassed: boolean;

  /** Đánh dấu môn này có bị thay thế (bị phủ quyết bởi một môn học lại mới hơn) hay không */
  isReplaced: boolean;
}

/**
 * Interface đại diện cho một Học kỳ (Semester)
 */
export interface Semester {
  /** Mã định danh học kỳ */
  id: string;

  /** Tên học kỳ (ví dụ: 'Học kỳ 1 - Năm học 2025-2026') */
  semesterName: string;

  /** Danh sách các môn học trong học kỳ */
  courses: Course[];
}

/**
 * Interface kết quả tính toán GPA và Tín chỉ (GPA Calculation Result)
 */
export interface GPACalculationResult {
  /** Điểm trung bình học kỳ này (GPA Học kỳ) */
  semesterGpa: number;

  /** Điểm trung bình tích lũy (Cumulative GPA) sau khi đã loại bỏ các môn cũ bị thay thế */
  cumulativeGpa: number;

  /** Tổng số tín chỉ đã đăng ký tính điểm GPA (không tính môn điều kiện) */
  gpaCredits: number;

  /** Tổng số tín chỉ tích lũy đạt được (không tính môn điều kiện bị trượt, môn bị thay thế và môn điểm F) */
  accumulatedCredits: number;

  /** Trạng thái hoàn thành tất cả môn điều kiện đăng ký (true nếu không môn điều kiện nào bị F) */
  isConditionPassed: boolean;

  /** Danh sách chi tiết các môn học sau khi tính toán và liên kết */
  processedCourses: ProcessedCourse[];
}

/**
 * Interface kết quả tính toán chi tiết theo quy chế DTU riêng biệt.
 */
export interface DTUGPAResult {
  /** 1. Tổng số tín chỉ tích lũy thực tế tính GPA (mẫu số của công thức tích lũy sau khi trừ các môn bị thay thế) */
  accumulatedCredits: number;

  /** 2. Điểm trung bình tích lũy GPA toàn khóa (làm tròn đến 2 chữ số thập phân) */
  cumulativeGpa: number;

  /** 3. Tổng số tín chỉ đã đăng ký học lại / học cải thiện */
  totalRetakeCredits: number;

  /** 4. Điểm trung bình tích lũy GPA chưa làm tròn (chính xác tuyệt đối) */
  rawCumulativeGpa: number;

  /** 5. Tổng số điểm tích lũy quy đổi (tử số trong công thức tính GPA) */
  totalGradePoints: number;
}

/**
 * Interface đại diện cho một môn học trong Khung chương trình dự kiến.
 */
export interface CurriculumCourse {
  courseCode: string;
  courseName: string;
  credits: number;
}

