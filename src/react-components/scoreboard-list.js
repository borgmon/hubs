import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import rootStyles from "../assets/stylesheets/ui-root.scss";
import styles from "../assets/stylesheets/presence-list.scss";
import { WithHoverSound } from "./wrap-with-audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListOl } from "@fortawesome/free-solid-svg-icons/faListOl";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { setScoreList } from "./custom/custom-scoreboard";

const key = "6pgVqTSKAz4GTeZPX2D5kMFmSwR8UFvs9e5GWtdacEY34N28bEREfCJTWVMHUkN2";
const baseUrl = "https://us-central1-wlacc-hubs.cloudfunctions.net/api";
const initState = { scoreList: [], selectList: [], phase: "SETUP", courseId: "", courseWorks: "" };

export default class ScoreboardList extends Component {
  static propTypes = {
    hubChannel: PropTypes.object,
    expanded: PropTypes.bool,
    onExpand: PropTypes.func
  };

  state = initState;

  isMod = () => this.props.hubChannel.can("kick_users");

  getSelection = id => {
    if (!id) {
      this.getCourses(id);
    } else if (!this.state.courseId) {
      this.setState({ courseId: id });
      this.getCourseWorks(id);
    } else {
      this.getRanks(this.state.courseId, id);
    }
  };

  getCourses = () => {
    this.setState({ phase: "LOADING" });
    fetch(`${baseUrl}/courses`, { headers: { key } })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ selectList: responseJson, phase: "SETUP" });
      });
  };

  getCourseWorks = courseId => {
    this.setState({ phase: "LOADING" });
    fetch(`${baseUrl}/courseWorks?courseId=${courseId}`, { headers: { key } })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ selectList: responseJson, phase: "SETUP" });
      });
  };

  getRanks = (courseId, courseWorksId) => {
    this.setState({ phase: "LOADING" });
    fetch(`${baseUrl}/ranks?courseId=${courseId}&courseWorkId=${courseWorksId}`, {
      headers: { key }
    })
      .then(response => response.json())
      .then(responseJson => {
        setScoreList(responseJson);
        this.setState({ scoreList: responseJson, phase: "DONE" });
      });
  };

  restartSetup = () => {
    this.setState(initState);
    setScoreList([]);
    this.getSelection();
  };

  domForScoreboard = data => {
    return (
      <WithHoverSound key={data.name}>
        <tr>
          <td>{data.rank}</td>
          <td>{data.name}</td>
          <td>{data.score}</td>
        </tr>
      </WithHoverSound>
    );
  };

  domForSelection = data => {
    return (
      <WithHoverSound key={data.id}>
        <div className={styles.row}>
          <div className={classNames({ [styles.listItem]: true })}>
            <div className={styles.listItemLink} onClick={() => this.getSelection(data.id)}>
              {data.name}
            </div>
          </div>
        </div>
      </WithHoverSound>
    );
  };

  componentDidMount() {
    if (this.isMod()) {
      this.getSelection();
    }

    document.body.addEventListener("custom_scoreboard", event => {
      const ls = event.detail;
      if (ls.length > 0) {
        this.setState({ scoreList: event.detail, phase: "DONE" });
      } else {
        this.setState(initState);
      }
    });

    document.querySelector(".a-canvas").addEventListener(
      "mouseup",
      () => {
        this.props.onExpand(false);
      },
      { once: true }
    );
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  setupScreen() {
    return (
      <div>
        {this.isMod() ? (
          <div className={styles.rows}>{this.state.selectList.map(this.domForSelection)}</div>
        ) : (
          <div>Your room moderator needs to setup scoreboard first</div>
        )}
      </div>
    );
  }

  listScreen() {
    return (
      <div>
        {this.resetBar()}
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>{this.state.scoreList.map(value => this.domForScoreboard(value))}</tbody>
        </table>
      </div>
    );
  }

  loadingScreen() {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FontAwesomeIcon icon={faSpinner} spin />
      </div>
    );
  }

  resetBar() {
    if (this.isMod()) {
      return (
        <div className={styles.listItem}>
          <div className={styles.listItemLink} onClick={() => this.restartSetup()}>
            RESET
          </div>
        </div>
      );
    }
  }

  renderExpandedList() {
    return (
      <div className={styles.presenceList}>
        <div className={styles.contents}>
          {this.state.phase === "SETUP"
            ? this.setupScreen()
            : this.state.phase === "DONE"
              ? this.listScreen()
              : this.state.phase === "LOADING"
                ? this.loadingScreen()
                : null}
        </div>
      </div>
    );
  }

  render() {
    const occupantCount = this.props.presences ? Object.entries(this.props.presences).length : 0;
    return (
      <div>
        <button
          title="Scoreboard"
          aria-label={`Toggle scoreboard`}
          onClick={() => {
            this.props.onExpand(!this.props.expanded);
          }}
          className={classNames({
            [rootStyles.scoreboardListButton]: true,
            [rootStyles.presenceInfoSelected]: this.props.expanded
          })}
        >
          <FontAwesomeIcon icon={faListOl} />
        </button>
        {this.props.expanded && this.renderExpandedList()}
      </div>
    );
  }
}
