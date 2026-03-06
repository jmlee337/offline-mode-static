import {
  Box,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import {
  type Event,
  type Phase,
  type Pool,
  type Set,
  type Tournament,
} from "./types";
import { useMemo, useState } from "react";
import {
  HourglassTop,
  KeyboardArrowDown,
  KeyboardArrowRight,
  NotificationsActive,
  Tv,
} from "@mui/icons-material";

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

function SetListItem({ set }: { set: Set }) {
  const titleStart = useMemo(() => {
    if (set.stream) {
      return <Tv fontSize="small" />;
    }
    return <Box width="20px">{set.station && set.station.number}</Box>;
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
    <ListItem
      disablePadding
      className="set"
      style={{
        alignItems: "stretch",
        backgroundColor: getBackgroundColor(set),
        boxSizing: "border-box",
        flexDirection: "column",
        flexGrow: 0,
        flexShrink: 0,
        width:
          "calc((100% - ((var(--set-columns) - 1) * 8px)) / var(--set-columns))",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        boxSizing="border-box"
        gap="4px"
        padding="4px 8px 0 8px"
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
          entrantName={set.entrant1Participants
            .map((participant) => participant.gamerTag)
            .join(" / ")}
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
          entrantName={set.entrant2Participants
            .map((participant) => participant.gamerTag)
            .join(" / ")}
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
    </ListItem>
  );
}

function PoolEl({ pool }: { pool: Pool }) {
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
            <SetListItem key={set.id} set={set} />
          ))}
        </List>
      </Collapse>
    </>
  );
}

function PhaseEl({ phase }: { phase: Phase }) {
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
              <PoolEl pool={pool} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
}

function EventEl({ event }: { event: Event }) {
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
              <PhaseEl phase={phase} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
}

export default function TournamentEl({
  tournament,
}: {
  tournament: Tournament;
}) {
  return (
    <List disablePadding>
      {tournament.events.map((event) => (
        <ListItem
          disablePadding
          key={event.id}
          style={{ flexDirection: "column", alignItems: "start" }}
        >
          <EventEl event={event} />
        </ListItem>
      ))}
    </List>
  );
}
