import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../firebaseConfig';
import { useAccounts } from './useAccounts';
import { useState } from 'react';

export const useSync = () => {
  const { updateUserWithCompany } = useAccounts(1);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const updateSessionGroup = async (sessionList: any[]) => {
    try {
      setIsSyncing(true);
      const userCompanyMap: Record<string, string> = {};

      // Step 1: Extract unique user emails from sessionList
      const uniqueUserEmails = Array.from(
        new Set(sessionList.map((s) => s.user_email)),
      );

      console.log('emails: ', uniqueUserEmails);

      // Step 2: Check if users have a company
      for (const user_email of uniqueUserEmails) {
        const userQuery = query(
          collection(FIRESTORE_DB, 'User'),
          where('email', '==', user_email),
        );
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          console.log(`No user found with email: ${user_email}`);
          continue; // Skip to next user
        }

        const userDoc = userSnapshot.docs[0];
        const userCompany = userDoc.data().company;

        if (!userCompany) {
          console.log(`User ${user_email} has no company, syncing now...`);
          await updateUserWithCompany(user_email);
          continue;
        }

        userCompanyMap[user_email] = userCompany;
      }

      // Step 3: Update sessions where company is missing
      const updatePromises = sessionList.map(async (session) => {
        const { user_email, company, id } = session;

        if (company) return;

        if (userCompanyMap[user_email]) {
          console.log(
            `Updating Session ${id} with ${user_email} ${userCompanyMap[user_email]}...`,
          );
          return updateDoc(doc(FIRESTORE_DB, 'Session', id), {
            company: userCompanyMap[user_email],
          });
        }
      });

      await Promise.all(updatePromises);

      console.log(`Updated sessions successfully`);
    } catch (error) {
      console.error('Error updating sessions:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateUserGroup = async (userList: any[]) => {
    try {
      setIsSyncing(true);
      const userCompanyMap: Record<string, string> = {};

      // Step 1: Extract unique user emails from sessionList
      const uniqueUserEmails = Array.from(
        new Set(userList.map((s) => s.email)),
      );

      console.log('emails: ', uniqueUserEmails);

      // Step 2: Check if users have a company
      for (const email of uniqueUserEmails) {
        const userQuery = query(
          collection(FIRESTORE_DB, 'User'),
          where('email', '==', email),
        );
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          console.log(`No user found with email: ${email}`);
          continue; // Skip to next user
        }

        const userDoc = userSnapshot.docs[0];
        const userCompany = userDoc.data().company;

        if (!userCompany) {
          console.log(`User ${email} has no company, syncing now...`);
          await updateUserWithCompany(email);
          continue;
        }

        userCompanyMap[email] = userCompany;
      }

      console.log(`Updated users successfully`);
    } catch (error) {
      console.error('Error updating sessions:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    updateSessionGroup,
    updateUserGroup,
    isSyncing,
  };
};
