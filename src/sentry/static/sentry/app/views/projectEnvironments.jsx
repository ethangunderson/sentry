import React from 'react';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';

import EnvironmentStore from '../stores/environmentStore';
import Panel from './settings/components/panel';
import PanelHeader from './settings/components/panelHeader';
import PanelBody from './settings/components/panelBody';
import EmptyMessage from './settings/components/emptyMessage';
import {t} from '../locale';
import Row from './settings/components/row';
import Button from '../components/buttons/button';
import SettingsPageHeader from './settings/components/settingsPageHeader';
import ListLink from '../components/listLink';
import ApiMixin from '../mixins/apiMixin';

import IndicatorStore from '../stores/indicatorStore.jsx';

import {addErrorMessage, addSuccessMessage} from '../actionCreators/settingsIndicator';

import {
  loadActiveEnvironments,
  loadHiddenEnvironments,
} from '../actionCreators/environments';

const ProjectEnvironments = createReactClass({
  propTypes: {
    route: PropTypes.object,
    params: PropTypes.object,
  },
  mixins: [ApiMixin, Reflux.listenTo(EnvironmentStore, 'onEnvironmentsChange')],

  getInitialState() {
    const isHidden = this.props.route.path === 'environments/hidden/';

    return {
      environments: [],
      title: '',
      isHidden,
    };
  },

  componentDidMount() {
    this.fetchData();
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.route.path !== nextProps.route.path) {
      const isHidden = nextProps.route.path === 'environments/hidden/';
      this.setState(
        {
          isHidden,
        },
        this.fetchData
      );
    }
  },

  fetchData() {
    // fetch both at once?
    const {orgId, projectId} = this.props.params;
    let {isHidden} = this.state;
    const load = isHidden ? loadHiddenEnvironments : loadActiveEnvironments;
    this.api.request(`/projects/${orgId}/${projectId}/environments/`, {
      query: {
        visibility: isHidden ? 'hidden' : 'visible',
      },
      success: envs => {
        load(envs);
      },
      error: () => {
        console.log('error loading environments');
      },
    });
  },

  onEnvironmentsChange() {
    const {isHidden} = this.state;

    this.setState({
      title: isHidden ? t('Hidden') : t('Active Environments'),
      environments: isHidden
        ? EnvironmentStore.getHidden()
        : EnvironmentStore.getActive(),
    });
  },

  toggleEnv(env, shouldHide) {
    const {orgId, projectId} = this.props.params;

    this.api.request(
      `/projects/${orgId}/${projectId}/environments/${env.urlRoutingName}/`,
      {
        method: 'PUT',
        data: {
          id: env.id,
          name: env.name,
          is_hidden: shouldHide,
        },
        success: e => {
          IndicatorStore.addSuccessMessage(t('Update successful'));
          console.log(e);
        },
        error: err => {
          addErrorMessage(t('An error occurred'));
          console.log(err);
        },
      }
    );
  },

  renderEmpty() {
    const {isHidden} = this.state;
    const message = isHidden
      ? t("You don't have any hidden environments.")
      : t("You don't have any environments yet.");
    return <EmptyMessage>{message}</EmptyMessage>;
  },

  renderEnvironmentList(envs) {
    let {isHidden} = this.state;
    let buttonText = isHidden ? t('Show') : t('Hide');

    return envs.map(env => (
      <Row key={env.id} style={{justifyContent: 'space-between'}}>
        <span>{env.displayName}</span>
        <Button size="xsmall" onClick={() => this.toggleEnv(env, !isHidden)}>
          {buttonText}
        </Button>
      </Row>
    ));
  },

  render() {
    // todo: loader
    const {environments} = this.state;
    const {orgId, projectId} = this.props.params;

    return (
      <div>
        <SettingsPageHeader
          title={t('Manage Environments')}
          tabs={
            <ul className="nav nav-tabs" style={{borderBottom: '1px solid #ddd'}}>
              <ListLink to={`/${orgId}/${projectId}/settings/environments/`} index={true}>
                {t('Environments')}
              </ListLink>
              <ListLink
                to={`/${orgId}/${projectId}/settings/environments/hidden/`}
                index={true}
              >
                {t('Hidden')}
              </ListLink>
            </ul>
          }
        />
        <Panel>
          <PanelHeader>{this.state.title}</PanelHeader>
          <PanelBody>
            {environments.length
              ? this.renderEnvironmentList(environments)
              : this.renderEmpty()}
          </PanelBody>
        </Panel>
      </div>
    );
  },
});

export default ProjectEnvironments;
