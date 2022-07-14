/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import NoMatch from 'Route/NoMatch';
import { ChildrenType } from 'Type/Common.type';
import { scrollToTop } from 'Util/Browser';
import { history } from 'Util/History';

/** @namespace Route/NoMatchHandler/Component */
export class NoMatchHandler extends PureComponent {
    static propTypes = {
        children: ChildrenType.isRequired,
        noMatch: PropTypes.bool.isRequired,
        updateNoMatch: PropTypes.func.isRequired
    };

    onRouteChanged = this.onRouteChanged.bind(this);

    componentDidMount() {
        scrollToTop();
        this.unsubscribeRouteChange = history.onChange(this.onRouteChanged);
    }

    componentWillUnmount() {
        const {
            noMatch,
            updateNoMatch
        } = this.props;

        if (noMatch) {
            updateNoMatch({ noMatch: false });
        }
        this.unsubscribeRouteChange();
    }

    /**
     * On browser route change
     * @return {void}
     */
    onRouteChanged() {
        const {
            noMatch,
            updateNoMatch
        } = this.props;

        scrollToTop();

        if (noMatch) {
            updateNoMatch({ noMatch: false });
        }
    }

    render() {
        const { children, noMatch } = this.props;

        if (noMatch) {
            return <NoMatch />;
        }

        return children;
    }
}

export default NoMatchHandler;
