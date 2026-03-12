import { useCallback, useEffect, useRef, useState } from "react";
import { type Set, type Tournament } from "./types";
import {
  Alert,
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { LeakAdd, LeakRemove } from "@mui/icons-material";
import TournamentEl from "./Tournament";

function AppIndex() {
  const [webSocketOpen, setWebSocketOpen] = useState(false);
  const [webSocketFailedToConnect, setWebSocketFailedToConnect] =
    useState(false);

  const [connectOpen, setConnectOpen] = useState(false);
  const [connecting, setConnecting] = useState(Boolean(true));

  const [tournament, setTournament] = useState<Tournament>();
  const [idToSet, setIdToSet] = useState<Map<number, Set>>();

  const webSocketOpenRef = useRef(false);
  const webSocketConnectingRef = useRef(true);

  const startWebSocket = useCallback(() => {
    const webSocket = new WebSocket(
      `ws://${location.hostname}`,
      "bracket-protocol"
    );
    const openListener = () => {
      webSocket.removeEventListener("error", errorListener);
      webSocket.send(
        JSON.stringify({
          op: "client-id-request",
          num: 1,
          computerName: "",
          clientName: "Offline Mode",
        })
      );
      webSocketOpenRef.current = true;
      webSocketConnectingRef.current = false;
      setWebSocketOpen(true);
      setWebSocketFailedToConnect(false);
      setConnecting(false);
      setConnectOpen(false);
    };
    const errorListener = () => {
      webSocket.removeEventListener("open", openListener);
      setWebSocketFailedToConnect(true);
      setConnectOpen(true);
    };
    webSocket.addEventListener("open", openListener);
    webSocket.addEventListener("error", errorListener);

    webSocket.addEventListener("close", () => {
      webSocketOpenRef.current = false;
      webSocketConnectingRef.current = false;
      setWebSocketOpen(false);
      setConnecting(false);
      setConnectOpen(true);
    });
    webSocket.addEventListener("message", (ev) => {
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
    });
    return webSocket;
  }, []);

  useEffect(() => {
    const webSocket = startWebSocket();
    return () => {
      webSocket.close();
    };
  }, [startWebSocket]);

  useEffect(() => {
    document.onvisibilitychange = () => {
      if (
        document.visibilityState === "visible" &&
        !webSocketOpenRef.current &&
        !webSocketConnectingRef.current
      ) {
        startWebSocket();
      }
    };
  }, [startWebSocket]);

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
              color={webSocketOpen ? "primary" : "error"}
              onClick={() => {
                setConnectOpen(true);
              }}
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
      <Dialog
        open={connectOpen}
        onClose={() => {
          setConnectOpen(false);
        }}
      >
        <DialogTitle>
          {webSocketFailedToConnect
            ? "Error!"
            : webSocketOpen
            ? "Connected"
            : "Disconnected"}
        </DialogTitle>
        <DialogContent style={{ paddingTop: 0 }}>
          {webSocketFailedToConnect && (
            <Alert severity="error">Couldn't Connect</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            disabled={connecting || webSocketOpen}
            onClick={() => {
              webSocketConnectingRef.current = true;
              setConnecting(true);
              startWebSocket();
            }}
            variant="contained"
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AppIndex;
