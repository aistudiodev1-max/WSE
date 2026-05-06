import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: {
      rules: fs.readFileSync(path.resolve(__dirname, 'DRAFT_firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Rules', () => {
  it('Payload 1: Note with missing required field', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const authedDb = testEnv.authenticatedContext('user1').firestore();
    await assertFails(setDoc(doc(authedDb, 'notes', 'note1'), {
      userId: 'user1',
      // missing groupId
    }));
  });

  it('Payload 2: Oversized ID', async () => {
    const authedDb = testEnv.authenticatedContext('user1').firestore();
    const hugeId = 'a'.repeat(150);
    await assertFails(setDoc(doc(authedDb, 'notes', hugeId), {
      userId: 'user1',
      groupId: 'g1', planId: 'p1', noteType: 'session', content: 'test', visibility: 'private',
      createdAt: new Date(), updatedAt: new Date()
    }));
  });

  it('Payload 3: Note with modified userId', async () => {
    const authedDb = testEnv.authenticatedContext('user1').firestore();
    await assertFails(setDoc(doc(authedDb, 'notes', 'note1'), {
      userId: 'user2', // malicious
      groupId: 'g1', planId: 'p1', noteType: 'session', content: 'test', visibility: 'private',
      createdAt: new Date(), updatedAt: new Date()
    }));
  });

  it('Payload 4: Invalid type', async () => {
    const authedDb = testEnv.authenticatedContext('user1').firestore();
    await assertFails(setDoc(doc(authedDb, 'notes', 'note1'), {
      userId: 'user1', groupId: 'g1', planId: 'p1',
      noteType: 'malicious', // invalid
      content: 'test', visibility: 'private',
      createdAt: new Date(), updatedAt: new Date()
    }));
  });

  it('Payload 5: Modified createdAt/updatedAt', async () => {
    const authedDb = testEnv.authenticatedContext('user1').firestore();
    const past = new Date(Date.now() - 100000);
    await assertFails(setDoc(doc(authedDb, 'notes', 'note1'), {
      userId: 'user1', groupId: 'g1', planId: 'p1', noteType: 'session', content: 'test', visibility: 'private',
      createdAt: past, // malicious
      updatedAt: past
    }));
  });

  it('Payload 6: Read group note if not owner (and not shared) -> blocked', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'notes', 'private_note'), {
        userId: 'user1', groupId: 'g1', planId: 'p1', noteType: 'session', content: 'test', visibility: 'private',
        createdAt: new Date(), updatedAt: new Date()
      });
    });
    const malDb = testEnv.authenticatedContext('user2').firestore();
    await assertFails(getDoc(doc(malDb, 'notes', 'private_note')));
  });

  it('Payload 7: Create note for another user -> blocked', async () => {
    const malDb = testEnv.authenticatedContext('user2').firestore();
    await assertFails(setDoc(doc(malDb, 'notes', 'note_user1'), {
      userId: 'user1', groupId: 'g1', planId: 'p1', noteType: 'session', content: 'test', visibility: 'private',
      createdAt: new Date(), updatedAt: new Date()
    }));
  });

  it('Payload 8: Note with malicious visibility', async () => {
    const authedDb = testEnv.authenticatedContext('user1').firestore();
    await assertFails(setDoc(doc(authedDb, 'notes', 'note1'), {
      userId: 'user1', groupId: 'g1', planId: 'p1', noteType: 'session', content: 'test',
      visibility: 'public', // invalid
      createdAt: new Date(), updatedAt: new Date()
    }));
  });
});
