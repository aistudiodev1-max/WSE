const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

async function pushToStaging() {
  const dir = process.cwd();
  const url = 'https://github.com/aistudiodev1-max/WSE.git';
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  const branch = 'staging';
  const tempGitDir = path.join(dir, '.git_temp');

  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is not set.');
    return;
  }

  console.log('Preparing push to staging (preserving history)...');

  try {
    console.log(`Cloning ${branch} branch from ${url}...`);
    if (fs.existsSync(tempGitDir)) {
      fs.rmSync(tempGitDir, { recursive: true, force: true });
    }
    
    await git.clone({
      fs,
      http,
      dir: tempGitDir,
      url,
      ref: branch,
      singleBranch: true,
      depth: 1,
      onAuth: () => ({ username: token })
    });

    console.log('Integrating remote history...');
    const currentGitDir = path.join(dir, '.git');
    if (fs.existsSync(currentGitDir)) {
      fs.rmSync(currentGitDir, { recursive: true, force: true });
    }
    fs.renameSync(path.join(tempGitDir, '.git'), currentGitDir);
    fs.rmSync(tempGitDir, { recursive: true, force: true });

    console.log('Staging files...');
    await git.add({ fs, dir, filepath: '.' });

    try {
      await git.commit({
        fs,
        dir,
        author: {
          name: 'AI Coding Agent',
          email: 'agent@ais.dev'
        },
        message: 'fix: properly render modal using z-[100] instead of z-100'
      });
      console.log('Changes committed.');
    } catch (e) {
      if (e.code === 'NothingToCommitError') {
        console.log('Nothing to commit, proceeding to push.');
      } else {
        throw e;
      }
    }

    console.log(`Pushing to ${url} on branch ${branch}...`);
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: branch,
      url,
      force: false,
      onAuth: () => ({ username: token })
    });

    if (pushResult.ok) {
      console.log('Successfully pushed to staging branch.');
    } else {
      console.error('Push failed:', JSON.stringify(pushResult));
    }
  } catch (err) {
    console.error('Error during git operation:', err.message);
    if (fs.existsSync(tempGitDir)) {
      fs.rmSync(tempGitDir, { recursive: true, force: true });
    }
  }
}

pushToStaging();
