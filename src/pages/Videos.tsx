
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, FilePlus, Calendar, Search, Play, Edit, Trash, X, Check } from "lucide-react";
import { VideoPlayerFixed } from "@/components/VideoPlayerFixed";

// دالة لتنسيق التاريخ
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return "تاريخ غير صالح";
  }
};

// دالة لتنسيق اسم الصف
const formatGrade = (grade: string) => {
  switch (grade) {
    case "first": return "الصف الأول الثانوي";
    case "second": return "الصف الثاني الثانوي";
    case "third": return "الصف الثالث الثانوي";
    default: return "غير محدد";
  }
};

const Videos = () => {
  const navigate = useNavigate();
  const { getAllVideos, getVideosByGrade, addVideo, deleteVideo, updateVideo } = useData();
  const { currentUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<"all" | "first" | "second" | "third">("all");
  
  // حالة النموذج
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [grade, setGrade] = useState<"first" | "second" | "third">("first");
  
  // حالة التعديل
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editGrade, setEditGrade] = useState<"first" | "second" | "third">("first");
  
  const videos = selectedGrade === "all" 
    ? getAllVideos() 
    : getVideosByGrade(selectedGrade);
    
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) { 
      const audio = new Audio("/error-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
      return;
    }
    addVideo(title, url, grade);
    setTitle("");
    setUrl("");
    setGrade("first");
    setShowAddForm(false);
  };
  
  const handleEditVideo = (e: React.FormEvent) => {
    e.preventDefault();
    updateVideo(editId, editTitle, editUrl, editGrade);
    setShowEditForm(false);
  };
  
  const handleDeleteVideo = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الفيديو؟")) {
      deleteVideo(id);
      if (selectedVideo) {
        setSelectedVideo(null);
      }
    }
  };
  
  const openEditForm = (video: any) => {
    setEditId(video.id);
    setEditTitle(video.title);
    setEditUrl(video.url);
    setEditGrade(video.grade);
    setShowEditForm(true);
  };
  
  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhoneContact />
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-physics-gold hover:opacity-80"
          >
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
        <Logo />
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto"> {/* عودة للعرض الأقصى السابق */} 
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-physics-gold">الفيديوهات التعليمية</h1>
            {currentUser?.role === "admin" && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="goldBtn flex items-center gap-2 w-full md:w-auto justify-center"
              >
                <FilePlus size={18} />
                <span>إضافة فيديو</span>
              </button>
            )}
          </div>
          
          {/* التصفية والبحث */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-physics-dark p-4 rounded-lg shadow-sm">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-300 mb-1">تصفية حسب الصف</label>
              <select
                className="inputField"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value as "all" | "first" | "second" | "third")}
              >
                <option value="all">جميع الصفوف</option>
                <option value="first">الصف الأول الثانوي</option>
                <option value="second">الصف الثاني الثانوي</option>
                <option value="third">الصف الثالث الثانوي</option>
              </select>
            </div>
            
            <div className="relative w-full md:w-2/3">
              <label className="block text-sm font-medium text-gray-300 mb-1">البحث عن فيديو</label>
              <Search className="absolute right-4 top-1/2 mt-3 transform -translate-y-1/2 text-physics-gold" size={20} />
              <input
                type="text"
                className="inputField pr-12"
                placeholder="اكتب عنوان الفيديو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* الفيديو المحدد */}
          {selectedVideo && (
            <div className="bg-physics-dark rounded-lg overflow-hidden mb-6 shadow-md">
              <VideoPlayerFixed 
                src={selectedVideo} 
                title={videos.find(v => v.url === selectedVideo)?.title || ""} 
              />
              <div className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <h2 className="text-xl font-bold text-white mb-2 md:mb-0">
                    {videos.find(v => v.url === selectedVideo)?.title || ""}
                  </h2>
                  
                  <div className="flex gap-2">
                   {currentUser?.role === "admin" && (
                      <>
                        <button 
                          onClick={() => {
                            const video = videos.find(v => v.url === selectedVideo);
                            if (video) openEditForm(video);
                          }}
                          className="p-2 text-physics-gold hover:text-white transition-colors"
                          title="تعديل"
                        >
                          <Edit size={18} />
                        </button>
                        
                        <button 
                          onClick={() => {
                            const video = videos.find(v => v.url === selectedVideo);
                            if (video) handleDeleteVideo(video.id);
                          }}
                          className="p-2 text-red-500 hover:text-red-400 transition-colors"
                          title="حذف"
                        >
                          <Trash size={18} />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => setSelectedVideo(null)}
                      className="text-gray-400 hover:text-white py-2 px-4 rounded-md transition-colors"
                    >
                      إغلاق المشغل
                    </button>
                   </div>
                </div>
              </div>
            </div>
          )}
          
          {/* قائمة الفيديوهات - التصميم الأصلي للقائمة */} 
          {!selectedVideo && (
            <div className="bg-physics-dark rounded-lg overflow-hidden shadow-sm">
              {filteredVideos.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white text-lg">لا توجد فيديوهات متاحة.</p>
                </div>
              ) : (
                <div className="divide-y divide-physics-navy">
                  {filteredVideos.map((video) => (
                    <div 
                      key={video.id} 
                      className="p-4 hover:bg-physics-navy/30 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        {/* زر التشغيل */} 
                        <div 
                          className="mr-4 bg-physics-navy p-3 rounded-full cursor-pointer hover:bg-physics-gold/20"
                          onClick={() => setSelectedVideo(video.url)}
                          title="تشغيل الفيديو"
                        >
                          <Play size={24} className="text-physics-gold" />
                        </div>
                        {/* تفاصيل الفيديو */} 
                        <div className="flex-1 cursor-pointer" onClick={() => setSelectedVideo(video.url)}>
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-white hover:text-physics-gold transition-colors">{video.title}</h3>
                            {/* يمكن إزالة علامة الصح إذا لم تكن ضرورية */}
                            {/* <div className="mr-2 text-green-500"><Check size={16} /></div> */} 
                          </div>
                          <div className="flex items-center text-sm text-gray-300 mt-1">
                            <Calendar size={14} className="ml-1 text-physics-gold/70" />
                            <span>{formatDate(video.uploadDate)}</span>
                            <span className="mx-2">•</span>
                            <span>{formatGrade(video.grade)}</span>
                          </div>
                        </div>
                        
                        {/* أزرار الإدارة */} 
                        {currentUser?.role === "admin" && (
                          <div className="flex">
                            <button 
                              onClick={() => openEditForm(video)}
                              className="p-2 text-gray-400 hover:text-physics-gold transition-colors"
                              title="تعديل"
                            >
                              <Edit size={18} />
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="حذف"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* نموذج إضافة فيديو */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-physics-gold">إضافة فيديو جديد</h2>
              <button type="button" className="text-gray-400 hover:text-white" onClick={() => setShowAddForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">عنوان الفيديو</label>
                <input type="text" className="inputField" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">رابط الفيديو (يوتيوب، إلخ)</label>
                <input type="text" className="inputField" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">الصف الدراسي</label>
                <select className="inputField" value={grade} onChange={(e) => setGrade(e.target.value as "first" | "second" | "third")} required>
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="goldBtn flex-1" disabled={!url || !title}>إضافة الفيديو</button>
                <button type="button" className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1 border border-gray-600 hover:bg-gray-700 transition-colors" onClick={() => setShowAddForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* نموذج تعديل الفيديو */}
      {showEditForm && (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-physics-gold">تعديل الفيديو</h2>
                <button type="button" className="text-gray-400 hover:text-white" onClick={() => setShowEditForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleEditVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">عنوان الفيديو</label>
                <input type="text" className="inputField" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">رابط الفيديو</label>
                <input type="text" className="inputField" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} required placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">الصف الدراسي</label>
                <select className="inputField" value={editGrade} onChange={(e) => setEditGrade(e.target.value as "first" | "second" | "third")} required>
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="goldBtn flex-1">حفظ التغييرات</button>
                <button type="button" className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1 border border-gray-600 hover:bg-gray-700 transition-colors" onClick={() => setShowEditForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
