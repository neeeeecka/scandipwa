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
import { ReactElement } from 'Type/Common.type';

import { OptionsListType } from 'Type/ProductList.type';

import ProductCustomizableOptions from './ProductCustomizableOptions.component';

/**
 * Product Customizable Options
 * @class ProductCustomizableOptionsContainer
 * @namespace Component/ProductCustomizableOptions/Container
 */
export class ProductCustomizableOptionsContainer extends PureComponent {
    static propTypes = {
        options: OptionsListType,
        updateSelectedValues: PropTypes.func.isRequired
    };

    static defaultProps = {
        options: []
    };

    containerProps() {
        const { options, updateSelectedValues } = this.props;

        return {
            options,
            updateSelectedValues
        };
    }

    render(): ReactElement {
        return (
            <ProductCustomizableOptions
                {...this.containerProps()}
            />
        );
    }
}

export default ProductCustomizableOptionsContainer;