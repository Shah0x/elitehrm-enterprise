const fs = require('fs');
let file = fs.readFileSync('src/server/seed.ts', 'utf8');

file = file.replace(/status: e\.status \|\| 'active'/g, "status: 'active'");

file = file.replace(/const employeesData = \[.*?\];/s, `const employeesData = [
      { f: 'Sarah', l: 'Parker', d: 'Engineering', des: 'Senior MERN Engineer', status: 'remote' },
      { f: 'Michael', l: 'Ross', d: 'Sales', des: 'VP Sales', status: 'active' },
      { f: 'Donna', l: 'Paulsen', d: 'HR', des: 'Lead HR Generalist', status: 'active' },
      { f: 'Louis', l: 'Litt', d: 'Finance', des: 'Managing Director', status: 'active' },
      { f: 'Rachel', l: 'Zane', d: 'Design', des: 'Lead Designer', status: 'on_leave' },
      { f: 'Harvey', l: 'Specter', d: 'Product', des: 'Product Visionary', status: 'remote' },
      { f: 'Tom', l: 'Hanks', d: 'Engineering', des: 'DevOps Lead', status: 'active' },
      { f: 'Emma', l: 'Watson', d: 'Marketing', des: 'Growth Lead', status: 'active' },
      { f: 'Robert', l: 'Downey', d: 'Engineering', des: 'Senior Developer', status: 'remote' },
      { f: 'Scarlett', l: 'Johansson', d: 'Product', des: 'Principal PM', status: 'active' },
    ];`);

file = file.replace(/status: 'active',\n        joinDate/g, "status: e.status || 'active',\n        joinDate");

fs.writeFileSync('src/server/seed.ts', file);
