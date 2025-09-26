import React from 'react';
import type { Priority, TaskMode } from '../types';

interface AdvancedModeDashboardProps {
  priority: Priority;
  setPriority: (priority: Priority) => void;
  taskMode: TaskMode;
  setTaskMode: (taskMode: TaskMode) => void;
}

export const AdvancedModeDashboard: React.FC<AdvancedModeDashboardProps> = ({ priority, setPriority, taskMode, setTaskMode }) => {
  return (
    <div className="flex-grow flex items-center gap-4 p-2 bg-gray-700/50 rounded-lg flex-wrap">
      <div className="flex items-center gap-2">
        <label htmlFor="task-select" className="font-semibold text-gray-300 ml-2">Tác vụ:</label>
        <select
          id="task-select"
          value={taskMode}
          onChange={(e) => setTaskMode(e.target.value as TaskMode)}
          className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2"
        >
          <option value="routing">Định tuyến Thông minh</option>
          <option value="debate">Tranh luận & Tổng hợp AI</option>
        </select>
      </div>

      {taskMode === 'routing' && (
        <div className="flex items-center gap-2">
            <label htmlFor="priority-select" className="font-semibold text-gray-300 ml-2">Tối ưu cho:</label>
            <select
                id="priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2"
            >
                <option value="quality">Chất lượng tốt nhất</option>
                <option value="cost">Chi phí thấp nhất</option>
                <option value="speed">Phản hồi nhanh nhất</option>
            </select>
        </div>
      )}
    </div>
  );
};