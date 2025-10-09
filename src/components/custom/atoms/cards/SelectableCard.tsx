import { Box } from "@mui/material";
import "./cards.css";
import { JSX } from "react";

type SelectableCardProps = {
  title: string;
  icon: JSX.Element;
};

export const SelectableCard: React.FC<SelectableCardProps> = ({
  title,
  icon,
}) => {
  return (
    <Box className="card-1">
      <div
        style={{
          display: "flex",
          paddingTop: "8px",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <p
        style={{
          display: "inline-flex",
          padding: "8px",
        }}
      >
        {title}
      </p>
    </Box>
  );
};
