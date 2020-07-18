import configs from "../utils/configs";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import classNames from "classnames";

import rootStyles from "../assets/stylesheets/ui-root.scss";
import styles from "../assets/stylesheets/presence-list.scss";
import maskEmail from "../utils/mask-email";
import StateLink from "./state-link.js";
import { WithHoverSound } from "./wrap-with-audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { pushHistoryPath, withSlug } from "../utils/history";
import { hasReticulumServer } from "../utils/phoenix-utils";
import { InlineSVG } from "./svgi";
import { faListOl } from "@fortawesome/free-solid-svg-icons/faListOl";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";

const key = "6pgVqTSKAz4GTeZPX2D5kMFmSwR8UFvs9e5GWtdacEY34N28bEREfCJTWVMHUkN2";

export default class ScoreboardList extends Component {
  static propTypes = {
    hubChannel: PropTypes.object,
    presences: PropTypes.object,
    history: PropTypes.object,
    sessionId: PropTypes.string,
    signedIn: PropTypes.bool,
    email: PropTypes.string,
    onSignIn: PropTypes.func,
    onSignOut: PropTypes.func,
    expanded: PropTypes.bool,
    onExpand: PropTypes.func
  };

  state = { scoreList: [], selectList: [], phase: "SETUP", courseId: "", courseWorks: "" };

  isMod = () => this.props.hubChannel.can("kick_users");

  getSelection = id => {
    if (this.isMod()) {
      if (!id) {
        this.getCourses(id);
      } else if (!this.state.courseId) {
        this.setState({ courseId: id });
        this.getCourseWorks(id);
      } else {
        this.getRanks(this.state.courseId, id);
      }
    }
  };

  getCourses = () => {
    this.setState({ phase: "LOADING" });
    fetch("https://us-central1-wlacc-hubs.cloudfunctions.net/api/courses", {
      headers: { key }
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ selectList: responseJson, phase: "SETUP" });
      });
  };

  getCourseWorks = courseId => {
    this.setState({ phase: "LOADING" });
    fetch(`https://us-central1-wlacc-hubs.cloudfunctions.net/api/courseWorks?courseId=${courseId}`, {
      headers: { key }
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ selectList: responseJson, phase: "SETUP" });
      });
  };

  getRanks = (courseId, courseWorksId) => {
    this.setState({ phase: "LOADING" });
    fetch(
      `https://us-central1-wlacc-hubs.cloudfunctions.net/api/ranks?courseId=${courseId}&courseWorkId=${courseWorksId}`,
      {
        headers: { key }
      }
    )
      .then(response => response.json())
      .then(responseJson => {
        // publish result here
        this.setState({ scoreList: responseJson, phase: "DONE" });
      });
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
    this.getSelection();

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

  renderExpandedList() {
    if (this.state.phase === "SETUP") {
      if (this.isMod()) {
        return (
          <div className={styles.presenceList}>
            <div className={styles.contents}>
              <div className={styles.rows}>{this.state.selectList.map(this.domForSelection)}</div>
            </div>
          </div>
        );
      } else {
        return (
          <div className={styles.presenceList}>
            <div className={styles.contents}>
              <div>Your room moderator need to setup scoreboard first</div>
            </div>
          </div>
        );
      }
    } else if (this.state.phase === "DONE") {
      return (
        <div className={styles.presenceList}>
          <div className={styles.contents}>
            {this.isMod() ? (
              <div className={styles.listItem}>
                <div className={styles.listItemLink}>Restart</div>
              </div>
            ) : null}
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
        </div>
      );
    } else if (this.state.phase === "LOADING") {
      return (
        <div className={styles.presenceList}>
          <div className={styles.contents} style={{ display: "flex", justifyContent: "center" }}>
            <FontAwesomeIcon icon={faSpinner} spin />
          </div>
        </div>
      );
    }
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
