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

import { PureComponent } from 'react';

import Field from 'Component/Field';
import { FieldType } from 'Component/Field/Field.config';
import TextPlaceholder from 'Component/TextPlaceholder';
import { ReactElement } from 'Type/Common.type';
import { SortDirectionType } from 'Type/Direction.type';

import './CategorySort.style';

/**
 * Product Sort
 * @class ProductSort
 * @namespace Component/CategorySort/Component
 */
export class CategorySort extends PureComponent {
    static propTypes = {
        onSortChange: PropTypes.func.isRequired,
        sortKey: PropTypes.string.isRequired,
        sortDirection: SortDirectionType.isRequired,
        selectOptions: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]),
            value: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]),
            disabled: PropTypes.bool,
            label: PropTypes.string
        })).isRequired,
        isMatchingInfoFilter: PropTypes.bool.isRequired
    };

    onChange = this.onChange.bind(this);

    onChange(value) {
        const { onSortChange } = this.props;
        const [direction, ...key] = value.split(' ');

        onSortChange(direction, key);
    }

    renderPlaceholder(): ReactElement {
        return (
            <p block="CategorySort" elem="Placeholder">
                <TextPlaceholder length="short" />
            </p>
        );
    }

    renderSortField(): ReactElement {
        const {
            sortKey,
            sortDirection,
            selectOptions,
            isMatchingInfoFilter
        } = this.props;

        if (!isMatchingInfoFilter) {
            return this.renderPlaceholder();
        }

        return (
            <Field
              type={ FieldType.SELECT }
              attr={ {
                  id: 'category-sort',
                  name: 'category-sort',
                  defaultValue: `${sortDirection} ${sortKey}`,
                  noPlaceholder: true
              } }
              events={ {
                  onChange: this.onChange
              } }
              isSortSelect
              options={ selectOptions }
              mix={ { block: 'CategorySort', elem: 'Select' } }
            />
        );
    }

    render(): ReactElement {
        return (
            <div block="CategorySort">
                { this.renderSortField() }
            </div>
        );
    }
}

export default CategorySort;