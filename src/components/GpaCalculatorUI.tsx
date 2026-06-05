import React, { useState, useMemo, useEffect } from 'react';
import { Course, GradeChar, ProcessedCourse, GRADE_SCALE_MAP, CurriculumCourse } from '../types/gpa';
import { calculateDTUGPA, calculateGpaSummary, calculateGpaTrend, calculateSemesterGpa, GpaTrendPoint } from '../utils/gpaCalculator';
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
  X
} from 'lucide-react';

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
  const [tempTargetCredits, setTempTargetCredits] = useState(targetCredits);

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
  const [simulatorRemainingCredits, setSimulatorRemainingCredits] = useState<number>(30);
  const [isCustomTarget, setIsCustomTarget] = useState(false);
  const [customTargetGpa, setCustomTargetGpa] = useState('3.50');

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
  const [curriculumInputText, setCurriculumInputText] = useState('');

  // State quản lý sửa môn học trong bảng điểm (Transcript Edit Inline)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseName, setEditCourseName] = useState('');
  const [editCredits, setEditCredits] = useState<number>(3);

  // State quản lý sửa tín chỉ môn học trong Khung chương trình
  const [editingCurriculumCode, setEditingCurriculumCode] = useState<string | null>(null);
  const [editCurriculumCredits, setEditCurriculumCredits] = useState<number>(3);

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
      alert('Vui lòng dán khung chương trình dự kiến!');
      return;
    }

    try {
      const cells = curriculumInputText
        .split(/[\n\t]/)
        .map(c => c.trim())
        .filter(c => c !== '');

      const parsedCourses: CurriculumCourse[] = [];
      
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (/^[a-zA-Z]{2,6}(\-[a-zA-Z]{1,4})?\s*\d{1,4}$/.test(cell)) {
          if (i + 2 < cells.length) {
            const courseCode = cell.toUpperCase();
            const courseName = cells[i + 1];
            const credits = parseInt(cells[i + 2], 10);

            if (!isNaN(credits) && credits > 0 && credits <= 15) {
              if (!parsedCourses.some(c => c.courseCode === courseCode)) {
                parsedCourses.push({
                  courseCode,
                  courseName,
                  credits
                });
              }
              i += 2;
            }
          }
        }
      }

      if (parsedCourses.length > 0) {
        setCurriculumCourses(parsedCourses);
        const totalCredits = parsedCourses.reduce((sum, c) => sum + c.credits, 0);
        setTargetCredits(totalCredits);
        setIsCurriculumModalOpen(false);
        setCurriculumInputText('');
        alert(`Thành công! Đã nhận diện ${parsedCourses.length} môn học. Tổng số tín chỉ tự động cập nhật: ${totalCredits} TC!`);
      } else {
        alert('Không nhận diện được môn học nào hợp lệ. Vui lòng copy đúng bảng khung chương trình.');
      }
    } catch (e) {
      console.error(e);
      alert('Đã xảy ra lỗi khi phân tích khung chương trình.');
    }
  };

  const handleStartEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setEditCourseCode(course.courseCode);
    setEditCourseName(course.courseName);
    setEditCredits(course.credits);
  };

  const handleSaveEditCourse = (courseId: string) => {
    if (!editCourseCode.trim() || !editCourseName.trim() || editCredits <= 0) {
      alert('Vui lòng nhập đầy đủ thông tin hợp lệ!');
      return;
    }
    const updated = courses.map(c => 
      c.id === courseId 
        ? { ...c, courseCode: editCourseCode.trim(), courseName: editCourseName.trim(), credits: editCredits } 
        : c
    );
    updateCoursesState(updated);
    setEditingCourseId(null);
  };

  const handleCancelEditCourse = () => {
    setEditingCourseId(null);
  };

  const handleUpdateCurriculumCredits = (courseCode: string, newCredits: number) => {
    const updated = curriculumCourses.map(cc => 
      cc.courseCode === courseCode ? { ...cc, credits: newCredits } : cc
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
      totalCredits: curriculumCourses.reduce((sum, c) => sum + c.credits, 0),
      completedCredits: completed.reduce((sum, c) => sum + c.credits, 0),
      learningCredits: learning.reduce((sum, c) => sum + c.credits, 0),
      failedCredits: failed.reduce((sum, c) => sum + c.credits, 0),
      missingCredits: missing.reduce((sum, c) => sum + c.credits, 0),
    };
  }, [curriculumCourses, summaryResult.processedCourses]);

  // Tính toán kết quả giả lập GPA mục tiêu
  const simulationResult = useMemo(() => {
    const currentCredits = dtuResult.accumulatedCredits;
    const currentGPA = dtuResult.cumulativeGpa;
    const remainingCredits = simulatorRemainingCredits;
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
    const rem = simulatorRemainingCredits;
    
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

  // Phân loại học lực theo GPA tích lũy hệ 4
  const gpaClassification = useMemo(() => {
    const gpa = dtuResult.cumulativeGpa;
    if (gpa >= 3.6) return { name: 'Xuất sắc', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
    if (gpa >= 3.2) return { name: 'Giỏi', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (gpa >= 2.5) return { name: 'Khá', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
    if (gpa >= 2.0) return { name: 'Trung bình', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { name: 'Yếu / Kém', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  }, [dtuResult.cumulativeGpa]);

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

  // 4. Xử lý thêm môn học mới
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) {
      alert('Vui lòng điền đầy đủ Mã môn học và Tên môn học!');
      return;
    }
    if (credits <= 0 || isNaN(credits)) {
      alert('Số tín chỉ phải lớn hơn 0!');
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
        setSmartPasteText('');
        const dupMsg = duplicateCount > 0 ? ` (Đã bỏ qua ${duplicateCount} môn trùng lặp)` : '';
        setSmartPasteStatus({ message: `Hoàn tất! Đã thêm ${importedCount} môn học.${dupMsg}`, type: 'success' });
        
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
        } catch (e) {
          console.error('Lỗi khi làm sạch localStorage:', e);
        }
        updateCoursesState([]);
        setTargetCredits(144);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
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
    if (gpaTrend.length < 2) return { line: '', area: '', points: [], yBase: 145 };
    
    const svgWidth = 560;
    const svgHeight = 180;
    const paddingLeft = 40;
    const paddingRight = 30;
    const paddingTop = 35;
    const paddingBottom = 25;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;
    const yBase = paddingTop + chartHeight; // 155

    const points = gpaTrend.map((point, index) => {
      const x = paddingLeft + (index / (gpaTrend.length - 1)) * chartWidth;
      // Trục Y: GPA chạy từ 0.00 đến 4.00
      const yCum = yBase - (point.cumulativeGpa / 4.0) * chartHeight;
      const ySem = yBase - (point.semesterGpa / 4.0) * chartHeight;
      return { x, yCum, ySem, point };
    });

    // Tạo đường dẫn vẽ biểu đồ GPA Tích lũy (Line Path)
    const linePath = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.yCum}` : `${acc} L ${p.x} ${p.yCum}`;
    }, '');

    // Tạo khu vực tô màu gradient phía dưới GPA Tích lũy (Area Path)
    const lastPoint = points[points.length - 1];
    const areaPath = `${linePath} L ${lastPoint.x} ${yBase} L ${points[0].x} ${yBase} Z`;

    return { line: linePath, area: areaPath, points, yBase };
  }, [gpaTrend]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Ứng Dụng Tính Điểm GPA Duy Tân (DTU)
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Tính toán GPA tích lũy, quản lý phân nhóm học kỳ và theo dõi tỉ lệ tín chỉ học cải thiện.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          {courses.length === 0 && (
            <button
              onClick={loadMockScenario}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-600/20 border border-indigo-400/20 cursor-pointer"
              id="btn-load-mock"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Tải Dữ Liệu Mẫu (Nhiều Kỳ)
            </button>
          )}
          
          <button
            onClick={handleResetApp}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer shadow-sm shadow-rose-500/5"
            id="btn-reset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset App (Xóa Sạch)
          </button>
        </div>
      </header>

      {/* DASHBOARD METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        
        {/* GPA CARD */}
        <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all"></div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-400" />
              GPA TÍCH LŨY HỆ 4.0
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${gpaClassification.color}`}>
              {gpaClassification.name}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-white" id="dashboard-gpa">
              {dtuResult.cumulativeGpa.toFixed(2)}
            </span>
            <span className="text-slate-500 text-xs">/ 4.00</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Đã trừ điểm gốc của các môn bị học cải thiện.
          </p>
        </div>

        {/* CREDITS CARD */}
        <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              TÍN CHỈ TÍCH LŨY ĐẠT
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500">Mục tiêu:</span>
              <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded">
                {targetCredits} TC
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-3xl font-extrabold tracking-tight text-white" id="dashboard-credits">
              {dtuResult.accumulatedCredits}
            </span>
            <span className="text-slate-500 text-xs">/</span>
            {isEditingTargetCredits ? (
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={tempTargetCredits}
                  onChange={(e) => setTempTargetCredits(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-16 bg-slate-950 border border-emerald-500 rounded px-1.5 py-0.5 text-center text-xs font-semibold text-emerald-400 focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setTargetCredits(tempTargetCredits);
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
                    setTargetCredits(tempTargetCredits);
                    setIsEditingTargetCredits(false);
                  }}
                  className="p-1 hover:bg-slate-800 rounded text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center justify-center"
                  title="Lưu"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setTempTargetCredits(targetCredits);
                    setIsEditingTargetCredits(false);
                  }}
                  className="p-1 hover:bg-slate-850 rounded text-rose-450 hover:text-rose-400 cursor-pointer flex items-center justify-center"
                  title="Hủy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 group/credits cursor-pointer" onClick={() => {
                setTempTargetCredits(targetCredits);
                setIsEditingTargetCredits(true);
              }}>
                <span className="text-slate-300 text-xs hover:text-emerald-400 font-bold transition">
                  {targetCredits} TC
                </span>
                <Pencil className="w-3 h-3 text-slate-500 group-hover/credits:text-emerald-400 transition opacity-60 group-hover/credits:opacity-100" />
              </div>
            )}
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (dtuResult.accumulatedCredits / targetCredits) * 100)}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between items-center">
            <span>Đã hoàn thành {targetCredits > 0 ? Math.round((dtuResult.accumulatedCredits / targetCredits) * 100) : 0}% chương trình.</span>
            <button 
              onClick={() => setIsCurriculumModalOpen(true)}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
              id="btn-curriculum-modal"
            >
              <Sparkles className="w-3 h-3" />
              Khung chương trình
            </button>
          </div>
        </div>

        {/* RETAKES CARD */}
        <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-400" />
              TÍN CHỈ HỌC LẠI / CẢI THIỆN
            </span>
            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              isRetakeExceeded 
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            }`} id="retake-badge">
              {isRetakeExceeded ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-450" />
                  Vượt ngưỡng 5%
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  An toàn (&le; 5%)
                </>
              )}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-white" id="dashboard-retakes">
              {dtuResult.totalRetakeCredits}
            </span>
            <span className="text-slate-500 text-xs">TC ({retakeRatio.toFixed(1)}%)</span>
          </div>
          
          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isRetakeExceeded ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(100, (retakeRatio / 5.0) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {isRetakeExceeded 
              ? '⚠️ Tỷ lệ học lại vượt quá 5% (Ảnh hưởng xét bằng tốt nghiệp Giỏi)' 
              : `Hạn mức tốt nghiệp: tối đa ${(targetCredits * 0.05).toFixed(1)} TC.`}
          </p>
        </div>

        {/* FAILED CREDITS CARD */}
        <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/15 transition-all"></div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-455" />
              NỢ MÔN / CHƯA ĐẠT (F)
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              totalFailedCredits > 0 
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse' 
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            }`} id="dashboard-failed-badge">
              {totalFailedCredits > 0 ? 'Cần trả nợ' : 'Sạch điểm F'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-white" id="dashboard-failed-credits">
              {totalFailedCredits}
            </span>
            <span className="text-slate-500 text-xs">TC ({failedCourses.length} môn)</span>
          </div>
          
          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${totalFailedCredits > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}
              style={{ width: `${totalFailedCredits > 0 ? 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate" title={totalFailedCredits > 0 ? `Môn nợ: ${failedCourses.map(c => c.courseCode).join(', ')}` : ''}>
            {totalFailedCredits > 0 
              ? `⚠️ Môn nợ: ${failedCourses.map(c => c.courseCode).join(', ')}`
              : 'Tuyệt vời! Bạn không có môn học nào bị điểm F.'}
          </p>
        </div>

      </section>

      {/* GRAPH & CHART PANEL */}
      <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 mb-6 shadow-md">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          BIỂU ĐỒ BIẾN ĐỘNG GPA (GPA HỌC KỲ VS GPA TÍCH LŨY)
        </h2>
        
        {gpaTrend.length >= 2 ? (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[580px] h-[185px] relative">
              <svg width="100%" height="180" viewBox="0 0 560 180" className="overflow-visible">
                <defs>
                  {/* Gradient cho đường line GPA Tích lũy */}
                  <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  {/* Gradient cho vùng area GPA Tích lũy */}
                  <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
                  </linearGradient>
                  {/* Gradient cho cột GPA Học kỳ */}
                  <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Chú thích đồ thị (Legend) */}
                <g transform="translate(150, 10)" fontSize="10" fontWeight="bold">
                  {/* Cột GPA Học kỳ */}
                  <rect x="0" y="-8" width="12" height="9" fill="#10b981" fillOpacity="0.5" rx="1.5" />
                  <text x="17" y="1" fill="#94a3b8">GPA Học Kỳ</text>

                  {/* Đường GPA Tích lũy */}
                  <line x1="110" y1="-3" x2="130" y2="-3" stroke="#6366f1" strokeWidth="2.5" />
                  <circle cx="120" cy="-3" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="138" y="1" fill="#94a3b8">GPA Tích Lũy</text>
                </g>

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
                        stroke="#1e293b" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                      />
                      <text x="32" y={y + 3} textAnchor="end" fill="#475569" fontSize="9" fontWeight="bold">
                        {level.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Vẽ các cột GPA Học kỳ trước (nằm phía dưới đường line) */}
                {chartSvgPath.points.map((p) => {
                  const barHeight = chartSvgPath.yBase - p.ySem;
                  return (
                    <g key={`bar-${p.point.semesterId}`}>
                      <rect 
                        x={p.x - 13} 
                        y={p.ySem} 
                        width="26" 
                        height={barHeight} 
                        fill="url(#bar-gradient)" 
                        stroke="#10b981" 
                        strokeWidth="1.5" 
                        strokeOpacity="0.25"
                        rx="3.5" 
                        className="transition-all hover:opacity-80 cursor-pointer"
                      />
                      {/* Trị số GPA Học kỳ nằm phía trên cột hoặc bên trong */}
                      <text 
                        x={p.x} 
                        y={barHeight > 18 ? p.ySem + 12 : p.ySem - 5} 
                        textAnchor="middle" 
                        fill={barHeight > 18 ? "#ffffff" : "#10b981"} 
                        fontSize="8.5" 
                        fontWeight="bold"
                        opacity="0.9"
                      >
                        {p.point.semesterGpa.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Vùng diện tích Gradient phía dưới GPA Tích lũy */}
                <path d={chartSvgPath.area} fill="url(#area-gradient)" />

                {/* Đường biểu đồ GPA Tích lũy (Line) */}
                <path 
                  d={chartSvgPath.line} 
                  fill="none" 
                  stroke="url(#line-gradient)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round" 
                />

                {/* Các chấm nút (Circles) GPA Tích lũy */}
                {chartSvgPath.points.map((p) => (
                  <g key={`point-${p.point.semesterId}`}>
                    {/* Circle nút tròn */}
                    <circle 
                      cx={p.x} 
                      cy={p.yCum} 
                      r="5.5" 
                      fill="#4f46e5" 
                      stroke="#ffffff" 
                      strokeWidth="2.5" 
                      className="cursor-pointer hover:r-7 transition-all duration-150"
                    />
                    {/* Nhãn điểm số ở trên nút */}
                    <text 
                      x={p.x} 
                      y={p.yCum - 10} 
                      textAnchor="middle" 
                      fill="#ffffff" 
                      fontSize="9.5" 
                      fontWeight="extrabold"
                    >
                      {p.point.cumulativeGpa.toFixed(2)}
                    </text>
                    {/* Nhãn học kỳ ở trục X */}
                    <text 
                      x={p.x} 
                      y="172" 
                      textAnchor="middle" 
                      fill="#64748b" 
                      fontSize="9" 
                      fontWeight="600"
                    >
                      {p.point.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500 bg-slate-950/20 rounded-xl border border-dashed border-slate-800/80">
            <TrendingUp className="w-8 h-8 mb-1.5 text-slate-700" />
            <p className="text-xs text-center">
              Chưa đủ dữ liệu để vẽ biểu đồ combo. Cần nhập tối thiểu môn học của **2 học kỳ** trở lên.
            </p>
          </div>
        )}
      </section>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: FORM & SIMULATOR (4 columns on lg) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* QUICK ADD FORM */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-800/80">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-indigo-400" />
              Thêm Môn Học
            </h2>
            
            <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setAddMode('manual')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${addMode === 'manual' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Nhập thủ công
              </button>
              <button
                onClick={() => setAddMode('smart_paste')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${addMode === 'smart_paste' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Dán từ myDTU
              </button>
            </div>
          </div>

          {addMode === 'manual' ? (
            <form onSubmit={handleAddCourse} className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">NĂM HỌC</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    id="form-year-select"
                  >
                    {academicYearOptions.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">HỌC KỲ</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as 'Học kỳ 1' | 'Học kỳ 2' | 'Học kỳ Hè')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    id="form-semester-select"
                  >
                    <option value="Học kỳ 1">Học kỳ 1</option>
                    <option value="Học kỳ 2">Học kỳ 2</option>
                    <option value="Học kỳ Hè">Kỳ Hè (Summer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">MÃ MÔN HỌC</label>
                <input
                  type="text"
                  placeholder="Ví dụ: LAW 201"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                  id="form-course-code"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">TÊN MÔN HỌC</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Pháp luật đại cương"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                  id="form-course-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">SỐ TÍN CHỈ</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={credits || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setCredits(isNaN(val) ? 0 : val);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    id="form-credits"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">ĐIỂM CHỮ</label>
                  <select
                    value={gradeChar}
                    onChange={(e) => setGradeChar(e.target.value as GradeChar)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    id="form-grade"
                  >
                    <option value="">-- Chưa có điểm --</option>
                    <optgroup label="Học phần tính GPA">
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
                    <optgroup label="Học phần điều kiện">
                      <option value="P">P (Đạt - Pass)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* CHECKBOXES */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
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
                    className="rounded border-slate-850 bg-slate-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-0 w-3.5 h-3.5"
                    id="form-is-condition"
                  />
                  <span className="text-xs text-slate-400 font-semibold">Môn điều kiện (PE, Quốc phòng)</span>
                </label>

                {!isConditionCourse && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRetake}
                      onChange={(e) => {
                        setIsRetake(e.target.checked);
                        if (!e.target.checked) {
                          setReplacesCourseId(null);
                        }
                      }}
                      className="rounded border-slate-850 bg-slate-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-0 w-3.5 h-3.5"
                      id="form-is-retake"
                    />
                    <span className="text-xs text-slate-400 font-semibold">Môn học lại / cải thiện điểm</span>
                  </label>
                )}
              </div>

              {/* DROP-DOWN CHỌN MÔN THAY THẾ */}
              {isRetake && !isConditionCourse && (
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-1.5 animate-fadeIn">
                  <label className="block text-[9px] font-bold text-indigo-400 tracking-wider">MÔN HỌC CŨ CẦN THAY THẾ</label>
                  {replaceableCourses.length > 0 ? (
                    <select
                      value={replacesCourseId || ''}
                      onChange={(e) => setReplacesCourseId(e.target.value || null)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-98 shadow-lg shadow-indigo-600/15 cursor-pointer border border-indigo-400/20"
                id="form-submit"
              >
                <Plus className="w-4 h-4" />
                Thêm Môn Vào Bảng
              </button>
            </form>
          ) : (
            <div className="space-y-3.5 animate-fadeIn">
              <p className="text-[11px] text-slate-400 leading-relaxed border-l-2 border-emerald-500/50 pl-2">
                Hãy vào trang <b>Bảng điểm Sinh viên</b> trên myDTU, <b className="text-white">bôi đen toàn bộ bảng từ trên xuống</b>, copy (Ctrl+C) và dán (Ctrl+V) vào ô dưới đây.
              </p>
              
              <textarea
                value={smartPasteText}
                onChange={(e) => setSmartPasteText(e.target.value)}
                placeholder="Dán toàn bộ bảng điểm copy từ myDTU vào đây..."
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs text-emerald-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 h-32 resize-none font-mono"
              />

              {smartPasteStatus.message && (
                <div className={`p-2.5 rounded-lg text-[11px] font-semibold flex items-start gap-1.5 ${
                  smartPasteStatus.type === 'error' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : smartPasteStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-800/50 text-slate-400'
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
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-md">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
            <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
            Giả Lập GPA Mục Tiêu
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">GPA MỤC TIÊU</label>
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  id="simulator-target-select"
                >
                  <option value="3.6">Xuất sắc (3.60)</option>
                  <option value="3.2">Giỏi (3.20)</option>
                  <option value="2.5">Khá (2.50)</option>
                  <option value="custom">Tùy chỉnh...</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">TÍN CHỈ CÒN LẠI</label>
                <input
                  type="number"
                  min="1"
                  value={simulatorRemainingCredits}
                  onChange={(e) => setSimulatorRemainingCredits(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  id="simulator-remaining-credits"
                />
              </div>
            </div>

            {isCustomTarget && (
              <div className="animate-fadeIn">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">GPA TÙY CHỈNH (HỆ 4.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  max="4.00"
                  value={customTargetGpa}
                  onChange={(e) => setCustomTargetGpa(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  id="simulator-custom-gpa"
                />
              </div>
            )}

            {/* Simulation Result Panel */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              simulationResult.status === 'invalid'
                ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                : simulationResult.status === 'achieved'
                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                : simulationResult.status === 'impossible'
                ? 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-200'
            }`} id="simulator-result-box">
              {simulationResult.status === 'invalid' && (
                <p className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>{simulationResult.message}</span>
                </p>
              )}

              {simulationResult.status === 'achieved' && (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    Mục tiêu đã đạt!
                  </p>
                  <p className="text-slate-450 text-[11px]">{simulationResult.message}</p>
                </div>
              )}

              {simulationResult.status === 'impossible' && (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    Cảnh báo: Không khả thi!
                  </p>
                  <p className="text-[11px]">{simulationResult.message}</p>
                </div>
              )}

              {simulationResult.status === 'feasible' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-400">GPA cần đạt trong {simulatorRemainingCredits} TC tới:</span>
                    <span className="text-sm font-extrabold text-white bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20" id="simulator-required-gpa">
                      {simulationResult.requiredGPA?.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-px bg-slate-800/40 w-full my-1"></div>
                  <p className="text-[11px] text-slate-350 font-semibold flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>{simulationResult.message}</span>
                  </p>

                  {/* LỘ TRÌNH ĐIỂM GỢI Ý */}
                  {gradeRecipes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/40 space-y-2">
                      <span className="block text-[10px] font-bold text-indigo-400 tracking-wider">
                        GỢI Ý TỔ HỢP ĐIỂM (THEO TÍN CHỈ):
                      </span>
                      <div className="space-y-1.5">
                        {gradeRecipes.map((r, i) => (
                          <div key={i} className="flex items-start gap-1.5 p-2 bg-slate-950/40 rounded-lg border border-slate-800/60">
                            <span className="text-sm flex-shrink-0">{r.icon}</span>
                            <div>
                              <span className="font-bold text-[10px] text-slate-300 block">{r.type}</span>
                              <span className="text-[10px] text-slate-400 leading-normal">{r.details}</span>
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
              <div className="pt-3.5 border-t border-slate-800/60 space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  HIỆU QUẢ TRẢ NỢ MÔN F:
                </span>
                <p className="text-[10.5px] text-slate-400 leading-normal">
                  Học lại các môn trượt sẽ xóa điểm F cũ. Dưới đây là mức GPA tích lũy tăng thêm tương ứng:
                </p>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {failedCoursesBoosts.map((b, idx) => (
                    <div key={idx} className="p-2.5 bg-rose-500/5 rounded-xl border border-rose-500/10 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-rose-400">{b.courseCode}</span>
                        <span className="text-slate-400 font-semibold">{b.courseName} ({b.credits} TC)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 pt-1 text-[9px] font-bold text-center">
                        <div className="bg-slate-950/80 rounded py-1 px-0.5">
                          <span className="text-slate-500 block">Đạt A (4.0)</span>
                          <span className="text-emerald-400">+{b.boostA.toFixed(2)} GPA</span>
                        </div>
                        <div className="bg-slate-950/80 rounded py-1 px-0.5">
                          <span className="text-slate-500 block">Đạt A- (3.65)</span>
                          <span className="text-emerald-400">+{b.boostAMinus.toFixed(2)} GPA</span>
                        </div>
                        <div className="bg-slate-950/80 rounded py-1 px-0.5">
                          <span className="text-slate-500 block">Đạt B+ (3.33)</span>
                          <span className="text-emerald-400">+{b.boostBPlus.toFixed(2)} GPA</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* RIGHT COLUMN: COURSE LIST (8 columns on lg) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* SEARCH, CATEGORIES, AND VIEW MODES */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/25 backdrop-blur-md border border-slate-800/80 p-4 rounded-xl shadow-inner">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm môn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                id="search-input"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* Thẻ lọc điểm */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/60">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    filterType === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  id="filter-all"
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterType('accumulated')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    filterType === 'accumulated' ? 'bg-slate-900 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  id="filter-accumulated"
                >
                  Tích lũy
                </button>
                <button
                  onClick={() => setFilterType('condition')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    filterType === 'condition' ? 'bg-slate-900 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  id="filter-condition"
                >
                  Điều kiện
                </button>
              </div>

              {/* Chế độ xem: Phân học kỳ vs Phẳng vs Tiến độ Khung */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/60">
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    viewMode === 'grouped' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Hiển thị theo từng học kỳ"
                  id="view-mode-grouped"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  Theo kỳ
                </button>
                <button
                  onClick={() => setViewMode('flat')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    viewMode === 'flat' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Hiển thị bảng tất cả môn học phẳng"
                  id="view-mode-flat"
                >
                  <List className="w-3.5 h-3.5" />
                  Bảng phẳng
                </button>
                <button
                  onClick={() => setViewMode('curriculum')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    viewMode === 'curriculum' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Đối chiếu tiến độ theo Khung chương trình"
                  id="view-mode-curriculum"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Tiến độ Khung
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
                    <div className="flex items-center gap-2 px-1">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-extrabold text-slate-300 tracking-wider">
                        NĂM HỌC {year}
                      </span>
                      <div className="h-px bg-slate-800 flex-grow ml-2"></div>
                    </div>

                    {/* Accordion từng học kỳ trong năm học */}
                    {sortedSemestersInYear(year).map(sem => {
                      const semKey = `${year}-${sem}`;
                      const isExpanded = expandedSemesters[semKey] !== false; // Mặc định là mở rộng (true)
                      const semCourses = groupedCourses[year][sem];
                      
                      // Tính toán điểm số riêng biệt cho từng kỳ
                      const semGPA = calculateSemesterGpa(semCourses);
                      const semCredits = semCourses.reduce((sum, c) => c.isConditionCourse ? sum : sum + c.credits, 0);

                      return (
                        <div key={sem} className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
                          {/* Accordion Header */}
                          <div 
                            onClick={() => toggleSemester(semKey)}
                            className="flex items-center justify-between px-4 py-3 bg-slate-900/60 hover:bg-slate-900/80 cursor-pointer select-none border-b border-slate-800/40"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-white mr-1">{sem}</span>
                              
                              {/* Điểm GPA Học kỳ */}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-bold border border-slate-800/60 text-emerald-400">
                                GPA Kỳ: {semGPA.toFixed(2)}
                              </span>

                              {/* Tổng số tín chỉ kỳ này */}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-semibold border border-slate-800/60 text-slate-400">
                                {semCredits} Tín chỉ
                              </span>

                              {/* Đánh giá học lực riêng cho kỳ */}
                              {(() => {
                                const getSemClass = (gpa: number) => {
                                  if (gpa >= 3.6) return { name: 'Xuất sắc', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
                                  if (gpa >= 3.2) return { name: 'Giỏi', color: 'text-emerald-450 bg-emerald-500/10 border-emerald-500/20' };
                                  if (gpa >= 2.5) return { name: 'Khá', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
                                  if (gpa >= 2.0) return { name: 'Trung bình', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
                                  return { name: 'Yêu / Kém', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
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
                                  className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 font-extrabold flex items-center gap-0.5 animate-pulse"
                                  title="Đủ điều kiện xét học bổng (GPA kỳ ≥ 3.2, đăng ký ≥ 5 TC và không trượt môn F nào)"
                                >
                                  🎁 Xét học bổng
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => handleDeleteSemester(year, sem, e)}
                                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                title={`Xóa toàn bộ ${sem}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="text-slate-400">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>

                          {/* Accordion Content (Table list) */}
                          {isExpanded && (
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                  <tr className="border-b border-slate-800 bg-slate-950/20 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="px-4 py-2.5">Mã Môn</th>
                                    <th className="px-4 py-2.5">Tên Môn Học</th>
                                    <th className="px-4 py-2.5 text-center">Tín Chỉ</th>
                                    <th className="px-4 py-2.5 text-center">Điểm</th>
                                    <th className="px-4 py-2.5 text-center">Hệ 4.0</th>
                                    <th className="px-4 py-2.5">Trạng Thái</th>
                                    <th className="px-4 py-2.5 text-right">Xóa</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850 bg-transparent">
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
                                        className={`hover:bg-slate-900/20 transition-colors ${
                                          pc.isReplaced ? 'opacity-40 line-through bg-slate-950/10' : ''
                                        }`}
                                      >
                                        <td className="px-4 py-2.5 font-semibold text-slate-400">
                                          {isEditing ? (
                                            <input 
                                              type="text"
                                              value={editCourseCode}
                                              onChange={(e) => setEditCourseCode(e.target.value)}
                                              className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                                            />
                                          ) : (
                                            pc.courseCode
                                          )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                          {isEditing ? (
                                            <input 
                                              type="text"
                                              value={editCourseName}
                                              onChange={(e) => setEditCourseName(e.target.value)}
                                              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            />
                                          ) : (
                                            <div>
                                              <span className="font-semibold text-slate-200">{pc.courseName}</span>
                                              {replacedCourse && (
                                                <div className="text-[9px] text-indigo-400 mt-0.5 flex items-center gap-1 font-semibold">
                                                  <RefreshCw className="w-2.5 h-2.5" />
                                                  Thay thế môn: {replacedCourse.courseCode} (Điểm cũ: {replacedCourse.gradeChar} | {replacedCourse.academicYear} - {replacedCourse.semester})
                                                </div>
                                              )}
                                              {replacementCourse && (
                                                <div className="text-[9px] text-rose-400 mt-0.5 flex items-center gap-1 font-semibold">
                                                  <AlertTriangle className="w-2.5 h-2.5" />
                                                  Cải thiện tại: {replacementCourse.academicYear} - {replacementCourse.semester}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-4 py-2.5 text-center font-semibold text-slate-300">
                                          {isEditing ? (
                                            <input 
                                              type="number"
                                              min="1"
                                              value={editCredits}
                                              onChange={(e) => setEditCredits(Math.max(1, parseInt(e.target.value) || 0))}
                                              className="w-12 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-xs text-white text-center font-bold focus:outline-none focus:border-indigo-500"
                                            />
                                          ) : (
                                            pc.credits
                                          )}
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                          <select
                                            disabled={isEditing}
                                            value={pc.gradeChar}
                                            onChange={(e) => handleUpdateGrade(pc.id, e.target.value as GradeChar)}
                                            className="font-bold text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white cursor-pointer hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none text-center outline-none disabled:opacity-50"
                                          >
                                            <option value="">--</option>
                                            {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'P'].map(grade => (
                                              <option key={grade} value={grade}>{grade}</option>
                                            ))}
                                          </select>
                                        </td>
                                        <td className="px-4 py-2.5 text-center font-medium text-slate-400">
                                          {pc.gradePoint !== null ? pc.gradePoint.toFixed(2) : '-'}
                                        </td>
                                        <td className="px-4 py-2.5">
                                          <div className="flex flex-wrap gap-1">
                                            {pc.isConditionCourse ? (
                                              <span className="bg-amber-500/10 text-amber-400 text-[8px] font-bold px-1 rounded border border-amber-500/10">Đ.Kiện</span>
                                            ) : pc.isReplaced ? (
                                              <span className="bg-rose-500/10 text-rose-400 text-[8px] font-bold px-1 rounded border border-rose-500/10">Bị Thay</span>
                                            ) : (
                                              <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-1 rounded border border-emerald-500/10">T.Lũy</span>
                                            )}
                                            {pc.isRetake && (
                                              <span className="bg-indigo-500/10 text-indigo-400 text-[8px] font-bold px-1 rounded border border-indigo-500/10">Học Lại</span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                          {isEditing ? (
                                            <div className="flex gap-1 justify-end">
                                              <button
                                                onClick={() => handleSaveEditCourse(pc.id)}
                                                className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center justify-center"
                                                title="Lưu thay đổi"
                                              >
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                                                className="text-slate-500 hover:text-indigo-400 p-1 rounded hover:bg-indigo-500/10 transition-all cursor-pointer flex items-center justify-center"
                                                title="Sửa môn học"
                                              >
                                                <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteCourse(pc.id)}
                                                className="text-slate-500 hover:text-rose-450 p-1 rounded-md hover:bg-rose-500/10 transition-all cursor-pointer"
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
                <div className="text-center py-10 text-slate-500 bg-slate-900/20 border border-slate-800 rounded-xl">
                  Chưa có môn học nào được đăng ký trong hệ thống.
                </div>
              )}
            </div>
          )}

          {/* VIEW: FLAT TABLE VIEW */}
          {viewMode === 'flat' && (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Năm học & Kỳ</th>
                      <th className="px-4 py-3">Mã Môn</th>
                      <th className="px-4 py-3">Tên Môn Học</th>
                      <th className="px-4 py-3 text-center">Tín Chỉ</th>
                      <th className="px-4 py-3 text-center">Điểm</th>
                      <th className="px-4 py-3 text-center">Hệ 4.0</th>
                      <th className="px-4 py-3">Trạng Thái</th>
                      <th className="px-4 py-3 text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-transparent" id="course-table-body">
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
                            className={`hover:bg-slate-900/30 transition-colors ${
                              pc.isReplaced ? 'opacity-50 line-through bg-slate-950/20' : ''
                            }`}
                          >
                            <td className="px-4 py-3 text-slate-400 font-medium whitespace-nowrap">
                              {pc.academicYear} - <span className="text-[10px] font-semibold">{pc.semester.replace('Học kỳ ', 'HK')}</span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-300">
                              {isEditing ? (
                                <input 
                                  type="text"
                                  value={editCourseCode}
                                  onChange={(e) => setEditCourseCode(e.target.value)}
                                  className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                                />
                              ) : (
                                pc.courseCode
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input 
                                  type="text"
                                  value={editCourseName}
                                  onChange={(e) => setEditCourseName(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                              ) : (
                                <div>
                                  <span className="font-semibold text-white">{pc.courseName}</span>
                                  {replacedCourse && (
                                    <div className="text-[9px] text-indigo-400 mt-0.5 flex items-center gap-1 font-semibold">
                                      <RefreshCw className="w-2.5 h-2.5" />
                                      Thay thế môn: {replacedCourse.courseCode} (Điểm cũ: {replacedCourse.gradeChar})
                                    </div>
                                  )}
                                  {replacementCourse && (
                                    <div className="text-[9px] text-rose-400 mt-0.5 flex items-center gap-1 font-semibold">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      Bị phủ quyết bởi môn cải thiện
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center font-medium text-slate-300">
                              {isEditing ? (
                                <input 
                                  type="number"
                                  min="1"
                                  value={editCredits}
                                  onChange={(e) => setEditCredits(Math.max(1, parseInt(e.target.value) || 0))}
                                  className="w-12 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-xs text-white text-center font-bold focus:outline-none focus:border-indigo-500"
                                />
                              ) : (
                                pc.credits
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select
                                disabled={isEditing}
                                value={pc.gradeChar}
                                onChange={(e) => handleUpdateGrade(pc.id, e.target.value as GradeChar)}
                                className="font-bold text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white cursor-pointer hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none text-center outline-none disabled:opacity-50"
                              >
                                <option value="">--</option>
                                {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'P'].map(grade => (
                                  <option key={grade} value={grade}>{grade}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center font-medium text-slate-400">
                              {pc.gradePoint !== null ? pc.gradePoint.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {pc.isConditionCourse ? (
                                  <span className="bg-amber-500/10 text-amber-400 text-[8px] font-bold px-1 rounded border border-amber-500/15">Điều Kiện</span>
                                ) : pc.isReplaced ? (
                                  <span className="bg-rose-500/10 text-rose-400 text-[8px] font-bold px-1 rounded border border-rose-500/15">Bị Thay</span>
                                ) : (
                                  <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-1 rounded border border-emerald-500/15">Tích Lũy</span>
                                )}
                                {pc.isRetake && (
                                  <span className="bg-indigo-500/10 text-indigo-400 text-[8px] font-bold px-1 rounded border border-indigo-500/15">Học Lại</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isEditing ? (
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={() => handleSaveEditCourse(pc.id)}
                                    className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center justify-center"
                                    title="Lưu thay đổi"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                                    className="text-slate-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors cursor-pointer flex items-center justify-center"
                                    title="Sửa môn học"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCourse(pc.id)}
                                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center justify-center"
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
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                          Không tìm thấy môn học nào khớp với bộ lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-slate-900/20 border-t border-slate-800/80 px-4 py-3 flex justify-between items-center text-slate-400">
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
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-sm text-center">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tổng Khung</span>
                      <span className="text-lg font-extrabold text-white">{curriculumProgress.totalCredits} TC</span>
                      <span className="text-[9px] text-slate-500 block">({curriculumCourses.length} môn)</span>
                    </div>
                    <div className="space-y-1 border-l border-slate-800/60">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Đã Xong</span>
                      <span className="text-lg font-extrabold text-emerald-400">{curriculumProgress.completedCredits} TC</span>
                      <span className="text-[9px] text-emerald-500/80 block">({curriculumProgress.completed.length} môn)</span>
                    </div>
                    <div className="space-y-1 border-l border-slate-800/60">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Đang Học</span>
                      <span className="text-lg font-extrabold text-indigo-400">{curriculumProgress.learningCredits} TC</span>
                      <span className="text-[9px] text-indigo-500/80 block">({curriculumProgress.learning.length} môn)</span>
                    </div>
                    <div className="space-y-1 border-l border-slate-800/60">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Nợ Môn</span>
                      <span className="text-lg font-extrabold text-rose-400">{curriculumProgress.failedCredits} TC</span>
                      <span className="text-[9px] text-rose-500/80 block">({curriculumProgress.failed.length} môn)</span>
                    </div>
                    <div className="space-y-1 border-l border-slate-800/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Còn Thiếu</span>
                      <span className="text-lg font-extrabold text-slate-200">{curriculumProgress.missingCredits} TC</span>
                      <span className="text-[9px] text-slate-500 block">({curriculumProgress.missing.length} môn)</span>
                    </div>
                  </div>

                  {/* Checklist Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* COLUMN 1: CÒN THIẾU (Chưa Đăng Ký) */}
                    <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-[500px]">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800/60">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          CÒN THIẾU ({curriculumProgress.missing.length})
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/60">{curriculumProgress.missingCredits} TC</span>
                      </div>
                      <div className="space-y-2.5 overflow-y-auto flex-grow pr-1.5 custom-scrollbar bg-transparent">
                        {curriculumProgress.missing.map(c => (
                          <div key={c.courseCode} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-slate-800 transition-all flex justify-between items-start gap-2 group">
                            <div className="space-y-1">
                              <div className="font-bold text-[11px] text-slate-300">{c.courseCode}</div>
                              <div className="text-[10px] text-slate-500 leading-snug">{c.courseName}</div>
                            </div>
                            
                            {/* Interactive Edit Credits */}
                            <div className="flex items-center gap-1">
                              {editingCurriculumCode === c.courseCode ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={editCurriculumCredits}
                                  onChange={(e) => setEditCurriculumCredits(Math.max(1, parseInt(e.target.value) || 0))}
                                  className="w-10 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white p-0.5 font-bold"
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
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850">{c.credits} TC</span>
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
                                className="p-1 hover:bg-slate-800 text-slate-500 hover:text-white rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                title="Sửa tín chỉ môn này"
                              >
                                {editingCurriculumCode === c.courseCode ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        {curriculumProgress.missing.length === 0 && (
                          <div className="text-center py-10 text-[11px] text-slate-600">Tuyệt vời! Bạn không thiếu môn nào.</div>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 2: NỢ MÔN (F) */}
                    <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-[500px]">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800/60">
                        <span className="text-xs font-bold text-rose-450 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          NỢ MÔN / F ({curriculumProgress.failed.length})
                        </span>
                        <span className="text-[10px] font-bold text-rose-450 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{curriculumProgress.failedCredits} TC</span>
                      </div>
                      <div className="space-y-2.5 overflow-y-auto flex-grow pr-1.5 custom-scrollbar bg-transparent">
                        {curriculumProgress.failed.map(c => (
                          <div key={c.courseCode} className="p-3 bg-rose-500/5 border border-rose-950/20 rounded-xl flex justify-between items-start gap-2 group">
                            <div className="space-y-1">
                              <div className="font-bold text-[11px] text-rose-455">{c.courseCode}</div>
                              <div className="text-[10px] text-slate-500 leading-snug">{c.courseName}</div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {editingCurriculumCode === c.courseCode ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={editCurriculumCredits}
                                  onChange={(e) => setEditCurriculumCredits(Math.max(1, parseInt(e.target.value) || 0))}
                                  className="w-10 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white p-0.5 font-bold"
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
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/10">{c.credits} TC</span>
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
                                className="p-1 hover:bg-slate-800 text-slate-500 hover:text-white rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                title="Sửa tín chỉ môn này"
                              >
                                {editingCurriculumCode === c.courseCode ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        {curriculumProgress.failed.length === 0 && (
                          <div className="text-center py-10 text-[11px] text-slate-600">Sạch điểm F! Không có môn nợ.</div>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 3: ĐANG HỌC (Chờ Điểm) */}
                    <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-[500px]">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800/60">
                        <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          ĐANG HỌC ({curriculumProgress.learning.length})
                        </span>
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{curriculumProgress.learningCredits} TC</span>
                      </div>
                      <div className="space-y-2.5 overflow-y-auto flex-grow pr-1.5 custom-scrollbar bg-transparent">
                        {curriculumProgress.learning.map(c => (
                          <div key={c.courseCode} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-slate-800 transition-all flex justify-between items-start gap-2 group">
                            <div className="space-y-1">
                              <div className="font-bold text-[11px] text-indigo-400">{c.courseCode}</div>
                              <div className="text-[10px] text-slate-500 leading-snug">{c.courseName}</div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {editingCurriculumCode === c.courseCode ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={editCurriculumCredits}
                                  onChange={(e) => setEditCurriculumCredits(Math.max(1, parseInt(e.target.value) || 0))}
                                  className="w-10 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white p-0.5 font-bold"
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
                                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10">{c.credits} TC</span>
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
                                className="p-1 hover:bg-slate-800 text-slate-500 hover:text-white rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                title="Sửa tín chỉ môn này"
                              >
                                {editingCurriculumCode === c.courseCode ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        {curriculumProgress.learning.length === 0 && (
                          <div className="text-center py-10 text-[11px] text-slate-600">Không có môn nào đang học.</div>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 4: ĐÃ HOÀN THÀNH */}
                    <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-[500px]">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800/60">
                        <span className="text-xs font-bold text-emerald-450 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          ĐÃ ĐẠT ({curriculumProgress.completed.length})
                        </span>
                        <span className="text-[10px] font-bold text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{curriculumProgress.completedCredits} TC</span>
                      </div>
                      <div className="space-y-2.5 overflow-y-auto flex-grow pr-1.5 custom-scrollbar bg-transparent">
                        {curriculumProgress.completed.map(c => (
                          <div key={c.courseCode} className="p-3 bg-emerald-500/5 border border-emerald-950/20 rounded-xl flex justify-between items-start gap-2 group">
                            <div className="space-y-1">
                              <div className="font-bold text-[11px] text-emerald-400">{c.courseCode}</div>
                              <div className="text-[10px] text-slate-500 leading-snug">{c.courseName}</div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {editingCurriculumCode === c.courseCode ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={editCurriculumCredits}
                                  onChange={(e) => setEditCurriculumCredits(Math.max(1, parseInt(e.target.value) || 0))}
                                  className="w-10 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white p-0.5 font-bold"
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
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">{c.credits} TC</span>
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
                                className="p-1 hover:bg-slate-800 text-slate-500 hover:text-white rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                title="Sửa tín chỉ môn này"
                              >
                                {editingCurriculumCode === c.courseCode ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        {curriculumProgress.completed.length === 0 && (
                          <div className="text-center py-10 text-[11px] text-slate-600">Chưa hoàn thành môn nào.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-md max-w-md mx-auto my-10 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mx-auto">
                    <BookOpen className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Chưa Cài Đặt Khung Chương Trình</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
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
          <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1 space-y-2 pt-1">
                <h3 className="text-lg font-bold text-slate-200 leading-none">{confirmModal.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
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
          <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <h3 className="text-base font-bold text-white mb-2 uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-405" />
              Cài Đặt Khung Chương Trình Đào Tạo
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              Hãy vào trang <b>Khung Chương Trình</b> trên myDTU, bôi đơn/bôi đen toàn bộ bảng danh sách môn học, copy (Ctrl+C) và dán (Ctrl+V) vào ô dưới đây. Hệ thống sẽ tự động bóc tách mã môn, tên môn và số tín chỉ của từng môn học.
            </p>
            
            <textarea
              value={curriculumInputText}
              onChange={(e) => setCurriculumInputText(e.target.value)}
              placeholder="Dán nội dung khung chương trình copy từ myDTU..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-indigo-205 placeholder-slate-600 focus:outline-none focus:border-indigo-500 flex-grow h-60 resize-none font-mono mb-4"
            />

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => {
                  setIsCurriculumModalOpen(false);
                  setCurriculumInputText('');
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-350 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleParseCurriculum}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Phân tích & Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
