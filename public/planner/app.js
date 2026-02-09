/**
 * TeamFlow MVP Planner
 * Vanilla JS implementation with drag-and-drop, resize, and LocalStorage
 */

// Configuration
const CONFIG = {
  startHour: 8,
  endHour: 18,
  hourHeight: 48,
  dayWidth: 180,
  storageKey: 'teamflow_mvp_data'
};

// Color mapping
const COLORS = {
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#a855f7',
  amber: '#f59e0b',
  red: '#ef4444',
  cyan: '#06b6d4'
};

// Phase labels
const PHASES = {
  planning: 'Planning & Risk Assessment',
  control: 'Control Testing',
  substantive: 'Substantive Procedures',
  conclusion: 'Conclusion & Reporting'
};

// Default data
const defaultData = {
  members: [
    { id: 'm1', name: 'Sarah Chen', role: 'Partner', color: 'blue', initials: 'SC' },
    { id: 'm2', name: 'Mike Ross', role: 'Manager', color: 'green', initials: 'MR' },
    { id: 'm3', name: 'Emma Davis', role: 'Senior', color: 'purple', initials: 'ED' },
    { id: 'm4', name: 'James Wilson', role: 'Staff', color: 'amber', initials: 'JW' }
  ],
  tasks: [
    { id: 't1', memberId: 'm1', day: 0, start: 9, duration: 4, title: 'Risk Assessment', phase: 'planning' },
    { id: 't2', memberId: 'm2', day: 0, start: 10, duration: 6, title: 'Control Testing', phase: 'control' },
    { id: 't3', memberId: 'm3', day: 1, start: 9, duration: 5, title: 'Substantive Procedures', phase: 'substantive' },
    { id: 't4', memberId: 'm4', day: 1, start: 13, duration: 4, title: 'Documentation', phase: 'conclusion' },
    { id: 't5', memberId: 'm1', day: 2, start: 14, duration: 3, title: 'Partner Review', phase: 'planning' },
    { id: 't6', memberId: 'm2', day: 3, start: 9, duration: 8, title: 'Fieldwork', phase: 'substantive' },
    { id: 't7', memberId: 'm3', day: 4, start: 10, duration: 5, title: 'Analytics', phase: 'substantive' }
  ],
  weekStart: getWeekStart(new Date())
};

// State
let state = {
  ...defaultData,
  selectedMember: null,
  isManagerView: false,
  dragging: null,
  resizing: null,
  dragOffset: { x: 0, y: 0 }
};

// Utility Functions
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// LocalStorage Functions
function saveToStorage() {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify({
      members: state.members,
      tasks: state.tasks,
      weekStart: state.weekStart.toISOString()
    }));
  } catch (e) {
    console.warn('Failed to save to LocalStorage:', e);
  }
}

function loadFromStorage() {
  try {
    const data = localStorage.getItem(CONFIG.storageKey);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        members: parsed.members || defaultData.members,
        tasks: parsed.tasks || defaultData.tasks,
        weekStart: new Date(parsed.weekStart) || defaultData.weekStart
      };
    }
  } catch (e) {
    console.warn('Failed to load from LocalStorage:', e);
  }
  return defaultData;
}

// DOM Elements
const elements = {
  teamList: document.getElementById('teamList'),
  timelineHeader: document.getElementById('timelineHeader'),
  timelineGrid: document.getElementById('timelineGrid'),
  totalHours: document.getElementById('totalHours'),
  budgetRemaining: document.getElementById('budgetRemaining'),
  managerToggle: document.getElementById('managerToggle'),
  exportBtn: document.getElementById('exportBtn'),
  addMemberBtn: document.getElementById('addMemberBtn'),
  taskModal: document.getElementById('taskModal'),
  memberModal: document.getElementById('memberModal'),
  taskForm: document.getElementById('taskForm'),
  memberForm: document.getElementById('memberForm'),
  toast: document.getElementById('toast')
};

// Rendering Functions
function renderTeamList() {
  elements.teamList.innerHTML = '';
  
  // Calculate hours per member
  const memberHours = {};
  state.tasks.forEach(task => {
    memberHours[task.memberId] = (memberHours[task.memberId] || 0) + task.duration;
  });
  
  state.members.forEach(member => {
    const hours = memberHours[member.id] || 0;
    const isActive = state.selectedMember === member.id;
    
    const el = document.createElement('div');
    el.className = `team-member ${isActive ? 'active' : ''}`;
    el.dataset.memberId = member.id;
    el.innerHTML = `
      <div class="member-avatar" style="background: ${COLORS[member.color]}">
        ${member.initials}
      </div>
      <div class="member-info">
        <div class="member-name">${member.name}</div>
        <div class="member-role">${member.role}</div>
      </div>
      <div class="member-hours">${hours}h</div>
    `;
    
    el.addEventListener('click', () => {
      state.selectedMember = isActive ? null : member.id;
      renderTeamList();
      renderTasks();
    });
    
    elements.teamList.appendChild(el);
  });
  
  // Update stats
  const totalHours = Object.values(memberHours).reduce((a, b) => a + b, 0);
  elements.totalHours.textContent = totalHours;
  elements.budgetRemaining.textContent = Math.max(0, 320 - totalHours);
}

function renderTimelineHeader() {
  elements.timelineHeader.innerHTML = '';
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(state.weekStart);
    date.setDate(date.getDate() + i);
    
    const el = document.createElement('div');
    el.className = 'day-header';
    el.innerHTML = `
      <div class="day-name">${getDayName(date)}</div>
      <div class="day-date">${formatDate(date)}</div>
    `;
    elements.timelineHeader.appendChild(el);
  }
}

function renderTimelineGrid() {
  elements.timelineGrid.innerHTML = '';
  
  for (let day = 0; day < 5; day++) {
    const column = document.createElement('div');
    column.className = 'day-column';
    column.dataset.day = day;
    
    // Add hour labels
    for (let hour = CONFIG.startHour; hour <= CONFIG.endHour; hour++) {
      const label = document.createElement('div');
      label.className = 'hour-label';
      label.style.top = `${(hour - CONFIG.startHour) * CONFIG.hourHeight}px`;
      label.textContent = `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`;
      column.appendChild(label);
      
      // Add click-to-add slot
      const slot = document.createElement('div');
      slot.className = 'add-task-slot';
      slot.style.top = `${(hour - CONFIG.startHour) * CONFIG.hourHeight}px`;
      slot.style.height = `${CONFIG.hourHeight}px`;
      
      const btn = document.createElement('button');
      btn.className = 'add-task-slot-btn';
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTaskModal(day, hour);
      });
      
      slot.appendChild(btn);
      column.appendChild(slot);
    }
    
    elements.timelineGrid.appendChild(column);
  }
  
  renderTasks();
}

function renderTasks() {
  // Remove existing tasks
  document.querySelectorAll('.task').forEach(el => el.remove());
  
  state.tasks.forEach(task => {
    // Filter by selected member if any
    if (state.selectedMember && task.memberId !== state.selectedMember) {
      return;
    }
    
    const member = state.members.find(m => m.id === task.memberId);
    if (!member) return;
    
    const column = elements.timelineGrid.querySelector(`[data-day="${task.day}"]`);
    if (!column) return;
    
    const el = document.createElement('div');
    el.className = 'task';
    el.dataset.taskId = task.id;
    el.dataset.phase = task.phase;
    el.style.top = `${(task.start - CONFIG.startHour) * CONFIG.hourHeight + 2}px`;
    el.style.height = `${task.duration * CONFIG.hourHeight - 4}px`;
    el.style.background = COLORS[member.color];
    el.innerHTML = `
      <div class="task-title">${task.title}</div>
      <div class="task-meta">${member.name} • ${task.duration}h</div>
      <div class="task-resize-handle"></div>
    `;
    
    // Drag handlers
    if (!state.isManagerView) {
      el.addEventListener('mousedown', (e) => startDrag(e, task));
      
      // Resize handler
      const resizeHandle = el.querySelector('.task-resize-handle');
      resizeHandle.addEventListener('mousedown', (e) => startResize(e, task));
    }
    
    column.appendChild(el);
  });
}

// Drag and Drop
function startDrag(e, task) {
  if (e.target.classList.contains('task-resize-handle')) return;
  
  e.preventDefault();
  const el = document.querySelector(`[data-task-id="${task.id}"]`);
  if (!el) return;
  
  state.dragging = task;
  state.dragOffset = {
    x: e.clientX,
    y: e.clientY
  };
  
  el.classList.add('dragging');
  
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);
}

function onDrag(e) {
  if (!state.dragging) return;
  
  const el = document.querySelector(`[data-task-id="${state.dragging.id}"]`);
  if (!el) return;
  
  const deltaX = e.clientX - state.dragOffset.x;
  const deltaY = e.clientY - state.dragOffset.y;
  
  el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
}

function endDrag(e) {
  if (!state.dragging) return;
  
  const task = state.dragging;
  const el = document.querySelector(`[data-task-id="${task.id}"]`);
  if (el) {
    el.classList.remove('dragging');
    el.style.transform = '';
    
    // Calculate new position
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Find target column
    const columns = document.querySelectorAll('.day-column');
    let newDay = task.day;
    columns.forEach((col, i) => {
      const colRect = col.getBoundingClientRect();
      if (centerX >= colRect.left && centerX <= colRect.right) {
        newDay = i;
      }
    });
    
    // Find target time
    const gridRect = elements.timelineGrid.getBoundingClientRect();
    const relativeY = centerY - gridRect.top + elements.timelineGrid.scrollTop;
    const newStart = Math.round(relativeY / CONFIG.hourHeight) + CONFIG.startHour;
    
    // Validate
    if (newStart >= CONFIG.startHour && newStart + task.duration <= CONFIG.endHour + 1) {
      task.day = newDay;
      task.start = newStart;
      saveToStorage();
      showToast('Task moved');
    }
    
    renderTasks();
  }
  
  state.dragging = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
}

// Resize
function startResize(e, task) {
  e.preventDefault();
  e.stopPropagation();
  
  state.resizing = task;
  state.dragOffset = { y: e.clientY };
  
  const el = document.querySelector(`[data-task-id="${task.id}"]`);
  if (el) el.classList.add('resizing');
  
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', endResize);
}

function onResize(e) {
  if (!state.resizing) return;
  
  const task = state.resizing;
  const el = document.querySelector(`[data-task-id="${task.id}"]`);
  if (!el) return;
  
  const deltaY = e.clientY - state.dragOffset.y;
  const deltaHours = Math.round(deltaY / CONFIG.hourHeight);
  const newDuration = Math.max(1, Math.min(8, task.duration + deltaHours));
  
  if (task.start + newDuration <= CONFIG.endHour + 1) {
    el.style.height = `${newDuration * CONFIG.hourHeight - 4}px`;
  }
}

function endResize(e) {
  if (!state.resizing) return;
  
  const task = state.resizing;
  const el = document.querySelector(`[data-task-id="${task.id}"]`);
  
  if (el) {
    el.classList.remove('resizing');
    
    const deltaY = e.clientY - state.dragOffset.y;
    const deltaHours = Math.round(deltaY / CONFIG.hourHeight);
    const newDuration = Math.max(1, Math.min(8, task.duration + deltaHours));
    
    if (task.start + newDuration <= CONFIG.endHour + 1) {
      task.duration = newDuration;
      saveToStorage();
      showToast('Task resized');
    }
    
    renderTasks();
    renderTeamList();
  }
  
  state.resizing = null;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', endResize);
}

// Modal Functions
function openTaskModal(day = 0, start = 9) {
  const modal = elements.taskModal;
  const memberSelect = document.getElementById('taskMember');
  const daySelect = document.getElementById('taskDay');
  const startSelect = document.getElementById('taskStart');
  
  // Populate members
  memberSelect.innerHTML = state.members.map(m => 
    `<option value="${m.id}">${m.name}</option>`
  ).join('');
  
  // Populate days
  daySelect.innerHTML = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(state.weekStart);
    date.setDate(date.getDate() + i);
    return `<option value="${i}">${getDayName(date)} ${formatDate(date)}</option>`;
  }).join('');
  
  // Set defaults
  daySelect.value = day;
  startSelect.value = start;
  document.getElementById('taskName').value = '';
  
  modal.classList.add('active');
}

function closeTaskModal() {
  elements.taskModal.classList.remove('active');
}

function openMemberModal() {
  elements.memberModal.classList.add('active');
  document.getElementById('memberName').value = '';
}

function closeMemberModal() {
  elements.memberModal.classList.remove('active');
}

// Toast
function showToast(message) {
  const toast = elements.toast;
  toast.querySelector('.toast-message').textContent = message;
  toast.classList.add('active');
  
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3000);
}

// CSV Export
function exportToCSV() {
  const headers = ['Task', 'Team Member', 'Role', 'Day', 'Start Time', 'Duration (hrs)', 'Phase'];
  
  const rows = state.tasks.map(task => {
    const member = state.members.find(m => m.id === task.memberId);
    const date = new Date(state.weekStart);
    date.setDate(date.getDate() + task.day);
    
    return [
      task.title,
      member?.name || '',
      member?.role || '',
      formatDate(date),
      `${task.start % 12 || 12} ${task.start >= 12 ? 'PM' : 'AM'}`,
      task.duration,
      PHASES[task.phase]
    ];
  });
  
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `teamflow-tasks-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('CSV exported successfully');
}

// Event Listeners
function setupEventListeners() {
  // Manager toggle
  elements.managerToggle.addEventListener('click', () => {
    state.isManagerView = !state.isManagerView;
    elements.managerToggle.classList.toggle('active', state.isManagerView);
    document.body.classList.toggle('manager-view', state.isManagerView);
    renderTasks();
    showToast(state.isManagerView ? 'Manager view enabled' : 'Manager view disabled');
  });
  
  // Export
  elements.exportBtn.addEventListener('click', exportToCSV);
  
  // Add member
  elements.addMemberBtn.addEventListener('click', openMemberModal);
  
  // Task form
  elements.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const task = {
      id: generateId(),
      memberId: document.getElementById('taskMember').value,
      day: parseInt(document.getElementById('taskDay').value),
      start: parseInt(document.getElementById('taskStart').value),
      duration: parseInt(document.getElementById('taskDuration').value),
      title: document.getElementById('taskName').value,
      phase: document.getElementById('taskPhase').value
    };
    
    state.tasks.push(task);
    saveToStorage();
    renderTasks();
    renderTeamList();
    closeTaskModal();
    showToast('Task added');
  });
  
  // Member form
  let selectedColor = 'blue';
  
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.color;
    });
  });
  
  elements.memberForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('memberName').value;
    const role = document.getElementById('memberRole').value;
    
    const member = {
      id: generateId(),
      name,
      role,
      color: selectedColor,
      initials: getInitials(name)
    };
    
    state.members.push(member);
    saveToStorage();
    renderTeamList();
    closeMemberModal();
    showToast('Team member added');
  });
  
  // Modal close buttons
  document.getElementById('closeModal').addEventListener('click', closeTaskModal);
  document.getElementById('cancelTask').addEventListener('click', closeTaskModal);
  document.getElementById('closeMemberModal').addEventListener('click', closeMemberModal);
  document.getElementById('cancelMember').addEventListener('click', closeMemberModal);
  
  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
      closeTaskModal();
      closeMemberModal();
    });
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTaskModal();
      closeMemberModal();
    }
  });
}

// Initialize
function init() {
  // Load data
  const saved = loadFromStorage();
  state.members = saved.members;
  state.tasks = saved.tasks;
  state.weekStart = saved.weekStart;
  
  // Render
  renderTeamList();
  renderTimelineHeader();
  renderTimelineGrid();
  
  // Setup events
  setupEventListeners();
  
  // Welcome toast
  setTimeout(() => {
    showToast('Welcome to TeamFlow MVP! Click any time slot to add a task.');
  }, 500);
}

// Start
init();
