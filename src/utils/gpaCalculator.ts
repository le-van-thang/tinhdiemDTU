import { Course, ProcessedCourse, GPACalculationResult, GRADE_SCALE_MAP, DTUGPAResult } from '../types/gpa';

/**
 * Kiểm tra xem một môn học có phải là môn đỗ (qua môn) hay không.
 * - Môn điều kiện: Đỗ khi đạt điểm 'P' (Pass).
 * - Môn bình thường: Đỗ khi đạt từ điểm 'D' trở lên (khác 'F').
 */
export function isCoursePassed(gradeChar: string, isConditionCourse: boolean): boolean {
  if (!gradeChar) return false;
  if (isConditionCourse) {
    return gradeChar === 'P';
  }
  return gradeChar !== 'F';
}

/**
 * Tính điểm trung bình (GPA) cho một danh sách môn học cụ thể (thường là trong một học kỳ).
 * Không áp dụng logic thay thế môn học cũ ở cấp độ học kỳ đơn lẻ.
 * 
 * @param courses Danh sách môn học cần tính GPA
 * @returns Điểm GPA hệ 4.00 (làm tròn 2 chữ số thập phân)
 */
export function calculateSemesterGpa(courses: Course[]): number {
  let totalCredits = 0;
  let totalGradePoints = 0;

  for (const course of courses) {
    // Bỏ qua các môn điều kiện (Thể dục, Quốc phòng)
    if (course.isConditionCourse) {
      continue;
    }

    const point = GRADE_SCALE_MAP[course.gradeChar];
    // Chỉ tính các môn có quy đổi điểm số hợp lệ
    if (point !== null && point !== undefined) {
      totalCredits += course.credits;
      totalGradePoints += point * course.credits;
    }
  }

  if (totalCredits === 0) {
    return 0.00;
  }

  const gpa = totalGradePoints / totalCredits;
  return Math.round(gpa * 100) / 100;
}

/**
 * Hàm tính toán tổng thể GPA học kỳ, GPA tích lũy và số tín chỉ đạt được của sinh viên.
 * Hàm này tự động quét và đánh dấu các môn bị học cải thiện/học lại để loại bỏ khỏi GPA tích lũy.
 * 
 * @param allCourses Toàn bộ danh sách môn học của sinh viên từ trước đến nay
 * @param currentSemesterId ID của học kỳ hiện tại (để tính riêng GPA học kỳ)
 * @returns Đối tượng GPACalculationResult chứa đầy đủ thông tin chi tiết
 */
export function calculateGpaSummary(
  allCourses: Course[],
  currentSemesterCourses: Course[] = []
): GPACalculationResult {
  // 1. Xác định danh sách các ID môn học bị thay thế (được thay thế bởi môn học lại/cải thiện)
  const replacedCourseIds = new Set<string>();
  allCourses.forEach(course => {
    if (course.isRetake && course.replacesCourseId) {
      replacedCourseIds.add(course.replacesCourseId);
    }
  });

  // 2. Chuyển đổi sang danh sách môn học đã xử lý (ProcessedCourse)
  const processedCourses: ProcessedCourse[] = allCourses.map(course => {
    const gradePoint = GRADE_SCALE_MAP[course.gradeChar];
    const isPassed = isCoursePassed(course.gradeChar, course.isConditionCourse);
    const isReplaced = replacedCourseIds.has(course.id);

    return {
      ...course,
      gradePoint,
      isPassed,
      isReplaced
    };
  });

  // 3. Tính toán GPA học kỳ hiện tại (dựa trên danh sách môn học kỳ hiện tại)
  const semesterGpa = calculateSemesterGpa(currentSemesterCourses);

  // 4. Tính toán GPA tích lũy và Tín chỉ tích lũy
  let cumulativeTotalCredits = 0;
  let cumulativeTotalGradePoints = 0;
  let accumulatedCredits = 0;
  let isConditionPassed = true;

  for (const pc of processedCourses) {
    // Kiểm tra trạng thái môn điều kiện
    if (pc.isConditionCourse) {
      // Nếu có môn điều kiện bị trượt (F) thì đánh dấu chưa hoàn thành môn điều kiện (bỏ qua môn chưa có điểm '')
      if (pc.gradeChar === 'F' && !pc.isReplaced) {
        isConditionPassed = false;
      }
      continue;
    }

    // Bỏ qua các môn học cũ đã bị thay thế trong GPA tích lũy
    if (pc.isReplaced) {
      continue;
    }

    const point = pc.gradePoint;
    if (point !== null && point !== undefined) {
      cumulativeTotalCredits += pc.credits;
      cumulativeTotalGradePoints += point * pc.credits;

      // Cộng tín chỉ tích lũy nếu môn học này qua môn (điểm >= D, tức là khác F)
      if (pc.isPassed) {
        accumulatedCredits += pc.credits;
      }
    }
  }

  const cumulativeGpa = cumulativeTotalCredits === 0 
    ? 0.00 
    : Math.round((cumulativeTotalGradePoints / cumulativeTotalCredits) * 100) / 100;

  return {
    semesterGpa,
    cumulativeGpa,
    gpaCredits: cumulativeTotalCredits,
    accumulatedCredits,
    isConditionPassed,
    processedCourses
  };
}

/**
 * Tính toán điểm GPA tích lũy toàn khóa học dành riêng cho trường Đại học Duy Tân (DTU).
 * 
 * Áp dụng nghiêm ngặt các quy chế sau:
 * 1. Môn học điều kiện (isConditionCourse: true) bị loại hoàn toàn khỏi GPA và Tín chỉ tích lũy.
 * 2. Môn học lại/cải thiện (isRetake: true) sẽ loại trừ môn bị thay thế (replacesCourseId) khỏi mẫu số và tử số.
 * 3. Điểm học lại/cải thiện mới nhất sẽ thay thế hoàn toàn điểm cũ của môn đó (Cơ chế "Trừ cũ - Cộng mới").
 * 4. Toàn bộ tín chỉ học lại/cải thiện được cộng dồn vào totalRetakeCredits để theo dõi phạt tốt nghiệp bằng Giỏi (>5%).
 * 
 * @param courses Danh sách tất cả môn học của sinh viên
 * @returns Đối tượng DTUGPAResult chứa thông tin tích lũy
 */
export function calculateDTUGPA(courses: Course[]): DTUGPAResult {
  // 1. Quét danh sách để xác định các ID môn học bị thay thế (bị học cải thiện/học lại phủ quyết)
  const replacedCourseIds = new Set<string>();
  let totalRetakeCredits = 0;

  for (const course of courses) {
    if (course.isConditionCourse) {
      continue;
    }

    if (course.isRetake) {
      // Cộng dồn tín chỉ học lại/cải thiện để theo dõi phạt bằng Giỏi (>5%)
      totalRetakeCredits += course.credits;

      // Lưu lại ID của môn học bị thay thế để loại trừ sau này
      if (course.replacesCourseId) {
        replacedCourseIds.add(course.replacesCourseId);
      }
    }
  }

  // 2. Tính toán GPA và Tín chỉ tích lũy sau khi áp dụng cơ chế "Trừ cũ - Cộng mới"
  let totalCreditsForGpa = 0;
  let totalGradePoints = 0;

  for (const course of courses) {
    // A. Loại bỏ hoàn toàn môn điều kiện (Thể dục, Quốc phòng)
    if (course.isConditionCourse) {
      continue;
    }

    // B. Loại bỏ môn học cũ đã bị thay thế bởi môn học lại/cải thiện mới hơn
    if (replacedCourseIds.has(course.id)) {
      continue;
    }

    const gradePoint = GRADE_SCALE_MAP[course.gradeChar];
    // Chỉ tính điểm các môn học có điểm số quy đổi hệ 4 hợp lệ
    if (gradePoint !== null && gradePoint !== undefined) {
      totalCreditsForGpa += course.credits;
      totalGradePoints += gradePoint * course.credits;
    }
  }

  // 3. Tính GPA tích lũy chung toàn khóa và làm tròn đến 2 chữ số thập phân
  const cumulativeGpa = totalCreditsForGpa === 0
    ? 0.00
    : Math.round((totalGradePoints / totalCreditsForGpa) * 100) / 100;

  return {
    accumulatedCredits: totalCreditsForGpa, // Mẫu số: Tổng tín chỉ tính GPA tích lũy
    cumulativeGpa,                         // Điểm trung bình tích lũy thang 4
    totalRetakeCredits                      // Tổng tín chỉ đã học lại/cải thiện
  };
}

export interface GpaTrendPoint {
  semesterId: string;
  academicYear: string;
  semester: 'Học kỳ 1' | 'Học kỳ 2' | 'Học kỳ Hè';
  label: string;
  semesterGpa: number;
  cumulativeGpa: number;
  semesterCredits: number;
  cumulativeCredits: number;
}

/**
 * Tính toán xu hướng GPA (GPA từng học kỳ và GPA tích lũy) theo tiến trình thời gian.
 * 
 * @param courses Danh sách tất cả môn học của sinh viên
 * @returns Mảng các điểm mốc GPA theo từng học kỳ xếp theo thứ tự thời gian
 */
export function calculateGpaTrend(courses: Course[]): GpaTrendPoint[] {
  if (courses.length === 0) return [];

  // 1. Thu thập danh sách các học kỳ độc nhất (Bọc giá trị mặc định phòng hờ dữ liệu cũ thiếu trường)
  const semesterMap = new Map<string, { academicYear: string; semester: 'Học kỳ 1' | 'Học kỳ 2' | 'Học kỳ Hè' }>();
  for (const course of courses) {
    const year = course.academicYear || '2025-2026';
    const sem = course.semester || 'Học kỳ 1';
    const semId = `${year}-${sem}`;
    if (!semesterMap.has(semId)) {
      semesterMap.set(semId, { academicYear: year, semester: sem });
    }
  }

  // 2. Sắp xếp học kỳ theo thứ tự thời gian tăng dần
  const sortedSemesters = Array.from(semesterMap.entries()).sort((a, b) => {
    const yearStrA = a[1].academicYear || '2025-2026';
    const yearStrB = b[1].academicYear || '2025-2026';
    const yearA = parseInt(yearStrA.split('-')[0]) || 0;
    const yearB = parseInt(yearStrB.split('-')[0]) || 0;
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    const semOrder = { 'Học kỳ 1': 1, 'Học kỳ 2': 2, 'Học kỳ Hè': 3 };
    const semA = a[1].semester || 'Học kỳ 1';
    const semB = b[1].semester || 'Học kỳ 1';
    return semOrder[semA] - semOrder[semB];
  });

  const trendPoints: GpaTrendPoint[] = [];

  // 3. Tính toán GPA học kỳ và GPA tích lũy cộng dồn lũy tiến
  for (let i = 0; i < sortedSemesters.length; i++) {
    const [semId, semInfo] = sortedSemesters[i];
    
    // Lấy danh sách các học kỳ từ đầu cho đến học kỳ hiện tại
    const activeSemesterIds = new Set(sortedSemesters.slice(0, i + 1).map(s => s[0]));

    // Lọc các môn học thuộc các học kỳ này
    const currentAndPastCourses = courses.filter(c => 
      activeSemesterIds.has(`${c.academicYear}-${c.semester}`)
    );

    // Tính GPA tích lũy lũy tiến đến thời điểm này
    const cumulativeDTU = calculateDTUGPA(currentAndPastCourses);

    // Lọc các môn thuộc riêng học kỳ này để tính GPA học kỳ
    const currentSemesterCourses = courses.filter(c => 
      `${c.academicYear}-${c.semester}` === semId
    );
    const semesterGpa = calculateSemesterGpa(currentSemesterCourses);

    // Tính tổng tín chỉ đạt được trong học kỳ hiện tại (không tính môn điều kiện, môn bị F và môn chưa có điểm '')
    let semesterCredits = 0;
    for (const c of currentSemesterCourses) {
      if (!c.isConditionCourse && c.gradeChar !== 'F' && c.gradeChar !== '') {
        semesterCredits += c.credits;
      }
    }

    // Tạo nhãn rút gọn cho biểu đồ, ví dụ: "HK1 25-26"
    const yearParts = semInfo.academicYear.split('-');
    const shortYear = yearParts.length === 2 ? `${yearParts[0].slice(2)}-${yearParts[1].slice(2)}` : semInfo.academicYear;
    const shortSem = semInfo.semester === 'Học kỳ 1' ? 'HK1' : semInfo.semester === 'Học kỳ 2' ? 'HK2' : 'Hè';
    const label = `${shortSem} ${shortYear}`;

    trendPoints.push({
      semesterId: semId,
      academicYear: semInfo.academicYear,
      semester: semInfo.semester,
      label,
      semesterGpa,
      cumulativeGpa: cumulativeDTU.cumulativeGpa,
      semesterCredits,
      cumulativeCredits: cumulativeDTU.accumulatedCredits
    });
  }

  return trendPoints;
}

