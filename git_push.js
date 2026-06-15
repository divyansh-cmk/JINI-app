const git = require('isomorphic-git');
const fs = require('fs');
const http = require('isomorphic-git/http/node');
const path = require('path');

const dir = '/Users/divyansh/Downloads/JINI LAYOUT';

async function main() {
  const token = process.env.GITHUB_TOKEN || '';
  if (!token || token === 'your_token_here') {
    console.error("❌ Error: Please provide a valid GITHUB_TOKEN environment variable.");
    process.exit(1);
  }

  console.log("⚙️ Initializing local Git repository...");
  await git.init({ fs, dir });

  console.log("📂 Analyzing workspace file status matrix...");
  const statusMatrix = await git.statusMatrix({ fs, dir });
  
  let addedCount = 0;
  for (const [filepath, head, workdir, stage] of statusMatrix) {
    // Ignore heavy or secret files
    if (
      filepath.startsWith('node_modules') || 
      filepath === '.env' || 
      filepath.endsWith('.zip') ||
      filepath === '.git'
    ) {
      continue;
    }
    
    // stage modifications or new files
    if (workdir === 0) {
      await git.remove({ fs, dir, filepath });
      addedCount++;
    } else if (workdir !== head || stage !== 1) {
      await git.add({ fs, dir, filepath });
      addedCount++;
    }
  }
  
  if (addedCount === 0) {
    console.log("ℹ️ No new changes to stage.");
  } else {
    console.log(`✅ Staged ${addedCount} files.`);
  }

  console.log("💾 Committing changes to local branch...");
  let sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Divyansh',
      email: 'divyansh-cmk@users.noreply.github.com'
    },
    message: 'Initial deploy: JINI application Vercel fullstack readiness setup'
  });
  console.log(`🎉 Commit created successfully with SHA: ${sha}`);

  console.log("🌱 Creating local branch 'main'...");
  await git.branch({
    fs,
    dir,
    ref: 'main',
    force: true
  });
  console.log("✅ Local branch 'main' created.");

  console.log("🔗 Mapping remote repository origin...");
  try {
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: 'https://github.com/divyansh-cmk/JINI-app.git'
    });
    console.log("✅ Remote 'origin' added.");
  } catch (e) {
    // Remote might already exist, update it
    await git.deleteRemote({ fs, dir, remote: 'origin' });
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: 'https://github.com/divyansh-cmk/JINI-app.git'
    });
    console.log("🔄 Remote 'origin' updated.");
  }

  console.log("🚀 Pushing references to https://github.com/divyansh-cmk/JINI-app.git (main)...");
  let pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({
      username: token,
      password: ''
    })
  });
  
  console.log("🚀 Git Push completed successfully!", pushResult);
}

main().catch(err => {
  console.error("❌ Git push failed: ", err);
});
