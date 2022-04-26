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

import MyAccountQuery from 'Query/MyAccount.query';
import { goToPreviousNavigationState } from 'Store/Navigation/Navigation.action';
import { NavigationType } from 'Store/Navigation/Navigation.type';
import { showNotification } from 'Store/Notification/Notification.action';
import { NotificationType } from 'Store/Notification/Notification.type';
import { hideActiveOverlay } from 'Store/Overlay/Overlay.action';
import { Addresstype } from 'Type/Account.type';
import { ReactElement } from 'Type/Common.type';
import { isSignedIn } from 'Util/Auth';
import { fetchMutation, getErrorMessage } from 'Util/Request';

import MyAccountAddressPopup from './MyAccountAddressPopup.component';
import { ADDRESS_POPUP_ID } from './MyAccountAddressPopup.config';

export const MyAccountDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/MyAccount/MyAccount.dispatcher'
);

/** @namespace Component/MyAccountAddressPopup/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    payload: state.PopupReducer.popupPayload[ ADDRESS_POPUP_ID ] || {}
});

/** @namespace Component/MyAccountAddressPopup/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    hideActiveOverlay: () => dispatch(hideActiveOverlay()),
    showErrorNotification: (error) => dispatch(showNotification(NotificationType.ERROR, getErrorMessage(error))),
    showSuccessNotification: (message) => dispatch(showNotification(NotificationType.SUCCESS, message)),
    updateCustomerDetails: () => MyAccountDispatcher.then(
        ({ default: dispatcher }) => dispatcher.requestCustomerData(dispatch)
    ),
    goToPreviousHeaderState: () => dispatch(goToPreviousNavigationState(NavigationType.TOP_NAVIGATION_TYPE))
});

/** @namespace Component/MyAccountAddressPopup/Container */
export class MyAccountAddressPopupContainer extends PureComponent {
    static propTypes = {
        showErrorNotification: PropTypes.func.isRequired,
        updateCustomerDetails: PropTypes.func.isRequired,
        hideActiveOverlay: PropTypes.func.isRequired,
        goToPreviousHeaderState: PropTypes.func.isRequired,
        payload: PropTypes.shape({
            address: Addresstype
        }).isRequired
    };

    state = {
        isLoading: false
    };

    handleAfterAction = this.handleAfterAction.bind(this);

    containerFunctions = {
        handleAddress: this.handleAddress.bind(this),
        handleDeleteAddress: this.handleDeleteAddress.bind(this)
    };

    containerProps() {
        const { payload } = this.props;
        const { isLoading } = this.state;

        return { isLoading, payload };
    }

    async handleAfterAction() {
        const {
            hideActiveOverlay,
            updateCustomerDetails,
            showErrorNotification,
            goToPreviousHeaderState
        } = this.props;

        try {
            await updateCustomerDetails();
            this.setState({ isLoading: false }, () => {
                hideActiveOverlay();
                goToPreviousHeaderState();
            });
        } catch (e) {
            showErrorNotification(e);
        }
    }

    handleError(error) {
        const { showErrorNotification } = this.props;
        showErrorNotification(error);
        this.setState({ isLoading: false });
    }

    handleAddress(address) {
        const { payload: { address: { id } } } = this.props;
        this.setState({ isLoading: true });

        if (id) {
            return this.handleEditAddress(address);
        }

        return this.handleCreateAddress(address);
    }

    async handleEditAddress(address) {
        const { payload: { address: { id } } } = this.props;
        const query = MyAccountQuery.getUpdateAddressMutation(id, address);

        if (!isSignedIn()) {
            return;
        }

        try {
            await fetchMutation(query);
            this.handleAfterAction();
        } catch (e) {
            this.handleError(e);
        }
    }

    async handleDeleteAddress() {
        const { payload: { address: { id } } } = this.props;

        if (!isSignedIn()) {
            return;
        }

        this.setState({ isLoading: true });
        const query = MyAccountQuery.getDeleteAddressMutation(id);

        try {
            await fetchMutation(query);
            this.handleAfterAction();
        } catch (e) {
            this.handleError(e);
        }
    }

    async handleCreateAddress(address) {
        if (!isSignedIn()) {
            return;
        }

        const query = MyAccountQuery.getCreateAddressMutation(address);

        try {
            await fetchMutation(query);
            this.handleAfterAction();
        } catch (e) {
            this.handleError(e);
        }
    }

    render(): ReactElement {
        return (
            <MyAccountAddressPopup
              { ...this.containerProps() }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountAddressPopupContainer);