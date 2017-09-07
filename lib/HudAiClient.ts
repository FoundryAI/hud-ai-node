import * as _ from 'lodash';
import * as Promise from 'bluebird';
import * as moment from 'moment';

import { TokenRequestData } from './util/TokenExchange';

import { Factory } from './util/ClientConfigFactory';
import { RequestManager } from './RequestManager';
import { HudAiError } from './util/HudAiError';

import {
    ArticleResource,
    ArticleHighlightResource,
    CompanyResource,
    DomainResource,
    KeyTermResource,
    TextCorpusResource,
    UserResource,
} from './resources';


export interface HudAiClientConfiguration {
    clientId: string;
    clientSecret?: string;
    redirectUri?: string;
    baseApiUrl?: string;
    baseAuthUrl?: string;
    request?: object;
}

export class HudAiClient {
    public baseApiUrl: string;
    public accessToken?: string;
    public refreshToken?: string;
    public tokenExpiresAt?: Date;

    public article: ArticleResource;
    public articleHighlight: ArticleHighlightResource;
    public company: CompanyResource;
    public domain: DomainResource;
    public keyTerm: KeyTermResource;
    public textCorpus: TextCorpusResource;
    public user: UserResource;

    private authorizationCode?: string;
    private baseAuthUrl: string;
    private clientId: string;
    private clientSecret?: string;
    private redirectUri?: string;

    private requestManager: RequestManager;

    public static create (clientConfig: HudAiClientConfiguration) {
        const config = Factory(clientConfig);
        return new HudAiClient(config);
    }

    constructor(config: HudAiClientConfiguration) {
        this.baseApiUrl = config.baseApiUrl || 'https://api.hud.ai';
        this.baseAuthUrl = config.baseAuthUrl || 'https://auth.hud.ai';
        if (config.redirectUri) this.redirectUri = config.redirectUri;

        this.clientId = config.clientId;
        if (config.clientSecret) this.clientSecret = config.clientSecret;

        this.requestManager = new RequestManager(this, config);

        this.article = new ArticleResource(this.requestManager);
        this.articleHighlight = new ArticleHighlightResource(this.requestManager);
        this.company = new CompanyResource(this.requestManager);
        this.domain = new DomainResource(this.requestManager);
        this.keyTerm = new KeyTermResource(this.requestManager);
        this.textCorpus = new TextCorpusResource(this.requestManager);
        this.user = new UserResource(this.requestManager);
    }

    // Defaults to the more secure 'code' option
    public getAuthorizeUri(response_type: string = 'code') {
        if (!this.clientId) throw new HudAiError('cannot generate authorization URL without clientId');
        if (!this.redirectUri) throw new HudAiError('cannot generate authorization URL without redirectUri');

        const params = _.chain({
                response_type,
                client_id: this.clientId,
                redirect_uri: this.redirectUri,
            })
            .map((value, key) => `${key}=${value}`)
            .join('&')
            .value();

        return `${this.baseAuthUrl}/authorize?${params}`
    }

    public getAccessToken (): string | null {
        return this.accessToken ? this.accessToken : null;
    }

    public setAccessToken (accessToken: string) {
        this.accessToken = accessToken;
    }

    public setAuthorizationCode (authorizationCode: string) {
        this.authorizationCode = authorizationCode;
    }

    // Private

    private exchangeAuthCode() {
        return this.getTokens({
            grant_type: 'authorization_code',
            code: this.authorizationCode
        })
            .then(() => { delete this.authorizationCode; })
    }

    public exchangeClientCredentials() {
        return this.getTokens({
            grant_type: 'client_credentials'
        })
    }

    private getTokens(data: TokenRequestData) {
        return this.requestManager.makeRequest({
            method: 'POST',
            data,
            url: '/auth/oauth2/token'
        })
            .then((response) => {
                this.accessToken = response.access_token;
                if (response.refresh_token) this.refreshToken = response.refresh_token;
                this.tokenExpiresAt = moment().add(response.expires_in, 'ms').toDate();
            });
    }

    public handleTokenRefresh() {
        return this.getTokens({
            grant_type: 'refresh_grant',
            refresh_token: this.refreshToken
        })
    }

    public refreshTokens(): Promise {
        if (moment(this.tokenExpiresAt).isAfter(moment.now())) return Promise.resolve();

        if (this.authorizationCode) return this.exchangeAuthCode();

        if (this.refreshToken) return this.handleTokenRefresh();

        if (this.clientSecret) return this.exchangeClientCredentials();
    }
}
