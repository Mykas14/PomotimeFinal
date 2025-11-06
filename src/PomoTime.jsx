// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaPlay, FaPause, FaRedo, FaSkullCrossbones } from 'react-icons/fa';
import { MdFileUpload } from 'react-icons/md';
import { GiTomato } from 'react-icons/gi';
import { generateQuiz, generateStudyPlan } from './ai-utils';

// PomoTime component
const PomoTime = () => {
  // Pomodoro Timer state
  const [timerMode, setTimerMode] = useState('focus');
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  // Task List state
  const [tasks, setTasks] = useState(
    JSON.parse(localStorage.getItem('tasks')) || []
  );

  // Quiz Generator state
  const [quizData, setQuizData] = useState(null);
  const [quizFile, setQuizFile] = useState(null);

  // Study Plan Generator state
  const [studyPlan, setStudyPlan] = useState([]);
  const [studyTopic, setStudyTopic] = useState('');
  const [studyDuration, setStudyDuration] = useState(7);

  // Timer functions
  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(focusDuration * 60);
    setTimerMode('focus');
  };
  const skipTimer = () => {
    if (timerMode === 'focus') {
      setTimeRemaining(shortBreakDuration * 60);
      setTimerMode('short-break');
    } else {
      setTimeRemaining(focusDuration * 60);
      setTimerMode('focus');
    }
  };

  // Task List functions
  const addTask = (task) => {
    const newTask = { id: Date.now(), text: task, completed: false };
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
  };
  const deleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };
  const toggleTaskCompletion = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };
  const reorderTasks = (result) => {
    if (!result.destination) return;
    const updatedTasks = Array.from(tasks);
    const [removed] = updatedTasks.splice(result.source.index, 1);
    updatedTasks.splice(result.destination.index, 0, removed);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  // Quiz Generator functions
  const handleFileUpload = (event) => {
    setQuizFile(event.target.files[0]);
  };
  const generateQuizFromFile = async () => {
    const quiz = await generateQuiz(quizFile);
    setQuizData(quiz);
  };
  const updateQuizData = (field, value, questionIndex = null) => {
    if (questionIndex !== null) {
      setQuizData((prevQuiz) => ({
        ...prevQuiz,
        questions: prevQuiz.questions.map((question, index) =>
          index === questionIndex ? { ...question, [field]: value } : question
        ),
      }));
    } else {
      setQuizData((prevQuiz) => ({ ...prevQuiz, [field]: value }));
    }
  };

  // Study Plan Generator functions
  const generateStudyPlanFromQuiz = async () => {
    const plan = await generateStudyPlan(quizData.title, studyDuration);
    setStudyPlan(plan);
    setStudyTopic(quizData.title);
  };
  const generateStudyPlanFromTopic = async () => {
    const plan = await generateStudyPlan(studyTopic, studyDuration);
    setStudyPlan(plan);
  };

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Timer mode effect
  useEffect(() => {
    if (timeRemaining === 0) {
      if (timerMode === 'focus') {
        setTimeRemaining(shortBreakDuration * 60);
        setTimerMode('short-break');
      } else if (timerMode === 'short-break') {
        setTimeRemaining(longBreakDuration * 60);
        setTimerMode('long-break');
      } else {
        setTimeRemaining(focusDuration * 60);
        setTimerMode('focus');
      }
      setIsTimerRunning(false);
    }
  }, [timeRemaining, timerMode, focusDuration, shortBreakDuration, longBreakDuration]);

  // compute total duration for current mode (in seconds)
  const currentModeDurationSeconds =
    (timerMode === 'focus'
      ? focusDuration
      : timerMode === 'short-break'
      ? shortBreakDuration
      : longBreakDuration) * 60;

  // Render the PomoTime application
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Pomodoro Timer */}
      <div className="bg-gray-100 dark:bg-gray-800 p-8 flex-1 flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <div className="text-6xl font-bold text-gray-800 dark:text-gray-200">
            {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
          </div>
          <div
            className={`absolute top-0 left-0 w-full h-full rounded-full transform -rotate-90 transition-all duration-300 ease-in-out ${
              timerMode === 'focus'
                ? 'bg-red-500'
                : timerMode === 'short-break'
                ? 'bg-green-500'
                : 'bg-blue-500'
            }`}
            style={{
              clipPath: `circle(${(timeRemaining / Math.max(1, currentModeDurationSeconds)) * 100}% at 50% 50%)`,
            }}
          />
        </div>
        <div className="mt-8 flex space-x-4">
          {isTimerRunning ? (
            <button onClick={pauseTimer}>
              <FaPause className="text-2xl text-gray-800 dark:text-gray-200" />
            </button>
          ) : (
            <button onClick={startTimer}>
              <FaPlay className="text-2xl text-gray-800 dark:text-gray-200" />
            </button>
          )}
          <button onClick={resetTimer}>
            <FaRedo className="text-2xl text-gray-800 dark:text-gray-200" />
          </button>
          <button onClick={skipTimer}>
            <FaSkullCrossbones className="text-2xl text-gray-800 dark:text-gray-200" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-gray-200 dark:bg-gray-700 p-8 flex-1 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Task List</h2>
        <DragDropContext onDragEnd={reorderTasks}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        className={`flex items-center justify-between bg-white dark:bg-gray-800 p-4 mb-2 rounded-md shadow-md ${
                          task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompletion(task.id)}
                            className="mr-4"
                          />
                          <span>{task.text}</span>
                        </div>
                        <button onClick={() => deleteTask(task.id)}>
                          <FaSkullCrossbones className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Add a new task"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addTask(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full bg-white dark:bg-gray-800 p-2 rounded-md shadow-md"
          />
        </div>
      </div>

      {/* Quiz Generator */}
      <div className="bg-gray-100 dark:bg-gray-800 p-8 flex-1 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">AI Quiz Generator</h2>
        <div className="flex items-center justify-center mb-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md flex items-center">
              <MdFileUpload className="text-2xl mr-2" />
              <span>Upload File</span>
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        <button
          onClick={generateQuizFromFile}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md mb-4"
        >
          Generate Quiz
        </button>
        {quizData && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
            <h3 className="text-xl font-bold mb-2">{quizData.title}</h3>
            {quizData.questions.map((question, index) => (
              <div key={index} className="mb-4">
                <p className="font-bold">{question.question}</p>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      checked={option === question.answer}
                      onChange={() => updateQuizData('answer', option, index)}
                      className="mr-2"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        updateQuizData('options', e.target.value, index)
                      }
                      className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-md"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Plan Generator */}
      <div className="bg-gray-200 dark:bg-gray-700 p-8 flex-1 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">AI Study Plan Generator</h2>
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={studyTopic}
            onChange={(e) => setStudyTopic(e.target.value)}
            placeholder="Enter a topic"
            className="w-full bg-white dark:bg-gray-800 p-2 rounded-md shadow-md mr-4"
          />
          <input
            type="number"
            value={studyDuration}
            onChange={(e) => setStudyDuration(Number(e.target.value))}
            min="1"
            max="30"
            placeholder="Duration (days)"
            className="w-32 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md"
          />
        </div>
        <button
          onClick={
            quizData
              ? generateStudyPlanFromQuiz
              : generateStudyPlanFromTopic
          }
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md mb-4"
        >
          Generate Study Plan
        </button>
        {studyPlan.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
            <h3 className="text-xl font-bold mb-2">
              {quizData ? quizData.title : studyTopic}
            </h3>
            <div className="space-y-4">
              {studyPlan.map((day, index) => (
                <div key={index}>
                  <h4 className="font-bold">Day {index + 1}</h4>
                  <p>{day.topic}</p>
                  <ul className="list-disc pl-6">
                    {day.activities.map((activity, activityIndex) => (
                      <li key={activityIndex}>{activity}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomoTime;