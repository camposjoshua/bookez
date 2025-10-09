import { ButtonBase, Divider } from '@mui/material';
import {
  LeaveRequestProps,
  SessionProps,
  UserProps,
} from '../../../../constants/types/interfaceProps';
import { formatFBTimestamp } from '../../../../services/date_services';
import { StatusChip } from './StatusChip';
import { getCompany } from '../../../../services/company_service';
import { useEffect, useState } from 'react';
import { useAccounts } from '../../../../hooks/useAccounts';

export const TableRow = (props: {
  data: SessionProps;
  index: number;
  onEmailClick: (email: string, user_type: 2 | 3) => void;
}) => {
  const { data, index, onEmailClick } = props;

  return (
    <div style={{ backgroundColor: 'white' }}>
      <div
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
      >
        <div className="cell-value" style={{ flex: 0.1, fontSize: 10 }}>
          {index + 1}
        </div>
        <div className="cell-value" style={{ flex: 0.6, fontSize: 10 }}>
          {StatusChip(data.status)}
        </div>
        <div className="cell-value" style={{ flex: 2, fontSize: 10 }}>
          <p style={{ marginRight: '2px' }}>{data.company}</p>
          <span
            style={{ cursor: 'pointer', color: 'blue' }}
            onClick={() => onEmailClick(data.user_email, 3)}
          >
            {data.user_email}
          </span>
        </div>
        <div className="cell-value" style={{ flex: 1, fontSize: 10 }}>
          {data.date ? formatFBTimestamp(data.date.seconds) : 'N/A'}
        </div>
        <div className="cell-value" style={{ flex: 1, fontSize: 10 }}>
          <span
            style={{ cursor: 'pointer', color: 'blue' }}
            onClick={() => onEmailClick(data.hopeliner_email, 2)}
          >
            {data.hopeliner_name}
          </span>
        </div>
        <div className="table-cell" style={{ flex: 1, fontSize: 10 }}>
          {data.date_created
            ? formatFBTimestamp(data.date_created.seconds)
            : 'N/A'}
        </div>
      </div>
      <Divider />
    </div>
  );
};
