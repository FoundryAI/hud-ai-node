import * as Promise from 'bluebird';

import {
    HudAiCreateAttributes,
    HudAiListAttributes,
    Resource
} from '../utils/Resource';
import { RequestManager } from '../RequestManager';
import { Tweet } from '../entities';

export interface TweetListAttributes extends HudAiListAttributes {
    personId?: string;
    minImportance?: number;
}

export interface TweetSearchAttributes extends HudAiListAttributes {
    id?: string;
    personId?: string;
    twitterTweetId?: string;
    text?: string;
    minImportance?: number,
    maxImportance?: number,
    terms: string[],
    createdBefore?: Date;
    createdAfter?: Date;
}

export interface TweetCreateAttributes extends HudAiCreateAttributes {
    personId: string;
    twitterTweetId: string;
    importanceScore?: number;
    twitterCreatedAt: Date;
    text: string;
}

export class TweetResource extends Resource<
    Tweet,
    TweetListAttributes,
    TweetCreateAttributes,
    any
    > {
    constructor(requestManager: RequestManager) {
        super('/people/tweets', requestManager);
    }

    public list(listArgs: TweetListAttributes): Promise<{ count: number, rows: Tweet[] }> {
        return this._list(listArgs);
    }

    public search(searchArgs: TweetSearchAttributes): Promise<{ count: number, rows: Tweet[] }> {
        return this.makeRequest({
            method: 'GET',
            params: searchArgs,
            url: `${this.basePath}/search`
        });
    }

    public reindex() {
        return this.makeRequest({
            method: 'POST',
            url: `${this.basePath}/search/reindex`
        });
    }

    public create(createArgs: TweetCreateAttributes): Promise<Tweet> {
        return this._create(createArgs);
    }

    public get(id: string | number): Promise<Tweet> {
        return this._get(id);
    }

    public getByTwitterTweetId(id: string | number): Promise<Tweet> {
        return this.makeRequest({
            method: 'GET',
            url: `${this.basePath}/by-twitter-id/${id}`
        });
    }

    public del(id: string | number): Promise<void> {
        return this.destroy(id);
    }

    public destroy(id: string | number): Promise<void> {
        return this._destroy(id);
    }
}
