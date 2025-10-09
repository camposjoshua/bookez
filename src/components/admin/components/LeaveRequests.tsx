import React, { useEffect, useState } from 'react';
import {
  query,
  collection,
  onSnapshot,
  doc,
  addDoc,
  orderBy,
  limit,
  updateDoc,
} from 'firebase/firestore';
import { LeaveRequestProps } from '../../../constants/types/interfaceProps';
import { FIRESTORE_DB } from '../../../firebaseConfig';
import Swal from 'sweetalert2';
import { Divider, IconButton, Tooltip } from '@mui/material';
import { formatFBTimestamp } from '../../../services/date_services';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FolderIcon from '@mui/icons-material/Folder';

const TooltipConfig = {
  popper: {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, -12],
        },
      },
    ],
  },
};

function LeaveRequests(props: {}) {
  const [documents, setDocuments] = useState<any>([]);

  const updateLeave = async (
    action: 'status' | 'archive',
    value: number | boolean,
    docID: string,
  ) => {
    const documentRef = doc(FIRESTORE_DB, 'leave_requests', docID);

    if (action === 'status') {
      const updatedData = {
        leave_status: value,
      };

      try {
        // Attempt to update the document
        await updateDoc(documentRef, updatedData);
        Swal.fire({
          title: value === 1 ? 'Leave Filed!' : 'Leave Denied!',
          text:
            value === 1
              ? `Hopeliner Schedule is now blocked`
              : 'Request has been denied',
          icon: 'success',
        });
        console.log('Document updated successfully');
      } catch (error) {
        Swal.fire({
          title: 'Action Failed',
          text: 'Contact Admin',
          icon: 'error',
        });
      }
    }

    if (action === 'archive') {
      const updatedData = {
        archive: value,
      };

      try {
        // Attempt to update the document
        await updateDoc(documentRef, updatedData);
        console.log('Document updated successfully');
      } catch (error) {
        Swal.fire({
          title: 'Action Failed',
          text: 'Contact Admin',
          icon: 'error',
        });
      }
    }
  };

  const handleSubmitLeave = async (data: any) => {
    const { leave_status, id, ...updatedData } = data;

    try {
      const doc = await addDoc(
        collection(FIRESTORE_DB, 'Session'),
        updatedData,
      );
      if (doc) {
        await updateLeave('status', 1, id);
      }
    } catch {
      Swal.fire({
        title: 'Action Failed',
        text: 'Contact Admin',
        icon: 'error',
      });
    }
  };

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
          <div className="cell-value" style={{ flex: 2, fontSize: 10 }}>
            {data.hopeliner_email}
          </div>
          <div className="table-cell" style={{ flex: 1 }}>
            {data.date_created
              ? formatFBTimestamp(data.date_created.seconds)
              : 'N/A'}
          </div>

          {data.leave_status === 4 ||
          data.leave_status === 1 ||
          data.leave_status === 2 ? (
            <div className="table-cell" style={{ height: 40 }}>
              <Tooltip
                title="Archive"
                onClick={() => {
                  updateLeave('archive', true, data.id);
                }}
                slotProps={TooltipConfig}
              >
                <IconButton>
                  <FolderIcon color="disabled" />
                </IconButton>
              </Tooltip>
            </div>
          ) : (
            <div className="table-cell">
              <Tooltip title="Approve" slotProps={TooltipConfig}>
                <IconButton onClick={() => handleSubmitLeave(data)}>
                  <CheckCircleIcon color="success" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Decline" slotProps={TooltipConfig}>
                <IconButton
                  color="warning"
                  onClick={() => {
                    updateLeave('status', 2, data.id);
                  }}
                >
                  <CancelIcon color="error" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>
        <Divider />
      </div>
    );
  };

  useEffect(() => {
    const collectionRef = collection(FIRESTORE_DB, 'leave_requests');

    const q = query(collectionRef, orderBy('date_created', 'desc'), limit(50));

    console.log(q, 'Query from DB');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: any = snapshot.docs
        .map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((doc) => doc.archive === false);

      setDocuments(docs);
    });

    return () => unsubscribe();
  }, []);

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
        <div>Leave Requests</div>
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
          <div className="cell-value" style={{ fontWeight: 600, flex: 2 }}>
            Hopeliner
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
            <TableRow key={doc.id} data={doc} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LeaveRequests;
