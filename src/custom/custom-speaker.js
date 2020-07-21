export default class CustomSpeaker {
  constructor(hubChannel, addToPresenceLog) {
    this.hubChannel = hubChannel;
    this.test = "asd";
    this.addToPresenceLog = addToPresenceLog;
    const self = this;
    NAF.connection.onConnect(() => {
      NAF.connection.subscribeToDataChannel(`${channelName}:perm`, (_, dataType, data) =>
        self.speakerPermCallback(data)
      );
      NAF.connection.subscribeToDataChannel(`${channelName}:state`, (_, dataType, data) =>
        self.speakerStateCallback(data)
      );
    });
  }
  speakerStateCallback(data) {
    if (data.clientId !== NAF.clientId) {
      setSpeakerById(data.clientId, data.value);
    }
  }
  speakerPermCallback(data) {
    if (data.clientId === NAF.clientId) {
      const value = data.value;
      this.hubChannel._permissions.speaker = value;
      APP.store.custom.isSpeakerOn = value;
      setSpeakerState({ clientId: data.clientId, value });
      console.log(this);
      this.addToPresenceLog({
        type: "log",
        body: `Speaker mode ${value ? "enabled" : "diabled"}.`
      });
    }
  }
}

const channelName = "custom-speaker";

export const sendMessage = (channelName, value) => {
  NAF.connection.broadcastDataGuaranteed(channelName, value);
};

export const getSpeakerById = clientId => {
  const playerObejct = APP.componentRegistry["player-info"].find(e => e.playerSessionId === clientId);

  if (playerObejct) {
    const audioSource = playerObejct.el.querySelector("[avatar-audio-source]");
    return !AFRAME.utils.entity.getComponentProperty(audioSource, "avatar-audio-source").positional;
  }
};

export const setSpeakerById = (clientId, value) => {
  const playerObejct = APP.componentRegistry["player-info"].find(e => e.playerSessionId === clientId);
  const audioSource = playerObejct.el.querySelector("[avatar-audio-source]");
  AFRAME.utils.entity.setComponentProperty(audioSource, "avatar-audio-source", { positional: !value });
};

export const setSpeakerPerm = value => sendMessage(`${channelName}:perm`, value);
export const setSpeakerState = value => sendMessage(`${channelName}:state`, value);
