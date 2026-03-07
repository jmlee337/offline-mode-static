import { useCallback, useEffect, useState } from "react";
import { type Tournament } from "./types";
import {
  Alert,
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
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
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [webSocketError, setWebSocketError] = useState(false);
  const [webSocketUnauth, setWebSocketUnauth] = useState(false);
  const [connecting, setConnecting] = useState(Boolean(getPassword()));
  const [tournament, setTournament] = useState<Tournament>();

  const startWebSocket = useCallback((password: string) => {
    const newWebSocket = new WebSocket(
      `ws://${location.hostname}`,
      "admin-protocol"
    );
    newWebSocket.onerror = () => {
      setWebSocketError(true);
    };
    newWebSocket.onclose = (ev) => {
      setWebSocket(null);
      setConnecting(false);
      if (ev.code === UNAUTH_CODE) {
        setWebSocketError(true);
        setWebSocketUnauth(true);
      }
    };
    newWebSocket.onmessage = async (ev) => {
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
          newWebSocket.send(
            JSON.stringify({
              op: "client-id-request",
              num: 1,
              computerName: "",
              clientName: "Offline Mode Admin",
            })
          );
          setWebSocket(newWebSocket);
          setWebSocketError(false);
          setWebSocketUnauth(false);
          setConnecting(false);
        } else if (
          message.op === "tournament-update-event" &&
          message.tournament
        ) {
          setTournament(message.tournament);
        }
      } catch {
        // just catch
      }
    };
    return newWebSocket;
  }, []);

  useEffect(() => {
    if (sessionStorage) {
      const password = sessionStorage.getItem(PASSWORD_KEY);
      if (password) {
        const newWebSocket = startWebSocket(password);
        return () => {
          newWebSocket.close();
        };
      }
    }
    return () => {};
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
              color={webSocketError ? "error" : "primary"}
              onClick={() => {}}
            >
              {webSocket ? <LeakAdd /> : <LeakRemove />}
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack marginTop="56px" marginBottom="8px">
        {tournament && <TournamentEl tournament={tournament} />}
      </Stack>
      <Dialog open={!webSocket}>
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
              setConnecting(true);
              setWebSocketError(false);
              setWebSocketUnauth(false);
              startWebSocket(password);
            }
          }}
        >
          <DialogContent>
            <TextField
              defaultValue={getPassword()}
              label="Password"
              name="password"
              required
              size="small"
              type="password"
              variant="outlined"
            />
            {webSocketUnauth && (
              <Alert severity="error" style={{ marginTop: "8px" }}>
                Incorrect Password
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              disabled={connecting || Boolean(webSocket)}
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
