
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// استيراد الصفحات
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import StudentsManagement from './pages/StudentsManagement';
import ParentsManagement from './pages/ParentsManagement';
import GradesManagement from './pages/GradesManagement';
import AttendanceRecordList from './pages/AttendanceRecordList';
import AttendanceRecord from './pages/AttendanceRecord';
import ScanCode from './pages/ScanCode';
import StudentCode from './pages/StudentCode';
import Videos from './pages/Videos';
import Books from './pages/Books';
import Grades from './pages/Grades';
import GradesByGrade from './pages/GradesByGrade';
import StudentGrades from './pages/StudentGrades';
import AttendanceListByGrade from './pages/AttendanceListByGrade';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import RequireAuth from './components/RequireAuth';

// الأنماط المخصصة
const applyCustomStyles = () => {
  const styleId = 'custom-app-styles';
  if (document.getElementById(styleId)) return; // منع إضافة الأنماط عدة مرات

  const tajawalFontStyles = document.createElement("style");
  tajawalFontStyles.id = styleId;
  tajawalFontStyles.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
    
    * {
      font-family: 'Tajawal', sans-serif;
    }
    
    .font-tajawal {
      font-family: 'Tajawal', sans-serif;
    }
    
    /* تجاوز تصميم الإخطارات - جعلها غير شفافة */
    .toast-root {
      background-color: #171E31 !important; /* لون داكن */
      border: 1px solid #D4AF37 !important; /* حد ذهبي */
      color: white !important;
      opacity: 1 !important;
    }
    
    /* إشعارات Sonner غير شفافة */
    [data-sonner-toast] {
      opacity: 1 !important;
      background-color: #171E31 !important; /* لون داكن */
      border: 1px solid #D4AF37 !important; /* حد ذهبي */
      color: white !important;
    }
    
    /* أزرار مستديرة */
    .goldBtn {
      background-color: #D4AF37; /* لون ذهبي */
      color: #091138; /* لون كحلي */
      padding: 0.5rem 1.5rem;
      border-radius: 9999px !important; /* جعلها مستديرة تمامًا */
      font-weight: bold;
      transition: background-color 0.3s ease;
    }
    .goldBtn:hover {
      background-color: #b89b30; /* درجة أغمق عند المرور */
    }
    .goldBtn:disabled {
      background-color: #a08c3a;
      cursor: not-allowed;
      opacity: 0.7;
    }
    
    /* حقول الإدخال */
    .inputField {
       background-color: #1c233e; /* كحلي أغمق قليلاً */
       border: 1px solid #3a4a8c; /* حد كحلي */
       color: white;
       padding: 0.75rem 1rem;
       border-radius: 8px;
       width: 100%;
    }
    .inputField:focus {
      outline: none;
      border-color: #D4AF37; /* حد ذهبي عند التركيز */
      box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.3); /* توهج ذهبي خفيف */
    }

    /* تحسين جودة الصورة */
    img {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
    
    /* مشغل فيديو أفضل */
    video {
      object-fit: contain;
    }
  `;
  document.head.appendChild(tajawalFontStyles);
};

function AppContent() {
  // تطبيق الأنماط عند تحميل المكون
  useEffect(() => {
    applyCustomStyles();
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes */}
      <Route element={<RequireAuth allowedRoles={['admin', 'parent', 'student']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/books" element={<Books />} />
          <Route path="/my-grades" element={<StudentGrades />} />
          <Route path="/my-code" element={<StudentCode />} />
      </Route>

      {/* Admin only routes */}
      <Route element={<RequireAuth allowedRoles={['admin']} />}>
          <Route path="/manage-students" element={<StudentsManagement />} />
          <Route path="/manage-parents" element={<ParentsManagement />} />
          <Route path="/manage-grades" element={<GradesManagement />} />
          <Route path="/attendance-records" element={<AttendanceRecordList />} />
          <Route path="/attendance-record/:id" element={<AttendanceRecord />} />
          <Route path="/scan-code" element={<ScanCode />} />
          <Route path="/grades-by-grade" element={<GradesByGrade />} />
          <Route path="/attendance-by-grade" element={<AttendanceListByGrade />} />
      </Route>

      {/* Parent only routes */}
      <Route element={<RequireAuth allowedRoles={['parent']} />}>
          <Route path="/child-grades" element={<Grades />} /> { /* مثال، قد تحتاج لتعديل */}
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
