import { Course } from './types/gpa';
import { calculateGpaSummary, calculateSemesterGpa, calculateDTUGPA } from './utils/gpaCalculator';

console.log('=== KHỞI CHẠY KIỂM THỬ THIẾT KẾ CẤU TRÚC DỮ LIỆU GPA - ĐẠI HỌC DUY TÂN (DTU) ===\n');

// 1. Khai báo danh sách các môn học giả lập qua 2 học kỳ
const mockCourses: Course[] = [
  // HỌC KỲ 1
  {
    id: 'sem1-law',
    courseCode: 'LAW 201',
    courseName: 'Pháp luật đại cương',
    credits: 2,
    gradeChar: 'F', // Môn bình thường bị trượt (Hệ số 0.0)
    isConditionCourse: false,
    isRetake: false,
    replacesCourseId: null,
    academicYear: '2025-2026',
    semester: 'Học kỳ 1',
  },
  {
    id: 'sem1-eng',
    courseCode: 'ENG 101',
    courseName: 'Tiếng Anh 1',
    credits: 3,
    gradeChar: 'B', // Môn bình thường đạt điểm B (Hệ số 3.0)
    isConditionCourse: false,
    isRetake: false,
    replacesCourseId: null,
    academicYear: '2025-2026',
    semester: 'Học kỳ 1',
  },
  {
    id: 'sem1-pe',
    courseCode: 'PE 101',
    courseName: 'Giáo dục Thể chất 1',
    credits: 1,
    gradeChar: 'F', // Môn điều kiện bị trượt (Không tính hệ số GPA)
    isConditionCourse: true,
    isRetake: false,
    replacesCourseId: null,
    academicYear: '2025-2026',
    semester: 'Học kỳ 1',
  },

  // HỌC KỲ 2 (Học lại và học mới)
  {
    id: 'sem2-law-retake',
    courseCode: 'LAW 201',
    courseName: 'Pháp luật đại cương',
    credits: 2,
    gradeChar: 'A', // Học lại đạt điểm A (Hệ số 4.0)
    isConditionCourse: false,
    isRetake: true,
    replacesCourseId: 'sem1-law', // Thay thế môn LAW 201 ở Học kỳ 1
    academicYear: '2025-2026',
    semester: 'Học kỳ 2',
  },
  {
    id: 'sem2-cs',
    courseCode: 'CS 101',
    courseName: 'Tin học cơ sở',
    credits: 3,
    gradeChar: 'B+', // Môn học mới đạt B+ (Hệ số 3.33)
    isConditionCourse: false,
    isRetake: false,
    replacesCourseId: null,
    academicYear: '2025-2026',
    semester: 'Học kỳ 2',
  },
  {
    id: 'sem2-pe-retake',
    courseCode: 'PE 101',
    courseName: 'Giáo dục Thể chất 1',
    credits: 1,
    gradeChar: 'P', // Học lại môn điều kiện đạt Pass (Không tính hệ số GPA)
    isConditionCourse: true,
    isRetake: true,
    replacesCourseId: 'sem1-pe', // Thay thế môn thể chất bị trượt ở học kỳ 1
    academicYear: '2025-2026',
    semester: 'Học kỳ 2',
  },
];

// Phân tách môn học theo từng học kỳ
const semester1Courses = mockCourses.filter(c => c.id.startsWith('sem1-'));
const semester2Courses = mockCourses.filter(c => c.id.startsWith('sem2-'));

console.log('--- CHI TIẾT MÔN HỌC ĐĂNG KÝ (DỮ LIỆU GỐC) ---');
console.table(
  mockCourses.map(c => ({
    'Mã Môn': c.courseCode,
    'Tên Môn': c.courseName,
    'Số Tín Chỉ': c.credits,
    'Điểm Chữ': c.gradeChar,
    'Môn Điều Kiện': c.isConditionCourse ? 'Có' : 'Không',
    'Học Lại': c.isRetake ? 'Có' : 'Không',
    'Môn Thay Thế (ID)': c.replacesCourseId || 'Không',
  }))
);

// 2. Chạy thử nghiệm tính toán thông thường
console.log('\n--- KẾT QUẢ TÍNH TOÁN THÔNG THƯỜNG ---');

// Tính GPA riêng lẻ của Học kỳ 1
const gpaSem1 = calculateSemesterGpa(semester1Courses);
console.log(`> GPA riêng Học kỳ 1: ${gpaSem1.toFixed(2)} (Kỳ vọng: 1.80)`);
console.log('  * Giải thích: (LAW 201 [F: 0.0] * 2 + ENG 101 [B: 3.0] * 3) / 5 = 1.80. Môn Thể dục 1 [F] không tính GPA.');

// Tính GPA riêng lẻ của Học kỳ 2
const gpaSem2 = calculateSemesterGpa(semester2Courses);
console.log(`> GPA riêng Học kỳ 2: ${gpaSem2.toFixed(2)} (Kỳ vọng: 3.60)`);
console.log('  * Giải thích: (LAW 201 [A: 4.0] * 2 + CS 101 [B+: 3.33] * 3) / 5 = 3.60. Môn Thể dục 1 [P] không tính GPA.');

// Tính GPA tích lũy tổng thể (áp dụng quy chế học lại/thay thế môn cũ)
const summary = calculateGpaSummary(mockCourses, semester2Courses);
console.log(`\n> GPA Tích lũy sau 2 Học kỳ (Summary): ${summary.cumulativeGpa.toFixed(2)} (Kỳ vọng: 3.37)`);
console.log('  * Giải thích: Môn LAW 201 [F] học kỳ 1 bị thay thế bởi LAW 201 [A] học kỳ 2.');
console.log('  * Điểm tích lũy = (ENG 101 [B: 3.0] * 3 + LAW 201 [A: 4.0] * 2 + CS 101 [B+: 3.33] * 3) / (3 + 2 + 3) = 26.99 / 8 = 3.37.');

console.log(`> Tổng số tín chỉ tích lũy đạt được: ${summary.accumulatedCredits} tín chỉ (Kỳ vọng: 8 tín chỉ)`);
console.log(`> Tình trạng môn điều kiện (Thể dục/Quốc phòng): ${summary.isConditionPassed ? 'ĐÃ HOÀN THÀNH ✅' : 'CHƯA HOÀN THÀNH ❌'} (Kỳ vọng: ĐÃ HOÀN THÀNH vì môn Thể dục 1 [F] đã được học lại đạt [P])`);

// 3. Chạy thử nghiệm tính toán chuyên sâu theo quy chế DTU
console.log('\n--- KẾT QUẢ TÍNH TOÁN THEO QUY CHẾ DTU (HÀM calculateDTUGPA) ---');
const dtuResult = calculateDTUGPA(mockCourses);
console.log(`> Tổng số tín chỉ tích lũy thực tế: ${dtuResult.accumulatedCredits} (Kỳ vọng: 8)`);
console.log(`> Điểm trung bình tích lũy GPA toàn khóa: ${dtuResult.cumulativeGpa.toFixed(2)} (Kỳ vọng: 3.37)`);
console.log(`> Tổng số tín chỉ đã học lại: ${dtuResult.totalRetakeCredits} (Kỳ vọng: 2 - Chỉ tính LAW 201 học lại, PE 101 học lại là môn điều kiện nên không tính GPA)`);

// 4. KIỂM THỬ TÌNH HUỐNG PHẦN YÊU CẦU:
// "Ví dụ: Mốc ban đầu 102 tín chỉ, GPA 3.05 có 1 môn LAW 201 bị F; sau đó học lại LAW 201 đạt điểm A để kiểm tra xem GPA có tự động cập nhật chuẩn xác không"
console.log('\n=== KIỂM THỬ TÌNH HUỐNG ĐẶC BIỆT (102 TÍN CHỈ, GPA 3.05, HỌC LẠI LAW 201 ĐẠT A) ===');

// Để tạo ra mốc 102 tín chỉ với GPA đúng 3.05 và chứa môn LAW 201 (2 tín chỉ, điểm F):
// Ta thiết lập các môn học nền tảng như sau:
// - Môn 1: 78 tín chỉ, điểm B (3.00) -> 78 * 3.0 = 234.0 grade points
// - Môn 2: 10 tín chỉ, điểm B+ (3.33) -> 10 * 3.33 = 33.3 grade points
// - Môn 3: 12 tín chỉ, điểm A- (3.65) -> 12 * 3.65 = 43.8 grade points
// - Môn LAW 201 (Cũ): 2 tín chỉ, điểm F (0.00) -> 2 * 0.0 = 0.0 grade points
// Tổng số tín chỉ ban đầu = 78 + 10 + 12 + 2 = 102 tín chỉ.
// Tổng điểm số quy đổi = 234.0 + 33.3 + 43.8 + 0.0 = 311.1.
// GPA ban đầu = 311.1 / 102 = 3.05.

const initialScenarioCourses: Course[] = [
  {
    id: 'base-1',
    courseCode: 'BASE 101',
    courseName: 'Môn cơ sở 1',
    credits: 78,
    gradeChar: 'B',
    isConditionCourse: false,
    isRetake: false,
    replacesCourseId: null,
    academicYear: '2025-2026',
    semester: 'Học kỳ 1',
  },
  {
    id: 'base-2',
    courseCode: 'BASE 102',
    courseName: 'Môn cơ sở 2',
    credits: 10,
    gradeChar: 'B+',
    isConditionCourse: false,
    isRetake: false,
    replacesCourseId: null,
    academicYear: '2025-2026',
    semester: 'Học kỳ 1',
  },
  {
    id: 'base-3',
    courseCode: 'BASE 103',
    courseName: 'Môn cơ sở 3',
    credits: 12,
    gradeChar: 'A-',
    isConditionCourse: false,
    isRetake: false,
    replacesCourseId: null,
    academicYear: '2025-2026',
    semester: 'Học kỳ 1',
  },
  {
    id: 'old-law-201',
    courseCode: 'LAW 201',
    courseName: 'Pháp luật đại cương',
    credits: 2,
    gradeChar: 'F',
    isConditionCourse: false,
    isRetake: false,
    replacesCourseId: null,
    academicYear: '2025-2026',
    semester: 'Học kỳ 1',
  }
];

// Chạy tính toán ban đầu
const initialGPA = calculateDTUGPA(initialScenarioCourses);
console.log('Trạng thái ban đầu (Trước khi học lại):');
console.log(`- Tổng tín chỉ tích lũy: ${initialGPA.accumulatedCredits} (Kỳ vọng: 102)`);
console.log(`- GPA tích lũy: ${initialGPA.cumulativeGpa.toFixed(2)} (Kỳ vọng: 3.05)`);
console.log(`- Số tín chỉ đã học lại: ${initialGPA.totalRetakeCredits} (Kỳ vọng: 0)`);

// Sau đó học lại LAW 201 đạt điểm A
const updatedScenarioCourses: Course[] = [
  ...initialScenarioCourses,
  {
    id: 'new-law-201',
    courseCode: 'LAW 201',
    courseName: 'Pháp luật đại cương',
    credits: 2,
    gradeChar: 'A', // Học lại đạt điểm A (4.00)
    isConditionCourse: false,
    isRetake: true,
    replacesCourseId: 'old-law-201', // Link thay thế môn học cũ bị điểm F
    academicYear: '2025-2026',
    semester: 'Học kỳ 2',
  }
];

// Chạy tính toán sau khi học lại
const updatedGPA = calculateDTUGPA(updatedScenarioCourses);
console.log('Trạng thái sau khi học lại và thay thế điểm:');
console.log(`- Tổng tín chỉ tích lũy (Mẫu số): ${updatedGPA.accumulatedCredits} (Kỳ vọng: 102 - Không bị phình lên 104)`);
console.log(`- GPA tích lũy sau cập nhật: ${updatedGPA.cumulativeGpa.toFixed(2)} (Kỳ vọng: 3.13)`);
console.log(`  * Giải thích chi tiết: (311.1 - 0.0 + 4.0 * 2) / 102 = 319.1 / 102 = 3.1284 -> Làm tròn 3.13`);
console.log(`- Số tín chỉ đã học lại: ${updatedGPA.totalRetakeCredits} (Kỳ vọng: 2)`);

// Assertions đơn giản để đảm bảo logic chạy hoàn toàn chính xác
const assertionsPassed = 
  gpaSem1 === 1.80 &&
  gpaSem2 === 3.60 &&
  summary.cumulativeGpa === 3.37 &&
  summary.accumulatedCredits === 8 &&
  dtuResult.accumulatedCredits === 8 &&
  dtuResult.cumulativeGpa === 3.37 &&
  dtuResult.totalRetakeCredits === 2 &&
  initialGPA.accumulatedCredits === 102 &&
  initialGPA.cumulativeGpa === 3.05 &&
  initialGPA.totalRetakeCredits === 0 &&
  updatedGPA.accumulatedCredits === 102 &&
  updatedGPA.cumulativeGpa === 3.13 &&
  updatedGPA.totalRetakeCredits === 2;

if (assertionsPassed) {
  console.log('\n✅ TẤT CẢ CÁC KIỂM THỬ ĐÃ VƯỢT QUA THÀNH CÔNG!');
} else {
  console.error('\n❌ CÓ LỖI LOGIC TRONG QUÁ TRÌNH TÍNH TOÁN. VUI LÒNG KIỂM TRA LẠI.');
  process.exit(1);
}

