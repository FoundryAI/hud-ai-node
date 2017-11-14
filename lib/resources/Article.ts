import * as Promise from 'bluebird';
import * as _ from 'lodash';

import {
    HudAiCreateAttributes,
    HudAiListAttributes,
    HudAiUpdateAttributes,
    Resource
} from '../utils/Resource';
import { RequestManager } from '../RequestManager';
import { ArticleKeyTerm } from './ArticleKeyTerm';
import { Author, BasicAuthor } from './Author';
import { ArticleTag, BasicArticleTag } from './ArticleTag';
import { BasicKeyTerm } from './KeyTerm';

export interface Article extends BasicArticle {
    keyTerms?: ArticleKeyTerm[];
    authors?: Author[];
    tags?: ArticleTag[];
    linkHash: string;
    rawDataUrl: string;
    sourceUrl: string;
}

export interface BasicArticle {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    keyTerms?: BasicKeyTerm[];
    authors?: BasicAuthor[];
    tags?: BasicArticleTag[];
    imageUrl: string;
    importanceScore: number;
    linkUrl: string;
    publishedAt: Date;
    text: string;
    title: string;
    type: string;
}

export interface ArticleSearchResult extends BasicArticle {
    keyTerms: BasicKeyTerm[];
    authors: BasicAuthor[];
    tags: BasicArticleTag[];
}

export interface ArticleListAttributes extends HudAiListAttributes {
    type?: string;
    importanceScoreMin?: number;
    keyTerm?: string;
    linkHash?: string;
    publishedAfter?: Date;
    publishedBefore?: Date;
}

export interface ArticleCreateAttributes extends HudAiCreateAttributes {
    authors?: string[];
    imageUrl?: string;
    importanceScore?: number;
    linkUrl: string;
    publishedAt?: Date;
    rawDataUrl: string;
    sourceUrl: string;
    text?: string;
    title: string;
    type: string;
}

export interface ArticleUpdateAttributes extends HudAiUpdateAttributes {
    authors?: string[];
    imageUrl?: string;
    importanceScore?: number;
    linkUrl?: string;
    publishedAt?: Date;
    rawDataUrl?: string;
    sourceUrl?: string;
    text?: string;
    title?: string;
    type?: string;
}

export interface ArticleSearchAttributes {
    limit?: number,
    offset?: number,
    authors?: string[],
    tags?: string[],
    keyTerms?: string[],
    publishedBefore?: Date,
    publishedAfter?: Date,
    createdBefore?: Date,
    createdAfter?: Date,
    scoredBefore?: Date,
    scoredAfter?: Date,
    minImportance?: number,
    maxImportance?: number,
    type?: string,
    text?: string,
}

export interface ArticleSearchRelevantAttributes {
    limit?: number,
    offset?: number,
    authors?: string[],
    createdAfter?: Date,
    createdBefore?: Date,
    keyTerms?: string[],
    maxImportance?: number,
    maxRelevance?: number,
    minImportance?: number,
    minRelevance?: number,
    publishedAfter?: Date,
    publishedBefore?: Date,
    scoredAfter?: Date,
    scoredBefore?: Date,
    tags?: string[],
    text?: string,
    type?: string,
    userId?: string,
}

export interface GroupedTagCount {
    [term: string]: {
        [tag: string]: number
    };
}

export class ArticleResource extends Resource<
    Article,
    ArticleListAttributes,
    ArticleCreateAttributes,
    ArticleUpdateAttributes
> {
    constructor(requestManager: RequestManager) {
        super('/articles', requestManager);
    }

    public list(listArgs: ArticleListAttributes): Promise<{ count: number, rows: Article[] }> {
        return this._list(listArgs);
    }

    public search(searchArgs: ArticleSearchAttributes): Promise<{ count: number, rows: ArticleSearchResult[] }> {
        return this.makeRequest({
            method: 'GET',
            params: searchArgs,
            url: `${this.basePath}/search`
        })
    }

    public searchRelated(searchArgs: ArticleSearchRelevantAttributes): Promise<{ count: number, rows: ArticleSearchResult[] }> {
        return this.makeRequest({
            method: 'GET',
            params: searchArgs,
            url: `${this.basePath}/search/relevant`
        })
    }

    public searchByTerm(searchArgs: ArticleSearchRelevantAttributes): Promise< { term: string, count: number, rows: ArticleSearchResult[] }[] > {
        return this.makeRequest({
            method: 'GET',
            params: searchArgs,
            url: `${this.basePath}/search/relevant/grouped/by-term`
        })
    }

    public countTagsByTerm(countArgs: ArticleSearchRelevantAttributes): Promise<GroupedTagCount> {
        return this.makeRequest({
            method: 'GET',
            params: _.merge(countArgs, { countTags: true }),
            url: `${this.basePath}/search/relevant/grouped/by-term`
        })
    }

    public create(createArgs: ArticleCreateAttributes): Promise<Article> {
        return this._create(createArgs);
    }

    public get(id: string | number): Promise<Article> {
        return this._get(id);
    }

    public update(id: string | number, updateArgs: ArticleUpdateAttributes): Promise<Article> {
        return this._update(id, updateArgs);
    }

    public del(id: string | number): Promise<void> {
        return this.destroy(id);
    }

    public destroy(id: string | number): Promise<void> {
        return this._destroy(id);
    }
}
