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
 * Tự động phát hiện và liên kết các môn học lại / cải thiện dựa trên mã môn (Course Code).
 * Nếu một môn học có nhiều lượt học ở các học kỳ khác nhau, hệ thống sẽ tự động coi:
 * - Lượt học sau (mới nhất theo thời gian) là môn học lại/cải thiện.
 * - Các lượt học trước đó là môn bị thay thế (isReplaced = true).
 */
export function resolveRetakes(courses: Course[]) {
  const replacedIds = new Set<string>();
  const retakeIds = new Set<string>();
  const replacesMap = new Map<string, string>();

  // 1. Áp dụng liên kết thủ công của người dùng (nếu có)
  courses.forEach(course => {
    if (course.isRetake && course.replacesCourseId) {
      replacedIds.add(course.replacesCourseId);
      retakeIds.add(course.id);
      replacesMap.set(course.id, course.replacesCourseId);
    }
  });

  // 2. Tự động phát hiện các liên kết chưa được khai báo thủ công
  // Nhóm các môn học theo mã môn học (courseCode) và số tín chỉ (credits)
  const groups = new Map<string, Course[]>();
  courses.forEach(course => {
    const key = `${course.courseCode.toUpperCase()}_${course.credits}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(course);
  });

  groups.forEach((groupCourses) => {
    if (groupCourses.length <= 1) return;

    // Sắp xếp các môn học theo thứ tự thời gian tăng dần (cũ nhất trước)
    const sorted = [...groupCourses].sort((a, b) => {
      const yearPartsA = (a.academicYear || '2025-2026').split('-');
      const yearPartsB = (b.academicYear || '2025-2026').split('-');
      const yA = parseInt(yearPartsA[0]) || 0;
      const yB = parseInt(yearPartsB[0]) || 0;
      if (yA !== yB) {
        return yA - yB;
      }
      const semOrder = { 'Học kỳ 1': 1, 'Học kỳ 2': 2, 'Học kỳ Hè': 3 };
      const sA = semOrder[a.semester || 'Học kỳ 1'] || 1;
      const sB = semOrder[b.semester || 'Học kỳ 1'] || 1;
      return sA - sB;
    });

    for (let i = 0; i < sorted.length - 1; i++) {
      const currentAttempt = sorted[i];
      const nextAttempt = sorted[i + 1];

      // Chỉ liên kết nếu chúng ở các học kỳ khác nhau
      const sameSemester = currentAttempt.academicYear === nextAttempt.academicYear && 
                           currentAttempt.semester === nextAttempt.semester;
      if (!sameSemester) {
        // Đánh dấu môn sau là học lại (luôn luôn đúng vì đã có lượt học trước đó)
        retakeIds.add(nextAttempt.id);
        
        // Chỉ đánh dấu môn trước là bị thay thế (loại khỏi GPA) nếu môn sau đã học xong và có điểm
        if (nextAttempt.gradeChar !== '') {
          replacedIds.add(currentAttempt.id);
          replacesMap.set(nextAttempt.id, currentAttempt.id);
        } else {
          // Nếu môn sau chưa có điểm (đang học), chúng ta vẫn có thể hiển thị liên kết dự kiến trên giao diện
          replacesMap.set(nextAttempt.id, currentAttempt.id);
        }
      }
    }
  });

  return { replacedIds, retakeIds, replacesMap };
}

/**
 * Hàm tính toán tổng thể GPA học kỳ, GPA tích lũy và số tín chỉ đạt được của sinh viên.
 * Hàm này tự động quét và đánh dấu các môn bị học cải thiện/học lại để loại bỏ khỏi GPA tích lũy.
 * 
 * @param allCourses Toàn bộ danh sách môn học của sinh viên từ trước đến nay
 * @param currentSemesterCourses Danh sách môn học kỳ hiện tại
 * @returns Đối tượng GPACalculationResult chứa đầy đủ thông tin chi tiết
 */
export function calculateGpaSummary(
  allCourses: Course[],
  currentSemesterCourses: Course[] = []
): GPACalculationResult {
  // 1. Xác định các liên kết học lại/cải thiện tự động + thủ công
  const { replacedIds, retakeIds, replacesMap } = resolveRetakes(allCourses);

  // 2. Chuyển đổi sang danh sách môn học đã xử lý (ProcessedCourse)
  const processedCourses: ProcessedCourse[] = allCourses.map(course => {
    const gradePoint = GRADE_SCALE_MAP[course.gradeChar];
    const isPassed = isCoursePassed(course.gradeChar, course.isConditionCourse);
    const isReplaced = replacedIds.has(course.id);
    const isRetake = retakeIds.has(course.id) || course.isRetake;
    const replacesCourseId = replacesMap.get(course.id) || course.replacesCourseId;

    return {
      ...course,
      isRetake,
      replacesCourseId,
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
  const { replacedIds, retakeIds } = resolveRetakes(courses);
  let totalRetakeCredits = 0;

  for (const course of courses) {
    if (course.isConditionCourse) {
      continue;
    }

    if (retakeIds.has(course.id) || course.isRetake) {
      // Cộng dồn tín chỉ học lại/cải thiện để theo dõi phạt bằng Giỏi (>5%)
      totalRetakeCredits += course.credits;
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
    if (replacedIds.has(course.id)) {
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

