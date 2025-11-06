// PomoTime component
const PomoTime = () => {
  // Pomodoro Timer state
  const [timerMode, setTimerMode] = useState('focus');
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  // NEW: settings panel state
  const [showSettings, setShowSettings] = useState(false);
  const [tempFocus, setTempFocus] = useState(focusDuration);
  const [tempShort, setTempShort] = useState(shortBreakDuration);
  const [tempLong, setTempLong] = useState(longBreakDuration);

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

  // Task List functions (unchanged) ...
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

  // Quiz + Study Plan handlers (unchanged) ...
  const handleFileUpload = (e) => setQuizFile(e.target.files[0]);
  const generateQuizFromFile = async () => {
    const quiz = await generateQuiz(quizFile);
    setQuizData(quiz);
  };
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

  // NEW: open settings and load current values
  const openSettings = () => {
    setTempFocus(focusDuration);
    setTempShort(shortBreakDuration);
    setTempLong(longBreakDuration);
    setShowSettings(true);
  };

  // NEW: apply settings
  const applySettings = () => {
    // clamp sensible bounds (1–240 minutes)
    const clamp = (n) => Math.min(240, Math.max(1, Math.floor(n || 0)));
    const newFocus = clamp(tempFocus);
    const newShort = clamp(tempShort);
    const newLong = clamp(tempLong);

    setFocusDuration(newFocus);
    setShortBreakDuration(newShort);
    setLongBreakDuration(newLong);

    // if timer isn't running, sync remaining time for current mode
    if (!isTimerRunning) {
      if (timerMode === 'focus') setTimeRemaining(newFocus * 60);
      else if (timerMode === 'short-break') setTimeRemaining(newShort * 60);
      else setTimeRemaining(newLong * 60);
    }
    setShowSettings(false);
  };

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
          {/* Left column: Timer (top) and Tasks (bottom) */}
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 relative">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold">Pomodoro</h2>

                {/* UPDATED: settings button opens panel */}
                <button
                  title="Timer settings"
                  onClick={openSettings}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ⚙️
                </button>
              </div>

              {/* NEW: settings popover */}
              {showSettings && (
                <div className="absolute top-12 right-6 w-72 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl z-10">
                  <div className="text-sm font-semibold mb-3">Timer Settings (minutes)</div>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-300">Focus</span>
                      <input
                        type="number"
                        min={1}
                        max={240}
                        value={tempFocus}
                        onChange={(e) => setTempFocus(Number(e.target.value))}
                        className="w-24 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-right"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-300">Short break</span>
                      <input
                        type="number"
                        min={1}
                        max={240}
                        value={tempShort}
                        onChange={(e) => setTempShort(Number(e.target.value))}
                        className="w-24 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-right"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-300">Long break</span>
                      <input
                        type="number"
                        min={1}
                        max={240}
                        value={tempLong}
                        onChange={(e) => setTempLong(Number(e.target.value))}
                        className="w-24 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-right"
                      />
                    </label>

                    {/* quick presets */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[25, 45, 60, 75, 90].map((m) => (
                        <button
                          key={m}
                          onClick={() => setTempFocus(m)}
                          className="px-2 py-1 text-xs rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700"
                          title={`Set focus to ${m} min`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShowSettings(false)}
                        className="px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={applySettings}
                        className="px-3 py-1.5 rounded-md bg-accent hover:bg-accent-dark text-white text-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col items-center">
                <div className="relative">
                  <div className="w-56 h-56 rounded-full border-8 border-gray-700 flex items-center justify-center">
                    <div className="text-4xl font-bold">{minutes}:{seconds}</div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-xs text-gray-400 uppercase mt-36">
                      {timerMode === 'focus'
                        ? 'Focus'
                        : timerMode === 'short-break'
                        ? 'Short Break'
                        : 'Long Break'}
                    </div>
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

            {/* Tasks card ... (unchanged) */}
            {/* ... keep your existing Tasks, Quiz, Study Plan sections as-is */}







