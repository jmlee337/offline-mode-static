import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type ReportGame,
  type Request,
  type Set,
  type Tournament,
} from "./types";
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
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { LeakAdd, LeakRemove } from "@mui/icons-material";
import TournamentEl from "./Tournament";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { base64url } from "rfc4648";
import { PASSWORD_KEY, UNAUTH_CODE } from "./constants";

function getPassword() {
  return sessionStorage?.getItem(PASSWORD_KEY) ?? "";
}

function AppAdmin() {
  const [webSocketConnected, setWebSocketConnected] = useState(false);
  const [webSocketFailedToConnect, setWebSocketFailedToConnect] =
    useState(false);
  const [webSocketUnauth, setWebSocketUnauth] = useState(false);
  const webSocketError = useMemo(() => {
    return webSocketFailedToConnect || webSocketUnauth;
  }, [webSocketFailedToConnect, webSocketUnauth]);

  const [connectOpen, setConnectOpen] = useState(!getPassword());
  const [connecting, setConnecting] = useState(Boolean(getPassword()));

  const [tournament, setTournament] = useState<Tournament>();
  const [idToSet, setIdToSet] = useState<Map<number, Set>>();

  const nextNumRef = useRef(1);
  const webSocketRef = useRef<WebSocket | null>(null);
  const webSocketConnectedRef = useRef(false);
  const webSocketConnectingRef = useRef(Boolean(getPassword()));

  const startWebSocket = useCallback((password: string) => {
    const newWebSocket = new WebSocket(
      `ws://${location.hostname}`,
      "admin-protocol"
    );
    const openListener = () => {
      newWebSocket.removeEventListener("error", errorListener);
      setWebSocketFailedToConnect(false);
    };
    const errorListener = () => {
      newWebSocket.removeEventListener("open", openListener);
      setWebSocketFailedToConnect(true);
      setConnectOpen(true);
    };
    newWebSocket.addEventListener("open", openListener);
    newWebSocket.addEventListener("error", errorListener);
    newWebSocket.addEventListener("close", (ev) => {
      webSocketRef.current = null;
      webSocketConnectedRef.current = false;
      webSocketConnectingRef.current = false;
      setWebSocketConnected(false);
      setConnecting(false);
      if (ev.code === UNAUTH_CODE) {
        setWebSocketUnauth(true);
        setConnectOpen(true);
      }
    });
    newWebSocket.addEventListener("message", async (ev) => {
      try {
        const message = JSON.parse(ev.data);
        if (message.op === "auth-hello") {
          if (
            typeof message.challenge === "string" &&
            typeof message.salt === "string"
          ) {
            const secretSha256 = new Sha256();
            secretSha256.update(password);
            secretSha256.update(message.salt);
            const secret = base64url.stringify(await secretSha256.digest(), {
              pad: false,
            });

            const authenticationSha256 = new Sha256();
            authenticationSha256.update(secret);
            authenticationSha256.update(message.challenge);
            const authentication = base64url.stringify(
              await authenticationSha256.digest(),
              { pad: false }
            );
            newWebSocket.send(
              JSON.stringify({
                op: "auth-identify",
                authentication,
              })
            );
          }
        } else if (message.op === "auth-success-event") {
          const num = nextNumRef.current;
          nextNumRef.current = num + 1;
          newWebSocket.send(
            JSON.stringify({
              op: "client-id-request",
              num,
              computerName: "",
              clientName: "Offline Mode Admin",
            })
          );
          webSocketRef.current = newWebSocket;
          webSocketConnectedRef.current = true;
          webSocketConnectingRef.current = false;
          setWebSocketConnected(true);
          setWebSocketUnauth(false);
          setConnecting(false);
          setConnectOpen(false);
        } else if (
          message.op === "tournament-update-event" &&
          message.tournament
        ) {
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
    return newWebSocket;
  }, []);

  useEffect(() => {
    const password = sessionStorage?.getItem(PASSWORD_KEY);
    if (password) {
      const newWebSocket = startWebSocket(password);
      return () => {
        newWebSocket.close();
      };
    }
    return () => {};
  }, [startWebSocket]);

  useEffect(() => {
    document.onvisibilitychange = () => {
      if (
        document.visibilityState === "visible" &&
        !webSocketConnectedRef.current &&
        !webSocketConnectingRef.current
      ) {
        const password = sessionStorage?.getItem(PASSWORD_KEY);
        if (password) {
          webSocketConnectingRef.current = true;
          setConnecting(true);
          startWebSocket(password);
        }
      }
    };
  }, [startWebSocket]);

  const doRequest = useCallback((request: Request, responseOp: string) => {
    return new Promise<void>((resolve, reject) => {
      if (webSocketRef.current === null) {
        reject(new Error("not connected"));
        return;
      }

      const listener = (ev: MessageEvent) => {
        try {
          const message = JSON.parse(ev.data);
          if (message.num === request.num && message.op === responseOp) {
            webSocketRef.current?.removeEventListener("message", listener);
            if (message.err) {
              reject(new Error(message.err));
            } else if (!message.data) {
              reject(new Error("no data"));
            } else {
              resolve();
            }
          }
        } catch (e: unknown) {
          reject(e);
          return;
        }
      };
      webSocketRef.current.addEventListener("message", listener);
      webSocketRef.current.send(JSON.stringify(request));
    });
  }, []);

  const resetSet = useCallback(
    async (id: number) => {
      const num = nextNumRef.current;
      nextNumRef.current = num + 1;
      const resetSetRequest: Request = {
        num,
        op: "reset-set-request",
        id,
      };
      await doRequest(resetSetRequest, "reset-set-response");
    },
    [doRequest]
  );

  const callSet = useCallback(
    async (id: number) => {
      const num = nextNumRef.current;
      nextNumRef.current = num + 1;
      const callSetRequest: Request = {
        num,
        op: "call-set-request",
        id,
      };
      await doRequest(callSetRequest, "call-set-response");
    },
    [doRequest]
  );

  const startSet = useCallback(
    async (id: number) => {
      const num = nextNumRef.current;
      nextNumRef.current = num + 1;
      const startSetRequest: Request = {
        num,
        op: "start-set-request",
        id,
      };
      await doRequest(startSetRequest, "start-set-response");
    },
    [doRequest]
  );

  const assignSetStation = useCallback(
    async (id: number, stationId: number) => {
      const num = nextNumRef.current;
      nextNumRef.current = num + 1;
      const assignSetStationRequest: Request = {
        num,
        op: "assign-set-station-request",
        id,
        stationId,
      };
      await doRequest(assignSetStationRequest, "assign-set-station-response");
    },
    [doRequest]
  );

  const assignSetStream = useCallback(
    async (id: number, streamId: number) => {
      const num = nextNumRef.current;
      nextNumRef.current = num + 1;
      const assignSetStreamRequest: Request = {
        num,
        op: "assign-set-stream-request",
        id,
        streamId,
      };
      await doRequest(assignSetStreamRequest, "assign-set-stream-response");
    },
    [doRequest]
  );

  const reportSet = useCallback(
    async (
      id: number,
      winnerId: number,
      isDQ: boolean,
      gameData: ReportGame[]
    ) => {
      const num = nextNumRef.current;
      nextNumRef.current = num + 1;
      const reportSetRequest: Request = {
        num,
        op: "report-set-request",
        id,
        winnerId,
        isDQ,
        gameData,
      };
      await doRequest(reportSetRequest, "report-set-response");
    },
    [doRequest]
  );

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
              Admin - {tournament ? tournament.name : "Offline Mode"}
            </Typography>
            <IconButton
              color={webSocketConnected ? "primary" : "error"}
              onClick={() => {
                setConnectOpen(true);
              }}
            >
              {webSocketConnected ? <LeakAdd /> : <LeakRemove />}
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack marginTop="56px" marginBottom="8px">
        {tournament && idToSet && (
          <TournamentEl
            tournament={tournament}
            idToSet={idToSet}
            resetSet={webSocketConnected ? resetSet : undefined}
            callSet={webSocketConnected ? callSet : undefined}
            startSet={webSocketConnected ? startSet : undefined}
            assignSetStation={webSocketConnected ? assignSetStation : undefined}
            assignSetStream={webSocketConnected ? assignSetStream : undefined}
            reportSet={webSocketConnected ? reportSet : undefined}
          />
        )}
      </Stack>
      <Dialog
        open={connectOpen}
        onClose={() => {
          setConnectOpen(false);
        }}
      >
        <DialogTitle>
          {webSocketError
            ? "Error!"
            : webSocketConnected
            ? "Connected"
            : "Disconnected"}
        </DialogTitle>
        <form
          onSubmit={(ev) => {
            const target = ev.target as typeof ev.target & {
              password: { value: string };
            };
            const password = target.password.value;
            ev.preventDefault();
            ev.stopPropagation();
            if (password) {
              sessionStorage?.setItem(PASSWORD_KEY, password);
              webSocketConnectingRef.current = true;
              setConnecting(true);
              setWebSocketUnauth(false);
              startWebSocket(password);
            }
          }}
        >
          <DialogContent style={{ paddingTop: "8px" }}>
            <TextField
              defaultValue={getPassword()}
              disabled={connecting || webSocketConnected}
              label="Password"
              name="password"
              required
              size="small"
              type="password"
              variant="outlined"
            />
            {webSocketError && (
              <Alert severity="error" style={{ marginTop: "8px" }}>
                {webSocketFailedToConnect && "Couldn't Connect"}
                {webSocketUnauth && "Incorrect Password"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              disabled={connecting || webSocketConnected}
              type="submit"
              variant="contained"
            >
              Connect
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default AppAdmin;
