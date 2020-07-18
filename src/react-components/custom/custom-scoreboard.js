export default class CustomScoreboard {
  constructor(hubChannel, addToPresenceLog) {
    this.hubChannel = hubChannel;
    this.addToPresenceLog = addToPresenceLog;
    const self = this;
    NAF.connection.onConnect(() => {
      NAF.connection.subscribeToDataChannel(`${channelName}:scoreList`, (_, dataType, data) =>
        self.scoreListCallback(data)
      );
    });
  }

  scoreListCallback(data) {
    if (data.clientId !== NAF.clientId) {
      const value = data.value;
      console.log("get", value);
      document.body.dispatchEvent(new CustomEvent("custom_scoreboard", { detail: value }));
    }
  }
}

const channelName = "custom-scoreboard";

export const sendMessage = (channelName, value) => {
  console.log("send");
  NAF.connection.broadcastDataGuaranteed(channelName, value);
};

export const setScoreList = value => sendMessage(`${channelName}:scoreList`, { clientId: NAF.clientId, value });
