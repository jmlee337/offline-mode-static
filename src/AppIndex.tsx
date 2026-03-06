import { useEffect, useState } from "react";
import { type Status, type Tournament } from "./types";

function AppIndex() {
  const [status, setStatus] = useState<Status>("closed");
  const [error, setError] = useState("");
  const [tournament, setTournament] = useState<Tournament>();
  useEffect(() => {
    const webSocket = new WebSocket(
      `ws://${location.hostname}`,
      "bracket-protocol"
    );
    webSocket.onopen = () => {
      setStatus("open");
      webSocket.send(
        JSON.stringify({
          op: "client-id-request",
          num: 1,
          computerName: "",
          clientName: "Offline Mode",
        })
      );
    };
    webSocket.onerror = (ev) => {
      setStatus("error");
      setError(JSON.stringify(ev));
    };
    webSocket.onclose = () => {
      setStatus("closed");
    };
    webSocket.onmessage = (ev) => {
      try {
        const message = JSON.parse(ev.data);
        if (message.op === "tournament-update-event" && message.tournament) {
          setTournament(message.tournament);
        }
      } catch {
        // just catch
      }
    };
    return () => {
      webSocket.close();
    };
  }, []);

  return <div>{tournament && JSON.stringify(tournament)}</div>;
}

export default AppIndex;
