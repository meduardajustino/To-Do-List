import { useState } from "react";

const Board = ({ task, index, taskList, setTaskList }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleDelete = () => {
    const removeIndex = taskList.indexOf(task);
    const newTasks = taskList.filter((_, idx) => idx !== removeIndex);
    setTaskList(newTasks);
  };

  const toggleComplete = () => {
    setIsCompleted(!isCompleted);
  };

  return (
    <div
      className={`w-1/2 max-w-xl flex items-center justify-between border rounded-xl px-4 py-1 text-lg md:px-6 ${
        isCompleted ? "line-through text-gray-500" : ""
      }`}
    >
      <p onClick={toggleComplete} className="cursor-pointer flex-grow text-left">
        {task}
      </p>
      <button
        onClick={handleDelete}
        className="bg-red-400 hover:bg-red-500 text-white rounded-lg py-1 px-2 ml-4"
      >
        x
      </button>
    </div>
  );
};

export default Board;