import React, { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import './molecules.css';
import { FIRESTORE_DB } from '../../../firebaseConfig';
import { LeaveRequestProps } from '../../../constants/types/interfaceProps';
import { formatFBTimestamp } from '../../../services/date_services';
import { Button, Divider } from '@mui/material';
import Swal from 'sweetalert2';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const checkStatus = (status: number) => {
  if (status === 3) {
    return 'Pending';
  }
  if (status === 1) {
    return 'Approved';
  }
  if (status === 2) {
    return 'Denied';
  }
  if (status === 4) {
    return 'Cancelled';
  } else {
    return 'N/A';
  }
};

function CollectionView(props: {
  table: 'Session' | 'leave_requests';
  param: string;
  column: string;
  title: string;
}) {
  const { param, table, column, title } = props;
  const [documents, setDocuments] = useState<any>([]);

  const handleDelete = async (docID: string, date: any) => {
    try {
      const docRef = doc(FIRESTORE_DB, 'leave_requests', docID);
      await deleteDoc(docRef);
      console.log(
        `Leave Request ${formatFBTimestamp(date)} successfully deleted `,
      );

      alert('Request successfully deleted!');
    } catch (err) {
      alert('Request deletion unsuccessful');
    }
  };

  const handleUpdate = async (
    action: 'cancel' | 'delete',
    docID: string,
    date: any,
  ) => {
    try {
      const docRef = doc(FIRESTORE_DB, 'leave_requests', docID);

      await updateDoc(docRef, {
        leave_status: action === 'cancel' ? 4 : 0,
      });

      Swal.fire({
        title: 'Update Successful',
        icon: 'success',
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Update Failed',
        text: 'Contact Admin',
        icon: 'error',
      });
    }
  };

  const TableRow = (props: { data: LeaveRequestProps }) => {
    const { data } = props;

    return (
      <div style={{ backgroundColor: 'white' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <div className="cell-value" style={{ flex: 1 }}>
            {data.date ? formatFBTimestamp(data.date.seconds) : 'N/A'}
          </div>
          <div className="cell-value" style={{ flex: 1 }}>
            {checkStatus(data.leave_status)}
          </div>
          <div className="table-cell" style={{ flex: 1 }}>
            {data.date_created
              ? formatFBTimestamp(data.date_created.seconds)
              : 'N/A'}
          </div>

          {data.leave_status === 4 ||
          data.leave_status === 1 ||
          data.leave_status === 2 ? (
            <div className="table-cell" style={{ height: 40 }}></div>
          ) : (
            <div className="table-cell">
              <Button
                color="warning"
                sx={{ height: 25, marginY: 1, fontSize: 11 }}
                variant="text"
                onClick={() =>
                  handleUpdate(
                    'cancel',
                    data.id,
                    formatFBTimestamp(data.date.seconds),
                  )
                }
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
        <Divider />
      </div>
    );
  };

  useEffect(() => {
    const collectionRef = collection(FIRESTORE_DB, table);

    const q = query(
      collectionRef,
      where(column, '==', param),
      orderBy('date_created', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: any = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDocuments(docs);
    });

    return () => unsubscribe();
  }, [column, param, table]);

  return (
    <div>
      <div
        style={{
          marginTop: 8,
          marginBottom: 8,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <CalendarMonthIcon color="info" />
        <div>{title}</div>
      </div>
      <div
        style={{
          borderColor: 'gray',
          borderWidth: 5,
          borderRadius: 10,
          overflow: 'hidden',
          padding: 5,
          backgroundColor: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            borderBlockColor: 'black',
            borderBottomWidth: 1,
            borderBlockStyle: 'solid',
            borderTopWidth: 0,
          }}
        >
          <div className="cell-value" style={{ fontWeight: 600 }}>
            Leave Request
          </div>
          <div className="cell-value" style={{ fontWeight: 600 }}>
            Status
          </div>
          <div
            className="table-cell"
            style={{ backgroundColor: 'whitesmoke', fontWeight: 600 }}
          >
            Date Created
          </div>
          <div className="table-cell" />
        </div>
        <div style={{ height: '200px', overflowY: 'scroll' }}>
          {documents.map((doc: any) => (
            <TableRow data={doc} />
          ))}
        </div>
      </div>
    </div>
  );
}
export default CollectionView;
