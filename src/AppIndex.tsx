import { useEffect, useState } from "react";
import { type Tournament } from "./types";
import { AppBar, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { LeakAdd, LeakRemove } from "@mui/icons-material";
import TournamentEl from "./Tournament";

function AppIndex() {
  const [webSocketOpen, setWebSocketOpen] = useState(false);
  const [webSocketError, setWebSocketError] = useState(false);
  const [tournament, setTournament] = useState<Tournament>();
  useEffect(() => {
    const webSocket = new WebSocket(
      `ws://${location.hostname}`,
      "bracket-protocol"
    );
    webSocket.onopen = () => {
      setWebSocketOpen(true);
      setWebSocketError(false);
      webSocket.send(
        JSON.stringify({
          op: "client-id-request",
          num: 1,
          computerName: "",
          clientName: "Offline Mode",
        })
      );
    };
    webSocket.onerror = () => {
      setWebSocketError(true);
    };
    webSocket.onclose = () => {
      setWebSocketOpen(false);
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

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: (theme) => theme.palette.common.white,
          color: (theme) => theme.palette.text.primary,
        }}
      >
        <Toolbar disableGutters>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            paddingLeft="8px"
            width="100%"
          >
            <Typography variant="body1">
              {tournament ? tournament.name : "Offline Mode"}
            </Typography>
            <IconButton
              color={webSocketError ? "error" : "primary"}
              onClick={() => {}}
            >
              {webSocketOpen ? <LeakAdd /> : <LeakRemove />}
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack marginTop="56px" marginBottom="8px">
        {tournament && <TournamentEl tournament={tournament} />}
      </Stack>
    </>
  );
}

export default AppIndex;
