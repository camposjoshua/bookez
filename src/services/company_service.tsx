import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIRESTORE_DB } from '../firebaseConfig';

export const getCompany = async (text: string) => {
  try {
    let q = query(
      collection(FIRESTORE_DB, 'Client'),
      where('email', '==', text),
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No matching documents.');
      return null;
    }

    const userDoc = querySnapshot.docs[0];

    return `${userDoc.data().company}`;
  } catch (error) {
    console.error('Error getting documents: ', error);
    return 'Unknown';
  }
};
