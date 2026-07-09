import { useEffect } from "react";
import { ref, onChildAdded } from "firebase/database";
import { db } from "../firebase";

const NotificationListener = () => {
  useEffect(() => {
    const leadsRef = ref(db, "fibreLeads");

    onChildAdded(leadsRef, (snapshot) => {
      const data = snapshot.val();

      if (data?.name) {
        alert(`🔔 New Lead Received: ${data.name} ${data.surname}`);
      }
    });
  }, []);

  return null;
};

export default NotificationListener;