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

  state = {
    scoreList: []
  };

  domForScoreboard = (data, index) => {
    return (
      <WithHoverSound key={index}>
        <tr>
          <td>{index + 1}</td>
          <td>{data.name}</td>
          <td>{data.score}</td>
        </tr>
      </WithHoverSound>
    );
  };

  componentDidMount() {
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
    fetch("https://jsonplaceholder.typicode.com/todos/1")
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ scoreList: [{ name: "test", score: responseJson.id }] });
      });

    return (
      <div className={styles.presenceList}>
        <div className={styles.contents}>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>{this.state.scoreList.map((value, index) => this.domForScoreboard(value, index))}</tbody>
          </table>
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
