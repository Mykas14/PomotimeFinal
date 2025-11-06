// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaPlay, FaPause, FaRedo, FaSkullCrossbones, FaSun, FaUserCircle } from 'react-icons/fa';
import { MdFileUpload } from 'react-icons/md';
import { GiTomato } from 'react-icons/gi';
import { generateQuiz, generateStudyPlan } from './ai-utils';

const AccentButton = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`bg-accent hover:bg-accent-dark text-white font-medium rounded-md px-5 py-2 flex items-center gap-2 ${className}`}
  >
    {children}
  </button>
);

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
  const [newTaskText, setNewTaskText] = useState('');

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
  const addTask = (taskText) => {
    if (!taskText || !taskText.trim()) return;
    const newTask = { id: Date.now(), text: taskText.trim(), completed: false };
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
    setNewTaskText('');
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

  // Study Plan Generator functions
  const generateStudyPlanFromQuiz = async () => {
    if (!quizData) return;
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
        setTimeRemaining((prevTime) => Math.max(prevTime - 1, 0));
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

  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
  const seconds = String(timeRemaining % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white">
            <GiTomato />
          </div>
          <h1 className="text-xl font-semibold">PomoTime</h1>
        </div>
        <div className="flex items-center gap-4 text-gray-300">
          <button title="Toggle theme" className="p-2 rounded-md hover:bg-gray-800"><FaSun /></button>
          <button title="Account" className="p-2 rounded-md hover:bg-gray-800"><FaUserCircle /></button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Timer (top) and Tasks (bottom) stacked */}
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold">Pomodoro</h2>
                <button className="text-gray-400 hover:text-gray-200">⚙️</button>
              </div>

              <div className="mt-6 flex flex-col items-center">
                <div className="relative">
                  <div className="w-56 h-56 rounded-full border-8 border-gray-700 flex items-center justify-center">
                    <div className="text-4xl font-bold">{minutes}:{seconds}</div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-xs text-gray-400 uppercase mt-36">{timerMode === 'focus' ? 'Focus' : timerMode === 'short-break' ? 'Short Break' : 'Long Break'}</div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  {isTimerRunning ? (
                    <AccentButton onClick={pauseTimer}><FaPause /> Pause</AccentButton>
                  ) : (
                    <AccentButton onClick={startTimer}><FaPlay /> Start</AccentButton>
                  )}

                  <button onClick={resetTimer} className="p-3 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700">
                    <FaRedo />
                  </button>
                  <button onClick={skipTimer} className="p-3 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700">
                    <FaSkullCrossbones />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">My Tasks</h3>
              <div className="flex gap-3">
                <input
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-4 py-2 focus:outline-none"
                  placeholder="Add a new task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addTask(newTaskText);
                  }}
                />
                <button
                  onClick={() => addTask(newTaskText)}
                  className="w-10 h-10 rounded-md bg-accent flex items-center justify-center text-white"
                >
                  +
                </button>
              </div>

              <div className="mt-6">
                {tasks.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No tasks yet. Add one to get started!</div>
                ) : (
                  <DragDropContext onDragEnd={reorderTasks}>
                    <Droppable droppableId="tasks">
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                          {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={task.completed} onChange={() => toggleTaskCompletion(task.id)} />
                                    <span className={`${task.completed ? 'line-through text-gray-500' : ''}`}>{task.text}</span>
                                  </div>
                                  <button onClick={() => deleteTask(task.id)} className="text-red-400"><FaSkullCrossbones /></button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Quiz (top) and Study Plan (bottom) stacked */}
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">AI Quiz Generator</h3>
              <p className="text-sm text-gray-400 mb-4">Upload study material to instantly create a quiz.</p>

              <label htmlFor="file-upload" className="block">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <MdFileUpload className="text-3xl text-gray-400" />
                    <div className="text-gray-300">Drag & drop a file here or click to upload</div>
                    <div className="text-xs text-gray-500">(PDF, DOCX, TXT supported)</div>
                    <div className="mt-4">
                      <input id="file-upload" type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                      <button onClick={generateQuizFromFile} className="px-4 py-2 rounded-md bg-gray-900 border border-gray-700 text-gray-200">Choose File</button>
                    </div>
                  </div>
                </div>
              </label>

              {quizData && (
                <div className="mt-4 bg-gray-900 border border-gray-700 rounded-md p-4">
                  <h4 className="font-semibold">{quizData.title}</h4>
                  <div className="mt-2 space-y-3">
                    {quizData.questions.map((q, qi) => (
                      <div key={qi} className="bg-gray-800 p-3 rounded-md border border-gray-700">
                        <div className="font-medium">{q.question}</div>
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-3">
                              <input type="radio" name={`q-${qi}`} checked={opt === q.answer} readOnly />
                              <input className="bg-gray-900 border border-gray-700 rounded-md px-2 py-1 w-full" value={opt} onChange={() => {}} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">AI Study Plan Generator</h3>
              <p className="text-sm text-gray-400 mb-4">Enter a topic and duration to generate a personalized study schedule.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={studyTopic}
                    onChange={(e) => setStudyTopic(e.target.value)}
                    placeholder="e.g., 'React Hooks'"
                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2"
                  />
                </div>
                <div className="md:col-span-1">
                  <input
                    type="number"
                    value={studyDuration}
                    onChange={(e) => setStudyDuration(Number(e.target.value))}
                    min={1}
                    max={30}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-center"
                  />
                </div>
              </div>

              <div className="mt-4">
                <AccentButton onClick={quizData ? generateStudyPlanFromQuiz : generateStudyPlanFromTopic} className="w-full">
                  📅 Generate Plan
                </AccentButton>
              </div>

              {studyPlan.length > 0 && (
                <div className="mt-4 space-y-3">
                  {studyPlan.map((day, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-700 rounded-md p-3">
                      <div className="font-semibold">Day {i + 1} — {day.topic}</div>
                      <ul className="list-disc pl-6 mt-2 text-sm text-gray-300">
                        {day.activities.map((act, ai) => (
                          <li key={ai}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PomoTime;
