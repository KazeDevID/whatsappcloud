'use strict';

const unirest = require('unirest');
const signale = require('signale');
const fs = require('fs');
const messageParser = require('./msg_parser.js');

class WhatsappCloud {
    constructor({accessToken, graphAPIVersion, senderPhoneNumberId, WABA_ID}) {
        this.accessToken = accessToken;
        this.graphAPIVersion = graphAPIVersion || 'v18.0';
        this.senderPhoneNumberId = senderPhoneNumberId;
        this.baseUrl = `https://graph.facebook.com/${this.graphAPIVersion}/${this.senderPhoneNumberId}`;
        this.WABA_ID = WABA_ID;

        if (!this.accessToken) {
            throw new Error('Missing "accessToken"');
        }

        if (!this.senderPhoneNumberId) {
            throw new Error('Missing "senderPhoneNumberId".');
        }

        if (graphAPIVersion) {
            signale.warn(`Please note, the default "graphAPIVersion" is v18.0. You are using ${graphAPIVersion}. This may result in quirky behavior.`);
        }

        this._fetchSupport = ({ baseUrl, url, method, headers, body }) => {
            return new Promise((resolve, reject) => {
                let defaultHeaders = () => {
                    let output = {
                        'Content-Type': 'application/json',
                        'Accept-Language': 'en_US',
                        Accept: 'application/json',
                    };
                    if (this.accessToken) {
                        output['Authorization'] = `Bearer ${this.accessToken}`;
                    }
                    return output;
                };
                let defaultBody = {};
                let defaultMethod = 'GET';

                if (!url) {
                    throw new Error('"url" is required in making a request');
                }

                if (!method) {
                    signale.warn(`WARNING: "method" is missing. The default method will default to ${defaultMethod}. If this is not what you want, please specify the method.`);
                }

                if (!headers && !defaultHeaders()) {
                    signale.warn(`WARNING: "headers" is missing.`);
                }

                if (method?.toUpperCase() === 'POST' && !body) {
                    signale.warn(`WARNING: "body" is missing. The default body will default to ${JSON.stringify(defaultBody)}. If this is not what you want, please specify the body.`);
                }

                method = method?.toUpperCase() || defaultMethod;
                headers = {
                    ...defaultHeaders(),
                    ...headers,
                };
                body = body || defaultBody;
                this.baseUrl = baseUrl || this.baseUrl;
                let fullUrl = `${this.baseUrl}${url}`;

                unirest(method, fullUrl)
                    .headers(headers)
                    .send(JSON.stringify(body))
                    .end(function (res) {
                        if (res.error) {
                            let errorObject = () => {
                                try {
                                    return (res.body?.error || JSON.parse(res.raw_body));
                                } catch (e) {
                                    return {
                                        error: res.raw_body,
                                    };
                                }
                            };
                            reject({
                                status: 'failed',
                                ...errorObject(),
                            });
                        } else {
                            resolve({
                                status: 'success',
                                data: res.body,
                            });
                        }
                    });
            });
        };
    }

    async createQRCodeMessage({ message, imageType = 'png' }) {
        if (!['png', 'svg'].includes(imageType)) {
            throw new Error(`"imageType" must be either "png" or "svg"`);
        }
        let response = await this._fetchSupport({
            url: `/message_qrdls?access_token=${this.accessToken}&prefilled_message=${message}&generate_qr_image=${imageType}`,
            method: 'POST',
            body: {},
        });

        return response;
    }

    async sendText({ message, recipientPhone, context }) {
        if (!recipientPhone) {
            throw new Error('"recipientPhone" is required in making a request');
        }

        if (!message) {
            throw new Error('"message" is required in making a request');
        }

        let body = {
            messaging_product: 'whatsapp',
            to: recipientPhone,
            type: 'text',
            text: {
                preview_url: false,
                body: message,
            },
        };

        if (context) {
            body['context'] = context;
        }

        let response = await this._fetchSupport({
            url: '/messages',
            method: 'POST',
            body,
        });

        return response;
    }

    parseMessage(requestBody) {
        return messageParser({ requestBody, currentWABA_ID: this.WABA_ID });
    }
}

module.exports = WhatsappCloud;