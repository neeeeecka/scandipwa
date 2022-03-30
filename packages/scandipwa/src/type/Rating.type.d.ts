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

export interface RatingOptionItemType {
    option_id?: string;
    value?: string;
}

export type RatingItemsType = {
    rating_id?: string;
    rating_code?: string;
    rating_options?: RatingOptionItemType[];
}[];

export interface VoteType {
    rating_code?: string;
    value?: string;
    percent?: number;
}

export interface ReviewItemType {
    average_rating?: number;
    nickname?: string;
    title?: string;
    detail?: string;
    created_at?: string;
    rating_votes?: VoteType[];
}

export interface CreateProductReviewInput {
    nickname: string;
    sku: string;
    summary: string;
    text: string;
    ratings: {
        id: string;
        value_id: string;
    }[];
}