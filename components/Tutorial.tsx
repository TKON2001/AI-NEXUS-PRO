
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './Icons';

interface TutorialProps {
  isVisible: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: 'Chào mừng đến với AI Nexus!',
    content: 'Đây là một chuyến tham quan nhanh các tính năng chính để giúp bạn bắt đầu.',
  },
  {
    title: 'Bước 1: Thiết lập API Keys (Tùy chọn)',
    content: 'Để so sánh các mô hình từ OpenAI hoặc DeepSeek, hãy nhấp vào biểu tượng bánh răng ⚙️ để nhập khóa API tương ứng. Mô hình Gemini của Google đã được cấu hình sẵn.',
  },
  {
    title: 'Bước 2: Nhập Truy vấn',
    content: 'Bắt đầu bằng cách nhập câu hỏi hoặc yêu cầu của bạn vào ô văn bản lớn. Bạn có thể nhấn Enter (không Shift) để gửi.',
  },
  {
    title: 'Bước 3: So sánh các Mô hình',
    content: 'Chọn các mô hình bạn muốn so sánh bằng cách sử dụng các hộp kiểm. Phản hồi của chúng sẽ xuất hiện cạnh nhau để bạn dễ dàng đối chiếu.',
  },
  {
    title: 'Bước 4: Phân tích Kết quả',
    content: 'Sau khi có kết quả, đừng quên chấm sao để đánh giá chất lượng. Việc này sẽ giúp tạo ra biểu đồ Radar trực quan hóa hiệu suất của các mô hình.',
  },
  {
    title: 'Bước 5: Xem lại Lịch sử',
    content: 'Mọi kết quả của bạn sẽ được lưu tự động. Nhấp vào nút "Lịch sử & Phân tích" để xem lại, sắp xếp, và thậm chí xuất dữ liệu ra file CSV.',
  },
  {
    title: 'Bạn đã sẵn sàng!',
    content: 'Giờ bạn đã biết những điều cơ bản. Hãy đóng hướng dẫn này và bắt đầu khám phá sức mạnh của AI!',
  },
];


export const Tutorial: React.FC<TutorialProps> = ({ isVisible, onClose }) => {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (isVisible) {
            setStepIndex(0);
        }
    }, [isVisible]);

    const handleNext = () => {
        if (stepIndex < tutorialSteps.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (stepIndex > 0) {
            setStepIndex(stepIndex - 1);
        }
    };

    const handleClose = () => {
        // Mark tutorial as seen so it doesn't auto-open next time
        window.localStorage.setItem('aiNexusTutorialSeen', 'true');
        onClose();
    };

    if (!isVisible) return null;
    
    const currentStep = tutorialSteps[stepIndex];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] backdrop-blur-sm" onClick={handleClose}>
            <div 
                className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-gray-700 relative text-center p-6 sm:p-8"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={handleClose} className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                <h3 className="text-xl font-bold text-cyan-400 mb-3">{currentStep.title}</h3>
                <p className="text-gray-300 mb-6 min-h-[60px]">{currentStep.content}</p>

                <div className="flex justify-between items-center mt-4">
                    {stepIndex > 0 ? (
                        <button onClick={handlePrev} className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">
                            Quay lại
                        </button>
                    ) : (
                        <div style={{width: '85px'}} /> // Placeholder for alignment
                    )}

                    <div className="flex items-center gap-2">
                        {tutorialSteps.map((_, index) => (
                             <div key={index} className={`h-2 w-2 rounded-full transition-colors ${index === stepIndex ? 'bg-cyan-400' : 'bg-gray-600'}`}></div>
                        ))}
                    </div>

                    <button onClick={handleNext} className="px-4 py-2 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors">
                        {stepIndex === tutorialSteps.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
                    </button>
                </div>
            </div>
        </div>
    );
};