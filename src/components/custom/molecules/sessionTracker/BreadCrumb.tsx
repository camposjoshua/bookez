import { ArrowRightIcon } from "@mui/x-date-pickers";
import { JSX } from "react";

interface SessionDocumentsProps {
  icon: JSX.Element;
  parent: string;
  selectedName: string | null;
  onClick: () => void;
}

export const BreadCrumb: React.FC<SessionDocumentsProps> = ({
  selectedName,
  onClick,
  icon,
  parent,
}) => {
  return (
    <div className="row-centered">
      {icon}

      {selectedName ? (
        <span
          style={{ cursor: "pointer", textDecorationLine: "underline" }}
          onClick={onClick}
        >
          {parent}
        </span>
      ) : (
        <p>{parent}</p>
      )}

      {selectedName && (
        <>
          <ArrowRightIcon color="info" className="ml-1" />
          <p style={{ fontWeight: "600" }}>{selectedName}</p>
        </>
      )}
    </div>
  );
};
