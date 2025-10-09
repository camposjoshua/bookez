import { useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../firebaseConfig';
import { SessionProps } from '../constants/types/interfaceProps';

interface UseSessionsReturn {
  sessions: SessionProps[];
  isLoading: boolean;
  getAllSessions: () => () => void;
  getSessions: (hasFilter: boolean, filter: 0 | 1 | 2 | 3 | 4) => () => void;
  getUserSessions: (
    user_email: string,
    user_type: 2 | 3,
  ) => Promise<() => void>;
  getSessionsByID: (userId: string) => Promise<() => void>;
  getSessionsByMonthYear: (year: number, month: number) => Promise<() => void>;
  searchSessionsByEmail: (user_email: string) => Promise<() => void>;
  updateSessionsWithCompany: (user_email: string) => Promise<void>;
}

export const useSessions = (queryLimit: number): UseSessionsReturn => {
  const [sessions, setSessions] = useState<SessionProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSessions = useCallback((sessionQuery: any) => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(
      sessionQuery,
      (snapshot: { docs: any[] }) => {
        let list: SessionProps[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as SessionProps,
        );

        if (list.length === 0) {
          list = [{ user_email: 'Table has no record' } as SessionProps];
        }

        setSessions(list);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting documents: ', error);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const getSessionsByMonthYear = useCallback(
    async (year: number, month: number) => {
      setIsLoading(true);
      // Start of the month
      const startDate = new Date(year, month - 1, 1, 0, 0, 0); // Month is 0-indexed
      // End of the month
      const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

      // Convert to Firestore Timestamps
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      // Firestore query
      const sessionQuery = query(
        collection(FIRESTORE_DB, 'Session'),
        where('status', '!=', 5),
        where('date_created', '>=', startTimestamp),
        where('date_created', '<=', endTimestamp),
        orderBy('date_created', 'desc'),
      );

      return fetchSessions(sessionQuery);
    },
    [fetchSessions, queryLimit],
  );

  const getAllSessions = useCallback(() => {
    const sessionQuery = query(
      collection(FIRESTORE_DB, 'Session'),
      where('status', '!=', 5),
      orderBy('date_created', 'desc'),
      limit(queryLimit),
    );

    return fetchSessions(sessionQuery);
  }, [fetchSessions, queryLimit]);

  const getSessions = useCallback(
    (hasFilter: boolean, filter: 0 | 1 | 2 | 3 | 4) => {
      let sessionQuery = query(
        collection(FIRESTORE_DB, 'Session'),
        orderBy('date_created', 'desc'),
        limit(queryLimit),
      );

      if (hasFilter) {
        sessionQuery = query(
          collection(FIRESTORE_DB, 'Session'),
          where('status', '==', filter),
          orderBy('status'),
          orderBy('date_created', 'desc'),
          limit(queryLimit),
        );
      } else {
        sessionQuery = query(
          collection(FIRESTORE_DB, 'Session'),
          where('status', '!=', 5),
          orderBy('date_created', 'desc'),
          limit(queryLimit),
        );
      }

      return fetchSessions(sessionQuery);
    },
    [fetchSessions, queryLimit],
  );

  const getUserSessions = useCallback(
    async (user_email: string, user_type: 2 | 3) => {
      setIsLoading(true);

      const sessionQuery = query(
        collection(FIRESTORE_DB, 'Session'),
        where('status', '!=', 5),
        where(
          user_type === 3 ? 'user_email' : 'hopeliner_email',
          '==',
          user_email,
        ),
        orderBy('date_created', 'desc'),
      );

      setIsLoading(false);
      return fetchSessions(sessionQuery);
    },
    [fetchSessions, queryLimit],
  );

  const getSessionsByID = useCallback(
    async (userId: string) => {
      setIsLoading(true);

      const sessionQuery = query(
        collection(FIRESTORE_DB, 'Session'),
        where('status', '!=', 5),
        where('user_id', '==', userId),
        orderBy('date_created', 'desc'),
      );

      setIsLoading(false);
      return fetchSessions(sessionQuery);
    },
    [fetchSessions, queryLimit],
  );

  const searchSessionsByEmail = useCallback(
    async (user_email: string) => {
      setIsLoading(true);

      const sessionQuery = query(
        collection(FIRESTORE_DB, 'Session'),
        where('user_email', '==', user_email),
      );
      setIsLoading(false);
      return fetchSessions(sessionQuery);
    },
    [fetchSessions, queryLimit],
  );

  const updateSessionsWithCompany = async (user_email: string) => {
    try {
      // Step 1: Get the user document to retrieve the company field
      const userQuery = query(
        collection(FIRESTORE_DB, 'User'),
        where('email', '==', user_email),
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        console.log(`No user found with email: ${user_email}`);
        return;
      }

      const userDoc = userSnapshot.docs[0]; // Assuming email is unique
      const company = userDoc.data().company;

      if (!company) {
        console.log(`No company field found for user: ${user_email}`);
        return;
      }

      // Step 2: Find all sessions associated with this user
      const sessionQuery = query(
        collection(FIRESTORE_DB, 'Session'),
        where('user_email', '==', user_email),
      );
      const sessionSnapshot = await getDocs(sessionQuery);

      if (sessionSnapshot.empty) {
        console.log(`No sessions found for user: ${user_email}`);
        return;
      }

      // Step 3: Update all matching sessions with the company field
      const updatePromises = sessionSnapshot.docs.map(async (sessionDoc) => {
        const sessionData = sessionDoc.data();

        if (!sessionData.company) {
          return updateDoc(doc(FIRESTORE_DB, 'Session', sessionDoc.id), {
            company,
          });
        }
      });
      await Promise.all(updatePromises);

      console.log(
        `Updated ${sessionSnapshot.size} sessions with company ${company}`,
      );
    } catch (error) {
      console.error('Error updating sessions:', error);
    }
  };

  return {
    sessions,
    isLoading,
    getAllSessions,
    getSessions,
    getUserSessions,
    getSessionsByMonthYear,
    getSessionsByID,
    updateSessionsWithCompany,
    searchSessionsByEmail,
  };
};
