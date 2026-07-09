import { MenuItem, Select } from "@mui/material";
import { update, ref } from "firebase/database";
import { db } from "../firebase";

const agents = ["Lebohang Molelekoa"];

const AgentAssign = ({ leadId, current }: any) => {
  const assignAgent = (agent: string) => {
    update(ref(db, `fibreLeads/${leadId}`), {
      assignedAgent: agent,
    });
  };

  return (
    <Select
      size="small"
      value={current || ""}
      onChange={(e) => assignAgent(e.target.value)}
    >
      {agents.map((a) => (
        <MenuItem value={a} key={a}>
          {a}
        </MenuItem>
      ))}
    </Select>
  );
};

export default AgentAssign;