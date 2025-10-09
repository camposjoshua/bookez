import React, { useState } from 'react';
import './atoms.css';
import { handleCopy } from '../../../services/text_tools';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function TextCopyButton(props: { text: string }) {
  const { text } = props;
  const [isCopied, setCopy] = useState(false);

  const handleClick = (data: string) => {
    handleCopy(data);
    setCopy(true);
    setTimeout(() => setCopy(false), 5000); // Reset after 2 seconds
  };

  return (
    <div
      aria-hidden="true"
      className={isCopied ? 'text-copy-btn-sltd' : 'text-copy-btn'}
      onClick={() => handleClick(text)}
    >
      <p style={{ marginRight: 10 }}>{text}</p>
      {isCopied ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p style={{ marginRight: 5 }}>Copied</p>
          <CheckCircleIcon color="success" sx={{ fontSize: 12 }} />
        </div>
      ) : (
        <ContentCopyIcon sx={{ fontSize: 12 }} />
      )}
    </div>
  );
}
export default TextCopyButton;
