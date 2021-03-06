import CustomSpeaker from "./custom-speaker";
import CustomScoreboard from "./custom-scoreboard";

export const initCustom = (hubChannel, addToPresenceLog) => {
  hubChannel.store.custom = hubChannel.store.custom ? hubChannel.store.custom : {};
  hubChannel.store.custom.enabled = ["custom-scoreboard", "custom-speaker"];

  new CustomSpeaker(hubChannel, addToPresenceLog);
  new CustomScoreboard(hubChannel, addToPresenceLog);
};
