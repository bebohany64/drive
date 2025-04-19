
import React, { useRef, useEffect, useState } from "react";
import { Play, Download, Youtube } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title: string;
}

// دالة لاستخراج معرف فيديو يوتيوب
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function VideoPlayerFixed({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youTubeVideoId, setYouTubeVideoId] = useState<string | null>(null);

  useEffect(() => {
    const videoId = getYouTubeVideoId(src);
    if (videoId) {
      setIsYouTube(true);
      setYouTubeVideoId(videoId);
      setIsLoading(false); // مشغل يوتيوب يتعامل مع التحميل الخاص به
      setError(null);
      setIsPlaying(false); // لن نستخدم زر التشغيل المخصص ليوتيوب
    } else {
      // التعامل مع الفيديو العادي
      setIsYouTube(false);
      setYouTubeVideoId(null);
      setIsLoading(true);
      setError(null);
      setIsPlaying(false);
      
      if (!videoRef.current) return;
      const video = videoRef.current;
      
      const handleCanPlay = () => {
        setIsLoading(false);
      };
      
      const handleError = (e: any) => {
        setIsLoading(false);
        console.error("Video error:", e);
        setError("حدث خطأ في تحميل الفيديو، يرجى التحقق من الرابط أو الاتصال بالإنترنت");
      };
      
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("error", handleError);
      
      video.setAttribute("playsinline", "true");
      video.setAttribute("controls", "false"); // لن نعرض عناصر التحكم الافتراضية مبدئيًا
      video.muted = false;
      video.preload = "auto";
      video.load();
      
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("error", handleError);
      };
    }
  }, [src]);

  // تحسين وظيفة تشغيل الفيديو للموبايل (للفيديوهات غير اليوتيوب)
  const handlePlayVideo = () => {
    if (!videoRef.current || isYouTube) return;
    const video = videoRef.current;
    
    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        video.setAttribute("controls", "true"); // إظهار عناصر التحكم بعد التشغيل
        try {
          if (video.requestFullscreen) {
            video.requestFullscreen().catch(err => console.log("Failed fullscreen:", err));
          }
        } catch (e) {
          console.log("Fullscreen error:", e);
        }
      }).catch(e => {
        console.error("Failed to play video:", e);
        setError("فشل تشغيل الفيديو، يرجى النقر مرة أخرى أو التحقق من إعدادات المتصفح");
        video.muted = true;
        video.play().then(() => {
          video.muted = false;
          setIsPlaying(true);
          video.setAttribute("controls", "true");
        }).catch(err => console.error("Failed to play even when muted:", err));
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // تنزيل الفيديو (يعمل فقط للفيديوهات المباشرة، ليس يوتيوب)
  const handleDownload = () => {
    if (src && !isYouTube) {
      const link = document.createElement('a');
      link.href = src;
      link.download = `${title || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      const audio = new Audio("/click-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
    }
  };

  return (
    <div className="relative w-full aspect-video bg-physics-dark rounded-lg overflow-hidden">
      {isYouTube ? (
        <iframe
          className="absolute inset-0 w-full h-full border-0"
          src={`https://www.youtube.com/embed/${youTubeVideoId}?autoplay=0&rel=0`}
          title={title || "YouTube video player"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-physics-dark z-20">
              <div className="w-12 h-12 border-4 border-physics-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-physics-dark z-20">
              <div className="text-white text-center px-4">
                <p className="text-red-400 mb-2">{error}</p>
                <p className="text-sm">تأكد من صحة الرابط وأنه يدعم التشغيل المباشر</p>
                <button 
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    if (videoRef.current) {
                      videoRef.current.load();
                    }
                  }}
                  className="mt-2 goldBtn"
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            className="w-full h-full rounded-lg bg-black"
            controls={isPlaying} // التحكمات تظهر فقط بعد التشغيل
            title={title}
            playsInline
            preload="auto"
            onContextMenu={(e) => e.preventDefault()}
            style={{ display: isLoading || error ? 'none' : 'block' }}
          >
            <source src={src} /> {/* النوع يتم تحديده تلقائيًا عادةً */}
            متصفحك لا يدعم تشغيل الفيديو
          </video>
          
          {/* زر التشغيل للفيديو العادي */}
          {!isPlaying && !isLoading && !error && (
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 z-10"
              onClick={handlePlayVideo}
            >
              <div className="bg-primary bg-opacity-90 p-8 rounded-full hover:bg-primary transition-colors shadow-xl hover:scale-105 transform duration-200 flex items-center justify-center">
                <Play size={56} className="text-physics-navy ml-2" fill="#091138" />
              </div>
              
              <div className="absolute bottom-6 right-6 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="bg-physics-navy/90 hover:bg-physics-navy p-3 rounded-full text-physics-gold shadow-lg transition-all"
                  title="تحميل الفيديو"
                >
                  <Download size={24} />
                </button>
              </div>
              
              <div className="absolute bottom-6 left-6 text-lg text-white font-bold bg-physics-navy/90 hover:bg-physics-navy px-4 py-2 rounded-full shadow-lg transition-all">
                اضغط للتشغيل
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
