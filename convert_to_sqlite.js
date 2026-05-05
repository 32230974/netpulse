const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Change datasource to sqlite
schema = schema.replace(/provider = "postgresql"/, 'provider = "sqlite"');
schema = schema.replace(/url      = env\("DATABASE_URL"\)/, 'url      = "file:./dev.db"');

// 2. Remove Enums and replace with String
const enums = [...schema.matchAll(/enum (\w+) \{([\s\S]*?)\}/g)];
enums.forEach(match => {
  const enumName = match[1];
  const enumValues = match[2].trim().split(/\s+/);
  
  // Replace the enum definition
  schema = schema.replace(match[0], '');
  
  // Replace usage in models
  const usageRegex = new RegExp(`(\\s+)(\\w+)(\\s+)${enumName}(\\s+)`, 'g');
  schema = schema.replace(usageRegex, '$1$2$3String$4');
  
  // Fix @default values
  enumValues.forEach(val => {
    const defaultRegex = new RegExp(`@default\\(${val}\\)`, 'g');
    schema = schema.replace(defaultRegex, `@default("${val}")`);
  });
});

// 3. Fix list types
schema = schema.replace(/features\s+String\[\]/g, 'features String');
schema = schema.replace(/factors\s+String\[\]/g, 'factors String');

fs.writeFileSync(schemaPath, schema);
console.log('Schema converted to SQLite with quoted defaults');
