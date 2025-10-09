import { useState, useCallback, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../firebaseConfig';
import { UserProps } from '../constants/types/interfaceProps';
import { useLogs } from './useLogs';

type RequestState = 'success' | 'error' | null;

type ToastState = {
  request: 'success' | 'error' | null;
  show: boolean;
  message: string | null;
};

interface UseAccountsReturn {
  users: UserProps[];
  isLoading: boolean;
  isFetching: boolean;
  request: RequestState;
  toast: ToastState;
  userData: UserProps | null;
  fetchUserData: (email: string) => Promise<UserProps | undefined>;
  setRequest: React.Dispatch<React.SetStateAction<RequestState>>;
  getAllUsers: () => () => void;
  getAllLatestUsers: () => () => void;
  getUsers: (hasFilter: boolean, filter: 0 | 1 | 2 | 3 | 4) => () => void;
  getUserSessions: (
    user_email: string,
    user_type: 2 | 3,
  ) => Promise<() => void>;
  searchSpecificUser: (user_email: string) => Promise<() => void>;
  updateUserWithCompany: (userEmail: string) => Promise<void>;
  updateUserByEmail: (
    user_email: string,
    action: string,
    updatedData: Partial<UserProps>,
  ) => Promise<void>;
}

export const useAccounts = (queryLimit: number): UseAccountsReturn => {
  const [users, setUsers] = useState<UserProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserProps | null>(null);
  const [request, setRequest] = useState<'success' | 'error' | null>(null);

  const { addLog } = useLogs();

  const [toast, setToast] = useState<ToastState>({
    request: null,
    show: false,
    message: null,
  });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const fetchUsers = useCallback((usersQuery: any) => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot: { docs: any[] }) => {
        let list: UserProps[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as UserProps,
        );

        if (list.length === 0) {
          list = [{ lname: 'No user found' } as UserProps];
        }

        setUsers(list);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting documents: ', error);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const getAllUsers = useCallback(() => {
    const sessionQuery = query(
      collection(FIRESTORE_DB, 'User'),
      where('user_type', '==', 3),
      limit(queryLimit),
    );
    return fetchUsers(sessionQuery);
  }, [fetchUsers, queryLimit]);

  const getAllLatestUsers = useCallback(() => {
    const sessionQuery = query(
      collection(FIRESTORE_DB, 'User'),
      where('user_type', '==', 3),
      orderBy('dateCreated', 'desc'),
    );
    return fetchUsers(sessionQuery);
  }, [fetchUsers, queryLimit]);

  const getUsers = useCallback(
    (hasFilter: boolean, filter: 0 | 1 | 2 | 3 | 4) => {
      let sessionQuery = query(
        collection(FIRESTORE_DB, 'User'),
        limit(queryLimit),
      );

      if (hasFilter) {
        sessionQuery = query(
          collection(FIRESTORE_DB, 'User'),
          where('user_type', '==', filter),
          limit(queryLimit),
        );
      } else {
        getAllUsers();
      }

      return fetchUsers(sessionQuery);
    },
    [fetchUsers, queryLimit],
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
      return fetchUsers(sessionQuery);
    },
    [fetchUsers, queryLimit],
  );

  const searchSpecificUser = useCallback(
    async (user_email: string) => {
      const sessionQuery = query(
        collection(FIRESTORE_DB, 'User'),
        where('email', '==', user_email),
      );

      setIsLoading(false);
      console.log(sessionQuery, 'user');
      return fetchUsers(sessionQuery);
    },
    [fetchUsers],
  );

  const fetchUserData = useCallback(
    async (email: string): Promise<UserProps | undefined> => {
      setIsFetching(true);
      try {
        const userQuery = query(
          collection(FIRESTORE_DB, 'User'),
          where('email', '==', email),
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();

          const user: UserProps = {
            dateCreated: userData.dateCreated,
            company: userData.company ?? '',
            email: userData.email ?? '',
            fname: userData.fname ?? '',
            img: userData.img ?? '',
            is_verified: userData.is_verified ?? false,
            lname: userData.lname ?? '',
            name: userData.name ?? '',
            token: userData.token ?? '',
            user_id: userDoc.id,
            user_type: userData.user_type ?? 0,
          };

          setUserData(user);
        } else {
          console.log('No user found with this email');
          setToast({
            request: 'error',
            show: true,
            message: `No user found with email: ${email}`,
          });
          return undefined;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setToast({
          request: 'error',
          show: true,
          message: `No user found with email: ${email}`,
        });
        return undefined;
      } finally {
        setIsFetching(false);
      }
    },
    [],
  );

  const updateUserByEmail = async (
    user_email: string,
    action: string,
    updatedData: Partial<UserProps>,
  ) => {
    setIsLoading(true);
    try {
      const q = query(
        collection(FIRESTORE_DB, 'User'),
        where('email', '==', user_email),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]; // Get the first matching document
        await updateDoc(doc(FIRESTORE_DB, 'User', userDoc.id), updatedData);
        addLog({
          action: action,
          target_email: user_email,
        });
        setRequest('success');
        setIsLoading(false);
      } else {
        setRequest('error');
        setIsLoading(false);
      }
    } catch (error) {
      setRequest('error');
      setIsLoading(false);
    }
  };

  const updateUserWithCompany = async (userEmail: string) => {
    try {
      // Step 1: Find the user document by email
      const userQuery = query(
        collection(FIRESTORE_DB, 'User'),
        where('email', '==', userEmail),
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        console.log(`No user found with email: ${userEmail}`);
        setToast({
          request: 'error',
          show: true,
          message: `No user found with email: ${userEmail}`,
        });
        return;
      }

      const userDoc = userSnapshot.docs[0]; // Assuming email is unique
      const userId = userDoc.id;
      const userData = userDoc.data();

      if (userData.company) {
        console.log(
          `User ${userEmail} already has a company: ${userData.company}`,
        );
        setToast({
          request: 'error',
          show: true,
          message: `User is already assigned to company ${userData.company}`,
        });
        return;
      }

      //Step 2:  Find matching client document
      const clientQuery = query(
        collection(FIRESTORE_DB, 'Client'),
        where('email', '==', userEmail),
      );
      const clientSnapshot = await getDocs(clientQuery);

      if (clientSnapshot.empty) {
        console.log(`No client found with email: ${userEmail}`);
        setToast({
          request: 'error',
          show: true,
          message: `${userEmail} is not Authorized`,
        });
        return;
      }

      const clientData = clientSnapshot.docs[0].data();
      const company = clientData.company; // Assuming "company" is the field in Client

      if (!company) {
        console.log(`No company field found for email: ${userEmail}`);
        setToast({
          request: 'error',
          show: true,
          message: `No company field found for email: ${userEmail}`,
        });
        return;
      }

      // Update the user document with the company field
      await updateDoc(doc(FIRESTORE_DB, 'User', userId), { company });

      console.log(`Updated user ${userEmail} with company ${company}`);
      setToast({
        request: 'success',
        show: true,
        message: `Updated user with company ${company}`,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      setToast({ request: 'error', show: true, message: `Update failed` });
    }
  };

  return {
    users,
    isLoading,
    request,
    userData,
    isFetching,
    fetchUserData,
    setRequest,
    toast,
    getAllUsers,
    getAllLatestUsers,
    updateUserWithCompany,
    getUsers,
    getUserSessions,
    searchSpecificUser,
    updateUserByEmail,
  };
};
