/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/scandipwa
 */

import { PureComponent } from 'react';

import Html from 'Component/Html';
import { ORDER_ITEMS, ORDER_REFUNDS, ORDER_SHIPMENTS } from 'Component/MyAccountOrder/MyAccountOrder.config';
import { ReactElement } from 'Type/Common.type';
import { OptionsType, OrderProductType } from 'Type/Order.type';
import { getOrderItemQtyToArray, getOrderItemRowDiscount } from 'Util/Orders';
import { formatPrice } from 'Util/Price';

import { ORDER_STATUS_TRANSLATION_MAP } from './MyAccountOrderItemsTableRow.config';

import './MyAccountOrderItemsTableRow.style';

/** @namespace Component/MyAccountOrderItemsTableRow/Component */
export class MyAccountOrderItemsTableRow extends PureComponent {
    static propTypes = {
        activeTab: PropTypes.string.isRequired,
        product: OrderProductType.isRequired,
        selectedOptions: OptionsType.isRequired,
        enteredOptions: OptionsType.isRequired,
        isMobile: PropTypes.bool.isRequired,
        colSpanCount: PropTypes.string.isRequired,
        comments: PropTypes.arrayOf(PropTypes.string)
    };

    static defaultProps = {
        comments: []
    };

    renderMap = {
        renderOption: this.renderOption.bind(this),
        renderQty: this.renderQty.bind(this),
        renderOptionItem: this.renderOptionItem.bind(this),
        renderEnteredOptionAsRow: this.renderEnteredOptionAsRow.bind(this)
    };

    renderItemPrice(): ReactElement {
        const {
            product: {
                product_sale_price: {
                    value,
                    currency
                }
            },
            activeTab
        } = this.props;

        if (activeTab === ORDER_SHIPMENTS) {
            return null;
        }

        return this.renderPrice(value, currency, (__('Price')));
    }

    renderQty([type, qty], index): ReactElement {
        const { activeTab } = this.props;

        if (qty === 0) {
            return null;
        }

        if (activeTab === ORDER_ITEMS) {
            return (
                <li key={ index }>{ `${ORDER_STATUS_TRANSLATION_MAP[ type ]}: ${qty}` }</li>
            );
        }

        return (
            <li key={ index }>{ qty }</li>
        );
    }

    renderRowQty(): ReactElement {
        const { product } = this.props;
        const { renderQty } = this.renderMap;

        const qtyArray = getOrderItemQtyToArray(product);

        return (
            <ul
              block="MyAccountOrderItemsTableRow"
              elem="QtyList"
            >
                { Object.entries(qtyArray).map(renderQty) }
            </ul>
        );
    }

    renderRowSubtotal(): ReactElement {
        const {
            activeTab,
            product: {
                row_subtotal: {
                    value,
                    currency
                } = {}
            }
        } = this.props;

        if (activeTab === ORDER_SHIPMENTS) {
            return null;
        }

        return this.renderPrice(value, currency, __('Subtotal'));
    }

    renderPrice(value, currency, title): ReactElement {
        const { isMobile, colSpanCount } = this.props;

        if (isMobile) {
            return (
                <tr
                  block="MyAccountOrderItemsTableRow"
                  elem="Row"
                >
                    <td colSpan={ colSpanCount }>
                        <strong>{ title }</strong>
                        <strong>{ formatPrice(value, currency) }</strong>
                    </td>
                </tr>
            );
        }

        return (
            <td>
                <strong>{ formatPrice(value, currency) }</strong>
            </td>
        );
    }

    renderSelectedAndEnteredOptions(): ReactElement {
        const {
            selectedOptions,
            enteredOptions,
            isMobile,
            colSpanCount
        } = this.props;
        const { renderOption } = this.renderMap;

        if (!selectedOptions.length && !enteredOptions.length) {
            return null;
        }

        if (isMobile) {
            return (
                <tr
                  block="MyAccountOrderItemsTableRow"
                  elem="Row"
                >
                    <td colSpan={ colSpanCount }>
                        { selectedOptions.map(renderOption) }
                        { enteredOptions.map(renderOption) }
                    </td>
                </tr>
            );
        }

        return (
            <>
                { selectedOptions.map(renderOption) }
                { enteredOptions.map(renderOption) }
            </>
        );
    }

    renderNameAndOptions(): ReactElement {
        const { product: { product_name } } = this.props;

        return (
            <td>
                <span
                  block="MyAccountOrderItemsTableRow"
                  elem="Name"
                >
                    { product_name }
                </span>
                { this.renderSelectedAndEnteredOptions() }
            </td>
        );
    }

    renderOptionItem(item, isLastOptionItem): ReactElement {
        const { product: { quantity_ordered = 1, product_sale_price: { currency } }, isMobile } = this.props;
        const { qty, title, price } = item;

        if (isMobile) {
            return this.renderMobileOptionItem(item);
        }

        return (
            <tr
              block="MyAccountOrderItemsTableRow"
              elem="EnteredRow"
              mods={ { isLastOptionItem } }
            >
                <td>
                    { `${qty} x ${title}` }
                </td>
                <td>{ title }</td>
                { this.renderEnteredOptionPrice(formatPrice(price, currency)) }
                <td
                  block="MyAccountOrderItemsTableRow"
                  elem="EnteredQty"
                >
                    { quantity_ordered * qty }
                </td>
            </tr>
        );
    }

    renderEnteredOptionPrice(price): ReactElement {
        const { activeTab } = this.props;

        if (activeTab === ORDER_SHIPMENTS) {
            return null;
        }

        return (
            <td
              block="MyAccountOrderItemsTableRow"
              elem="EnteredPrice"
            >
                <strong>{ price }</strong>
            </td>
        );
    }

    renderMobileOptionItem(item): ReactElement {
        const { product: { product_sale_price: { currency } } } = this.props;
        const { qty, title, price } = item;

        const nameRowMix = { block: 'MyAccountOrderItemsTableRow', elem: 'Name' };

        return (
            <>
                { this.renderMobileBodyContentRow(__('Product name'), `${qty} x ${title}`, nameRowMix) }
                { this.renderMobileBodyContentRow(__('SKU'), title) }
                { this.renderMobileBodyContentRow(__('Price'), formatPrice(price, currency)) }
            </>
        );
    }

    renderEnteredOptionAsRow(option, index): ReactElement {
        const { colSpanCount, enteredOptions } = this.props;
        const { label, items } = option;
        const { renderOptionItem } = this.renderMap;

        if (!items) {
            return null;
        }

        const isLastOptionItem = enteredOptions.length - 1 === index;

        return (
            <>
                <tr
                  block="MyAccountOrderItemsTableRow"
                  elem="EnteredLabel"
                  key={ `${label}-${index}` }
                >
                    <td
                      colSpan={ colSpanCount }
                    >
                        <strong>{ label }</strong>
                    </td>
                </tr>
                { items.map((item) => renderOptionItem(item, isLastOptionItem)) }
            </>
        );
    }

    renderEnteredOptionsAsRow(): ReactElement {
        const { enteredOptions } = this.props;
        const { renderEnteredOptionAsRow } = this.renderMap;

        if (!enteredOptions.length) {
            return null;
        }

        return enteredOptions.map(renderEnteredOptionAsRow);
    }

    renderOption(option): ReactElement {
        const {
            label,
            items,
            value
        } = option || [];

        if (items) {
            return null;
        }

        return (
            <dl key={ `${label}-${value}` }>
                <dt
                  block="MyAccountOrderItemsTableRow"
                  elem="OptionLabel"
                >
                    <strong>{ label }</strong>
                </dt>
                { this.renderOptionContent(option) }
            </dl>
        );
    }

    renderOptionContent(option): ReactElement {
        const {
            value = '',
            linkItems = []
        } = option;

        if (linkItems && linkItems.length) {
            return linkItems.map(this.renderLink.bind(this));
        }

        return <dd block="MyAccountOrderItemsTableRow" elem="OptionValue"><Html content={ value } /></dd>;
    }

    renderLink(title, index): ReactElement {
        return (
            <dd
              block="MyAccountOrderItemsTableRow"
              elem="DownloadableLink"
              key={ `${title}-${index}` }
            >
                { title }
            </dd>
        );
    }

    renderDiscountAndRowTotal(): ReactElement {
        const {
            activeTab,
            product: {
                row_subtotal: {
                    value: row_subtotal,
                    currency
                } = {},
                discounts = []
            },
            isMobile
        } = this.props;

        if (activeTab !== ORDER_REFUNDS) {
            return null;
        }

        const totalDiscount = discounts.length ? getOrderItemRowDiscount(discounts) : 0;

        if (isMobile) {
            return (
                <>
                    { this.renderPrice(
                        -totalDiscount,
                        currency,
                        __('Discount Amount')
                    ) }
                    { this.renderPrice(
                        row_subtotal - totalDiscount,
                        currency,
                        __('Row Total')
                    ) }
                </>
            );
        }

        return (
            <>
                <td><strong>{ formatPrice(-totalDiscount, currency) }</strong></td>
                <td><strong>{ formatPrice(row_subtotal - totalDiscount, currency) }</strong></td>
            </>
        );
    }

    renderMobileBodyContentRow(label, value, mix = {}): ReactElement {
        const { colSpanCount } = this.props;

        return (
            <tr
              block="MyAccountOrderItemsTableRow"
              elem="Row"
              mix={ mix }
            >
                <td colSpan={ colSpanCount }>
                    <strong>{ label }</strong>
                    { value }
                </td>
            </tr>
        );
    }

    renderMobileTableRow(): ReactElement {
        const {
            activeTab,
            product: {
                product_sku,
                product_name
            },
            comments
        } = this.props;

        const nameRowMix = { block: 'MyAccountOrderItemsTableRow', elem: 'Name' };
        const lineBefore = !!((activeTab === ORDER_SHIPMENTS) && (comments.length));

        return (
            <tbody
              block="MyAccountOrderItemsTableRow"
              elem="RowWrapper"
              mods={ { lineBefore } }
            >
                { this.renderMobileBodyContentRow(__('Product name'), product_name, nameRowMix) }
                { this.renderSelectedAndEnteredOptions() }
                { this.renderMobileBodyContentRow(__('SKU'), product_sku) }
                { this.renderItemPrice() }
                { this.renderMobileBodyContentRow(__('Qty'), this.renderRowQty()) }
                { this.renderRowSubtotal() }
                { this.renderDiscountAndRowTotal() }
                { this.renderEnteredOptionsAsRow() }
            </tbody>
        );
    }

    renderDesktopTableRow(): ReactElement {
        const {
            activeTab,
            product: {
                product_sku
            },
            enteredOptions = [],
            comments
        } = this.props;

        const isWithEnteredItems = !!enteredOptions[ 0 ]?.items;
        const lineBefore = !!((activeTab === ORDER_SHIPMENTS) && (comments.length));

        return (
            <>
                <tr
                  block="MyAccountOrderItemsTableRow"
                  elem="RowWrapper"
                  mods={ { isWithEnteredItems, lineBefore } }
                >
                    { this.renderNameAndOptions() }
                    <td>{ product_sku }</td>
                    { this.renderItemPrice() }
                    <td
                      block="MyAccountOrderItemsTableRow"
                      elem="Qty"
                    >
                        { this.renderRowQty() }
                    </td>
                    { this.renderRowSubtotal() }
                    { this.renderDiscountAndRowTotal() }
                </tr>
                { this.renderEnteredOptionsAsRow() }
            </>
        );
    }

    render(): ReactElement {
        const { isMobile } = this.props;

        if (!isMobile) {
            return this.renderDesktopTableRow();
        }

        return this.renderMobileTableRow();
    }
}

export default MyAccountOrderItemsTableRow;