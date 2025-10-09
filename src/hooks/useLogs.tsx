import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { FIRESTORE_DB } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

type LogsEntry = {
  action: string;
  dateStamp: Timestamp;
  target_email?: string;
  target_id?: string;
  user_email: string;
  user_id: string;
};

export const useLogs = () => {
  const auth = getAuth();
  const addLog = async (
    log: Omit<LogsEntry, 'user_id' | 'user_email' | 'dateStamp'>,
  ) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.error('No authenticated user found.');
        return;
      }

      const logEntry: LogsEntry = {
        ...log,
        user_id: user.uid,
        user_email: user.email ?? 'No Email',
        dateStamp: Timestamp.now(),
      };

      await addDoc(collection(FIRESTORE_DB, 'logs'), logEntry);
      console.log('Log added successfully');
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  return { addLog };
};
