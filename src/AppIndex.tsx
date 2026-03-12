import { StrictMode, useCallback, useEffect, useRef, useState } from "react";
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
  const [connecting, setConnecting] = useState(false);

  const [tournament, setTournament] = useState<Tournament>();
  const [idToSet, setIdToSet] = useState<Map<number, Set>>();

  const webSocketOpenRef = useRef(false);
  const webSocketConnectingRef = useRef(false);
  const timeoutRef = useRef<number>(undefined);

  const startWebSocket = useCallback(() => {
    console.log("startWebSocket");
    console.log(webSocketOpenRef.current);
    console.log(webSocketConnectingRef.current);
    console.log(document.visibilityState);
    const inner = (nextTimeout: number = 1000) => {
      if (nextTimeout < 1000) {
        throw new Error();
      }
      if (
        webSocketOpenRef.current ||
        webSocketConnectingRef.current ||
        document.visibilityState === "hidden"
      ) {
        return null;
      }

      let actualNextTimeout = nextTimeout;
      webSocketConnectingRef.current = true;
      setConnecting(true);

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
        actualNextTimeout = 1000;
        setWebSocketOpen(true);
        setWebSocketFailedToConnect(false);
        setConnecting(false);
        setConnectOpen(false);
      };
      const errorListener = () => {
        webSocket.removeEventListener("open", openListener);
        setWebSocketFailedToConnect(true);
      };
      webSocket.addEventListener("open", openListener);
      webSocket.addEventListener("error", errorListener);

      webSocket.addEventListener("close", () => {
        webSocketOpenRef.current = false;
        webSocketConnectingRef.current = false;
        setWebSocketOpen(false);
        setConnecting(false);
        if (document.visibilityState === "visible") {
          timeoutRef.current = setTimeout(() => {
            inner(Math.min(16000, actualNextTimeout * 2));
          }, actualNextTimeout);
        }
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
    };
    return inner();
  }, []);

  useEffect(() => {
    const webSocket = startWebSocket();
    if (webSocket) {
      return () => {
        webSocket.close();
      };
    }
    return () => {};
  }, [startWebSocket]);

  useEffect(() => {
    document.onvisibilitychange = () => {
      if (
        document.visibilityState === "visible" &&
        !webSocketOpenRef.current &&
        !webSocketConnectingRef.current
      ) {
        startWebSocket();
      } else if (document.visibilityState === "hidden") {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [startWebSocket]);

  return (
    <StrictMode>
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
              startWebSocket();
            }}
            variant="contained"
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </StrictMode>
  );
}

export default AppIndex;
