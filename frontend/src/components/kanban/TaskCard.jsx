import React from 'react';

const TaskCard = ({ task, userRole, onEdit }) => {
  return (
    <div className="bg-white p-4 rounded shadow-sm border border-gray-200 hover:shadow-md transition">
      <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 text-xs">
        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
          @{task.assignee?.name || 'Unassigned'}
        </span>
        
        {userRole === 'Admin' && (
          <button onClick={() => onEdit(task)} className="text-blue-500 hover:text-blue-700 font-medium">
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;