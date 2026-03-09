import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  type Event,
  type Participant,
  type Phase,
  type Pool,
  type ReportGame,
  type Set,
  type Station,
  type Stream,
  type Tournament,
} from "./types";
import { useCallback, useMemo, useState } from "react";
import {
  HourglassTop,
  KeyboardArrowDown,
  KeyboardArrowRight,
  NotificationsActive,
  RestartAlt,
  Tv,
} from "@mui/icons-material";
import styled from "@emotion/styled";

const WINNER_BACKGROUND_HIGHLIGHT = "#ba68c8";
const TEXT_COLOR_LIGHT = "#fff";
const TEXT_COLOR_SECONDARY = "#757575";

function getColor(set: Set) {
  if (set.state === 2) {
    return "#0d8225";
  }
  if (set.state === 6) {
    return "#f9a825";
  }
  return undefined;
}

function getBackgroundColor(set: Set) {
  if (set.round < 0) {
    return "#ffebee";
  }
  return "#fafafa";
}

function SetEntrant({
  entrantName,
  prereqStr,
}: {
  entrantName: string;
  prereqStr: string | null;
}) {
  return (
    <Typography
      color={entrantName.length === 0 ? TEXT_COLOR_SECONDARY : undefined}
      fontStyle={entrantName.length === 0 ? "italic" : undefined}
      fontWeight="inherit"
      padding="0 8px"
      overflow="hidden"
      textOverflow="ellipsis"
      variant="body2"
      whiteSpace="nowrap"
    >
      {entrantName || prereqStr}
    </Typography>
  );
}

function getEntrantName(participants: Participant[]) {
  return participants.map((participant) => participant.gamerTag).join(" / ");
}

function SetEl({ set }: { set: Set }) {
  const titleStart = useMemo(() => {
    if (set.stream) {
      return <Tv fontSize="small" />;
    }
    return (
      <Typography variant="caption" width="20px">
        {set.station && set.station.number}
      </Typography>
    );
  }, [set.station, set.stream]);
  const titleEnd = useMemo(() => {
    if (set.state === 2) {
      return (
        <HourglassTop
          fontSize="small"
          style={{ marginLeft: "5px", marginRight: "-5px" }}
        />
      );
    }
    if (set.state === 6) {
      return (
        <NotificationsActive
          fontSize="small"
          style={{ marginLeft: "2px", marginRight: "-2px" }}
        />
      );
    }
    return <Box width="20px" />;
  }, [set.state]);

  let entrant1Score: number | string = "\u00A0";
  if (set.state === 3) {
    if (set.entrant1Score !== null) {
      entrant1Score = set.entrant1Score;
    } else {
      entrant1Score = set.winnerId === set.entrant1Id ? "W" : "L";
    }
  }

  let entrant2Score: number | string = "\u00A0";
  if (set.state === 3) {
    if (set.entrant2Score !== null) {
      entrant2Score = set.entrant2Score;
    } else {
      entrant2Score = set.winnerId === set.entrant2Id ? "W" : "L";
    }
  }

  return (
    <Stack
      alignItems="stretch"
      boxSizing="border-box"
      flexGrow={0}
      flexShrink={0}
      padding="4px 0"
      style={{
        backgroundColor: getBackgroundColor(set),
      }}
      width="100%"
    >
      <Stack
        direction="row"
        alignItems="center"
        boxSizing="border-box"
        gap="4px"
        padding="0 8px"
        width="100%"
        style={{ color: getColor(set) }}
      >
        {titleStart}
        <Typography flexGrow={1} textAlign="center" variant="caption">
          {set.shortRoundText} ({set.identifier})
        </Typography>
        {titleEnd}
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        style={{
          fontWeight:
            set.entrant1Id && set.entrant1Id === set.winnerId ? 700 : undefined,
        }}
      >
        <SetEntrant
          entrantName={getEntrantName(set.entrant1Participants)}
          prereqStr={set.entrant1PrereqStr}
        />
        {set.state === 3 && (
          <Typography
            fontWeight="inherit"
            textAlign="center"
            variant="body2"
            width="18px"
            sx={
              set.entrant1Id && set.entrant1Id === set.winnerId
                ? {
                    backgroundColor: WINNER_BACKGROUND_HIGHLIGHT,
                    color: TEXT_COLOR_LIGHT,
                  }
                : undefined
            }
          >
            {entrant1Score}
          </Typography>
        )}
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        style={{
          fontWeight:
            set.entrant2Id && set.entrant2Id === set.winnerId ? 700 : undefined,
        }}
      >
        <SetEntrant
          entrantName={getEntrantName(set.entrant2Participants)}
          prereqStr={set.entrant2PrereqStr}
        />
        {set.state === 3 && (
          <Typography
            fontWeight="inherit"
            textAlign="center"
            variant="body2"
            width="18px"
            sx={
              set.entrant2Id && set.entrant2Id === set.winnerId
                ? {
                    backgroundColor: WINNER_BACKGROUND_HIGHLIGHT,
                    color: TEXT_COLOR_LIGHT,
                  }
                : undefined
            }
          >
            {entrant2Score}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

function PoolEl({
  pool,
  openSet,
}: {
  pool: Pool;
  openSet: ((newSelectedSetId: number) => void) | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ListItemButton
        style={{ padding: "4px 8px 4px 24px" }}
        onClick={() => {
          setOpen((prevOpen) => !prevOpen);
        }}
      >
        {open ? (
          <KeyboardArrowDown fontSize="small" />
        ) : (
          <KeyboardArrowRight fontSize="small" />
        )}
        <ListItemText slotProps={{ primary: { variant: "body1" } }}>
          {pool.name}
        </ListItemText>
      </ListItemButton>
      <Collapse in={open} style={{ width: "100%" }} unmountOnExit>
        <List
          disablePadding
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            margin: "8px",
          }}
        >
          {pool.sets.map((set) => (
            <ListItem
              disablePadding
              key={set.id}
              style={{
                width:
                  "calc((100% - ((var(--set-columns) - 1) * 8px)) / var(--set-columns))",
              }}
            >
              {openSet ? (
                <ListItemButton
                  onClick={() => {
                    openSet(set.id);
                  }}
                  style={{ padding: 0 }}
                >
                  <SetEl set={set} />
                </ListItemButton>
              ) : (
                <SetEl set={set} />
              )}
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
}

function PhaseEl({
  phase,
  openSet,
}: {
  phase: Phase;
  openSet: ((newSelectedSetId: number) => void) | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ListItemButton
        style={{ padding: "4px 8px 4px 16px" }}
        onClick={() => {
          setOpen((prevOpen) => !prevOpen);
        }}
      >
        {open ? (
          <KeyboardArrowDown fontSize="small" />
        ) : (
          <KeyboardArrowRight fontSize="small" />
        )}
        <ListItemText slotProps={{ primary: { variant: "body1" } }}>
          {phase.name}
        </ListItemText>
      </ListItemButton>
      <Collapse in={open} style={{ width: "100%" }} unmountOnExit>
        <List disablePadding>
          {phase.pools.map((pool) => (
            <ListItem
              disablePadding
              key={pool.id}
              style={{ flexDirection: "column", alignItems: "start" }}
            >
              <PoolEl pool={pool} openSet={openSet} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
}

function EventEl({
  event,
  openSet,
}: {
  event: Event;
  openSet: ((newSelectedSetId: number) => void) | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ListItemButton
        style={{ padding: "4px 8px" }}
        onClick={() => {
          setOpen((prevOpen) => !prevOpen);
        }}
      >
        {open ? (
          <KeyboardArrowDown fontSize="small" />
        ) : (
          <KeyboardArrowRight fontSize="small" />
        )}
        <ListItemText slotProps={{ primary: { variant: "body1" } }}>
          {event.name}
        </ListItemText>
      </ListItemButton>
      <Collapse in={open} style={{ width: "100%" }} unmountOnExit>
        <List disablePadding>
          {event.phases.map((phase) => (
            <ListItem
              disablePadding
              key={phase.id}
              style={{ flexDirection: "column", alignItems: "start" }}
            >
              <PhaseEl phase={phase} openSet={openSet} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
}

function toCombinedStreamName(stream: Stream) {
  let prefix = "";
  if (stream.streamSource === "TWITCH") {
    prefix = "ttv/";
  } else if (stream.streamSource === "YOUTUBE") {
    prefix = "yt/";
  }
  return prefix + stream.streamName;
}

function AssignDialog({
  open,
  selectedSet,
  stations,
  streams,
  assigning,
  close,
  closeAll,
  assignSetStation,
  assignSetStream,
  setAssigning,
  openError,
}: {
  open: boolean;
  selectedSet: Set;
  stations: Station[];
  streams: Stream[];
  assigning: boolean;
  close: () => void;
  closeAll: () => void;
  assignSetStation?: (id: number, stationId: number) => Promise<void>;
  assignSetStream?: (id: number, streamId: number) => Promise<void>;
  setAssigning: (assigning: boolean) => void;
  openError: (msg: string) => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        close();
      }}
    >
      <DialogContent>
        {assignSetStream && streams.length > 0 && (
          <>
            {selectedSet.stream && (
              <ListItemButton
                disabled={assigning}
                disableGutters
                style={{ marginTop: "8px" }}
                onClick={async () => {
                  setAssigning(true);
                  try {
                    await assignSetStream(selectedSet.id, 0);
                    closeAll();
                  } catch (e: unknown) {
                    if (e instanceof Error) {
                      openError(e.message);
                    }
                  } finally {
                    setAssigning(false);
                  }
                }}
              >
                <ListItemText>
                  Remove from {toCombinedStreamName(selectedSet.stream)}
                </ListItemText>
              </ListItemButton>
            )}
            <List disablePadding>
              {streams
                .filter((stream) => stream.id !== selectedSet.stream?.id)
                .map((stream) => (
                  <ListItemButton
                    disabled={assigning}
                    key={stream.id}
                    disableGutters
                    onClick={async () => {
                      setAssigning(true);
                      try {
                        await assignSetStream(selectedSet.id, stream.id);
                        closeAll();
                      } catch (e: unknown) {
                        if (e instanceof Error) {
                          openError(e.message);
                        }
                      } finally {
                        setAssigning(false);
                      }
                    }}
                  >
                    <ListItemText>{toCombinedStreamName(stream)}</ListItemText>
                  </ListItemButton>
                ))}
            </List>
          </>
        )}
        {assignSetStation && stations.length > 0 && (
          <>
            {selectedSet.station && (
              <ListItemText style={{ padding: "12px 0", margin: "8px 0 0" }}>
                Assigned to station {selectedSet.station.number}
              </ListItemText>
            )}
            <List
              disablePadding
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {stations
                .filter((station) => station.id !== selectedSet.station?.id)
                .map((station) => (
                  <ListItemButton
                    disabled={assigning}
                    key={station.id}
                    style={{ flexGrow: 0 }}
                    onClick={async () => {
                      setAssigning(true);
                      try {
                        await assignSetStation(selectedSet.id, station.id);
                        closeAll();
                      } catch (e: unknown) {
                        if (e instanceof Error) {
                          openError(e.message);
                        }
                      } finally {
                        setAssigning(false);
                      }
                    }}
                  >
                    <ListItemText>{station.number}</ListItemText>
                  </ListItemButton>
                ))}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const StyledToggleButton = styled(ToggleButton)({
  padding: "8px",
  width: "42.5px",
});

function SelectedSetDialog({
  open,
  selectedSet,
  stations,
  streams,
  reportWinnerId,
  reportIsDq,
  reportEntrant1Score,
  reportEntrant2Score,
  close,
  resetSet,
  callSet,
  startSet,
  assignSetStation,
  assignSetStream,
  setReportWinnerId,
  setReportIsDq,
  setReportEntrant1Score,
  setReportEntrant2Score,
  reportSet,
}: {
  open: boolean;
  selectedSet: Set | undefined;
  stations: Station[];
  streams: Stream[];
  reportWinnerId: number;
  reportIsDq: boolean;
  reportEntrant1Score: number;
  reportEntrant2Score: number;
  close: () => void;
  resetSet?: (id: number) => Promise<void>;
  callSet?: (id: number) => Promise<void>;
  startSet?: (id: number) => Promise<void>;
  assignSetStation?: (id: number, stationId: number) => Promise<void>;
  assignSetStream?: (id: number, streamId: number) => Promise<void>;
  setReportWinnerId: (winnerId: number) => void;
  setReportIsDq: (isDq: boolean) => void;
  setReportEntrant1Score: (entrant1Score: number) => void;
  setReportEntrant2Score: (entrant2Score: number) => void;
  reportSet?: (
    id: number,
    winnerId: number,
    isDQ: boolean,
    gameData: ReportGame[]
  ) => Promise<void>;
}) {
  const gameData = useMemo(() => {
    const gameData = [];
    if (selectedSet && selectedSet.entrant1Id && selectedSet.entrant2Id) {
      if (reportEntrant1Score > reportEntrant2Score) {
        for (
          let n = 1;
          n <= reportEntrant1Score + reportEntrant2Score;
          n += 1
        ) {
          gameData.push({
            gameNum: n,
            winnerId:
              n <= reportEntrant1Score
                ? selectedSet.entrant1Id
                : selectedSet.entrant2Id,
            entrant1Score: 0,
            entrant2Score: 0,
            selections: [],
          });
        }
      } else if (reportEntrant1Score < reportEntrant2Score) {
        for (
          let n = 1;
          n <= reportEntrant1Score + reportEntrant2Score;
          n += 1
        ) {
          gameData.push({
            gameNum: n,
            winnerId:
              n <= reportEntrant2Score
                ? selectedSet.entrant2Id
                : selectedSet.entrant1Id,
            entrant1Score: 0,
            entrant2Score: 0,
            selections: [],
          });
        }
      }
    }
    return gameData;
  }, [reportEntrant1Score, reportEntrant2Score, selectedSet]);
  const updateUnchanged = useMemo(() => {
    if (selectedSet && selectedSet.state === 3) {
      if (reportIsDq) {
        if (selectedSet.winnerId === selectedSet.entrant1Id) {
          return selectedSet.entrant2Score === -1;
        }
        return selectedSet.entrant1Score === -1;
      }
      return (
        reportEntrant1Score === selectedSet.entrant1Score &&
        reportEntrant2Score === selectedSet.entrant2Score
      );
    }
    return false;
  }, [reportEntrant1Score, reportEntrant2Score, reportIsDq, selectedSet]);

  const [resetting, setResetting] = useState(false);
  const [calling, setCalling] = useState(false);
  const [starting, setStarting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [reporting, setReporting] = useState(false);

  const [resetOpen, setResetOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const [error, setError] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const closeError = useCallback(() => {
    setError("");
    setErrorOpen(false);
  }, []);
  const openError = useCallback((newError: string) => {
    setError(newError);
    setErrorOpen(true);
  }, []);

  return (
    <>
      <Dialog open={open} onClose={close} fullWidth>
        {selectedSet && (
          <>
            <DialogTitle
              style={{
                alignItems: "center",
                color: getColor(selectedSet),
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" alignItems="center">
                {selectedSet.fullRoundText} ({selectedSet.identifier})
                {selectedSet.state === 2 && (
                  <HourglassTop style={{ marginLeft: "3px" }} />
                )}
                {selectedSet.state === 6 && (
                  <NotificationsActive style={{ marginLeft: "6px" }} />
                )}
              </Stack>
              <Stack direction="row" alignItems="center" gap="8px">
                {selectedSet.station && (
                  <Typography variant="body1">
                    {selectedSet.station.number}
                  </Typography>
                )}
                {selectedSet.stream && <Tv />}
              </Stack>
            </DialogTitle>
            <DialogContent style={{ paddingTop: 0 }}>
              <Stack gap="8px">
                <Box
                  overflow="hidden"
                  textOverflow="ellipsis"
                  typography="body2"
                  whiteSpace="nowrap"
                >
                  {getEntrantName(selectedSet.entrant1Participants) ||
                    selectedSet.entrant1PrereqStr}
                </Box>
                <Stack direction="row" justifyContent="end">
                  <ToggleButtonGroup>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        selectedSet.state === 3
                      }
                      selected={
                        reportIsDq && reportWinnerId === selectedSet.entrant2Id
                      }
                      onClick={() => {
                        setReportWinnerId(selectedSet.entrant2Id!);
                        setReportIsDq(true);
                        setReportEntrant1Score(0);
                        setReportEntrant2Score(0);
                      }}
                      value={"DQ"}
                    >
                      DQ
                    </StyledToggleButton>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        (selectedSet.state === 3 &&
                          selectedSet.winnerId === selectedSet.entrant1Id)
                      }
                      selected={
                        !reportIsDq &&
                        !(
                          reportEntrant2Score === 0 &&
                          (reportWinnerId === selectedSet.entrant1Id ||
                            reportWinnerId === selectedSet.entrant2Id)
                        ) &&
                        reportEntrant1Score === 0
                      }
                      onClick={() => {
                        setReportWinnerId(
                          reportEntrant2Score > 0 ? selectedSet.entrant2Id! : 0
                        );
                        setReportIsDq(false);
                        setReportEntrant1Score(0);
                      }}
                      value={0}
                    >
                      0
                    </StyledToggleButton>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        (selectedSet.state === 3 &&
                          ((selectedSet.winnerId === selectedSet.entrant1Id &&
                            reportEntrant2Score >= 1) ||
                            (selectedSet.winnerId === selectedSet.entrant2Id &&
                              reportEntrant2Score <= 1)))
                      }
                      selected={!reportIsDq && reportEntrant1Score === 1}
                      onClick={() => {
                        if (reportEntrant2Score > 1) {
                          setReportWinnerId(selectedSet.entrant2Id!);
                        } else if (reportEntrant2Score < 1) {
                          setReportWinnerId(selectedSet.entrant1Id!);
                        } else {
                          setReportWinnerId(0);
                        }
                        setReportIsDq(false);
                        setReportEntrant1Score(1);
                      }}
                      value={1}
                    >
                      1
                    </StyledToggleButton>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        (selectedSet.state === 3 &&
                          ((selectedSet.winnerId === selectedSet.entrant1Id &&
                            reportEntrant2Score >= 2) ||
                            (selectedSet.winnerId === selectedSet.entrant2Id &&
                              reportEntrant2Score <= 2)))
                      }
                      selected={!reportIsDq && reportEntrant1Score === 2}
                      onClick={() => {
                        if (reportEntrant2Score > 2) {
                          setReportWinnerId(selectedSet.entrant2Id!);
                        } else if (reportEntrant2Score < 2) {
                          setReportWinnerId(selectedSet.entrant1Id!);
                        } else {
                          setReportWinnerId(0);
                        }
                        setReportIsDq(false);
                        setReportEntrant1Score(2);
                      }}
                      value={2}
                    >
                      2
                    </StyledToggleButton>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        (selectedSet.state === 3 &&
                          selectedSet.winnerId === selectedSet.entrant2Id)
                      }
                      selected={!reportIsDq && reportEntrant1Score === 3}
                      onClick={() => {
                        if (reportEntrant2Score > 3) {
                          setReportWinnerId(selectedSet.entrant2Id!);
                        } else if (reportEntrant2Score < 3) {
                          setReportWinnerId(selectedSet.entrant1Id!);
                        } else {
                          setReportWinnerId(0);
                        }
                        setReportIsDq(false);
                        setReportEntrant1Score(3);
                      }}
                      value={3}
                    >
                      3
                    </StyledToggleButton>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        selectedSet.state === 3
                      }
                      selected={reportWinnerId === selectedSet.entrant1Id}
                      onClick={() => {
                        setReportWinnerId(selectedSet.entrant1Id!);
                        setReportIsDq(false);
                        setReportEntrant1Score(0);
                        setReportEntrant2Score(0);
                      }}
                      value={"W"}
                    >
                      W
                    </StyledToggleButton>
                  </ToggleButtonGroup>
                </Stack>
                <Box
                  overflow="hidden"
                  textOverflow="ellipsis"
                  typography="body2"
                  whiteSpace="nowrap"
                >
                  {getEntrantName(selectedSet.entrant2Participants) ||
                    selectedSet.entrant2PrereqStr}
                </Box>
                <Stack direction="row" justifyContent="end">
                  <ToggleButtonGroup>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        selectedSet.state === 3
                      }
                      selected={
                        reportIsDq && reportWinnerId === selectedSet.entrant1Id
                      }
                      onClick={() => {
                        setReportWinnerId(selectedSet.entrant1Id!);
                        setReportIsDq(true);
                        setReportEntrant1Score(0);
                        setReportEntrant2Score(0);
                      }}
                      value={"DQ"}
                    >
                      DQ
                    </StyledToggleButton>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        (selectedSet.state === 3 &&
                          selectedSet.winnerId === selectedSet.entrant2Id)
                      }
                      selected={
                        !reportIsDq &&
                        !(
                          reportEntrant1Score === 0 &&
                          (reportWinnerId === selectedSet.entrant1Id ||
                            reportWinnerId === selectedSet.entrant2Id)
                        ) &&
                        reportEntrant2Score === 0
                      }
                      onClick={() => {
                        setReportWinnerId(
                          reportEntrant1Score > 0 ? selectedSet.entrant1Id! : 0
                        );
                        setReportIsDq(false);
                        setReportEntrant2Score(0);
                      }}
                      value={0}
                    >
                      0
                    </StyledToggleButton>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        (selectedSet.state === 3 &&
                          ((selectedSet.winnerId === selectedSet.entrant2Id &&
                            reportEntrant1Score >= 1) ||
                            (selectedSet.winnerId === selectedSet.entrant1Id &&
                              reportEntrant1Score <= 1)))
                      }
                      selected={!reportIsDq && reportEntrant2Score === 1}
                      onClick={() => {
                        if (reportEntrant1Score > 1) {
                          setReportWinnerId(selectedSet.entrant1Id!);
                        } else if (reportEntrant1Score < 1) {
                          setReportWinnerId(selectedSet.entrant2Id!);
                        } else {
                          setReportWinnerId(0);
                        }
                        setReportIsDq(false);
                        setReportEntrant2Score(1);
                      }}
                      value={1}
                    >
                      1
                    </StyledToggleButton>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        (selectedSet.state === 3 &&
                          ((selectedSet.winnerId === selectedSet.entrant2Id &&
                            reportEntrant1Score >= 2) ||
                            (selectedSet.winnerId === selectedSet.entrant1Id &&
                              reportEntrant1Score <= 2)))
                      }
                      selected={!reportIsDq && reportEntrant2Score === 2}
                      onClick={() => {
                        if (reportEntrant1Score > 2) {
                          setReportWinnerId(selectedSet.entrant1Id!);
                        } else if (reportEntrant1Score < 2) {
                          setReportWinnerId(selectedSet.entrant2Id!);
                        } else {
                          setReportWinnerId(0);
                        }
                        setReportIsDq(false);
                        setReportEntrant2Score(2);
                      }}
                      value={2}
                    >
                      2
                    </StyledToggleButton>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        (selectedSet.state === 3 &&
                          selectedSet.winnerId === selectedSet.entrant1Id)
                      }
                      selected={!reportIsDq && reportEntrant2Score === 3}
                      onClick={() => {
                        if (reportEntrant1Score > 3) {
                          setReportWinnerId(selectedSet.entrant1Id!);
                        } else if (reportEntrant1Score < 3) {
                          setReportWinnerId(selectedSet.entrant2Id!);
                        } else {
                          setReportWinnerId(0);
                        }
                        setReportIsDq(false);
                        setReportEntrant2Score(3);
                      }}
                      value={3}
                    >
                      3
                    </StyledToggleButton>
                    <StyledToggleButton
                      disabled={
                        !selectedSet.entrant1Id ||
                        !selectedSet.entrant2Id ||
                        selectedSet.state === 3
                      }
                      selected={reportWinnerId === selectedSet.entrant2Id}
                      onClick={() => {
                        setReportWinnerId(selectedSet.entrant2Id!);
                        setReportIsDq(false);
                        setReportEntrant1Score(0);
                        setReportEntrant2Score(0);
                      }}
                      value={"W"}
                    >
                      W
                    </StyledToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              {(assignSetStation || assignSetStream) && (
                <IconButton
                  disabled={assigning}
                  onClick={() => {
                    setAssignOpen(true);
                  }}
                >
                  {assigning ? <CircularProgress size="24px" /> : <Tv />}
                </IconButton>
              )}
              {resetSet && (
                <IconButton
                  color="error"
                  disabled={resetting || selectedSet.state === 1}
                  onClick={async () => {
                    if (selectedSet.state === 3) {
                      setResetOpen(true);
                    } else {
                      try {
                        setResetting(true);
                        await resetSet(selectedSet.id);
                        close();
                      } catch (e: unknown) {
                        if (e instanceof Error) {
                          openError(e.message);
                        }
                      } finally {
                        setResetting(false);
                      }
                    }
                  }}
                >
                  {resetting ? (
                    <CircularProgress size="24px" />
                  ) : (
                    <RestartAlt />
                  )}
                </IconButton>
              )}
              {callSet && (
                <IconButton
                  disabled={
                    calling ||
                    selectedSet.state === 3 ||
                    selectedSet.state === 6
                  }
                  onClick={async () => {
                    try {
                      setCalling(true);
                      await callSet(selectedSet.id);
                      close();
                    } catch (e: unknown) {
                      if (e instanceof Error) {
                        openError(e.message);
                      }
                    } finally {
                      setCalling(false);
                    }
                  }}
                >
                  {calling ? (
                    <CircularProgress size="24px" />
                  ) : (
                    <NotificationsActive />
                  )}
                </IconButton>
              )}
              {startSet && (
                <IconButton
                  disabled={
                    starting ||
                    selectedSet.state === 2 ||
                    selectedSet.state === 3
                  }
                  onClick={async () => {
                    try {
                      setStarting(true);
                      await startSet(selectedSet.id);
                      close();
                    } catch (e: unknown) {
                      if (e instanceof Error) {
                        openError(e.message);
                      }
                    } finally {
                      setStarting(false);
                    }
                  }}
                >
                  {starting ? (
                    <CircularProgress size="24px" />
                  ) : (
                    <HourglassTop />
                  )}
                </IconButton>
              )}
              {reportSet && (
                <Button
                  disabled={
                    !selectedSet.entrant1Id ||
                    !selectedSet.entrant2Id ||
                    (selectedSet.state === 3 && updateUnchanged) ||
                    reporting ||
                    !reportWinnerId
                  }
                  endIcon={reporting ? <CircularProgress /> : undefined}
                  onClick={async () => {
                    try {
                      setReporting(true);
                      await reportSet(
                        selectedSet.id,
                        reportWinnerId,
                        reportIsDq,
                        gameData
                      );
                      close();
                    } catch (e: unknown) {
                      if (e instanceof Error) {
                        openError(e.message);
                      }
                    } finally {
                      setReporting(false);
                    }
                  }}
                  variant="contained"
                >
                  Report
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      {selectedSet && (
        <>
          <Dialog
            open={resetOpen}
            onClose={() => {
              setResetOpen(false);
            }}
          >
            <DialogTitle>Reset?</DialogTitle>
            <DialogContent>
              <Box width="200px">
                <SetEl set={selectedSet} />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                disabled={resetting}
                color="error"
                endIcon={resetting ? <CircularProgress /> : undefined}
                onClick={async () => {
                  if (selectedSet && resetSet) {
                    try {
                      setResetting(true);
                      await resetSet(selectedSet.id);
                      setResetOpen(false);
                      close();
                    } catch (e: unknown) {
                      if (e instanceof Error) {
                        openError(e.message);
                      }
                    } finally {
                      setResetting(false);
                    }
                  }
                }}
                variant="contained"
              >
                Reset
              </Button>
            </DialogActions>
          </Dialog>
          <AssignDialog
            open={assignOpen}
            selectedSet={selectedSet}
            stations={stations}
            streams={streams}
            assigning={assigning}
            close={() => {
              setAssignOpen(false);
            }}
            closeAll={() => {
              setAssignOpen(false);
              close();
            }}
            assignSetStation={assignSetStation}
            assignSetStream={assignSetStream}
            setAssigning={setAssigning}
            openError={openError}
          />
        </>
      )}
      <Dialog open={errorOpen} onClose={closeError}>
        <DialogTitle>Error!</DialogTitle>
        <DialogContent>
          <DialogContentText>{error}</DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function TournamentEl({
  tournament,
  idToSet,
  resetSet,
  callSet,
  startSet,
  assignSetStation,
  assignSetStream,
  reportSet,
}: {
  tournament: Tournament;
  idToSet: Map<number, Set>;
  resetSet?: (id: number) => Promise<void>;
  callSet?: (id: number) => Promise<void>;
  startSet?: (id: number) => Promise<void>;
  assignSetStation?: (id: number, stationId: number) => Promise<void>;
  assignSetStream?: (id: number, streamId: number) => Promise<void>;
  reportSet?: (
    id: number,
    winnerId: number,
    isDQ: boolean,
    gameData: ReportGame[]
  ) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState(0);
  const closeSet = useCallback(() => {
    setSelectedSetId(0);
    setOpen(false);
  }, []);

  const [reportWinnerId, setReportWinnerId] = useState(0);
  const [reportIsDq, setReportIsDq] = useState(false);
  const [reportEntrant1Score, setReportEntrant1Score] = useState(0);
  const [reportEntrant2Score, setReportEntrant2Score] = useState(0);
  const openSet = useMemo(() => {
    if (
      resetSet ||
      callSet ||
      startSet ||
      assignSetStation ||
      assignSetStream ||
      reportSet
    ) {
      return (newSelectedSetId: number) => {
        const newSelectedSet = idToSet.get(newSelectedSetId);
        if (!newSelectedSet) {
          return;
        }

        setReportWinnerId(newSelectedSet.winnerId ?? 0);
        setReportIsDq(
          newSelectedSet.entrant1Score === -1 ||
            newSelectedSet.entrant2Score === -1
        );
        setReportEntrant1Score(newSelectedSet.entrant1Score ?? 0);
        setReportEntrant2Score(newSelectedSet.entrant2Score ?? 0);
        setSelectedSetId(newSelectedSetId);
        setOpen(true);
      };
    }
    return null;
  }, [
    assignSetStation,
    assignSetStream,
    callSet,
    idToSet,
    reportSet,
    resetSet,
    startSet,
  ]);

  return (
    <>
      <List disablePadding>
        {tournament.events.map((event) => (
          <ListItem
            disablePadding
            key={event.id}
            style={{ flexDirection: "column", alignItems: "start" }}
          >
            <EventEl event={event} openSet={openSet} />
          </ListItem>
        ))}
      </List>
      {(resetSet ||
        callSet ||
        startSet ||
        assignSetStation ||
        assignSetStream ||
        reportSet) && (
        <SelectedSetDialog
          open={open}
          stations={tournament.stations}
          streams={tournament.streams}
          selectedSet={idToSet.get(selectedSetId)}
          reportWinnerId={reportWinnerId}
          reportIsDq={reportIsDq}
          reportEntrant1Score={reportEntrant1Score}
          reportEntrant2Score={reportEntrant2Score}
          close={closeSet}
          resetSet={resetSet}
          callSet={callSet}
          startSet={startSet}
          assignSetStation={assignSetStation}
          assignSetStream={assignSetStream}
          setReportWinnerId={setReportWinnerId}
          setReportIsDq={setReportIsDq}
          setReportEntrant1Score={setReportEntrant1Score}
          setReportEntrant2Score={setReportEntrant2Score}
          reportSet={reportSet}
        />
      )}
    </>
  );
}
