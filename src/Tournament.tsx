import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  type Event,
  type Phase,
  type Pool,
  type Set,
  type Tournament,
} from "./types";
import { useState } from "react";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";

function SetListItem({ set }: { set: Set }) {
  return (
    <ListItem disablePadding style={{ width: "initial" }}>
      {set.id}
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
        <ListItemText slotProps={{ primary: { variant: "body2" } }}>
          {pool.name}
        </ListItemText>
      </ListItemButton>
      <Collapse in={open} style={{ width: "100%" }} unmountOnExit>
        <List
          disablePadding
          style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
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
        <ListItemText slotProps={{ primary: { variant: "body2" } }}>
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
        <ListItemText slotProps={{ primary: { variant: "body2" } }}>
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
