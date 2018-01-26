import PropTypes from 'prop-types';
import classNames from 'classnames';
import React from 'react';

import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import GuideStore from '../../stores/guideStore';

// update create class. connect to guidestore instead of listento, move fetchguide to action creator

const GuideAnchor = createReactClass({
  propTypes: {
    target: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  },

  mixins: [Reflux.listenTo(GuideStore, 'onGuideChange')],

  getInitialState() {
    return {
      active:
        GuideStore.getCurrentStep() &&
        GuideStore.getCurrentStep().target == this.props.target,
    };
  },

  onGuideChange(guideState) {
    if (
      guideState.step >= 0 &&
      guideState.guide.steps[guideState.step].target == this.props.target
    ) {
      this.setState({active: true});
    } else {
      this.setState({active: false});
    }
  },

  handlePingClick(e) {},

  handleClick(e) {
    if (this.state.active) {
      GuideStore.completeStep();
    }
  },

  render() {
    return (
      <div
        className={classNames('guide-anchor', this.props.type)}
        onClick={this.handleClick}
      >
        {this.props.children}
        <span
          className={classNames(this.props.target, 'guide-anchor-ping', {
            active: this.state.active,
          })}
          onClick={this.handlePingClick}
        />
      </div>
    );
  },
});

export default GuideAnchor;