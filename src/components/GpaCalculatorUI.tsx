import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  X,
  HelpCircle,
  MessageSquare,
  Mail,
  Paperclip,
  Upload,
  Download,
  Database,
  ClipboardList
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
  const [curriculumInputText, setCurriculumInputText] = useState('');
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
  const [mobileDrawerTab, setMobileDrawerTab] = useState<'add' | 'simulator'>('add');

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
    label: string;
    semesterGpa: number;
    cumulativeGpa: number;
    diffGpa?: number;
    diffPercent?: string;
  } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const chartContainerRef = useRef<HTMLDivElement>(null);

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
      return { name: 'Chưa xếp loại', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    }
    const gpa = dtuResult.cumulativeGpa;
    if (gpa >= 3.6) return { name: 'Xuất sắc', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
    if (gpa >= 3.2) return { name: 'Giỏi', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (gpa >= 2.5) return { name: 'Khá', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
    if (gpa >= 2.0) return { name: 'Trung bình', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { name: 'Yêu / Kém', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
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
      color: #1e293b;
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
      color: #475569;
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
        <div class="summary-value">${displayGpa}</div>
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

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 text-slate-100">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
              Ứng Dụng Tính Điểm GPA Duy Tân (DTU)
              <button 
                onClick={() => setIsHelpModalOpen(true)}
                className="text-slate-500 hover:text-indigo-400 hover:scale-110 active:scale-95 transition-all cursor-pointer p-1"
                title="Hướng dẫn sử dụng & Nhập điểm từ myDTU"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">
            Tính toán GPA tích lũy, quản lý phân nhóm học kỳ và theo dõi tỉ lệ tín chỉ học cải thiện.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {courses.length === 0 && (
            <button
              onClick={loadMockScenario}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-600/20 border border-indigo-400/20 cursor-pointer"
              id="btn-load-mock"
            >
              <Database className="w-3.5 h-3.5" />
              Tải Dữ Liệu Mẫu (Nhiều Kỳ)
            </button>
          )}

          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer shadow-sm shadow-emerald-500/5"
            title="Tải xuống bản điểm dạng file HTML tuyệt đẹp để xem hoặc in ấn"
            id="btn-export"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Bản Điểm</span>
          </button>
          
          <button
            onClick={handleTriggerImport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 active:scale-95 transition-all cursor-pointer shadow-sm shadow-indigo-500/5"
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
            onClick={() => setIsFeedbackModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 active:scale-95 transition-all cursor-pointer shadow-sm shadow-indigo-500/5"
            title="Liên hệ Admin, báo lỗi hoặc góp ý kiến"
            id="btn-feedback"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Hỗ Trợ & Góp Ý
          </button>
          
          <button
            onClick={handleResetApp}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer shadow-sm shadow-rose-500/5"
            id="btn-reset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset App (Xóa Sạch)
          </button>
        </div>
      </header>

      {/* CẢNH BÁO DỮ LIỆU MẪU */}
      {isMockDataLoaded && courses.length > 0 && (
        <div className="mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 mt-0.5">
              <Database className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">💡 Bạn đang xem dữ liệu ví dụ mẫu (Demo)</h4>
              <p className="text-xs text-slate-300">
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
        <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-800/80 shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all"></div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-400" />
              GPA TÍCH LŨY HỆ 4.0
            </span>
            <span 
              onClick={() => setIsHelpModalOpen(true)}
              className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${gpaClassification.color} cursor-pointer hover:bg-slate-800 transition-all flex items-center gap-1`}
              title="Nhấp để xem Quy chế xếp loại tốt nghiệp DTU"
            >
              {gpaClassification.name}
              <HelpCircle className="w-3 h-3 opacity-85" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white" id="dashboard-gpa">
              {hasGrades ? dtuResult.cumulativeGpa.toFixed(2) : '--'}
            </span>
            <span className="text-slate-500 text-xs">/ 4.00</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Đã trừ điểm gốc của các môn bị học cải thiện.
          </p>
        </div>

        {/* CREDITS CARD */}
        <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-800/80 shadow-md">
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
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white" id="dashboard-credits">
              {dtuResult.accumulatedCredits}
            </span>
            <span className="text-slate-500 text-xs">/</span>
            {isEditingTargetCredits ? (
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={tempTargetCredits}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTempTargetCredits(val === '' ? '' : parseInt(val) || 0);
                  }}
                  className="w-16 bg-slate-950 border border-emerald-500 rounded px-1.5 py-0.5 text-center text-xs font-semibold text-emerald-400 focus:outline-none focus:border-emerald-500"
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
                  className="p-1 hover:bg-slate-850 rounded text-rose-400 hover:text-rose-400 cursor-pointer flex items-center justify-center"
                  title="Hủy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                className="flex items-center gap-1 group/credits cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 hover:border-emerald-500/50 transition-all" 
                onClick={() => {
                  setTempTargetCredits(targetCredits);
                  setIsEditingTargetCredits(true);
                }}
                title="Nhấp để thay đổi tổng số tín chỉ tốt nghiệp của ngành bạn"
              >
                <span className="text-slate-300 text-[11px] hover:text-emerald-400 font-bold transition">
                  {targetCredits} TC (Nhấp để sửa)
                </span>
                <Pencil className="w-2.5 h-2.5 text-slate-500 group-hover/credits:text-emerald-400 transition opacity-80" />
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
                className="absolute top-1 right-1 text-slate-500 hover:text-indigo-400 transition cursor-pointer p-0.5"
                title="Đóng thông báo"
              >
                <X className="w-2.5 h-2.5" />
              </button>
              <div className="flex gap-1.5 items-start pr-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[10px] leading-normal text-slate-300">
                  👋 <strong>Mẹo:</strong> Nhấp vào <strong>Khung chương trình</strong> ở dưới để dán khung từ myDTU hoặc nhập trực tiếp tổng tín chỉ ngành của bạn để app tự động thiết lập nhanh chóng nhé!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RETAKES CARD */}
        <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-800/80 shadow-md">
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
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
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
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white" id="dashboard-retakes">
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
        <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-800/80 shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/15 transition-all"></div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
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
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white" id="dashboard-failed-credits">
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
            <div 
              ref={chartContainerRef}
              className="min-w-[580px] h-[185px] relative"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
            >
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
                {chartSvgPath.points.map((p, idx) => {
                  const barHeight = chartSvgPath.yBase - p.ySem;
                  const prevPoint = idx > 0 ? chartSvgPath.points[idx - 1].point : null;
                  const diffGpa = prevPoint ? p.point.cumulativeGpa - prevPoint.cumulativeGpa : undefined;
                  const diffPercent = prevPoint && prevPoint.cumulativeGpa > 0
                    ? `${(diffGpa! >= 0 ? '+' : '')}${((diffGpa! / prevPoint.cumulativeGpa) * 100).toFixed(1)}%`
                    : undefined;

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
                        onMouseEnter={() => {
                          setHoveredPoint({
                            label: p.point.label,
                            semesterGpa: p.point.semesterGpa,
                            cumulativeGpa: p.point.cumulativeGpa,
                            diffGpa,
                            diffPercent
                          });
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {/* Trị số GPA Học kỳ nằm ở dưới cùng bên trong cột để tránh đè lên đường tích lũy */}
                      {p.point.semesterGpa >= 0.5 && (
                        <text 
                          x={p.x} 
                          y={chartSvgPath.yBase - 8} 
                          textAnchor="middle" 
                          fill="#ffffff" 
                          fontSize="8.5" 
                          fontWeight="bold"
                          opacity="0.8"
                        >
                          {p.point.semesterGpa.toFixed(2)}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Vùng diện tích Gradient phía dưới GPA Tích lũy - không chặn hover */}
                <path d={chartSvgPath.area} fill="url(#area-gradient)" style={{ pointerEvents: 'none' }} />

                {/* Đường biểu đồ GPA Tích lũy (Line) - không chặn hover */}
                <path 
                  d={chartSvgPath.line} 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ pointerEvents: 'none' }}
                />

                {/* Các chấm nút (Circles) GPA Tích lũy */}
                {chartSvgPath.points.map((p, idx) => {
                  const prevPoint = idx > 0 ? chartSvgPath.points[idx - 1].point : null;
                  const diffGpa = prevPoint ? p.point.cumulativeGpa - prevPoint.cumulativeGpa : undefined;
                  const diffPercent = prevPoint && prevPoint.cumulativeGpa > 0
                    ? `${(diffGpa! >= 0 ? '+' : '')}${((diffGpa! / prevPoint.cumulativeGpa) * 100).toFixed(1)}%`
                    : undefined;

                  return (
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
                        onMouseEnter={() => {
                          setHoveredPoint({
                            label: p.point.label,
                            semesterGpa: p.point.semesterGpa,
                            cumulativeGpa: p.point.cumulativeGpa,
                            diffGpa,
                            diffPercent
                          });
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
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
                  );
                })}
              </svg>

              {/* FLOATING TOOLTIP - sử dụng tọa độ chuột thực tế */}
              {hoveredPoint && (
                <div 
                  className="absolute bg-slate-950/95 border border-indigo-500/40 rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-[11px] pointer-events-none z-50 w-48 text-left"
                  style={{ 
                    left: mousePos.x,
                    top: mousePos.y,
                    transform: mousePos.y < 100 ? 'translate(-50%, 12px)' : 'translate(-50%, calc(-100% - 12px))'
                  }}
                >
                  {/* Mũi tên nhỏ phía dưới hoặc phía trên tooltip */}
                  <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950/95 border-indigo-500/40 rotate-45 ${
                    mousePos.y < 100 ? '-top-1.5 border-l border-t' : '-bottom-1.5 border-r border-b'
                  }`} />
                  <span className="font-bold text-indigo-400 block mb-1.5 text-center border-b border-slate-800/80 pb-1.5">{hoveredPoint.label}</span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">GPA Học kỳ:</span>
                      <span className="font-bold text-emerald-400">{hoveredPoint.semesterGpa.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">GPA Tích lũy:</span>
                      <span className="font-bold text-white">{hoveredPoint.cumulativeGpa.toFixed(2)}</span>
                    </div>
                    {hoveredPoint.diffGpa !== undefined && (
                      <div className="pt-1.5 mt-0.5 border-t border-slate-800/60 flex items-center justify-between font-bold">
                        <span className="text-slate-400">Biến động:</span>
                        {hoveredPoint.diffGpa > 0 ? (
                          <span className="text-emerald-400">↑ +{hoveredPoint.diffGpa.toFixed(2)} ({hoveredPoint.diffPercent})</span>
                        ) : hoveredPoint.diffGpa < 0 ? (
                          <span className="text-rose-400">↓ {hoveredPoint.diffGpa.toFixed(2)} ({hoveredPoint.diffPercent})</span>
                        ) : (
                          <span className="text-slate-400">→ Không đổi</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
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

      {/* MAIN LAYOUT - 12 columns on desktop, active tab takes 100% on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6">
        
        {/* LEFT COLUMN: FORM & SIMULATOR */}
        {/* On desktop: static left column. On mobile: absolute bottom sheet drawer when open, hidden otherwise */}
        <div className={`
          sm:col-span-4 space-y-3 sm:space-y-6 min-w-0
          ${isMobileDrawerOpen 
            ? 'fixed inset-x-0 bottom-0 z-50 bg-slate-900/98 border-t border-slate-800 rounded-t-3xl p-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp block' 
            : 'hidden sm:block'
          }
        `}>
          {/* Header of Drawer (Only visible on mobile when drawer is open) */}
          {isMobileDrawerOpen && (
            <div className="sm:hidden flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex gap-2 p-0.5 bg-slate-950 rounded-xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setMobileDrawerTab('add')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    mobileDrawerTab === 'add' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30' : 'text-slate-400'
                  }`}
                >
                  Nhập điểm
                </button>
                <button
                  type="button"
                  onClick={() => setMobileDrawerTab('simulator')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    mobileDrawerTab === 'simulator' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30' : 'text-slate-400'
                  }`}
                >
                  Giả lập GPA
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* QUICK ADD FORM */}
          <div className={`bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-md ${
            isMobileDrawerOpen 
              ? (mobileDrawerTab === 'add' ? 'block' : 'hidden')
              : 'block'
          }`}>
          {/* Form Header: luôn 2 dòng - title trên, mode tabs dưới */}
          <div className="flex flex-col gap-2.5 mb-3 pb-3 border-b border-slate-800/80">
            {/* Dòng 1: Title + Help */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Thêm Môn Học
              </h2>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="text-slate-500 hover:text-indigo-400 transition-all p-1 rounded-lg hover:bg-indigo-500/10 cursor-pointer"
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
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-indigo-500/50'
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
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-emerald-500/50'
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
                  <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-wider mb-1">NĂM HỌC</label>
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    id="form-year-select"
                  >
                    {yearOptions.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                    <option value="ADD_CUSTOM_YEAR" className="text-indigo-400 font-bold">+ Thêm năm học khác...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-wider mb-1">HỌC KỲ</label>
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
                <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-wider mb-1">MÃ MÔN HỌC</label>
                <input
                  type="text"
                  placeholder="VD: LAW 201"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-wider mb-1">SỐ TÍN CHỈ</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={credits || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setCredits(isNaN(val) ? 0 : val);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                  <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-wider mb-1">ĐIỂM CHỮ</label>
                  <select
                    value={gradeChar}
                    onChange={(e) => setGradeChar(e.target.value as GradeChar)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg sm:rounded-xl px-2 sm:px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                    className="rounded border-slate-850 bg-slate-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-0 w-3 h-3 sm:w-3.5 sm:h-3.5"
                    id="form-is-condition"
                  />
                  <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">Môn điều kiện (PE, Quốc phòng)</span>
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
                      className="rounded border-slate-850 bg-slate-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-0 w-3 h-3 sm:w-3.5 sm:h-3.5"
                      id="form-is-retake"
                    />
                    <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">Môn học lại / cải thiện điểm</span>
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
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider">TỰ ĐỘNG THÊM MÔN NHANH</span>
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="flex items-center gap-1.5 text-[10px] text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-2 py-1 rounded-lg transition-all cursor-pointer font-bold"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  Hướng dẫn copy-paste
                </button>
              </div>
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
          <div className={`bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-md ${
            isMobileDrawerOpen 
              ? (mobileDrawerTab === 'simulator' ? 'block' : 'hidden')
              : 'block'
          }`}>
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
                  value={simulatorRemainingCredits || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSimulatorRemainingCredits(isNaN(val) ? 0 : val);
                    setIsRemainingCreditsEdited(true);
                  }}
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
                  <p className="text-slate-400 text-[11px]">{simulationResult.message}</p>
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
                    <span className="font-semibold text-slate-400">GPA cần đạt trong {simulatorRemainingCredits || 0} TC tới:</span>
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

        {/* RIGHT COLUMN: TABLE */}
        <div className="sm:col-span-8 space-y-4 min-w-0 overflow-hidden">
          
          {/* SEARCH, CATEGORIES, AND VIEW MODES */}
          <div className="flex flex-col gap-3 justify-between items-start bg-slate-900/25 backdrop-blur-md border border-slate-800/80 p-3 sm:p-4 rounded-xl shadow-inner">
            <div className="relative w-full">
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

            <div className="flex flex-wrap items-center gap-2 w-full justify-between">
              {/* Thẻ lọc điểm */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/60">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    filterType === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  id="filter-all"
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterType('accumulated')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    filterType === 'accumulated' ? 'bg-slate-900 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  id="filter-accumulated"
                >
                  Tích lũy
                </button>
                <button
                  onClick={() => setFilterType('condition')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
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
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                    viewMode === 'grouped' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
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
                    viewMode === 'flat' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
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
                    viewMode === 'curriculum' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
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
                    <div className="flex items-center gap-2 px-1 pt-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="text-[10px] sm:text-xs font-extrabold text-indigo-400 tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 shadow-inner whitespace-nowrap">
                        NĂM HỌC {year}
                      </span>
                      <div className="h-[2px] bg-gradient-to-r from-indigo-500/40 to-transparent flex-grow ml-1"></div>
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
                        <div key={sem} className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
                          {/* Accordion Header */}
                      <div 
                            onClick={() => toggleSemester(semKey)}
                            className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900/60 hover:bg-slate-900/80 cursor-pointer select-none border-b border-slate-800/40"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-xs text-indigo-200 bg-indigo-600/35 px-2 py-0.5 rounded-lg border border-indigo-500/30 shadow-inner whitespace-nowrap">
                                {sem} (Năm học {year})
                              </span>
                              
                              {/* Điểm GPA Học kỳ */}
                              <span className={`text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-bold border border-slate-800/60 ${gradedSemCoursesCount > 0 ? 'text-emerald-400' : 'text-slate-400'} whitespace-nowrap`}>
                                GPA: {gradedSemCoursesCount > 0 ? semGPA.toFixed(2) : '--'}
                              </span>

                              {/* Tổng số tín chỉ kỳ này */}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-semibold border border-slate-800/60 text-slate-400 whitespace-nowrap hidden sm:inline">
                                {semCredits} TC
                              </span>

                              {/* Đánh giá học lực riêng cho kỳ */}
                              {(() => {
                                if (gradedSemCoursesCount === 0) {
                                  return (
                                    <span className="text-[9px] px-2 py-0.5 rounded-full border border-slate-700/30 bg-slate-800/40 text-slate-400 font-bold">
                                      Chưa xếp loại
                                    </span>
                                  );
                                }
                                const getSemClass = (gpa: number) => {
                                  if (gpa >= 3.6) return { name: 'Xuất sắc', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
                                  if (gpa >= 3.2) return { name: 'Giỏi', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
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
                                  className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold flex items-center gap-0.5 animate-pulse"
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
                                <tr className="border-b border-slate-800 bg-slate-950/20 text-slate-500 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5">Mã Môn</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5">Tên Môn Học</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5 text-center">TC</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5 text-center">Điểm</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5 text-center hidden sm:table-cell">Hệ 4.0</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5 hidden sm:table-cell">TT</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-2.5 text-right">Xóa</th>
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
                                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 font-semibold text-slate-400 whitespace-nowrap">
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
                                        <td className="px-2 sm:px-4 py-2 sm:py-2.5">
                                          {isEditing ? (
                                            <input 
                                              type="text"
                                              value={editCourseName}
                                              onChange={(e) => setEditCourseName(e.target.value)}
                                              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            />
                                          ) : (
                                            <div className="min-w-0">
                                              <span className="font-semibold text-slate-200 text-xs leading-tight line-clamp-2">{pc.courseName}</span>
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
                                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-center font-semibold text-slate-300 whitespace-nowrap">
                                          {isEditing ? (
                                            <input 
                                              type="number"
                                              min="1"
                                              value={editCredits}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setEditCredits(val === '' ? '' : parseInt(val) || 0);
                                              }}
                                              className="w-12 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-xs text-white text-center font-bold focus:outline-none focus:border-indigo-500"
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
                                            className="font-bold text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white cursor-pointer hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none text-center outline-none disabled:opacity-50"
                                          >
                                            <option value="">--</option>
                                            {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'P'].map(grade => (
                                              <option key={grade} value={grade}>{grade}</option>
                                            ))}
                                          </select>
                                        </td>
                                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-center font-medium text-slate-400 hidden sm:table-cell">
                                          {pc.gradePoint !== null ? pc.gradePoint.toFixed(2) : '-'}
                                        </td>
                                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 hidden sm:table-cell">
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
                                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right">
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
                    <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">
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
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-400 font-medium whitespace-nowrap hidden sm:table-cell">
                              {pc.academicYear} - <span className="text-[10px] font-semibold">{pc.semester.replace('Học kỳ ', 'HK')}</span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-slate-300 whitespace-nowrap">
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
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
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
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-medium text-slate-300 whitespace-nowrap">
                              {isEditing ? (
                                <input 
                                  type="number"
                                  min="1"
                                  value={editCredits}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditCredits(val === '' ? '' : parseInt(val) || 0);
                                  }}
                                  className="w-12 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-xs text-white text-center font-bold focus:outline-none focus:border-indigo-500"
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
                                className="font-bold text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white cursor-pointer hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none text-center outline-none disabled:opacity-50"
                              >
                                <option value="">--</option>
                                {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'P'].map(grade => (
                                  <option key={grade} value={grade}>{grade}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-medium text-slate-400 hidden sm:table-cell">
                              {pc.gradePoint !== null ? pc.gradePoint.toFixed(2) : '-'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
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
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
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
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditCurriculumCredits(val === '' ? '' : parseInt(val) || 0);
                                  }}
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
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditCurriculumCredits(val === '' ? '' : parseInt(val) || 0);
                                  }}
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
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditCurriculumCredits(val === '' ? '' : parseInt(val) || 0);
                                  }}
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
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          ĐÃ ĐẠT ({curriculumProgress.completed.length})
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{curriculumProgress.completedCredits} TC</span>
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
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditCurriculumCredits(val === '' ? '' : parseInt(val) || 0);
                                  }}
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
          <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <h3 className="text-base font-bold text-white mb-2.5 uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Cài Đặt Khung Chương Trình Đào Tạo
            </h3>
            
            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto pr-1 flex-grow mb-4 space-y-4 custom-scrollbar">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Thiết lập danh sách môn học khung của ngành học giúp bạn theo dõi tiến độ tích lũy và xem các môn còn lại chưa học để giả lập điểm.
              </p>

              {/* Hướng dẫn lấy khung chương trình */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                <span className="text-[10px] font-extrabold text-emerald-400 tracking-wider uppercase block">
                  💡 Hướng Dẫn Từng Bước (Nhanh):
                </span>
                <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1.5 pl-0.5 leading-relaxed">
                  <li>Truy cập myDTU &rarr; chọn mục <strong>Chương Trình Học</strong>.</li>
                  <li>Bôi đen (quét khối) từ <strong>Mã Môn / Tên Môn đầu tiên</strong> kéo xuống hết toàn bộ danh sách (như ảnh bên dưới).</li>
                  <li>Nhấn <strong>Ctrl + C</strong> để sao chép.</li>
                  <li>Dán (<strong>Ctrl + V</strong>) vào ô nhập bên dưới và nhấn phân tích.</li>
                </ol>
                <div className="pt-2 border-t border-slate-800/50">
                  <span className="text-[9px] text-slate-500 font-bold block mb-1.5 uppercase">Ảnh minh họa bôi đen:</span>
                  <img 
                    src="/guide_curriculum.png" 
                    alt="Ảnh minh họa bôi đen khung chương trình myDTU" 
                    className="rounded-lg border border-slate-800/80 w-full object-contain max-h-[180px] shadow-md"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dán nội dung vào đây:</label>
                <textarea
                  value={curriculumInputText}
                  onChange={(e) => setCurriculumInputText(e.target.value)}
                  placeholder="Nhấp vào đây và nhấn Ctrl+V..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-indigo-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 h-28 resize-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="curriculum-merge-checkbox"
                  checked={isCurriculumMerge}
                  onChange={(e) => setIsCurriculumMerge(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:outline-none cursor-pointer"
                />
                <label 
                  htmlFor="curriculum-merge-checkbox" 
                  className="text-xs text-slate-350 hover:text-white transition-colors cursor-pointer select-none font-semibold"
                >
                  Cộng dồn vào khung hiện tại (không xóa môn học cũ)
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-800/60">
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

      {/* MODAL HƯỚNG DẪN SỬ DỤNG (Help Modal) */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsHelpModalOpen(false)}
          ></div>
          <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                Hướng Dẫn Sử Dụng & Nhập Điểm Từ myDTU
              </h3>
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="text-slate-500 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-6 overflow-y-auto pr-2 flex-grow text-xs leading-relaxed text-slate-300">
              
              <div className="space-y-2">
                <span className="text-[13px] font-extrabold text-white block">
                  CÁC BƯỚC NHẬP ĐIỂM TỰ ĐỘNG BẰNG COPY - PASTE:
                </span>
                <ol className="list-decimal list-inside space-y-3 pl-1">
                  <li>
                    Đăng nhập vào cổng thông tin đào tạo <a href="https://mydtu.duytan.edu.vn" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">myDTU của bạn</a>.
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
                <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                  HÌNH 1: QUÉT KHỐI BẢNG ĐIỂM TRÊN MYDTU (VÍ DỤ CẢ NĂM 1 VÀ NĂM 2)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold block text-center uppercase">1. Phần đầu bảng điểm (Bắt đầu quét)</span>
                    <img 
                      src="/guide_step1.png" 
                      alt="Quét bảng điểm myDTU đầu" 
                      className="rounded-lg border border-slate-800/80 w-full object-contain shadow-md" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold block text-center uppercase">2. Phần cuối bảng điểm (Quét hết bảng)</span>
                    <img 
                      src="/guide_step2.png" 
                      alt="Quét bảng điểm myDTU cuối" 
                      className="rounded-lg border border-slate-800/80 w-full object-contain shadow-md" 
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
                <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                  HÌNH 2: DÂN VÀO ỨNG DỤNG VÀ NHẤN "PHÂN TÍCH & TỰ ĐỘNG THÊM"
                </span>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 max-w-lg mx-auto">
                  <img 
                    src="/guide_step3.png" 
                    alt="Dán dữ liệu và phân tích" 
                    className="rounded-lg border border-slate-800/80 w-full object-contain shadow-md" 
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

              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3.5 text-[11px] space-y-1">
                <span className="font-bold text-white block">💡 LƯU Ý HỮU ÍCH:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-450 pl-1">
                  <li>Ứng dụng hỗ trợ tự động phát hiện và gộp các môn học cải thiện / học lại dựa trên mã môn và số tín chỉ.</li>
                  <li>Bạn có thể nhấp chọn biểu tượng <Pencil className="w-3.5 h-3.5 inline text-indigo-400 mx-0.5" /> ngay bên cạnh điểm chữ trong bảng điểm hoặc tên môn học để sửa thông tin trực tiếp bất cứ lúc nào.</li>
                </ul>
              </div>

              {/* Quy chế xếp loại tốt nghiệp DTU */}
              <div className="space-y-3 pt-4 border-t border-slate-800" id="graduation-rules">
                <span className="text-[13px] font-extrabold text-white block uppercase tracking-wider">
                  🎓 Quy Chế Xếp Loại Tốt Nghiệp Đại Học Duy Tân (DTU):
                </span>
                
                <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/20">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="p-2.5">Xếp Loại Tốt Nghiệp</th>
                        <th className="p-2.5">Yêu Cầu GPA Tích Lũy</th>
                        <th className="p-2.5">Điều Kiện Khống Chế (Tín Chỉ Học Lại / Cải Thiện)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="p-2.5 font-bold text-violet-400">Xuất Sắc</td>
                        <td className="p-2.5 font-bold text-white">3.60 – 4.00</td>
                        <td className="p-2.5 text-xs" rowSpan={2}>
                          Tổng số tín chỉ thi lại, học lại hoặc cải thiện <strong className="text-rose-450">không vượt quá 5%</strong> tổng số tín chỉ của toàn khóa học (ví dụ: tối đa 7.2 tín chỉ trên tổng 144 tín chỉ).
                          <div className="text-[10px] text-slate-500 mt-1 italic">
                            * Nếu vượt quá 5%, thứ hạng tốt nghiệp sẽ bị hạ xuống 1 bậc.
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-emerald-400">Giỏi</td>
                        <td className="p-2.5 font-bold text-white">3.20 – 3.59</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-indigo-400">Khá</td>
                        <td className="p-2.5 font-bold text-white">2.50 – 3.19</td>
                        <td className="p-2.5 text-slate-500 italic">Không áp dụng điều kiện khống chế học lại.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-amber-400">Trung Bình</td>
                        <td className="p-2.5 font-bold text-white">2.00 – 2.49</td>
                        <td className="p-2.5 text-slate-500 italic">Không áp dụng điều kiện khống chế học lại.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 text-[11px] space-y-1">
                  <span className="font-bold text-rose-400 block">⚠️ CẢNH BÁO TỐT NGHIỆP:</span>
                  <p className="text-slate-400 leading-normal">
                    Ứng dụng sẽ tự động phân tích tỷ lệ phần trắng số tín chỉ học lại của bạn dựa trên tổng số tín chỉ mục tiêu của chương trình học (mặc định là 144 tín chỉ, bạn có thể chỉnh sửa). Hãy theo dõi cảnh báo học lại ở màn hình chính để tránh bị hạ bậc tốt nghiệp đáng tiếc!
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-800 mt-4">
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all active:scale-95 cursor-pointer"
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
          <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-5 w-full max-w-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 mb-3.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-indigo-400" />
                Hỗ Trợ & Đóng Góp Ý Kiến
              </h3>
              <button 
                onClick={handleCloseFeedbackModal}
                className="text-slate-500 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Author Credit Banner */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/15 rounded-xl p-3 mb-3.5 text-[11px] leading-relaxed text-slate-350 flex items-start gap-2.5">
              <span className="p-1 bg-indigo-500/10 text-indigo-400 rounded-md font-bold text-xs shrink-0">👨‍💻</span>
              <div>
                <span className="font-bold text-white block">Lê Văn Thắng dev</span>
                <span>Mọi đóng góp, báo cáo lỗi từ bạn là động lực to lớn giúp tôi tối ưu hóa ứng dụng này. Cảm ơn bạn!</span>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-800 mb-3.5 p-0.5 bg-slate-950 rounded-xl">
              <button
                onClick={() => setFeedbackTab('bug')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  feedbackTab === 'bug' 
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🐞 Báo cáo lỗi
              </button>
              <button
                onClick={() => setFeedbackTab('suggestion')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  feedbackTab === 'suggestion' 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                💡 Góp ý cải tiến
              </button>
              <button
                onClick={() => setFeedbackTab('contact')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  feedbackTab === 'contact' 
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📞 Liên hệ tác giả
              </button>
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto pr-1 flex-grow space-y-3.5">
              
              {feedbackTab === 'bug' && (
                <div className="space-y-3 animate-fadeIn">
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-1">
                    Mô tả lỗi hiển thị hoặc tính toán sai dưới đây. Bạn có thể đính kèm ảnh chụp màn hình (ảnh sẽ được tự động copy, bạn chỉ cần nhấn <strong>Ctrl + V</strong> để dán vào Gmail).
                  </p>
                  
                  <textarea
                    value={bugText}
                    onChange={(e) => setBugText(e.target.value)}
                    placeholder="Mô tả chi tiết lỗi bạn gặp phải..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/50 h-20 resize-none leading-relaxed"
                  />

                  {/* Nút gửi kèm ảnh lỗi */}
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer border border-slate-800 transition-colors shrink-0">
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
                      <div className="flex items-center gap-2 bg-rose-500/5 border border-rose-500/10 rounded-xl px-2.5 py-1.5 flex-grow min-w-0">
                        <img
                          src={URL.createObjectURL(bugImage)}
                          alt="preview"
                          className="w-6 h-6 rounded object-cover border border-rose-500/20 shrink-0"
                        />
                        <span className="text-[11px] text-slate-300 truncate flex-grow font-mono">{bugImage.name}</span>
                        
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
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-350 text-[10px] rounded font-semibold cursor-pointer transition-colors shrink-0"
                          title="Sao chép hình ảnh này vào bộ nhớ tạm"
                        >
                          Sao chép ảnh
                        </button>

                        <button
                          onClick={() => {
                            setBugImage(null);
                            setBugPngBlob(null);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic pl-1 flex-grow align-middle flex items-center h-8">
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
                      className={`flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer border border-slate-700 ${isSendingBug ? 'opacity-65 cursor-not-allowed' : ''}`}
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
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-1">
                    Đóng góp ý tưởng cải tiến ứng dụng. Bạn có thể đính kèm ảnh mô tả (ví dụ: ảnh vẽ phác họa hoặc screenshot minh họa).
                  </p>
                  
                  <textarea
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder="Mô tả ý tưởng cải tiến của bạn..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 h-20 resize-none leading-relaxed"
                  />

                  {/* Nút gửi kèm ảnh góp ý */}
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer border border-slate-800 transition-colors shrink-0">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
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
                      <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-2.5 py-1.5 flex-grow min-w-0">
                        <img
                          src={URL.createObjectURL(suggestionImage)}
                          alt="preview"
                          className="w-6 h-6 rounded object-cover border border-emerald-500/20 shrink-0"
                        />
                        <span className="text-[11px] text-slate-300 truncate flex-grow font-mono">{suggestionImage.name}</span>
                        
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
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-350 text-[10px] rounded font-semibold cursor-pointer transition-colors shrink-0"
                          title="Sao chép hình ảnh này vào bộ nhớ tạm"
                        >
                          Sao chép ảnh
                        </button>

                        <button
                          onClick={() => {
                            setSuggestionImage(null);
                            setSuggestionPngBlob(null);
                          }}
                          className="text-slate-500 hover:text-emerald-400 p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic pl-1 flex-grow align-middle flex items-center h-8">
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
                      className={`flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer border border-slate-700 ${isSendingSuggestion ? 'opacity-65 cursor-not-allowed' : ''}`}
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
                  <p className="text-xs text-slate-400 leading-relaxed pl-1">
                    Nếu bạn muốn trao đổi trực tiếp, báo cáo các lỗi nghiêm trọng hoặc hợp tác phát triển ứng dụng, hãy liên hệ trực tiếp với tôi qua hòm thư:
                  </p>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10">
                        <Mail className="w-5 h-5" />
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Hòm thư hỗ trợ</span>
                        <span className="text-xs font-bold text-white select-all">levanthang0166@gmail.com</span>
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

                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">CẢM ƠN BẠN ĐÃ ĐỒNG HÀNH & ỦNG HỘ!</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Chúc các bạn sinh viên Duy Tân (DTU) học tốt và đạt điểm GPA như mong đợi!</span>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-800 mt-3.5">
              <button 
                onClick={handleCloseFeedbackModal}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/95 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 min-w-[320px] max-w-[90vw]">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
          <p className="text-[11px] font-semibold leading-relaxed flex-grow text-slate-200">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:text-white p-0.5 rounded transition-colors shrink-0 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Backdrop for Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div 
          className="sm:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 animate-fadeIn"
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

    </div>
  );
}
