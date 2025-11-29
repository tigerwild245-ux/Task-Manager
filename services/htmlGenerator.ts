import { Task, AppSettings } from '../types';

export const generatePresentationHTML = (
  tasks: Task[],
  settings: AppSettings,
  config: { title: string; subtitle: string; includeCharts: boolean }
): string => {
  const dateRange = `Report generated on ${new Date().toLocaleDateString()}`;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const overdueTasks = tasks.filter((t) => t.status === 'overdue').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // -- Section Content Generators --

  // 1. Overview
  const overviewContent = `
    <div style="font-size: 1.1em; color: #444; margin-bottom: 2rem;">
      <p>This report provides a comprehensive overview of current operational tasks managed by <strong>${settings.userName}</strong>. 
      Currently tracking <strong>${totalTasks}</strong> active items with a completion rate of <strong>${completionRate}%</strong>.</p>
      ${overdueTasks > 0 ? `<p style="color: #ef4444; margin-top: 10px;"><strong>⚠️ Attention:</strong> There are ${overdueTasks} overdue tasks requiring immediate action.</p>` : ''}
    </div>
  `;

  // 2. Metrics
  const metricsContent = `
    <div class="metric-card">
      <h3>Total Tasks</h3>
      <span class="value">${totalTasks}</span>
      <span class="description">Active items in system</span>
    </div>
    <div class="metric-card">
      <h3>Completion Rate</h3>
      <span class="value">${completionRate}%</span>
      <span class="description">Tasks fully executed</span>
    </div>
    <div class="metric-card">
      <h3>Overdue</h3>
      <span class="value" style="color: #ef4444;">${overdueTasks}</span>
      <span class="description">Items past due date</span>
    </div>
    <div class="metric-card">
      <h3>High Priority</h3>
      <span class="value">${tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length}</span>
      <span class="description">Critical & High items</span>
    </div>
  `;

  // 3. Tasks By Status Helper
  const renderTaskCard = (t: Task) => `
    <div class="task-card priority-${t.priority}">
      <div class="task-title">${t.title}</div>
      <div class="task-description">${t.description}</div>
      <div class="task-meta">
        <span class="task-meta-item">👤 ${t.assignedTo}</span>
        <span class="task-meta-item">📅 ${new Date(t.dueDate).toLocaleDateString()}</span>
        <span class="task-meta-item">🏷️ ${t.category}</span>
      </div>
      ${t.subtasks.length > 0 ? `
        <div class="subtasks-list">
          ${t.subtasks.map(st => `
            <div class="subtask-item ${st.completed ? 'completed' : ''}">${st.title}</div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  const tasksByStatusContent = `
    <div class="expandable-container">
      ${['overdue', 'in-progress', 'pending', 'completed'].map(status => {
         const statusTasks = tasks.filter(t => t.status === status);
         if (statusTasks.length === 0) return '';
         return `
           <div class="expandable-card ${status !== 'completed' ? 'expanded' : ''}">
             <div class="expandable-header">
               <h3>${status.toUpperCase().replace('-', ' ')} (${statusTasks.length})</h3>
               <span class="toggle-icon">▼</span>
             </div>
             <div class="expandable-content">
               <div class="task-grid">
                 ${statusTasks.map(renderTaskCard).join('')}
               </div>
             </div>
           </div>
         `;
      }).join('')}
    </div>
  `;

  // 4. Tasks By Person
  const persons = Array.from(new Set(tasks.map(t => t.assignedTo)));
  const tasksByPersonContent = `
    <div class="expandable-container">
       ${persons.map(person => {
         const pTasks = tasks.filter(t => t.assignedTo === person);
         const pCompleted = pTasks.filter(t => t.status === 'completed').length;
         return `
           <div class="expandable-card expanded">
             <div class="expandable-header">
               <h3>${person} <span style="font-size: 0.8em; font-weight: normal; opacity: 0.8">(${pCompleted}/${pTasks.length} Done)</span></h3>
               <span class="toggle-icon">▼</span>
             </div>
             <div class="expandable-content">
               <div class="task-grid">
                 ${pTasks.map(renderTaskCard).join('')}
               </div>
             </div>
           </div>
         `;
       }).join('')}
    </div>
  `;

  // 5. Timeline (Simple List for this implementation)
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const timelineContent = `
    <div style="margin-top: 20px;">
      ${sortedTasks.map(t => `
        <div style="display: flex; gap: 20px; margin-bottom: 20px; align-items: start;">
          <div style="min-width: 120px; font-weight: bold; color: #2563eb;">${new Date(t.dueDate).toLocaleDateString()}</div>
          <div style="padding-bottom: 20px; border-left: 2px solid #e2e8f0; padding-left: 20px; position: relative;">
            <div style="position: absolute; left: -6px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: ${t.priority === 'critical' ? '#ef4444' : '#2563eb'};"></div>
            <div style="font-weight: 600;">${t.title}</div>
            <div style="color: #666; font-size: 0.9em;">${t.assignedTo}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        /* CSS from Requirements */
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; transition: all 0.3s ease-in-out; }
        :root { --primary-color: #2563eb; --secondary-color: #7c3aed; --accent-color: #06b6d4; --text-color: #333; --background-color: #f8fafc; --card-background: #ffffff; --shadow-light: rgba(0, 0, 0, 0.1); --shadow-medium: rgba(0, 0, 0, 0.2); --border-radius: 12px; }
        body { line-height: 1.6; color: var(--text-color); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); overflow-x: hidden; min-height: 100vh; }
        .presentation-container { max-width: 1400px; margin: 40px auto; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 20px; box-shadow: 0 8px 32px var(--shadow-medium); overflow: hidden; }
        .hero-header { background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; padding: 60px 40px; text-align: center; position: relative; overflow: hidden; }
        .hero-header::before { content: ''; position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px; animation: backgroundScroll 20s linear infinite; }
        @keyframes backgroundScroll { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
        .hero-header h1 { font-size: 3.5em; margin-bottom: 15px; position: relative; z-index: 1; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
        .hero-header p { font-size: 1.4em; opacity: 0.95; position: relative; z-index: 1; }
        .nav-tabs { display: flex; justify-content: center; background: var(--card-background); padding: 20px; box-shadow: 0 4px 12px var(--shadow-light); flex-wrap: wrap; gap: 15px; position: sticky; top: 0; z-index: 100; }
        .nav-tab { background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; border: none; padding: 12px 30px; border-radius: 25px; cursor: pointer; font-size: 1em; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .nav-tab:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
        .nav-tab.active { background: var(--accent-color); transform: translateY(-3px); }
        .content-section { padding: 60px 40px; display: none; }
        .content-section.active { display: block; animation: fadeInUp 0.6s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .section-title { font-size: 2.5em; color: var(--primary-color); margin-bottom: 30px; text-align: center; position: relative; padding-bottom: 15px; }
        .section-title::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 4px; background: linear-gradient(90deg, var(--primary-color), var(--secondary-color)); border-radius: 2px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin: 40px 0; }
        .metric-card { background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,244,248,0.9)); border-radius: var(--border-radius); padding: 30px; box-shadow: 0 8px 24px var(--shadow-light); border-left: 5px solid var(--primary-color); transition: all 0.3s ease; position: relative; overflow: hidden; }
        .metric-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 12px 32px var(--shadow-medium); }
        .metric-card h3 { color: var(--secondary-color); font-size: 1.3em; margin-bottom: 15px; }
        .metric-card .value { font-size: 3em; font-weight: bold; color: var(--primary-color); display: block; margin-bottom: 10px; }
        .metric-card .description { font-size: 0.95em; color: #666; line-height: 1.5; }
        .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; margin: 30px 0; }
        .task-card { background: var(--card-background); border-radius: var(--border-radius); padding: 25px; box-shadow: 0 4px 20px var(--shadow-light); border-left: 5px solid; transition: all 0.3s ease; position: relative; }
        .task-card.priority-critical { border-left-color: #ef4444; }
        .task-card.priority-high { border-left-color: #f59e0b; }
        .task-card.priority-medium { border-left-color: #06b6d4; }
        .task-card.priority-low { border-left-color: #94a3b8; }
        .task-card:hover { transform: translateY(-5px); box-shadow: 0 8px 30px var(--shadow-medium); }
        .task-title { font-size: 1.4em; color: var(--primary-color); margin-bottom: 12px; font-weight: 600; }
        .task-meta { display: flex; flex-wrap: wrap; gap: 12px; margin: 15px 0; font-size: 0.9em; }
        .task-meta-item { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(37,99,235,0.1); border-radius: 20px; color: var(--primary-color); font-weight: 500; }
        .task-description { color: #555; line-height: 1.6; margin-bottom: 15px; }
        .subtasks-list { margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
        .subtask-item { padding: 8px 0; padding-left: 25px; position: relative; color: #666; font-size: 0.95em; }
        .subtask-item::before { content: '→'; position: absolute; left: 5px; color: var(--secondary-color); font-weight: bold; }
        .subtask-item.completed { text-decoration: line-through; opacity: 0.6; }
        .expandable-container { margin: 30px 0; }
        .expandable-card { background: var(--card-background); border: 1px solid #e0e0e0; border-radius: var(--border-radius); margin-bottom: 20px; box-shadow: 0 4px 15px var(--shadow-light); overflow: hidden; transition: all 0.3s ease; }
        .expandable-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; background: linear-gradient(135deg, rgba(37,99,235,0.05), rgba(124,58,237,0.05)); cursor: pointer; transition: all 0.3s ease; }
        .expandable-header:hover { background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1)); }
        .expandable-header h3 { color: var(--primary-color); font-size: 1.4em; margin: 0; }
        .toggle-icon { font-size: 1.8em; color: var(--secondary-color); transition: transform 0.3s ease; }
        .expandable-card.expanded .toggle-icon { transform: rotate(180deg); }
        .expandable-content { max-height: 0; overflow: hidden; transition: max-height 0.5s ease, padding 0.5s ease; padding: 0 30px; }
        .expandable-card.expanded .expandable-content { max-height: 2000px; padding: 25px 30px; }
        .presentation-footer { background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 40px; text-align: center; }
        @media print { .nav-tabs { display: none; } .content-section { display: block !important; page-break-after: always; } }
    </style>
</head>
<body>
    <div class="presentation-container">
        <div class="hero-header">
            <h1>${config.title}</h1>
            <p>${config.subtitle}</p>
            <p style="margin-top: 15px; font-size: 1.1em;">${dateRange}</p>
        </div>
        
        <nav class="nav-tabs">
            <button class="nav-tab active" onclick="showSection(0)">Overview</button>
            <button class="nav-tab" onclick="showSection(1)">Key Metrics</button>
            <button class="nav-tab" onclick="showSection(2)">Tasks by Status</button>
            <button class="nav-tab" onclick="showSection(3)">Tasks by Person</button>
            <button class="nav-tab" onclick="showSection(4)">Timeline</button>
        </nav>
        
        <div id="section-0" class="content-section active">
            <h2 class="section-title">Executive Overview</h2>
            ${overviewContent}
        </div>
        
        <div id="section-1" class="content-section">
            <h2 class="section-title">Key Performance Indicators</h2>
            <div class="metrics-grid">
                ${metricsContent}
            </div>
        </div>
        
        <div id="section-2" class="content-section">
            <h2 class="section-title">Tasks by Status</h2>
            ${tasksByStatusContent}
        </div>
        
        <div id="section-3" class="content-section">
            <h2 class="section-title">Tasks by Team Member</h2>
            ${tasksByPersonContent}
        </div>
        
        <div id="section-4" class="content-section">
            <h2 class="section-title">Project Timeline</h2>
            ${timelineContent}
        </div>
        
        <footer class="presentation-footer">
            <p><strong>Fincantieri Task Management Report</strong></p>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Office Manager: ${settings.userName}</p>
        </footer>
    </div>
    
    <script>
        function showSection(index) {
            const sections = document.querySelectorAll('.content-section');
            const tabs = document.querySelectorAll('.nav-tab');
            sections.forEach(s => s.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));
            sections[index].classList.add('active');
            tabs[index].classList.add('active');
            sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        document.querySelectorAll('.expandable-header').forEach(header => {
            header.addEventListener('click', function() {
                this.parentElement.classList.toggle('expanded');
            });
        });
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.metric-card, .task-card, .expandable-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });
    </script>
</body>
</html>`;
};
