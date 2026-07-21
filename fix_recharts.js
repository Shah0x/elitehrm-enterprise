const fs = require('fs');
let file = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

file = file.replace(
  /<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" \/>/g,
  '<CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f3f4f6"} />'
);

file = file.replace(
  /<Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 \/ 0\.1)'}} \/>/g,
  '<Tooltip cursor={{fill: isDark ? "#1e293b" : "#f8fafc"}} contentStyle={{borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", backgroundColor: isDark ? "#0f172a" : "#ffffff", color: isDark ? "#f8fafc" : "#0f172a"}} />'
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', file);
