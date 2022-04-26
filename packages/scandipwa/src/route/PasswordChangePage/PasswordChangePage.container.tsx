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
import { connect } from 'react-redux';
import { Redirect } from 'react-router';

import { Page } from 'Component/Header/Header.config';
import { AccountPageUrl } from 'Route/MyAccount/MyAccount.config';
import { toggleBreadcrumbs } from 'Store/Breadcrumbs/Breadcrumbs.action';
import { updateMeta } from 'Store/Meta/Meta.action';
import { changeNavigationState } from 'Store/Navigation/Navigation.action';
import { NavigationType } from 'Store/Navigation/Navigation.type';
import { showNotification } from 'Store/Notification/Notification.action';
import { NotificationType } from 'Store/Notification/Notification.type';
import { ReactElement } from 'Type/Common.type';
import { LocationType } from 'Type/Router.type';
import { isSignedIn } from 'Util/Auth';
import transformToNameValuePair from 'Util/Form/Transform';
import history from 'Util/History';
import { appendWithStoreCode, getQueryParam } from 'Util/Url';

import PasswordChangePage from './PasswordChangePage.component';
import {
    STATUS_PASSWORD_MISS_MATCH,
    STATUS_PASSWORD_UPDATED
} from './PasswordChangePage.config';

export const MyAccountDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/MyAccount/MyAccount.dispatcher'
);

/** @namespace Route/PasswordChangePage/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    passwordResetStatus: state.MyAccountReducer.passwordResetStatus,
    passwordResetMessage: state.MyAccountReducer.passwordResetMessage,
    isMobile: state.ConfigReducer.device.isMobile,
    minimunPasswordLength: state.ConfigReducer.minimun_password_length,
    minimunPasswordCharacter: state.ConfigReducer.required_character_classes_number
});

/** @namespace Route/PasswordChangePage/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    updateMeta: (meta) => dispatch(updateMeta(meta)),
    toggleBreadcrumbs: (visibility) => dispatch(toggleBreadcrumbs(visibility)),
    setHeaderState: (headerState) => dispatch(changeNavigationState(NavigationType.TOP_NAVIGATION_TYPE, headerState)),
    resetPassword(options) {
        MyAccountDispatcher.then(
            ({ default: dispatcher }) => dispatcher.resetPassword(options, dispatch)
        );
    },
    updateCustomerPasswordResetStatus(options) {
        MyAccountDispatcher.then(
            ({ default: dispatcher }) => dispatcher.updateCustomerPasswordResetStatus(options, dispatch)
        );
    },
    showNotification(type, message) {
        dispatch(showNotification(type, message));
    }
});

/** @namespace Route/PasswordChangePage/Container */
export class PasswordChangePageContainer extends PureComponent {
    static propTypes = {
        updateMeta: PropTypes.func.isRequired,
        toggleBreadcrumbs: PropTypes.func.isRequired,
        showNotification: PropTypes.func.isRequired,
        passwordResetStatus: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool
        ]).isRequired,
        passwordResetMessage: PropTypes.string.isRequired,
        resetPassword: PropTypes.func.isRequired,
        location: LocationType.isRequired,
        isLoading: PropTypes.bool.isRequired,
        setHeaderState: PropTypes.func.isRequired,
        isMobile: PropTypes.bool.isRequired,
        minimunPasswordLength: PropTypes.number.isRequired,
        minimunPasswordCharacter: PropTypes.string.isRequired
    };

    state = {
        passwordResetStatus: '',
        isLoading: false
    };

    static getDerivedStateFromProps(props) {
        const {
            passwordResetStatus,
            passwordResetMessage,
            showNotification
        } = props;
        const stateToBeUpdated = {};

        if (passwordResetStatus) {
            stateToBeUpdated.isLoading = false;
            stateToBeUpdated.passwordResetStatus = passwordResetStatus;

            switch (passwordResetStatus) {
            case STATUS_PASSWORD_UPDATED:
                showNotification(NotificationType.SUCCESS, __('Password has been successfully updated!'));
                break;
            case STATUS_PASSWORD_MISS_MATCH:
                showNotification(NotificationType.INFO, __('Your password and confirmation password do not match.'));
                break;
            default:
                showNotification(NotificationType.ERROR, passwordResetMessage);
            }
        }

        return Object.keys(stateToBeUpdated).length ? stateToBeUpdated : null;
    }

    containerFunctions = {
        onPasswordSuccess: this.onPasswordSuccess.bind(this),
        onError: this.onError.bind(this)
    };

    componentDidMount(): void {
        const { setHeaderState } = this.props;
        this.updateMeta();
        this.toggleBreadcrumbs(false);

        if (isSignedIn()) {
            history.replace({ pathname: appendWithStoreCode(AccountPageUrl.ACCOUNT_URL) });
        }

        setHeaderState({
            name: Page.CUSTOMER_SUB_ACCOUNT,
            title: __('Change My Password'),
            onBackClick: () => {
                history.push({ pathname: appendWithStoreCode('/') });
            }
        });
    }

    containerProps() {
        const { isLoading } = this.state;
        const { isMobile, minimunPasswordLength, minimunPasswordCharacter } = this.props;

        const range = {
            min: minimunPasswordLength,
            max: 64
        };

        return {
            range,
            isLoading,
            isMobile,
            minimunPasswordCharacter,
            shouldDisplayWarning: this.shouldDisplayWarning()
        };
    }

    shouldDisplayWarning() {
        const token = getQueryParam('token', location);

        return !token;
    }

    onPasswordSuccess(form, fields) {
        this.setState({ isLoading: true }, () => {
            const { resetPassword, location } = this.props;
            const { password, password_confirmation } = transformToNameValuePair(fields);
            const token = getQueryParam('token', location);

            resetPassword({ token, password, password_confirmation });
        });
    }

    onError() {
        this.setState({ isLoading: false });
    }

    updateMeta() {
        const { updateMeta } = this.props;

        updateMeta({ title: __('Password Change Page') });
    }

    toggleBreadcrumbs(visibility) {
        const { toggleBreadcrumbs } = this.props;

        toggleBreadcrumbs(visibility);
    }

    render(): ReactElement {
        const { passwordResetStatus } = this.state;

        if (passwordResetStatus === STATUS_PASSWORD_UPDATED) {
            return <Redirect to="/" />;
        }

        return (
            <PasswordChangePage
              { ...this.containerProps() }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PasswordChangePageContainer);