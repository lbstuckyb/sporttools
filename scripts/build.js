#!/usr/bin/env node

/**
 * SPORTTOOLS Build Script
 * 
 * Scans /tools directory, generates catalog.json, and copies files to /docs
 * Run: node scripts/build.js
 */

const fs = require('fs');
const path = require('path');

const TOOLS_DIR = path.join(__dirname, '..', 'tools');
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const DOCS_TOOLS_DIR = path.join(DOCS_DIR, 'tools');
const CATALOG_FILE = path.join(DOCS_DIR, 'catalog.json');

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy directory recursively
function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Main build function
function build() {
  console.log('🔧 SPORTTOOLS Build Script\n');
  
  // Ensure docs/tools directory exists
  ensureDir(DOCS_TOOLS_DIR);
  
  // Get all tool directories
  const toolDirs = fs.readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`📁 Found ${toolDirs.length} tool(s)\n`);
  
  const catalog = [];
  const errors = [];
  
  for (const toolDir of toolDirs) {
    const toolPath = path.join(TOOLS_DIR, toolDir);
    const jsonPath = path.join(toolPath, 'tool.json');
    
    // Check if tool.json exists
    if (!fs.existsSync(jsonPath)) {
      errors.push(`⚠️  ${toolDir}: Missing tool.json, skipping`);
      continue;
    }
    
    try {
      // Read and parse tool.json
      const toolData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Validate required fields
      const required = ['id', 'name', 'description', 'status'];
      const missing = required.filter(field => !toolData[field]);
      
      if (missing.length > 0) {
        errors.push(`⚠️  ${toolDir}: Missing fields: ${missing.join(', ')}`);
        continue;
      }
      
      // Add paths (relative to docs/)
      toolData.paths = {
        page: `tools/${toolDir}/`,
        tool: `tools/${toolDir}/tool.html`,
        prompt: `tools/${toolDir}/prompt.md`
      };
      
      // Add to catalog
      catalog.push(toolData);
      
      // Copy tool folder to docs/tools/
      const destPath = path.join(DOCS_TOOLS_DIR, toolDir);
      copyDir(toolPath, destPath);
      
      console.log(`✅ ${toolData.name.en || toolDir}`);
      
    } catch (err) {
      errors.push(`❌ ${toolDir}: ${err.message}`);
    }
  }
  
  // Sort catalog: active first, then by dateAdded (newest first)
  catalog.sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return (b.dateAdded || '').localeCompare(a.dateAdded || '');
  });
  
  // Write catalog.json
  const catalogOutput = {
    generated: new Date().toISOString(),
    count: catalog.length,
    tools: catalog
  };
  
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalogOutput, null, 2));
  
  // Summary
  console.log('\n' + '─'.repeat(40));
  console.log(`\n📦 Catalog: ${catalog.length} tool(s)`);
  console.log(`📄 Output: docs/catalog.json`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  Warnings/Errors:`);
    errors.forEach(e => console.log(`   ${e}`));
  }
  
  console.log('\n✨ Build complete!\n');
}

// Run
build();
