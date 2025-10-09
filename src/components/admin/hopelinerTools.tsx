import React from 'react';
import SubmitLeave from './components/SubmitLeave';
import CollectionView from '../custom/molecules/CollectionView';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { User } from 'firebase/auth';

function HopelinerToolsPage(props: {
  id_token: any;
  user: any;
  handleNav?: any;
  userType: any;
  view: any;
}) {
  const currentUser: User | null = FIREBASE_AUTH.currentUser;
  console.log(currentUser?.uid);

  return (
    <div>
      <p>Hopeliner Tools</p>
      <CollectionView
        title="Leave Filings"
        column={'hopeliner_id'}
        table={'leave_requests'}
        param={currentUser?.uid as string}
      />
      <SubmitLeave />
    </div>
  );
}
export default HopelinerToolsPage;
