import React from "react";
import { useState } from "react";

const Input = ({ taskList, setTaskList }) => {
    const [input, setInput] = useState("");

    const handleAddTask = (e) => {
        e.preventDefault();
        setTaskList([...taskList, input]);
        setInput("");
    };

    console.log(input);

    return (
        <>
            <form className="flex flex-row items-center gap-3">
                <input 
                    type="text"
                    style={{
                        backgroundColor: 'rgba(255, 182, 193, 0.5)', 
                        border: '1px solid #f8b8d9'
                    }}
                    className="border rounded-lg py-1.5 px-5"
                    placeholder="Digite os objetivos do dia"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button 
                    onClick={handleAddTask}
                    className="bg-pink-400 text-white py-2 px-3.5 rounded-lg font-semibold hover:opacity-70"
                >
                    Adicionar tarefa
                </button>
            </form>
        </>
    );
};

export default Input;
