import { ArticleKeyTerm } from './ArticleKeyTerm';
import { Author, BasicAuthor } from './Author';
import { ArticleTag, BasicArticleTag } from './ArticleTag';
import { BasicKeyTerm } from './KeyTerm';
import { BasicArticleCompany } from './ArticleCompany';

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
    sourceId: string;
    publishedAt: Date;
    text: string;
    title: string;
    type: string;
}

export interface ArticleSearchResult extends BasicArticle {
    groupId?: string;
    authors: BasicAuthor[];
    companies: BasicArticleCompany[];
    keyTerms: BasicKeyTerm[];
    tags: BasicArticleTag[];
}