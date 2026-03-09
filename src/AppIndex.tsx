import { useEffect, useState } from "react";
import { type Set, type Tournament } from "./types";
import { AppBar, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { LeakAdd, LeakRemove } from "@mui/icons-material";
import TournamentEl from "./Tournament";

function AppIndex() {
  const [webSocketOpen, setWebSocketOpen] = useState(false);
  const [webSocketError, setWebSocketError] = useState(false);
  const [tournament, setTournament] = useState<Tournament>();
  const [idToSet, setIdToSet] = useState<Map<number, Set>>();

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
          const newTournament = message.tournament as Tournament;
          const newIdToSet = new Map<number, Set>();
          newTournament.events.forEach((event) => {
            event.phases.forEach((phase) => {
              phase.pools.forEach((pool) => {
                pool.sets.forEach((set) => {
                  newIdToSet.set(set.id, set);
                });
              });
            });
          });
          setTournament(newTournament);
          setIdToSet(newIdToSet);
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
        <Toolbar disableGutters style={{ minHeight: "56px" }}>
          <Stack
            direction="row"
            alignItems="center"
            boxSizing="border-box"
            justifyContent="space-between"
            paddingLeft="8px"
            width="100%"
          >
            <Typography
              overflow="hidden"
              textOverflow="ellipsis"
              variant="subtitle2"
              whiteSpace="nowrap"
            >
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
        {tournament && idToSet && (
          <TournamentEl tournament={tournament} idToSet={idToSet} />
        )}
      </Stack>
    </>
  );
}

export default AppIndex;
