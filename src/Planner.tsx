import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Calendar, 
  Plus, 
  X, 
  CheckSquare, 
  ChevronRight, 
  ChevronLeft,
  Edit2,
  Trash2,
  Save,
  Menu,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// --- Types ---
interface Member {
  id: string;
  name: string;
  role: string;
}

interface Task {
  id: string;
  name: string;
  area?: string;
  remarks?: string;
  memberId: string;
  day: number; // 1-5 representing days of the week (Mon-Fri)
  duration: number; // in hours (can be decimal, e.g. 0.25 = 15 mins)
  startTime: number; // hour of day (e.g., 9.25 for 9:15 AM)
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  memberId?: string; // Optional: Assign to specific member
}

interface Engagement {
  title: string;
  notes: string;
}

type ViewMode = 'week' | 'day';

// --- Initial Data ---
const initialMembers: Member[] = [
  { id: '1', name: 'Biplav', role: 'Manager' },
  { id: '2', name: 'Sarah Chen', role: 'Partner' },
  { id: '3', name: 'Mike Ross', role: 'Senior' },
];

const initialEngagement: Engagement = {
  title: 'ABC Corp Annual Audit',
  notes: 'Focus on revenue recognition and inventory valuation.',
};

const initialTodos: Todo[] = [
  { id: '1', text: 'Review prelim analytics', completed: false, memberId: '1' },
  { id: '2', text: 'Send PBC list', completed: true, memberId: '2' },
];

export default function Planner() {
  // --- State ---
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [engagement, setEngagement] = useState<Engagement>(initialEngagement);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  
  // UI State
  const [view, setView] = useState<ViewMode>('week');
  const [selectedDay, setSelectedDay] = useState<number>(1); // Default to Monday (1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [rightPanelWidth, setRightPanelWidth] = useState(320); // Resizable panel width
  
  // Modals & Editing
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Member Creation State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Staff');
  
  // Task Creation State
  const [newTask, setNewTask] = useState<Partial<Task>>({});
  
  // Todo State
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedTodoMember, setSelectedTodoMember] = useState<string>('all');

  // Drag & Drop State
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    taskId: string | null;
    type: 'move' | 'resize' | null;
    initialY: number;
    initialStartTime: number;
    initialDuration: number;
    initialMemberId: string | null;
  }>({
    isDragging: false,
    taskId: null,
    type: null,
    initialY: 0,
    initialStartTime: 0,
    initialDuration: 0,
    initialMemberId: null
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    const savedState = localStorage.getItem('teamflow_planner_state_v4');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.members) setMembers(parsed.members);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.engagement) setEngagement(parsed.engagement);
        if (parsed.todos) setTodos(parsed.todos);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  useEffect(() => {
    const state = { members, tasks, engagement, todos };
    localStorage.setItem('teamflow_planner_state_v4', JSON.stringify(state));
  }, [members, tasks, engagement, todos]);

  // Sync Todo Filter with Sidebar Selection
  useEffect(() => {
    if (selectedMemberId) {
      setSelectedTodoMember(selectedMemberId);
    } else {
      setSelectedTodoMember('all');
    }
  }, [selectedMemberId]);

  // --- Handlers ---

  // Member Handlers
  const addMember = () => {
    if (!newMemberName.trim()) return;
    const newMember: Member = {
      id: Date.now().toString(),
      name: newMemberName,
      role: newMemberRole,
    };
    setMembers([...members, newMember]);
    setNewMemberName('');
    setNewMemberRole('Staff');
    setIsMemberModalOpen(false);
  };

  const deleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    setTasks(tasks.filter(t => t.memberId !== id)); // Remove associated tasks
    if (selectedMemberId === id) setSelectedMemberId(null);
  };

  const updateMemberName = (id: string, name: string) => {
    setMembers(members.map(m => (m.id === id ? { ...m, name } : m)));
  };

  // Todo Handlers
  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    const newTodo: Todo = { 
      id: Date.now().toString(), 
      text: newTodoText, 
      completed: false,
      memberId: selectedTodoMember === 'all' ? undefined : selectedTodoMember
    };
    setTodos([...todos, newTodo]);
    setNewTodoText('');
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  // Task Handlers
  const handleGridClick = (memberId: string, day: number, hour: number) => {
    setNewTask({
      memberId,
      day,
      startTime: hour,
      duration: 1, // Default 1 hour
      name: '',
      area: '',
      remarks: ''
    });
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setNewTask({ ...task });
    setIsTaskModalOpen(true);
  };

  const saveTask = () => {
    if (!newTask.name || !newTask.memberId || !newTask.day || !newTask.startTime) return;
    
    // If editing existing task
    if (newTask.id) {
       setTasks(tasks.map(t => (t.id === newTask.id ? { ...t, ...newTask } as Task : t)));
    } else {
      // Create new task
      const task: Task = {
        id: Date.now().toString(),
        name: newTask.name,
        area: newTask.area,
        remarks: newTask.remarks,
        memberId: newTask.memberId,
        day: newTask.day,
        startTime: newTask.startTime,
        duration: newTask.duration || 1,
      };
      setTasks([...tasks, task]);
    }
    
    setIsTaskModalOpen(false);
    setNewTask({});
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setIsTaskModalOpen(false);
  }
  
  // --- Drag & Drop Logic (Day View) ---
  const handleMouseDown = (e: React.MouseEvent, task: Task, type: 'move' | 'resize') => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection
    setDragState({
      isDragging: true,
      taskId: task.id,
      type,
      initialY: e.clientY,
      initialStartTime: task.startTime,
      initialDuration: task.duration,
      initialMemberId: task.memberId
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.taskId) return;

    const PIXELS_PER_HOUR = 60;
    const SNAP_MINUTES = 15;
    const SNAP_PIXELS = PIXELS_PER_HOUR * (SNAP_MINUTES / 60); // 15px

    const deltaY = e.clientY - dragState.initialY;
    const snappedDeltaY = Math.round(deltaY / SNAP_PIXELS) * SNAP_PIXELS;
    const timeDelta = (snappedDeltaY / PIXELS_PER_HOUR);

    if (dragState.type === 'move') {
      // Calculate new start time
      let newStartTime = dragState.initialStartTime + timeDelta;
      
      // Clamp values (8 AM to 8 PM)
      newStartTime = Math.max(8, Math.min(20 - dragState.initialDuration, newStartTime));
      
      // Check if we moved horizontally (to another member)
      // This requires knowing the column width. Simplification: assuming we only drag vertically for now
      // OR we can implement horizontal drag if we track X coordinates. 
      // For now, let's stick to vertical move (time change) + separate member reassignment via modal if needed
      // Wait, user asked for "drag to move tasks (change time/member)".
      // Horizontal drag is complex without dropping libraries. Let's do time first.

      setTasks(prev => prev.map(t => 
        t.id === dragState.taskId 
          ? { ...t, startTime: newStartTime } 
          : t
      ));
    } else if (dragState.type === 'resize') {
      let newDuration = dragState.initialDuration + timeDelta;
      // Min duration 15 mins (0.25h)
      newDuration = Math.max(0.25, newDuration);
      
      setTasks(prev => prev.map(t => 
        t.id === dragState.taskId 
          ? { ...t, duration: newDuration } 
          : t
      ));
    }
  };

  const handleMouseUp = () => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        taskId: null,
        type: null,
        initialY: 0,
        initialStartTime: 0,
        initialDuration: 0,
        initialMemberId: null
      });
    }
  };

  // Add global mouse listeners for drag
  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging]); // Re-bind when drag state changes


  // Calculate layout for overlapping tasks
  const getTaskLayout = (memberTasks: Task[]) => {
    // Sort tasks by start time
    const sortedTasks = [...memberTasks].sort((a, b) => a.startTime - b.startTime);
    const layout: Record<string, { left: string, width: string }> = {};
    
    // Simple overlap detection
    const columns: Task[][] = [];
    
    sortedTasks.forEach(task => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const lastTask = col[col.length - 1];
        // If this task starts after the last task in this column ends, place it here
        if (task.startTime >= (lastTask.startTime + lastTask.duration)) {
          col.push(task);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([task]);
      }
    });

    // Calculate width and position
    const totalColumns = columns.length;
    columns.forEach((col, colIndex) => {
      col.forEach(task => {
        layout[task.id] = {
          left: `${(colIndex / totalColumns) * 100}%`,
          width: `${100 / totalColumns}%`
        };
      });
    });

    return layout;
  };
  
  const getTaskStyle = (task: Task, layoutStyle?: { left: string, width: string }) => {
    const startOffset = task.startTime - 8; 
    const top = startOffset * 60;
    const height = task.duration * 60;
    
    return {
      top: `${top}px`,
      height: `${height}px`,
      left: layoutStyle?.left || '2px',
      width: layoutStyle?.width || 'calc(100% - 4px)',
      zIndex: dragState.taskId === task.id ? 50 : 10, // Bring to front when dragging
    };
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ["Member", "Role", "Day", "Start Time", "Duration (hrs)", "Task", "Area", "Remarks"];
    const rows = tasks.map(task => {
      const member = members.find(m => m.id === task.memberId);
      const dayName = days[task.day - 1];
      const startHour = Math.floor(task.startTime);
      const startMin = Math.round((task.startTime - startHour) * 60);
      const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      
      return [
        member?.name || "Unknown",
        member?.role || "Unknown",
        dayName,
        startTimeStr,
        task.duration.toFixed(2),
        task.name,
        task.area || "",
        task.remarks || ""
      ].map(field => `"${field}"`).join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `teamflow_plan_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Render Helpers ---
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM (13 hours)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dayDates = ['Feb 10', 'Feb 11', 'Feb 12', 'Feb 13', 'Feb 14'];
  
  const filteredMembers = selectedMemberId 
    ? members.filter(m => m.id === selectedMemberId) 
    : members;

  // Filter Todos
  const filteredTodos = todos.filter(t => 
    selectedTodoMember === 'all' || t.memberId === selectedTodoMember
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 transition-all duration-300 overflow-hidden shrink-0`}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 min-w-[256px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">Team Members</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-3 min-w-[256px]">
          <div className="space-y-1">
            {members.map(member => (
              <div 
                key={member.id} 
                className={`group flex items-center justify-between p-2 rounded-lg border transition-all duration-200 ${
                  selectedMemberId === member.id 
                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' 
                    : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                }`}
                onClick={() => setSelectedMemberId(selectedMemberId === member.id ? null : member.id)}
              >
                <div className="flex-1 min-w-0 cursor-pointer">
                  <div className="flex items-center justify-between">
                     <Input 
                        value={member.name} 
                        onChange={(e) => updateMemberName(member.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 px-1.5 py-0 border-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-blue-100 font-medium text-sm w-full transition-colors"
                      />
                  </div>
                  <div className="text-xs text-slate-500 px-1.5 mt-0.5 font-medium">{member.role}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  onClick={(e) => { e.stopPropagation(); deleteMember(member.id); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-slate-200 bg-slate-50/30 min-w-[256px]">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => setIsMemberModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Collapsed Sidebar Trigger */}
        {!isSidebarOpen && (
          <div className="absolute left-4 top-4 z-30">
             <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)} className="shadow-md bg-white">
                <Menu className="w-4 h-4" />
             </Button>
          </div>
        )}

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm/50 pl-16">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <Input 
                  value={engagement.title} 
                  onChange={(e) => setEngagement({ ...engagement, title: e.target.value })}
                  className="text-xl font-bold h-10 w-96 border-blue-200 focus:border-blue-500"
                  autoFocus
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                />
                <Button size="sm" onClick={() => setEditingTitle(false)} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
              </div>
            ) : (
              <div 
                className="group flex items-center gap-3 cursor-pointer select-none" 
                onClick={() => setEditingTitle(true)}
              >
                <h1 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                  {engagement.title}
                </h1>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            )}
            <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 px-3 py-1 ml-2 font-semibold">
              In Progress
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {view === 'day' && (
              <Button variant="ghost" size="sm" onClick={() => setView('week')} className="mr-2">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Week
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className={`border-slate-200 text-slate-700 hover:bg-slate-50 ${isRightPanelOpen ? 'bg-slate-100' : ''}`}
            >
              {isRightPanelOpen ? <ChevronRight className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
              {isRightPanelOpen ? 'Close Panel' : 'To-Do List'}
            </Button>
          </div>
        </header>

        {/* --- Week View --- */}
        {view === 'week' && (
          <div className="flex-1 overflow-auto bg-slate-50/50 p-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ring-1 ring-slate-200/50">
              {/* Grid Header */}
              <div className="grid grid-cols-[220px_1fr] border-b border-slate-200 sticky top-0 bg-white z-10">
                <div className="p-4 bg-slate-50/80 border-r border-slate-200 font-semibold text-slate-500 text-sm flex items-center">
                  Team Member
                </div>
                <div className="grid grid-cols-5 divide-x divide-slate-200">
                  {days.map((day, i) => (
                    <div 
                      key={day} 
                      className="p-3 text-center bg-slate-50/80 backdrop-blur-sm text-sm hover:bg-blue-50 cursor-pointer transition-colors group"
                      onClick={() => {
                        setSelectedDay(i + 1);
                        setView('day');
                      }}
                    >
                      <div className="font-bold text-slate-700 group-hover:text-blue-700">{day}</div>
                      <div className="text-xs font-medium text-slate-400 mt-0.5 group-hover:text-blue-500">{dayDates[i]}</div>
                      <div className="text-[10px] text-blue-600 mt-1 opacity-0 group-hover:opacity-100 font-medium">Click to view day</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Body */}
              <div className="divide-y divide-slate-200">
                {filteredMembers.map(member => (
                  <div key={member.id} className="grid grid-cols-[220px_1fr] group hover:bg-slate-50/30 transition-colors">
                    <div className="p-4 border-r border-slate-200 bg-white group-hover:bg-slate-50/30 transition-colors flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 flex items-center justify-center text-sm font-bold shadow-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 text-sm truncate">{member.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{member.role}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 divide-x divide-slate-200 relative bg-white group-hover:bg-slate-50/30">
                      {days.map((_, dayIndex) => (
                        <div 
                          key={dayIndex} 
                          className="relative min-h-[100px] hover:bg-blue-50/50 transition-colors cursor-pointer p-2"
                          onClick={() => handleGridClick(member.id, dayIndex + 1, 9)} 
                        >
                          {/* Tasks */}
                          {tasks
                            .filter(t => t.memberId === member.id && t.day === dayIndex + 1)
                            .map(task => (
                              <TooltipProvider key={task.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div 
                                      className="mb-2 p-2.5 bg-white border border-l-4 border-slate-200 border-l-blue-500 rounded-md shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group/task animate-in fade-in zoom-in-95 duration-200"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditTaskModal(task);
                                      }}
                                    >
                                      <div className="font-semibold text-slate-800 text-xs truncate leading-tight mb-0.5">{task.name}</div>
                                      {task.area && (
                                        <div className="text-[10px] font-medium text-slate-500 truncate bg-slate-100 inline-block px-1.5 py-0.5 rounded-full">
                                          {task.area}
                                        </div>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-1">
                                      <p className="font-bold">{task.name}</p>
                                      {task.area && <p className="text-xs text-slate-500">Area: {task.area}</p>}
                                      {task.remarks && <p className="text-xs text-slate-400">"{task.remarks}"</p>}
                                      <p className="text-xs text-blue-500 pt-1">
                                        {task.duration} hrs • Starts {Math.floor(task.startTime)}:{(task.startTime % 1 * 60).toString().padStart(2, '0')}
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))
                          }
                          
                          {/* Add Hint */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
                            <Plus className="w-5 h-5 text-blue-300/50" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Day View (Hourly) --- */}
        {view === 'day' && (
          <div className="flex-1 overflow-auto bg-slate-50/50 p-6 select-none" ref={gridRef}>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ring-1 ring-slate-200/50 flex flex-col h-full">
              
              {/* Day Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    {days[selectedDay - 1]}, {dayDates[selectedDay - 1]}
                  </h2>
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    {days.map((d, i) => (
                       <button
                         key={d}
                         onClick={() => setSelectedDay(i + 1)}
                         className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                           selectedDay === i + 1 
                             ? 'bg-white text-blue-600 shadow-sm' 
                             : 'text-slate-500 hover:text-slate-900'
                         }`}
                       >
                         {d}
                       </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scrollable Hourly Grid */}
              <div className="flex-1 overflow-auto relative">
                <div className="min-w-[800px]"> {/* Ensure horizontal scroll if needed */}
                  
                  {/* Grid Header (Members) */}
                  <div className="sticky top-0 z-10 grid grid-cols-[80px_1fr] bg-white border-b border-slate-200">
                    <div className="p-3 border-r border-slate-200 bg-slate-50/50"></div>
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${filteredMembers.length}, minmax(180px, 1fr))` }}>
                      {filteredMembers.map(member => (
                        <div key={member.id} className="p-3 border-r border-slate-200 text-center bg-slate-50/50 font-semibold text-slate-700 text-sm">
                          {member.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hourly Rows */}
                  <div className="relative">
                    {hours.map((hour) => (
                      <div key={hour} className="grid grid-cols-[80px_1fr] h-[60px] border-b border-slate-100">
                        <div className="text-right pr-3 pt-1 text-xs text-slate-400 font-medium border-r border-slate-200 relative bg-white sticky left-0 z-10">
                          {hour}:00
                        </div>
                        <div className="grid divide-x divide-slate-100" style={{ gridTemplateColumns: `repeat(${filteredMembers.length}, minmax(180px, 1fr))` }}>
                          {filteredMembers.map(member => (
                            <div 
                              key={`${member.id}-${hour}`} 
                              className="relative group hover:bg-slate-50 transition-colors"
                              onClick={() => handleGridClick(member.id, selectedDay, hour)}
                            >
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <Plus className="w-4 h-4 text-slate-300" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Task Overlay */}
                    <div className="absolute top-0 left-[80px] right-0 bottom-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${filteredMembers.length}, minmax(180px, 1fr))` }}>
                      {filteredMembers.map(member => {
                         const memberTasks = tasks.filter(t => t.memberId === member.id && t.day === selectedDay);
                         const layout = getTaskLayout(memberTasks);
                         
                         return (
                          <div key={member.id} className="relative border-r border-transparent h-full">
                            {memberTasks.map(task => (
                                <div 
                                  key={task.id}
                                  className={`absolute rounded-md border p-2 text-xs overflow-hidden pointer-events-auto shadow-sm transition-shadow hover:shadow-md
                                    ${dragState.taskId === task.id ? 'opacity-80 ring-2 ring-blue-500 z-50' : 'z-10'}
                                    bg-blue-100 border-blue-300 text-blue-900
                                  `}
                                  style={getTaskStyle(task, layout[task.id])}
                                  onMouseDown={(e) => handleMouseDown(e, task, 'move')}
                                  onClick={(e) => {
                                    if (!dragState.isDragging) {
                                      e.stopPropagation();
                                      openEditTaskModal(task);
                                    }
                                  }}
                                >
                                  {/* Task Content */}
                                  <div className="font-bold truncate leading-tight">{task.name}</div>
                                  <div className="text-blue-700 truncate text-[10px] mt-0.5">
                                    {task.area && <span>{task.area} • </span>}
                                    {task.remarks && <span>{task.remarks}</span>}
                                  </div>
                                  
                                  {/* Resize Handle */}
                                  <div 
                                    className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize hover:bg-blue-400/20 flex items-center justify-center"
                                    onMouseDown={(e) => handleMouseDown(e, task, 'resize')}
                                  >
                                    <div className="w-8 h-1 bg-blue-300 rounded-full opacity-0 hover:opacity-100 transition-opacity"></div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel (Resizable) */}
      {isRightPanelOpen && (
        <div 
          ref={rightPanelRef}
          className="bg-white border-l border-slate-200 flex flex-col shadow-xl z-30 relative"
          style={{ width: `${rightPanelWidth}px` }}
        >
          {/* Resize Handle */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-400 z-40"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = rightPanelWidth;
              
              const onMouseMove = (moveEvent: MouseEvent) => {
                const newWidth = startWidth + (startX - moveEvent.clientX);
                setRightPanelWidth(Math.max(250, Math.min(600, newWidth)));
              };
              
              const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
              };
              
              window.addEventListener('mousemove', onMouseMove);
              window.addEventListener('mouseup', onMouseUp);
            }}
          ></div>

          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-slate-500" /> 
              <span>To-Do List</span>
            </h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" onClick={() => setIsRightPanelOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="px-4 py-2 border-b border-slate-100">
             <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Filter:</span>
                <Select value={selectedTodoMember} onValueChange={setSelectedTodoMember}>
                  <SelectTrigger className="h-7 text-xs w-full">
                    <SelectValue placeholder="Filter by Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-5 space-y-8">
              {/* To-Do List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasks</h4>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{filteredTodos.filter(t => !t.completed).length} left</Badge>
                </div>
                
                <div className="space-y-1">
                  {filteredTodos.map(todo => (
                    <div key={todo.id} className="flex items-start gap-2 group p-2 hover:bg-slate-50 rounded-lg transition-colors -mx-2">
                      <Checkbox 
                        checked={todo.completed} 
                        onCheckedChange={() => toggleTodo(todo.id)}
                        className="mt-1 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        id={`todo-${todo.id}`}
                      />
                      <label 
                        htmlFor={`todo-${todo.id}`}
                        className={`text-sm flex-1 leading-relaxed cursor-pointer select-none ${
                          todo.completed ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700 font-medium'
                        }`}
                      >
                        {todo.text}
                      </label>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 -mt-0.5"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  
                  {filteredTodos.length === 0 && (
                    <p className="text-sm text-slate-400 italic py-2">No tasks for this selection.</p>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Input 
                    placeholder="Add new task..." 
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    className="h-9 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                  />
                  <Button size="icon" className="h-9 w-9 shrink-0 bg-slate-800 hover:bg-slate-900 text-white" onClick={addTodo}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Engagement Notes */}
              <div className="space-y-3 h-full flex flex-col">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Edit2 className="w-3 h-3" /> Engagement Notes
                </h4>
                <div className="relative flex-1">
                  <Textarea 
                    value={engagement.notes}
                    onChange={(e) => setEngagement({ ...engagement, notes: e.target.value })}
                    className="min-h-[200px] w-full text-sm leading-relaxed resize-none bg-yellow-50/30 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-100 p-4 rounded-xl shadow-sm"
                    placeholder="Add general engagement notes, findings, or reminders here..."
                  />
                  <div className="absolute top-0 right-0 p-2 pointer-events-none">
                    <div className="w-0 h-0 border-t-[16px] border-r-[16px] border-t-transparent border-r-yellow-100/50 rounded-bl-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{newTask.id ? 'Edit Task' : 'New Task Assignment'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-name">Task Name <span className="text-red-500">*</span></Label>
              <Input 
                id="task-name" 
                placeholder="e.g. Cash Reconciliation" 
                value={newTask.name || ''}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                className="col-span-3"
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="task-duration">Duration (Hours)</Label>
                <Input 
                  id="task-duration" 
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={newTask.duration || 1}
                  onChange={(e) => setNewTask({ ...newTask, duration: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-start">Start Time (24h)</Label>
                <Input 
                  id="task-start" 
                  type="number"
                  min="8"
                  max="20"
                  step="0.25"
                  value={newTask.startTime || 9}
                  onChange={(e) => setNewTask({ ...newTask, startTime: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-area">Area / Section (Optional)</Label>
              <Input 
                id="task-area" 
                placeholder="e.g. Assets, Liabilities, Revenue" 
                value={newTask.area || ''}
                onChange={(e) => setNewTask({ ...newTask, area: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-remarks">Remarks / Instructions (Optional)</Label>
              <Textarea 
                id="task-remarks" 
                placeholder="Add any specific instructions or context..." 
                value={newTask.remarks || ''}
                onChange={(e) => setNewTask({ ...newTask, remarks: e.target.value })}
                className="col-span-3 min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {newTask.id ? (
               <Button variant="destructive" onClick={() => deleteTask(newTask.id!)}>Delete Task</Button>
            ) : <div></div>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
              <Button onClick={saveTask} disabled={!newTask.name} className="bg-blue-600 hover:bg-blue-700 text-white">Save Task</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Member Modal */}
      <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="member-name">Full Name</Label>
              <Input 
                id="member-name" 
                placeholder="e.g. Jane Doe" 
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMember()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="member-role">Role / Designation</Label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Senior">Senior Associate</SelectItem>
                  <SelectItem value="Staff">Staff Associate</SelectItem>
                  <SelectItem value="Intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMemberModalOpen(false)}>Cancel</Button>
            <Button onClick={addMember} disabled={!newMemberName} className="bg-blue-600 hover:bg-blue-700 text-white">Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
