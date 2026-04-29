import git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';

async function main() {
  const dir = process.cwd();
  try {
    const remotes = await git.listRemotes({ fs, dir });
    console.log('Remotes:', JSON.stringify(remotes));
  } catch (e) {
    console.error('Error listing remotes:', e.message);
  }
}

main();
