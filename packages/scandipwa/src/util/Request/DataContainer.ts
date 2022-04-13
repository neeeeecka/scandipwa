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

import { Query } from '@tilework/opus';
import { PureComponent } from 'react';

import { noopFn } from 'Util/Common';
import { makeCancelable } from 'Util/Promise';
import { CancelablePromise } from 'Util/Promise/Promise.type';
import { prepareQuery } from 'Util/Query';
import { executeGet, listenForBroadCast } from 'Util/Request';
import { hash } from 'Util/Request/Hash';

import { ONE_MONTH_IN_SECONDS } from './QueryDispatcher';

/** @namespace Util/Request/DataContainer */
export class DataContainer extends PureComponent {
    protected dataModelName = '';

    protected isShouldListenForBroadcast = true;

    protected cacheTTL = ONE_MONTH_IN_SECONDS;

    protected promise?: CancelablePromise<unknown>;

    __construct(
        props: Record<string, unknown>,
        dataModelName = '',
        isShouldListenForBroadcast = true,
        cacheTTL = ONE_MONTH_IN_SECONDS
    ): void {
        if (super.__construct) {
            super.__construct(props);
        }

        this.dataModelName = dataModelName;
        this.isShouldListenForBroadcast = isShouldListenForBroadcast;
        this.cacheTTL = cacheTTL;
        this.promise = undefined;
    }

    componentWillUnmount(): void {
        if (this.promise) {
            this.promise.cancel();
        }
    }

    fetchData(
        rawQueries: Query<string, unknown, boolean>[],
        onSuccess: (x: unknown) => void = noopFn,
        onError: (x: unknown) => void = noopFn,
        takeFromWindowCache = true
    ): void {
        const preparedQuery = prepareQuery(rawQueries);
        const { query, variables } = preparedQuery;
        const queryHash = hash(query + JSON.stringify(variables));

        if (!window.dataCache) {
            window.dataCache = {};
        }

        if (takeFromWindowCache && window.dataCache[queryHash]) {
            onSuccess(window.dataCache[queryHash]);

            return;
        }

        this.promise = makeCancelable(
            executeGet(preparedQuery, this.dataModelName, this.cacheTTL)
        );

        this.promise.promise.then(
            /** @namespace Util/Request/DataContainer/DataContainer/fetchData/then */
            (response) => {
                (window.dataCache || {})[queryHash] = response;
                onSuccess(response);
            },
            /** @namespace Util/Request/DataContainer/DataContainer/fetchData/then/onError/catch */
            (err) => onError(err)
        );

        if (this.isShouldListenForBroadcast) {
            listenForBroadCast(this.dataModelName).then(
                /** @namespace Util/Request/DataContainer/DataContainer/fetchData/listenForBroadCast/then/onSuccess */
                onSuccess
            );
        }
    }
}

export default DataContainer;