import React, { useState } from "react";
import { FIRESTORE_DB } from "../../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { csvParse } from "d3-dsv";
import {
  Box,
  Button,
  ButtonBase,
  Grow,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import SearchQuestionnaire from "./components/SearchQuestionnaire";
import LeaveRequests from "./components/LeaveRequests";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SessionTracker from "./components/SessionTracker";
import { BreadCrumb } from "../custom/molecules/sessionTracker/BreadCrumb";
import SettingsIcon from "@mui/icons-material/Settings";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { SelectableCard } from "../custom/atoms/cards/SelectableCard";
import { AccountManagement } from "./components/AccountManagement";
import { AnalyticsTool } from "./components/database/Analytics";

function AdminControlPage(
  props: Readonly<{
    handleUser?: any;
    handleCode?: any;
    handleTokens?: any;
    handleNavigation?: any;
    view?: any;
  }>
) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    // Read the contents of the file
    try {
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        const fileContent = event.target.result;

        // Parse the CSV content
        const parsedData = csvParse(fileContent);

        // Upload each row to Firestore
        const db = FIRESTORE_DB;
        const collectionRef = collection(db, "Client");

        parsedData.forEach(async (row: any) => {
          try {
            await addDoc(collectionRef, row);
          } catch (error) {
            console.error("Error adding document:", error);
          }
        });

        console.log("Data uploaded successfully.");
      };
      reader.readAsText(selectedFile);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const onClear = () => {
    setEmail("");
    setCompany("");
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    onClear();
  };

  const addClient = async () => {
    const newClient = {
      email: email.toLowerCase(),
      company: company,
      normal_case: email.toLowerCase(),
    };

    try {
      await addDoc(collection(FIRESTORE_DB, "Client"), newClient);
      alert("Client added successfully");
      handleClose();
    } catch (error) {
      alert("Failed to add client");
      console.log("failed", error);
    }
  };

  return (
    <section style={{ paddingBottom: 50, marginBottom: 10 }}>
      <div className="default-container">
        <BreadCrumb
          icon={<SettingsIcon color="info" className="mr-1" />}
          parent={"Admin Control"}
          selectedName={selectedWindow}
          onClick={() => setSelectedWindow(null)}
        />
        <div className="row-g2 pt-2">
          <ButtonBase onClick={() => setSelectedWindow("Sessions")}>
            <SelectableCard
              title={"Sessions"}
              icon={<FolderIcon color="info" className="mr-1" />}
            />
          </ButtonBase>

          <ButtonBase onClick={() => setSelectedWindow("Database")}>
            <SelectableCard
              title={"Database"}
              icon={<CloudUploadIcon color={"info"} />}
            />
          </ButtonBase>

          <ButtonBase onClick={() => setSelectedWindow("Leave Request")}>
            <SelectableCard
              title={"Leave Request"}
              icon={<CalendarMonthIcon color="info" />}
            />
          </ButtonBase>

          <ButtonBase onClick={() => setSelectedWindow("Account Management")}>
            <SelectableCard
              title={"Account Management"}
              icon={<AccountBoxIcon color="info" />}
            />
          </ButtonBase>
        </div>
      </div>

      {selectedWindow === "Database" && (
        <>
          <div className="default-container">
            <p>Admin Control</p>

            <section
              className="update-database"
              style={{ marginTop: 10, marginBottom: 10 }}
            >
              <div
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CloudUploadIcon color={"info"} />
                <div>Update Database</div>
              </div>
              <div
                style={{
                  padding: 8,
                  margin: 2,
                  backgroundColor: "white",
                  borderRadius: 4,
                  width: "max-content",
                }}
              >
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload File</button>
              </div>
            </section>

            <SearchQuestionnaire info={undefined} type={""} />

            <Button
              sx={{ marginTop: "20px" }}
              color="primary"
              onClick={handleOpen}
            >
              Add Client
            </Button>

            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 400,
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 8,
                }}
              >
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Add New Client
                </Typography>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={addClient}
                  sx={{ mt: 2 }}
                >
                  Add Client
                </Button>
              </Box>
            </Modal>
          </div>
          <AnalyticsTool />
        </>
      )}

      {selectedWindow === "Sessions" && (
        <Grow
          in={selectedWindow === "Sessions"}
          style={{ transformOrigin: "0 0 0" }}
          {...(selectedWindow === "Sessions" ? { timeout: 1000 } : {})}
        >
          <div className="default-container">
            <SessionTracker />
          </div>
        </Grow>
      )}

      {selectedWindow === "Leave Request" && (
        <Grow
          in={selectedWindow === "Leave Request"}
          style={{ transformOrigin: "0 0 0" }}
          {...(selectedWindow === "Leave Request" ? { timeout: 1000 } : {})}
        >
          <div className="default-container">
            <LeaveRequests />
          </div>
        </Grow>
      )}

      {selectedWindow === "Account Management" && (
        <Grow
          in={selectedWindow === "Account Management"}
          style={{ transformOrigin: "0 0 0" }}
          {...(selectedWindow === "Account Management"
            ? { timeout: 1000 }
            : {})}
        >
          <div className="default-container">
            <AccountManagement />
          </div>
        </Grow>
      )}
    </section>
  );
}
export default AdminControlPage;
